import { numArray } from "./types.js";
import { broadcast } from "./shapes.js";

/**
 * Adds the two n-dimensional matrices element-wise
 * @param a1 the first matrix
 * @param a2 the second matrix
 * @returns their element-wise sum
 */
 export const addArrays = (a1: numArray, a2: numArray): numArray => {
    [a1, a2] = broadcast(a1, a2);
    if (typeof a1 === 'number') {
        return a1 + (a2 as number);
    }

    let res: numArray = [];
    for (let i = 0; i < a1.length; i++) {
        res.push(addArrays(a1[i], (a2 as number[])[i]));
    }
    return res;
}

/**
 * Subtracts the two n-dimensional matrices element-wise
 * @param a1 the first matrix
 * @param a2 the second matrix
 * @returns a1 - a2 element-wise
 */
 export const subArrays = (a1: numArray, a2: numArray): numArray => {
    return addArrays(a1, scalarMul(-1, a2));
}

/**
 * Multiplies every element of A by x and returns a new matrix
 * @param x the scalar
 * @param A the matrix to multiply
 * @returns the result of x * A
 */
 export const scalarMul = (x: number, A: numArray): numArray => {
    if (typeof A === 'number') {
        return x * A;
    }

    let res: numArray = [];
    for (const row of A) {
        res.push(scalarMul(x, row));
    }
    
    return res;
}

/**
 * Returns the averages of the columns of A
 * @param A the 2D matrix to average
 * @returns the column-wise average of A
 */
 export const colAverage = (A: number[][]): number[] => {
    if (A.length === 0) return [];
    let res = A[0];
    for (let i = 1; i < A.length; i++) {
        res = addArrays(res, A[i]) as number[];
    }
    return scalarMul(1 / A.length, res) as number[];
}

/**
 * Returns the sum of every element of the n-dimensional list
 * @param x the array of numbers
 * @returns the sum of every element in x
 */
 export const sumList = (x: numArray): number => {
    if (typeof x === 'number') {
        return x;
    }
    return x.map(sumList).reduce((a, b) => a + b, 0);
}

