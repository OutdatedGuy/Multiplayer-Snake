var FoodX = [];
var FoodY = [];
var ran = [];
var blocks = 20;
let mySnake = [];
let myLambi = 0;
let SNAKES = [];
let eatSound;
let deadSound;
var end;
let appleImg;
let pearImg;
let orangeImg;
let bananaImg;
let meatImg;
var ranCol;
var socket;
let name;
let scoreBoard = [];

function preload() {
	deadSound = loadSound("sounds/Oof.mp3");
	eatSound = loadSound("sounds/munch-sound-effect.mp3");
	appleImg = loadImage("img/Apple.png");
	pearImg = loadImage("img/Pear.png");
	orangeImg = loadImage("img/Orange.png");
	bananaImg = loadImage("img/Banana.png");
	meatImg = loadImage("img/Meat.png");
}

function setup() {
	createCanvas(1300, 700);

	socket = io.connect();

	socket.on('heartbeat',
	function(data) {
		SNAKES = data;
	});

	socket.on('newFood',
	function(data) {
		FoodX = data.FoodX;
		FoodY = data.FoodY;
		ran = data.ran;
	});

	frameRate(15);

	end = -1;
	
	deadSound.rate(4);
	eatSound.rate(1.7);
	eatSound.setVolume(0.25);

	startScreen();
}

function draw() {
	if (end == 0) {
		mySnake[0].move();
		mySnake[0].dead(socket.id);
		gameScreen();
	} else if (end == -0.5)
		waitingScreen();
}

function startScreen() {
	background(60);
	name = createInput('Your Name!').attribute('maxlength', 10);
	name.position(width/2 - 75, height/2 - 60);
	name.size(150, 20);

	let button = createButton('Submit');
	button.position(width/2 - 50, height/2 - 10);
	button.size(100, 20);
	button.style('cursor: pointer');
	button.mousePressed(bonjour);
}

function bonjour() {
	removeElements();
	
	var ranX = int(random(1, (width / blocks) - 2)) * blocks;
	var ranY = int(random(1, (height / blocks) - 2)) * blocks;

	mySnake[myLambi++] = new SnakeBody(ranX, ranY);

	ranCol = color(random(255), random(255), random(255));

	var data = {
		name: name.value(),
		mySnake: mySnake,
		lambi: myLambi,
		col: ranCol
	}

	if(SNAKES.length == 0) {
		for(var f = 0; f < 10; f++) {
			foodLocation(f);
		}
	}

	socket.emit('start', data);
	end = -0.5;

	
	let button = createButton("Don't Wait");
	button.position(width/2 - 50, height/2 + 30);
	button.size(100, 20);
	button.style('cursor: pointer');
	button.mousePressed(lonely);
	waitingScreen();
}

function waitingScreen() {
	background(60);
	noFill();
	stroke(255);
	strokeWeight(1);
	rectMode(CORNER);

	fill(0, 255, 255);
	stroke(100, 255, 60);
	strokeWeight(2);
	textAlign(CENTER);
	textSize(45);
	text("Waiting for Someone to Join...", width/2, height/2);
	if(SNAKES.length > 1) {
		end = 0;
	}
}

function lonely() {
	end = 0;
}

function keyPressed() {
	if (end == 0) {
		if ((keyCode === LEFT_ARROW || keyCode === 65) && mySnake[0].xSpeed < 1) {
			mySnake[0].updateSpeed(-1, 0);
		} else if ((keyCode === RIGHT_ARROW || keyCode === 68) && mySnake[0].xSpeed > -1) {
			mySnake[0].updateSpeed(1, 0);
		} else if ((keyCode === UP_ARROW || keyCode === 87) && mySnake[0].ySpeed < 1) {
			mySnake[0].updateSpeed(0, -1);
		} else if ((keyCode === DOWN_ARROW || keyCode === 83) && mySnake[0].ySpeed > -1) {
			mySnake[0].updateSpeed(0, 1);
		}
	}
}

