const server = require('./server');
const states = require('./states');
const settings = require('./settings');

server.on('clientConnected', function(client) {
  setTimeout(function(){
    states.connected = true;
    reset();
  },100);
});
server.on('clientDisconnected', function(client) {
  states.connected = false;
});

const lastMoves = {
  xAxis:new Date(),
  yAxis:new Date()
}

const stepSize = 1;
const stepInterval = 100;

function toggleLed(){
  states.led = states.led === 0 ? 1 : 0;
  const message = {
    topic: '/CatLaser/gpio/'+settings.ledPin,
    payload: states.led.toString(),
    qos: 0,
    retain: false
  };
  server.publish(message, function() {
    console.log('Toggling led');
  });
}
module.exports.toggleLed = toggleLed;

function moveRight(){
  if(!states.connected){
    return;
  } 
  states.xAxis-= stepSize;
  if(states.xAxis < 0){
    states.xAxis = 0;
  }
  moveXAxis();
}
module.exports.moveRight = moveRight;
function moveLeft(){
  if(!states.connected){
    return;
  }
  states.xAxis += stepSize;
  if(states.xAxis > 180){
    states.xAxis = 180;
  }
  moveXAxis();
}
module.exports.moveLeft = moveLeft;

function moveUp(){
  if(!states.connected){
    return;
  }
  states.yAxis-= stepSize;
  if(states.yAxis < 0){
    states.yAxis = 0;
  }
  moveYAxis();
}
module.exports.moveUp = moveUp;
function moveDown(){
  if(!states.connected){
    return;
  }
  states.yAxis += stepSize;
  if(states.yAxis > 180){
    states.yAxis = 180;
  }
  moveYAxis();
}
module.exports.moveDown = moveDown;

function moveXAxis(){
  if(new Date() - lastMoves.xAxis < stepInterval){
    return;
  }
  console.log("Moving X", states.xAxis)
  states.fixed = false;
  lastMoves.xAxis = new Date();
  const message = {
    topic: '/CatLaser/cmd',
    payload: "Servo 1 "+settings.xAxisGpio+" "+states.xAxis,
    qos: 0,
    retain: false
  };
  server.publish(message);
}

function moveYAxis(){
  if(new Date() - lastMoves.yAxis < stepInterval){
    return;
  }
  console.log("Moving Y", states.yAxis)
  states.fixed = false;
  lastMoves.yAxis = new Date();
  const message = {
    topic: '/CatLaser/cmd',
    payload: "Servo 2 "+settings.yAxisGpio+" "+states.yAxis,
    qos: 0,
    retain: false
  };
  server.publish(message);
}

function reset(){
  states.fixed = false;
  const message = {
    topic: '/CatLaser/gpio/'+settings.ledPin,
    payload: states.led.toString(),
    qos: 0,
    retain: false
  };
  const message2 = {
    topic: '/CatLaser/cmd',
    payload: "Servo 1 "+settings.xAxisGpio+" "+states.xAxis,
    qos: 0,
    retain: false
  };
  const message3 = {
    topic: '/CatLaser/cmd',
    payload: "Servo 2 "+settings.yAxisGpio+" "+states.yAxis,
    qos: 0,
    retain: false
  };
  server.publish(message);
  server.publish(message2);
  server.publish(message3);
  console.log('init requested');
}
module.exports.reset = reset;

function fixJitter(){
  if(!states.connected || states.fixed || new Date() - lastMoves.yAxis < 1000 || new Date() - lastMoves.xAxis < 1000){
    return;
  }
  console.log("Disabling servos");

  states.fixed = true;

  // Fixes jitter
const message1 = {
  topic: '/CatLaser/cmd',
  payload: "Servo 1 "+settings.xAxisGpio+" 9000",
  qos: 0,
  retain: false
};
server.publish(message1);
  // Fixes jitter
  const message2 = {
    topic: '/CatLaser/cmd',
    payload: "Servo 2 "+settings.yAxisGpio+" 9000",
    qos: 0,
    retain: false
  };
  server.publish(message2);
}

module.exports.initJitterFix = function(interval){
  setInterval(fixJitter, interval)
}