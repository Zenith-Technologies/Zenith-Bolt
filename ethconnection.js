const ethers = require('ethers');

const provider = new ethers.providers.WebSocketProvider("ws://147.135.5.39:8545");

(async() => {
    console.log((new ethers.Wallet("6ea007ab470f0a024175d4188d451bb034d567c7b8368ca7d8781e4744e0e0bf")).address);
    await provider;
    const bal = await provider.getTransaction("0x29055d9625118fcdaee26e09f8294c9a52d5deefa48700c82571ea43c5ddbb1e");

    console.log(bal);
})();

provider.on('block', (txn) => {
    console.log(txn);
});