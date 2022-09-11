import { numArray } from "./types.js";
import { addArrays } from "./arithmetic.js";
import { broadcast, getSize } from "./shapes.js";
import { mean } from "./measuresOfCenter";

/**
 * Calculates the mean squared error between x and y.
 * x and y can be of any shape and are broadcast and compared
 * element-wise.
 * ```
 * console.log(mse([0, 1, 2], [3, 2, 1])) // output: 3.66666667
 * console.log(mse([0, 1, 2], 1)) // output: 0.66666667
 * console.log(mse([[0, 1], [2, 3]], [0, 1, 2, 3])) // output: 0
 * ```
 * @param x the first array of numbers
 * @param y the second array of numbers
 * @returns the mean squared error between x and y
 */
 export const mse = (x: numArray, y: numArray): number => {
    const l = Math.max(getSize(x), getSize(y))
    return l === 0 ? 0 : squareDistance(x, y) / l;
}

/**
 * Returns the square (for efficiency) of the Euclidean distance 
 * between x and y. Arrays are broadcast and compared element-wise
 * ```
 * console.log(squareDistance([0, 1, 2], [3, 2, 1])) // output: 11
 * console.log(squareDistance([0, 1, 2], 1)) // output: 2
 * console.log(squareDistance([[0, 1], [2, 3]], [0, 1, 2, 3])) // output: 0
 * ```
 * @param x the first array/vector
 * @param y the second array/vector
 * @returns the squared distance between x and y
 */
export const squareDistance = (x: numArray, y: numArray): number => {
    [x, y] = broadcast(x, y);

    if (Array.isArray(x)) {
        let total = 0;
        for (let i = 0; i < x.length; i++) {
            total += squareDistance(x[i], (y as number[])[i]);
        }
        return total;
    }
    return Math.pow(x - (y as number), 2);
}

/**
 * Computes the Manhattan distance between x and y. x and y are broadcast
 * together and compared element-wise.
 * ```
 * console.log(manhattanDistance([0, 1, 2], [3, 2, 1])) // output: 5
 * console.log(manhattanDistance([0, 1, 2], 1)) // output: 2
 * console.log(manhattanDistance([[0, 1], [2, 3]], [0, 1, 2, 3])) // output: 0
 * ```
 * @param x the first array of numbers
 * @param y the second array of numbers
 * @returns the Manhattan distance between x and y
 */
export const manhattanDistance = (x: numArray, y: numArray): number => {
    [x, y] = broadcast(x, y);
    
    if (Array.isArray(x)) {
        let total = 0;
        for (let i = 0; i < x.length; i++) {
            total += manhattanDistance(x[i], (y as number[])[i]);
        }
        return total;
    }
    return Math.abs(x - (y as number));
}

/**
 * Returns the correlation between x and y. x and y are broadcast together
 * and compared element-wise. A correlation of 1 means a perfect positive 
 * correlation, while -1 means a perfect negative correlation. 0 means no
 * correlation.
 * ```
 * console.log(correlation([1, 2, 3], [4, 5, 6])) // output: 1
 * console.log(correlation([[1, 2], [3, 4]], [-1, -2, -3, -4])) // output: -1
 * console.log(correlation([1, 2, 3], [1, 1, 1])) // output: 0
 * console.log(correlation([1, 2, 3], 1)) // output: 0
 * ```
 * @param x 
 * @param y 
 * @returns 
 */
export const correlation = (x: numArray, y: numArray): number => {
    [x, y] = broadcast(x, y);

    const xAvg = mean(x);
    const yAvg = mean(y);

    const helper = (arr1: numArray, arr2: numArray): [number, [number, number]] => {
        if (Array.isArray(arr1)) {
            let num = 0;
            let denom: [number, number] = [0, 0];
            for (let i = 0; i < arr1.length; i++) {
                const [subNum, subDenom] = helper(arr1[i], (arr2 as number[])[i]);
                num += subNum;
                denom = addArrays(denom, subDenom) as [number, number];
            }
            return [num, denom];
        }
        const xDiff = arr1 - xAvg;
        const yDiff = (arr2 as number) - yAvg;
        return [
            xDiff * yDiff,
            [Math.pow(xDiff, 2), Math.pow(yDiff, 2)]
        ];
    }

    const [num, [d1, d2]] = helper(x, y);
    const prod = d1 * d2;
    return prod === 0 ? 0 : num / Math.sqrt(prod);
}

/**
 * Returns the square (for efficiency) of the magnitude (distance from origin)
 * of x.
 * ```
 * console.log(squaredMag(1)) // output: 1
 * console.log(squaredMag([1, 2, 3])) // output: 14
 * console.log(squaredMag([[1, 2], [3, 4]])) // output: 30
 * ```
 * @param x 
 * @returns 
 */
export const squaredMag = (x: numArray): number => {
    return squareDistance(x, 0);
}
