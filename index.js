const targetTimestamp = 1672418940;

setTimeout(() => {
    console.log("Current:", Date.now()/1000);
    console.log("Target:", targetTimestamp)
}, (targetTimestamp-(Date.now()/1000)) * 1000);

console.log("delay", targetTimestamp-(Date.now()/1000));