function gameScreen() {
	removeElements();
	//playing layout
	background(60);
	noFill();
	stroke(255);
	strokeWeight(1);
	rectMode(CORNER);
	rect(blocks - 1, blocks - 1, width - 2 * blocks + 2, height - 2 * blocks + 2);

	for(var f = 0; f < FoodX.length; f++) {
		FoodShow(ran[f], f);
	}

	var temp = SNAKES;
	temp.sort((a, b) => b.lambi - a.lambi);

	for(var s = 0; s < temp.length; s++) {
		scoreBoard[s] = createP(`${s + 1}) ${temp[s].name}: ${temp[s].lambi - 1}`);
		scoreBoard[s].position(1310, 20 + s*25);
	}
	
	for(var k = myLambi - 1; k >= 0; k--) {
		mySnake[k].show();
		if(k == 0) {
			mySnake[k].eyes();
		}
	}

	for(var k = 0; k < SNAKES.length; k++) {
		if (SNAKES[k].id == socket.id) {
			continue;
		}
		for(var i = SNAKES[k].lambi - 1; i >= 0 ; i--) {
			var x = SNAKES[k].snake[i].x;
			var y = SNAKES[k].snake[i].y;
			show(SNAKES[k].col.levels, x, y);

			if (i == 0) {
				var xs = SNAKES[k].snake[i].xSpeed;
				var ys = SNAKES[k].snake[i].ySpeed;
				eyes(x, y, xs, ys, SNAKES[k].name);
			}
		}
	}
	
	mySnake[0].eat();

	for(var i = myLambi - 1; i > 0; i--) {
		mySnake[i].x = mySnake[i - 1].x;
		mySnake[i].y = mySnake[i - 1].y;
		mySnake[i].xSpeed = mySnake[i - 1].xSpeed;
		mySnake[i].ySpeed = mySnake[i - 1].ySpeed;
	}
}

class SnakeBody {
	constructor(ranX, ranY) {
		this.x = ranX;
		this.y = ranY;
		this.xSpeed = 0;
		this.ySpeed = 0;
	}
	updateSpeed(xS, xY) {
		this.xSpeed = xS * blocks;
		this.ySpeed = xY * blocks;
		
		var data = {
			name: name.value(),
			mySnake: mySnake,
			lambi: myLambi,
			col: ranCol
		}

		socket.emit('update', data);
	}
	dead(me) {
		var r = 0;
		for(var k = 0; k < SNAKES.length; k++) {
			if (SNAKES[k].id == me) {
				continue;
			}
			for(var i = 0; i < SNAKES[k].lambi; i++) {
				if (this.x == SNAKES[k].snake[i].x && this.y == SNAKES[k].snake[i].y) {
					deadSound.play();
					deadFood();
					myLambi = 0;
					revive(me);
					return;
				}
			}
		}
	}
	eat() {
		for(var f = 0; f < FoodX.length; f++) {
			if (this.x == FoodX[f] && this.y == FoodY[f]) {
				if(f >= 10) {
					meatEat(f);
					break;
				}
				eatSound.play();
				mySnake[myLambi] = new SnakeBody(mySnake[myLambi - 1].x, mySnake[myLambi - 1].y);
				myLambi++;
				foodLocation(f);
				break;
			}
		}
	}
	move() {
		this.x = this.x + this.xSpeed;
		this.y = this.y + this.ySpeed;
		if(this.x < blocks) {
			this.x = width - (2*blocks);
		}
		if(this.y < blocks) {
			this.y = height - (2*blocks);
		}
		if(this.x > width - (2*blocks)) {
			this.x = blocks;
		}
		if(this.y > height - (2*blocks)) {
			this.y = blocks;
		}
		
		var data = {
			name: name.value(),
			mySnake: mySnake,
			lambi: myLambi,
			col: ranCol
		}

		socket.emit('update', data);
	}
	show() {
		fill(ranCol);
		stroke(0);
		strokeWeight(1);
		rect(this.x, this.y, blocks);
	}
	eyes() {
		noStroke();
		ellipseMode(CENTER);
		textSize(10);
		if (this.xSpeed > 0) {
			fill(0);
			ellipse(this.x + 15, this.y + 5, 6, 3);
			ellipse(this.x + 15, this.y + 15, 6, 3);
			fill(255);
			text(name.value(), this.x + 10, this.y + 30);
		} else if (this.xSpeed < 0) {
			fill(0);
			ellipse(this.x + 5, this.y + 5, 6, 3);
			ellipse(this.x + 5, this.y + 15, 6, 3);
			fill(255);
			text(name.value(), this.x + 10, this.y + 30);
		} else if (this.ySpeed < 0) {
			fill(0);
			ellipse(this.x + 5, this.y + 5, 3, 6);
			ellipse(this.x + 15, this.y + 5, 3, 6);
			fill(255);
			text(name.value(), this.x + 10, this.y - 5);
		} else if (this.ySpeed > 0) {
			fill(0);
			ellipse(this.x + 5, this.y + 15, 3, 6);
			ellipse(this.x + 15, this.y + 15, 3, 6);
			fill(255);
			text(name.value(), this.x + 10, this.y + 30);
		} else {
			fill(255);
			text(name.value(), this.x + 10, this.y - 5);
		}
	}
}

