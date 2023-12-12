const ethers = require('ethers');

const provider = new ethers.providers.WebSocketProvider("ws://147.135.5.39:8545");

(async() => {
    console.log((new ethers.Wallet("#")).address);
    await provider;
    const bal = await provider.getTransaction("#");

    console.log(bal);
})();

provider.on('block', (txn) => {
    console.log(txn);
});
