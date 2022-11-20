const ethers = require('ethers');

const provider = new ethers.providers.WebSocketProvider("ws://147.135.5.39:8545");

(async() => {
    await provider;
    const bal = await provider.getTransaction("0x29055d9625118fcdaee26e09f8294c9a52d5deefa48700c82571ea43c5ddbb1e");

    console.log(bal);
})();

provider.on('block', (txn) => {
    console.log(txn);
});