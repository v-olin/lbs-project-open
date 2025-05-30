function get_first(arr){
    var x = 500;
    // Add side effects to prevent inlining
    for (var i = 0; i < x / 2; i++){
        if(x % i == 0)
            var z = 5;
    }
    return arr[0];
}

my_constants = [1.41, 2.72, 3.14];

my_obj = {"a":1, "b":2, "c":3};
my_arr = [my_obj, my_obj, my_obj];

// trigger Turbofan optimization
for (var i = 0; i < 100000; i++){
    get_first(my_constants);
}

console.log(get_first(my_constants));   // 1.41
console.log(my_arr[0]); // [object Object]
console.log(get_first(my_arr)); // 5.752508329577218e-270