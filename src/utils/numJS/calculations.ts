/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */

import { numArray } from "./types.js";
import { getSize, zeros } from "./shapes.js";
import { squareDistance } from "./metrics.js";
import { mean } from "./measuresOfCenter.js";
import { colAverage, addArrays, scalarMul } from "./arithmetic.js";

/**
 * Returns the dot product of x and y
 * ```
 * dot([1], [2]) // output: 2
 * dot([1, 2, 3], [4, 5, 6]) // output: 32 
 * ```
 * @param x the first vector
 * @param y the second vector
 * @returns the dot product
 */
 export const dot = (x: number[], y: number[]): number => {
    let res = 0;
    for (let i = 0; i < Math.min(x.length, y.length); i++) {
        res += x[i] * y[i];
    }
    return res;
}

/**
 * Computes the variance (square of the standard deviation) of x.
 * ```
 * variance([1, 1, 1, 1]) // output: 0
 * variance([0, 1, 1, 2]) // output; 0.6666667
 * ```
 * @param x the array to measure
 * @returns the variance of x
 */
export const variance = (x: numArray): number => {
    return squareDistance(x, mean(x)) / (getSize(x) - 1);
}

/**
 * Sigmoid function to floor x to somewhere between 0 and 1
 * ```
 * sigmoid(0) // output: 0.5
 * sigmoid(1) // output: ~0.731
 * sigmoid(-1) // output: ~0.2689
 * ```
 * @param x the number to reduce
 * @returns `1 / (1 + Math.exp(-x))`
 */
 export const sigmoid = (x: number): number => {
    return 1 / (1 + Math.exp(-x));
}

/**
 * Returns the column-wise variances of x.
 * ```
 * colVariance([[0, 1, 2], [0, 2, 1]]) // output: [0, 0.5, 0.5]
 * ```
 * @param x the matrix to measure
 * @returns the column-wise variances of x
 */
export const colVariance = (x: number[][]): number[] => {
    const avgs = colAverage(x);
    let sums: number[] = zeros([avgs.length]) as number[];
    for (const row of x) {
        let diffs: number[] = [];
        for (let i = 0; i < row.length; i++) {
            diffs.push(Math.pow(row[i] - avgs[i], 2));
        }
        sums = addArrays(sums, diffs) as number[];
    }
    return scalarMul(sums, 1 / (x.length - 1)) as number[];
}
