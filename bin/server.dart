import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math';

import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as shelf_io;
import 'package:shelf_static/shelf_static.dart';
import 'package:shelf_web_socket/shelf_web_socket.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

// Global variables
List<Snake> snakes = [];
List<dynamic> foodX = [];
List<dynamic> foodY = [];
List<dynamic> ran = [];

// Keep track of active WebSocket connections for broadcasting
final List<WebSocketChannel> activeClients = [];
final Random _random = Random();

class Snake {
  String id;
  dynamic name;
  dynamic snake;
  dynamic lambi;
  dynamic col;

  Snake({required this.id, this.name, this.snake, this.lambi, this.col});

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'snake': snake,
    'lambi': lambi,
    'col': col,
  };
}

// Helper to replicate Socket.IO's io.sockets.emit()
void broadcast(String eventType, dynamic data) {
  final message = jsonEncode({'type': eventType, 'data': data});
  for (final client in activeClients) {
    client.sink.add(message);
  }
}

void main() async {
  final port = int.tryParse(Platform.environment['PORT'] ?? '') ?? 10000;

  // WebSocket Handler
  final wsHandler = webSocketHandler((WebSocketChannel webSocket, _) {
    activeClients.add(webSocket);

    // Generate a unique ID since native WebSockets don't have one
    final clientId =
        DateTime.now().millisecondsSinceEpoch.toString() +
        _random.nextInt(10000).toString();

    print('Connected: $clientId');

    webSocket.sink.add(jsonEncode({'type': 'connected', 'data': clientId}));

    webSocket.stream.listen(
      (message) {
        // Replicate Socket.IO event parsing
        final decoded = jsonDecode(message as String);
        final String eventType = decoded['type'];
        final dynamic data = decoded['data'];

        if (eventType == 'start') {
          snakes.add(
            Snake(
              id: clientId,
              name: data['name'],
              snake: data['mySnake'],
              lambi: data['lambi'],
              col: data['col'],
            ),
          );

          broadcast('newFood', {'FoodX': foodX, 'FoodY': foodY, 'ran': ran});
        } else if (eventType == 'update') {
          for (var i = 0; i < snakes.length; i++) {
            if (clientId == snakes[i].id) {
              snakes[i] = Snake(
                id: clientId,
                name: data['name'],
                snake: data['mySnake'],
                lambi: data['lambi'],
                col: data['col'],
              );
              break;
            }
          }
        } else if (eventType == 'foodLocation') {
          foodX = data['x'];
          foodY = data['y'];
          ran = data['ran'];

          broadcast('newFood', {'FoodX': foodX, 'FoodY': foodY, 'ran': ran});
        }
      },
      onDone: () {
        print('Disconnected: $clientId');
        activeClients.remove(webSocket);
        snakes.removeWhere((snake) => snake.id == clientId);
      },
    );
  });

  // Static File Handler
  final staticHandler = createStaticHandler(
    'public',
    defaultDocument: 'index.html',
  );

  // Routing (Cascade allows us to try multiple handlers)
  // If the path is /ws, upgrade to WebSocket. Otherwise, serve static files.
  final cascade = Cascade()
      .add((Request request) {
        if (request.url.path == 'ws') {
          return wsHandler(request);
        }
        return Response.notFound('Not found');
      })
      .add(staticHandler);

  final handler = const Pipeline()
      .addMiddleware(logRequests())
      .addHandler(cascade.handler);

  final server = await shelf_io.serve(handler, InternetAddress.anyIPv4, port);
  print('Starting server at https://${server.address.host}:$port');

  // 4. Heartbeat Loop
  Timer.periodic(Duration(milliseconds: 30), (Timer t) {
    broadcast('heartbeat', snakes.map((s) => s.toJson()).toList());
  });
}
