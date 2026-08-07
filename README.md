# MP-Snake

A Multiplayer Snake Game

Made using p5js library & Dart Shelf server.

A Multiplayer Snake Game Using Server Side Programming

Inspired by [Snake.io](https://snake.io)

Learned Sockets, Node and p5 from [The Coding Train](https://www.youtube.com/channel/UCvjgXvBlbQiydffZU7m1_aw)

# Running the sample

## Running with the Dart SDK

You can run the example with the [Dart SDK](https://dart.dev/get-dart)
like this:

```
$ dart run bin/server.dart
Starting server at http://localhost:10000
```

And then open [http://localhost:10000](http://localhost:10000) in 2 different
browser tabs.

## Running with Docker

If you have [Docker Desktop](https://www.docker.com/get-started) installed, you
can build and run with the `docker` command:

```
$ docker build . -t myserver
$ docker run -it -p 10000:10000 myserver
Starting server at http://localhost:10000
```

And then open [http://localhost:10000](http://localhost:10000) in 2 different
browser tabs.

You should see the logging printed in the first terminal:

```
2026-08-07T10:13:36.679882  0:00:00.014005 GET     [200] /
2026-08-07T10:13:36.716824  0:00:00.001287 GET     [200] /style.css
2026-08-07T10:13:36.720396  0:00:00.000412 GET     [200] /sketch.js
2026-08-07T10:13:36.771460  0:00:00.000585 GET     [200] /sounds/Oof.mp3
2026-08-07T10:13:36.772555  0:00:00.000412 GET     [200] /sounds/munch-sound-effect.mp3
2026-08-07T10:13:36.773720  0:00:00.000261 GET     [200] /img/Apple.png
2026-08-07T10:13:36.774443  0:00:00.000264 GET     [200] /img/Pear.png
2026-08-07T10:13:36.775240  0:00:00.000353 GET     [200] /img/Orange.png
2026-08-07T10:13:36.776456  0:00:00.000324 GET     [200] /img/Banana.png
2026-08-07T10:13:36.779706  0:00:00.000403 GET     [200] /img/Meat.png
Connected: 17860778167966993
```
