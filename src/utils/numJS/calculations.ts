import { numArray } from "./types.js";
import { getSize } from "./shapes.js";
import { squareDistance } from "./metrics.js";
import { mean } from "./measuresOfCenter.js";

/**
 * Returns the dot product of x and y
 * ```
 * console.log(dot([1], [2])) // output: 2
 * console.log(dot([1, 2, 3], [4, 5, 6])) // output: 32 
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
 * console.log(variance(1)) // output: 0
 * console.log(variance([1, 1, 1, 1])) // output: 0
 * console.log(variance([0, 1, 1, 2])) // output; 0.5
 * ```
 * @param x the array to measure
 * @returns the variance of x
 */
export const variance = (x: numArray): number => {
    return squareDistance(x, mean(x)) / getSize(x);
}

/**
 * Sigmoid function to floor x to somewhere between 0 and 1
 * ```
 * console.log(sigmoid(0)) // output: 0.5
 * console.log(sigmoid(1)) // output: ~0.731
 * console.log(sigmoid(-1)) // output: ~0.2689
 * ```
 * @param x the number to reduce
 * @returns `1 / (1 + Math.exp(-x))`
 */
 export const sigmoid = (x: number): number => {
    return 1 / (1 + Math.exp(-x));
}
