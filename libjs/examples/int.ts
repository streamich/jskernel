import * as ctypes from '../ctypes';


var num = 123123123123123;
var lo = ctypes.UInt64.lo(num);
var hi = ctypes.UInt64.hi(num, lo);
console.log(num, lo, hi, ctypes.UInt64.hi(num));


var num2 = ctypes.UInt64.joinToNumber(hi, lo);
console.log(num2);


