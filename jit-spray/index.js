const { memoryUsage } = require("process");

const results = [];

for (let i = 0; i < 10000; i++){
    const payload = 0x050f3cb0c031;
    results.push(payload^i);
}

