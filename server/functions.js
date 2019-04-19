const server = require('./server');
const states = require('./states');
const os = require( 'os' );
const networkInterfaces = os.networkInterfaces( );

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
const stepInterval = 15;

module.exports.logIp = function(){
  console.log("Your computer has the following ip's :")
  for(const interfaceName in networkInterfaces){
    const interfaceIps = networkInterfaces[interfaceName];
    for(const ip of interfaceIps){
      if(ip.family === "IPv4"){
        let ipAddr = ip.address;
        if(ipAddr === "127.0.0.1"){
          continue;
        }
        while(ipAddr.length < 15){
          ipAddr += " ";
        }
        console.log(ipAddr+" : "+interfaceName)
      }
    }
  }
}

function toggleLed(){
  states.led = states.led === 0 ? 1 : 0;
  const message = {
    topic: 'laser',
    payload: states.led.toString(),
  };
  console.log('Toggling led');
  sendMessage(message);
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
    topic: 'servo1',
    payload: states.xAxis.toString(),
  };
  sendMessage(message);
}

function moveYAxis(){
  if(new Date() - lastMoves.yAxis < stepInterval){
    return;
  }
  console.log("Moving Y", states.yAxis)
  states.fixed = false;
  lastMoves.yAxis = new Date();
  const message = {
    topic: 'servo2',
    payload: states.yAxis.toString(),
  };
  sendMessage(message);
}

function reset(){
  states.fixed = false;
  const message = {
    topic: 'laser',
    payload: states.led.toString(),
  };
  const message2 = {
    topic: 'servo1',
    payload: states.xAxis.toString(),
  };
  const message3 = {
    topic: 'servo2',
    payload: states.yAxis.toString(),
  };
  sendMessage(message);
  sendMessage(message2);
  sendMessage(message3);
  console.log('reset requested');
}
module.exports.reset = reset;

function sendMessage(message){
  message.qos = 0;
  message.retain = false;
  server.publish(message);
}

function fixJitter(){
  if(!states.connected || states.fixed || new Date() - lastMoves.yAxis < 1000 || new Date() - lastMoves.xAxis < 1000){
    return;
  }
  console.log("Disabling servos");

  states.fixed = true;

  // Fixes jitter
const message1 = {
  topic: 'servo1',
  payload: "9000",
  qos: 0,
  retain: false
};
sendMessage(message1);
  // Fixes jitter
  const message2 = {
    topic: 'servo2',
    payload: "9000",
  };
  sendMessage(message2);
}

module.exports.initJitterFix = function(interval){
  setInterval(fixJitter, interval)
}