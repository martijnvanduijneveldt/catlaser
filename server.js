const mosca = require('mosca');
const server = new mosca.Server({port:1883});

server.on('ready', function(){
  console.log("MQTT server started");
  console.log("Waiting for ESP ...");
});

server.on('clientConnected', function(client) {
  console.log('client connected', client.id);
});
server.on('clientDisconnected', function(client) {
  console.log('client disconnected', client.id);
  console.log('Waiting for ESP ...')
});

module.exports = server;