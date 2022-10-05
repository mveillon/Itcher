/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */

import { sumList } from "./arithmetic.js";
import { flatten, getSize } from "./shapes.js";
import { numArray } from "./types.js";

/**
 * Computes the average aka mean of x.
 * ```
 * mean(1) // output; 1
 * mean([1, 2, 3]) // output: 1
 * mean([[1, 2], [3, 4]]) // output: 2.5
 * ```
 * @param x the array to measure
 * @returns the mean of x
 */
 export const mean = (x: numArray): number => {
    const size = getSize(x);
    if (size === 0) {
        throw new Error('Trying to find the mean of empty array');
    }
    return sumList(x) / size
}

/**
 * Finds the most common element in arr
 * ```
 * mode(1) // output: 1
 * mode([0, 0, 1, 2]) // output: 0
 * mode([1, 1, 0, 2, 2, 2]) // output: 2
 * mode([[0, 1], [1, 2]]) // output: 1
 * ```
 * @param arr the array to search through
 * @returns the most common element in arr
 */
 export const mode = (arr: numArray): number => {
    arr = flatten(arr);
    if (Array.isArray(arr)) {
        const flat: number[] = arr as number[];
        if (arr.length === 0) {
            throw new Error('Trying to find mode of empty array');
        };

        let counts: { [key: number]: number } = {};
        for (const n of flat) {
            counts[n] = n in counts ? counts[n] + 1 : 1;
        }
        let best: number = flat[0];
        for (const k in counts) {
            if (counts[k] > counts[best]) {
                best = parseInt(k);
            }
        }

        return best;
    }
    return arr;
}

/**
 * Returns the element n such that there are an equal number of elements
 * in arr greater than or equal to n as there are less than or equal to n
 * ```
 * median(1) // output: 1
 * median([0, 1, 2]) // output: 1
 * median([0, 0, 1, 1]) // output: 0.5
 * median([2, 2, 0, 1, 1]) // output: 1
 * median([[1, 2], [3, 4]]) // output: 2.5
 * ```
 * @param arr the array to search through
 * @returns the median of arr
 */
export const median = (arr: numArray): number => {
    arr = flatten(arr);
    if (Array.isArray(arr)) {
        const flat: number[] = arr as number[];
        if (flat.length === 0) {
            throw new Error('Trying to find median of empty array');
        }
        const s = flat.sort((a, b) => a - b);
        if (flat.length % 2 === 0) {
            return (s[arr.length / 2 - 1] + s[arr.length / 2]) / 2;
        }
        return s[Math.floor(arr.length / 2)];
    }
    return arr;
}