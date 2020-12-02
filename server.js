let SNAKES = [];
let FoodX = [];
let FoodY = [];
let ran = [];

class Snake {
    constructor(id, name, snake, lambi, col) {
        this.id = id;
        this.name = name;
        this.snake = snake;
        this.lambi = lambi;
        this.col = col;
    }
}

const express = require('express');
const app = express();

const port = process.env.PORT || 1412;
const server = app.listen(port);
console.log(`Starting server at ${port}`);

app.use(express.static('public'));

const socket = require('socket.io');
const io = socket(server);


setInterval(heartbeat, 1000/15);

function heartbeat() {
    io.sockets.emit('heartbeat', SNAKES);
}


io.sockets.on('connection',

function (socket) {
    console.log('Connected: ' + socket.id);

    socket.on('start',
    function(data) {
        // console.log(socket.id+" "+data.name+" "+data.mySnake+" "+data.lambi+" "+data.col);

        var snake = new Snake(socket.id, data.name, data.mySnake, data.lambi, data.col);
        SNAKES.push(snake);

        var FOOD = {
            FoodX: FoodX,
            FoodY: FoodY,
            ran: ran
        }
        io.sockets.emit('newFood', FOOD);
        io.sockets.emit('heartbeat', SNAKES);
    });

    socket.on('update',
    function(data) {
        for(var i = 0; i < SNAKES.length; i++) {
            if(socket.id == SNAKES[i].id) {
                var snake = new Snake(socket.id, data.name, data.mySnake, data.lambi, data.col);
                SNAKES[i] = snake;
            }
        }
        io.sockets.emit('heartbeat', SNAKES);
    });


    socket.on('foodLocation',
    function(data) {
        FoodX = data.x;
        FoodY = data.y;
        ran = data.ran;

        var FOOD = {
            FoodX: FoodX,
            FoodY: FoodY,
            ran: ran
        }
        io.sockets.emit('newFood', FOOD);
        io.sockets.emit('heartbeat', SNAKES);
    });

    socket.on('disconnect',
    function() {
        console.log('Disconnected: ' + socket.id);
        for(var i = 0; i < SNAKES.length; i++) {
            if(socket.id == SNAKES[i].id) {
                SNAKES.splice(i, 1);
            }
        }
        io.sockets.emit('heartbeat', SNAKES);
    });
});