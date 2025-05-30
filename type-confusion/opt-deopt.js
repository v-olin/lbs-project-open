// run with node --allow-natives-syntax --trace_opt --trace_deopt
function printStatus(status) {
    console.log(status.toString(2).padStart(12, '0'));
    if (status & (1 << 0)) { console.log("is function"); }
    if (status & (1 << 1)) { console.log("is never optimized"); }
    if (status & (1 << 2)) { console.log("is always optimized"); }
    if (status & (1 << 3)) { console.log("is maybe deoptimized"); }
    if (status & (1 << 4)) { console.log("is optimized"); }
    if (status & (1 << 5)) { console.log("is optimized by TurboFan"); }
    if (status & (1 << 6)) { console.log("is interpreted"); }
    if (status & (1 << 7)) { console.log("is marked for optimization"); }
    if (status & (1 << 8)) { console.log("is marked for concurrent optimization"); }
    if (status & (1 << 9)) { console.log("is optimizing concurrently"); }
    if (status & (1 << 10)) { console.log("is executing"); }
    if (status & (1 << 11)) { console.log("topmost frame is turbo fanned"); }
}

function addOne(x) {
    return x + 1;
}

let currStat = %GetOptimizationStatus(addOne);
for (let i = 0; i <= 1000000; i++) {
    addOne(i);
    let newStat = %GetOptimizationStatus(addOne);
    if (currStat !== newStat) {
        console.log(`Status changed at iteration ${i}: ${currStat} -> ${newStat}`);
        currStat = newStat;
        printStatus(currStat);
    }
}

console.log(addOne("hello"));
printStatus(%GetOptimizationStatus(addOne));