const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

var mosca = require('mosca');
var settings = {
		port:1883
}

var server = new mosca.Server(settings);

server.on('ready', function(){
  console.log("ready");
  console.log("Waiting for ESP");
});

server.on('clientConnected', function(client) {
  console.log('client connected', client.id);
  states.connected = true;
});
server.on('clientDisconnected', function(client) {
  console.log('client disconnected', client.id);
  states.connected = false;
});

// fired when a message is received
// server.on('published', function(packet) {
//   console.log("Received message",packet.topic, packet.payload.toString());
// });

const states = {
  connected:false,
  led:0,
  xAxis:0,
  yAxis:0
}

const lastMoves = {
  xAxis:new Date(),
  yAxis:new Date()
}

function toggleLed(){
  states.led = states.led === 0 ? 1 : 0;
  var message = {
    topic: '/CatLaser/gpio/16',
    payload: states.led.toString(),
    qos: 0, // 0, 1, or 2
    retain: false // or true
  };
  server.publish(message, function() {
    console.log('Toggling led');
  });
}

function moveRight(){
  if(new Date() - lastMoves.xAxis < 100){
    return;
  }
  lastMoves.xAxis = new Date();
  states.xAxis-= 5;
  if(states.xAxis < 0){
    states.xAxis = 0;
  }
  moveXAxis();
}
function moveLeft(){
  if(new Date() - lastMoves.xAxis < 100){
    return;
  }
  lastMoves.xAxis = new Date();
  states.xAxis += 5;
  if(states.xAxis > 180){
    states.xAxis = 180;
  }
  moveXAxis();
}

function moveUp(){
  if(new Date() - lastMoves.yAxis < 100){
    return;
  }
  lastMoves.yAxis = new Date();
  states.yAxis-= 5;
  if(states.yAxis < 0){
    states.yAxis = 0;
  }
  moveYAxis();
}
function moveDown(){
  if(new Date() - lastMoves.yAxis < 100){
    return;
  }
  lastMoves.yAxis = new Date();
  states.yAxis += 5;
  if(states.yAxis > 180){
    states.yAxis = 180;
  }
  moveYAxis();
}

function moveXAxis(){
  var message = {
    topic: '/CatLaser/cmd',
    payload: "Servo 1 0 "+states.xAxis,
    qos: 0, // 0, 1, or 2
    retain: false // or true
  };
  server.publish(message);
}

function moveYAxis(){
  var message = {
    topic: '/CatLaser/cmd',
    payload: "Servo 2 13 "+states.yAxis,
    qos: 0,
    retain: false
  };
  server.publish(message);
}


function reset(){
  var message = {
    topic: '/CatLaser/gpio/16',
    payload: "0",
    qos: 0, // 0, 1, or 2
    retain: false // or true
  };
  console.log('init requested');
  server.publish(message);
}

process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    process.exit();
  } else if(key.name === "right"){
    moveRight();
  } else if(key.name === "left"){
    moveLeft();
  } else if(key.name === "up"){
    moveUp();
  } else if(key.name === "down"){
    moveDown();
  } else if(key.name === "r"){
    reset();
  } else if(key.name === "space"){
      toggleLed();
  } else {
    console.log(`You pressed the "${str}" key`);
    console.log();
    console.log(key);
    console.log();
  }
});
console.log('Press any key...');
