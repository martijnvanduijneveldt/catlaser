const readline = require('readline');
const functions = require('./functions')

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    process.exit();
  } else if(key.name === "right"){
    functions.moveRight();
  } else if(key.name === "left"){
    functions.moveLeft();
  } else if(key.name === "up"){
    functions.moveUp();
  } else if(key.name === "down"){
    functions.moveDown();
  } else if(key.name === "r"){
    functions.reset();
  } else if(key.name === "space"){
    functions.toggleLed();
  }
});

console.log('Press ctrl+c to exit ...')
console.log('Press \'r\' to reset');
console.log('Press \'space\' to toggle laser');
console.log('Use arrow keys to move ')
console.log('')

functions.logIp()
console.log('')

