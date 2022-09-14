import { boolArray, ndArray, numArray } from "./types.js";

/**
 * Maps func onto every element of x and returns a new array of the same shape as x.
 * ```
 * let double = n => 2 * n;
 * ndMap(1, double) // output: 2
 * ndMap([1, 2, 3], double) // output: [2, 4, 6]
 * ndMap([[1, 2], [3, 4, 5]], double) // output: [[2, 4], [6, 8, 10]]
 * ```
 * @param x the ndArray of any type
 * @param func a function that takes an element of x and returns something else
 * @returns func mapped onto x
 */
 export const ndMap = <T, U>(x: ndArray<T>, func: (val: T) => U): ndArray<U> => {
    if (Array.isArray(x)) {
        let res: ndArray<U> = [];
        for (const nested of x) {
            res.push(ndMap(nested, func));
        }
        return res;
    }
    return func(x);
}

/**
 * Converts the array of booleans to numbers.
 * ```
 * toNum(false) // output: 0
 * toNum(true) // output: 1
 * toNum([true, false, false]) // output: [1, 0, 0]
 * toNum([[true, false], [false, false]]) // output: [[1, 0], [0, 0]]
 * ```
 * @param bools an nd array of bools
 * @returns the same array with every `true` mapped to one and every `false`
 * mapped to 0
 */
export const toNum = (bools: boolArray): numArray => {
    return ndMap(bools, b => +b);
}

/**
 * Converts the array of numbers to booleans.
 * ```
 * toBool(0) // output: false
 * toBool(2) // output: true
 * toBool([0, 1, 2]) // output: [false, true, true]
 * toBool([[0, 1], [-2, 0]]) // output: [[false, true], [true, false]]
 * ```
 * @param nums an nd array of numbers
 * @returns the same array with every zero mapped to `false` and every other
 * value mapped to `true`
 */
export const toBool = (nums: numArray): boolArray => {
    return ndMap(nums, n => !!n);
}
