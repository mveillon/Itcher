import { numArray } from "./types.js";
import { broadcast, zeros } from "./shapes.js";

/**
 * Adds the two n-dimensional matrices element-wise.
 * ```
 * console.log(addArrays(1, 2)) // output: 3
 * console.log(addArrays([1, 2, 3], [3, 4, 5])) // output: [4, 6, 8]
 * console.log(addArrays(2, [1, 2, 3])) // output: [3, 5, 7]
 * ```
 * @param a1 the first matrix
 * @param a2 the second matrix
 * @returns their element-wise sum
 */
 export const addArrays = (a1: numArray, a2: numArray): numArray => {
    [a1, a2] = broadcast(a1, a2);

    if (Array.isArray(a1)) {
        let res: numArray = [];
        for (let i = 0; i < a1.length; i++) {
            res.push(addArrays(a1[i], (a2 as number[])[i]));
        }
        return res
    }

    return a1 + (a2 as number);
}

/**
 * Subtracts the two n-dimensional matrices element-wise.
 * ```
 * console.log(subArrays(2, 1)) // output: 1
 * console.log(subArrays([3, 4, 5], [1, 2, 3])) // output: [2, 2, 2]
 * console.log(subArrays([1, 2, 3], 1)) // output: [0, 1, 2]
 * console.log(subArrays(3, [1, 2, 3])) // output: [2, 1, 0]
 * ```
 * @param a1 the first matrix
 * @param a2 the second matrix
 * @returns a1 - a2 element-wise
 */
 export const subArrays = (a1: numArray, a2: numArray): numArray => {
    return addArrays(a1, scalarMul(a2, -1));
}

/**
 * Multiplies every element of A by x and returns a new matrix.
 * ```
 * console.log(scalarMul(1, 2)) // output: 2
 * console.log(scalarMul([1, 2, 3], 3)) // output: [3, 6, 9]
 * console.log(scalarMul([2, 4, 6], 0.5)) // output: [1, 2, 3]
 * ```
 * @param x the scalar
 * @param A the matrix to multiply
 * @returns the result of x * A
 */
 export const scalarMul = (A: numArray, x: number): numArray => {
    if (Array.isArray(A)) {
        let res: numArray = [];
        for (const row of A) {
            res.push(scalarMul(row, x));
        }
        return res;
    }
    
    return x * A;
}

/**
 * Returns the averages of the columns of A.
 * ```
 * console.log(colAverage([[1, 2], [3, 4]])) // output: [2, 3]
 * ```
 * @param A the 2D matrix to average
 * @returns the column-wise average of A
 */
 export const colAverage = (A: number[][]): number[] => {
    if (A.length === 0) return [];
    const total = A.reduce(
        (accum, row) => addArrays(accum, row) as number[],
        zeros([A[0].length])
    );
    return scalarMul(total, 1 / A.length) as number[];
}

/**
 * Returns the sum of every element of the n-dimensional list.
 * ```
 * console.log(sumList(1)) // output: 1
 * console.log(sumList([1, 2, 3])) // output: 6
 * console.log(sumList([[1, 2], [3, 4]])) // output: 10
 * ```
 * @param x the array of numbers
 * @returns the sum of every element in x
 */
 export const sumList = (x: numArray): number => {
    if (Array.isArray(x)) {
        return x.map(sumList).reduce((a, b) => a + b, 0);
    }
    return x;
}