function  show(colour, x, y) {
	fill(colour);
	stroke(0);
	strokeWeight(1);
	rect(x, y, blocks);
}

function eyes(x, y, xSpeed, ySpeed, name) {
	noStroke();
	ellipseMode(CENTER);
	textSize(10);
	if (xSpeed > 0) {
		fill(0);
		ellipse(x + 15, y + 5, 6, 3);
		ellipse(x + 15, y + 15, 6, 3);
		fill(255);
		text(name, x + 10, y + 30);
	} else if (xSpeed < 0) {
		fill(0);
		ellipse(x + 5, y + 5, 6, 3);
		ellipse(x + 5, y + 15, 6, 3);
		fill(255);
		text(name, x + 10, y + 30);
	} else if (ySpeed < 0) {
		fill(0);
		ellipse(x + 5, y + 5, 3, 6);
		ellipse(x + 15, y + 5, 3, 6);
		fill(255);
		text(name, x + 10, y - 5);
	} else if (ySpeed > 0) {
		fill(0);
		ellipse(x + 5, y + 15, 3, 6);
		ellipse(x + 15, y + 15, 3, 6);
		fill(255);
		text(name, x + 10, y + 30);
	} else {
		fill(255);
		text(name, x + 10, y - 5);
	}
}


function revive(me) {
	var ranX = int(random(1, (width / blocks) - 2)) * blocks;
	var ranY = int(random(1, (height / blocks) - 2)) * blocks;

	for(var k = 0; k < SNAKES.length; k++) {
			if (SNAKES[k].id == me) {
				continue;
			}
			for(var i = 0; i < SNAKES[k].lambi; i++) {
			if (ranX == SNAKES[k].snake[i].x && ranY == SNAKES[k].snake[i].y) {
				revive(me);
				return;
			}
		}
	}
	mySnake[myLambi++] = new SnakeBody(ranX, ranY);
	
	var data = {
		name: name.value(),
		mySnake: mySnake,
		lambi: myLambi,
		col: ranCol
	}

	socket.emit('update', data);
}


function deadFood() {
	var len = FoodX.length;
	for(var df = 0; df < (myLambi - 1); df++) {
		FoodX[len + df] = mySnake[df + 1].x;
		FoodY[len + df] = mySnake[df + 1].y;
		ran[len + df] = 5;
	}

	var fata = {
		x: FoodX,
		y: FoodY,
		ran: ran
	};

	socket.emit('foodLocation', fata);
}


function meatEat(fEat) {
	eatSound.play();
	mySnake[myLambi] = new SnakeBody(mySnake[myLambi - 1].x, mySnake[myLambi - 1].y);
	myLambi++;

	FoodX.splice(fEat, 1);
	FoodY.splice(fEat, 1);
	ran.splice(fEat, 1);

	var fata = {
		x: FoodX,
		y: FoodY,
		ran: ran
	};

	socket.emit('foodLocation', fata);
}


function foodLocation(f) {
	FoodX[f] = int(random(1, (width / blocks) - 2)) * blocks;
	FoodY[f] = int(random(1, (height / blocks) - 2)) * blocks;
	ran[f] = int(random(1, 5));

	for(var i = 0; i < FoodX.length; i++) {
		if(i == f) {
			continue;
		}
		if(FoodX[i] == FoodX[f] && FoodY[i] == FoodY[f]) {
			foodLocation(f);
			return;
		}
	}
	
	for(var k = 0; k < SNAKES.length; k++) {
		for(var i = 0; i < SNAKES[k].lambi; i++) {
			if (FoodX[f] == SNAKES[k].snake[i].x && FoodY[f] == SNAKES[k].snake[i].y) {
				foodLocation(f);
				return;
			}
		}
	}

	var fata = {
		x: FoodX,
		y: FoodY,
		ran: ran
	};

	socket.emit('foodLocation', fata);
}

function FoodShow(type, f) {
	if (type == 1) {
		image(bananaImg, FoodX[f], FoodY[f], 20,20);
	} else if (type == 2) {
		image(appleImg, FoodX[f], FoodY[f], 20,20);
	} else if (type == 3) {
		image(pearImg, FoodX[f], FoodY[f], 20,20);
	} else if (type == 4) {
		image(orangeImg, FoodX[f], FoodY[f], 20,20);
	} else {
		image(meatImg, FoodX[f], FoodY[f], 20,20);
	}
}