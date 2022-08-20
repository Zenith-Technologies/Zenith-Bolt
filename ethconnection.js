const ethers = require('ethers');

const provider = new ethers.providers.WebSocketProvider("ws://147.135.5.39:8545");

provider.on('block', (blockNumber) => {
    console.log('New Block: ' + blockNumber);
});