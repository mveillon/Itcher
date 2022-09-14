import { numArray } from "./types.js";
import { getShape, zeros, reshape } from "./shapes.js";
import { scalarMul, subArrays } from "./arithmetic.js";
import { dot } from "./calculations.js";
import { isClose } from "./comparing.js";

/**
 * Multiplies the two matrices together. If both matrices are vectors,
 * computes their dot product.
 * ```
 * matMul(2, 3) // output: 6
 * matMul(5, [1, 2, 3, 4]) // output: [5, 10, 15, 20]
 * matMul(5, [[1, 2], [3, 4]]) // output: [[5, 10], [15, 20]]
 * matMul([1, 2, 3], [4, 5, 6]) // output: 32
 * matMul([[1, 2], [3, 4]], [[1, 0], [0, 1]]) // output: [[1, 2], [3, 4]]
 * matMul([[1, 2], [3, 4]], [5, 6]) // output: [17, 39]
 * matMul([5, 6], [[1, 2], [3, 4]]) // output: [23, 34]
 * ```
 * @param m1 the first matrix
 * @param m2 the second matrix
 * @returns the matrix multiplication of m1 and m2
 */
export const matMul = (m1: numArray, m2: numArray): numArray => {
    let shape1 = getShape(m1);
    let shape2 = getShape(m2);
    if (shape1.length === 0) {
        return scalarMul(m2, m1 as number);
    }
    if (shape2.length === 0) {
        return scalarMul(m1, m2 as number);
    }
    if (shape1.length === 1 && shape2.length === 1) {
        return dot(m1 as number[], m2 as number[]);
    }
    if (shape1.length === 1) {
        m1 = [m1];
        shape1 = [1, shape1[0]];
    } else if (shape2.length === 1) {
        shape2 = [shape2[0], 1];
        m2 = reshape(m2, shape2);
    }

    if (shape1[1] !== shape2[0]) {
        throw new Error(
            'Matrix multiplication shapes not compatible ' +
            `[${getShape(m1)}] vs [${getShape(m2)}]`
        );
    }
    
    let res: number[][] = zeros([shape1[0], shape2[1]]) as number[][];
    // iteration order from https://cs61.seas.harvard.edu/wiki/images/0/0f/Lec14-Cache_measurement.pdf
    for (let k = 0; k < shape1[1]; k++) {
        for (let i = 0; i < shape1[0]; i++) {
            const point = (m1 as number[][])[i][k];
            for (let j = 0; j < shape2[1]; j++) {
                res[i][j] += point * (m2 as number[][])[k][j];
            }
        }
    }

    if (shape1[0] === 1) {
        return res[0];
    }
    if (shape2[1] === 1) {
        return reshape(res, [shape1[0]]);
    }

    return res;
}

/**
 * Transposes m.
 * ```
 * transpose([[1, 2], [3, 4]]) // output: [[1, 3], [2, 4]]
 * transpose([[1, 2], [3, 4], [5, 6]]) // output: [[1, 3, 5], [2, 4, 6]]
 * ```
 * @param m the matrix to transpose
 * @returns the transposed matrix
 */
export const transpose = (m: number[][]): number[][] => {
    let res: number[][] = [];
    for (let j = 0; j < m[0].length; j++) {
        let row: number[] = [];
        for (let i = 0; i < m.length; i++) {
            row.push(m[i][j]);
        }
        res.push(row);
    }
    return res;
}

/**
 * Returns the identity matrix with a length and width of len.
 * By definition, `matMul(eye, m)` for any `m` returns `m`, and
 * the same is true of `matMul(m, eye)`.
 * @param len how large the matrix should be
 * @returns a matrix with all zeros except along the diagonal are ones
 */
export const eye = (len: number): number[][] => {
    let res: number[][] = zeros([len, len]) as number[][];
    for (let i = 0; i < len; i++) {
        res[i][i] = 1;
    }
    return res;
}

/**
 * Finds the row-reduced echelon form of m, meaning the matrix is
 * in echelon form, the column of each row's left-most 
 * non-zero value (the pivot) has only one non-zero value, located 
 * in that row, and that pivot value is always a one. Output is saved to m
 * @param m the matrix to row-reduce. Assumed to be square. Output is saved here
 */
const rowReduce = (m: number[][]) => {
    echelon(m, 0);

    for (let i = 0; i < m.length; i++) {
        let pivot = -1;
        while (++pivot < m[i].length && m[i][pivot] === 0) {}
        if (pivot === m[i].length) break;
        m[i] = scalarMul(m[i], 1 / m[i][pivot]) as number[];

        for (let i2 = 0; i2 < m.length; i2++) {
            if (i !== i2) {
                m[i2] = subArrays(
                    m[i2],
                    scalarMul(m[i], m[i2][pivot])
                ) as number[];
            }
        }
    }
}

/**
 * Converts the matrix to echelon form, meaning the column of
 * each row's left-most non-zero value is to the right of that of 
 * the row above it. The output is saved to m
 * @param m the matrix to reduce. Assumed to be square. Output is saved here
 * @param n which row and column to change in this recursion
 */
const echelon = (m: number[][], n: number) => {
    if (n === m.length) return;

    let largest = n;
    for (let i = n + 1; i < m.length; i++) {
        if (m[largest][n] < m[i][n]) {
            largest = i;
        }
    }
    let temp: number[];
    if (largest !== n) {
        temp = m[n];
        m[n] = m[largest];
        m[largest] = temp;
    }

    if (m[n][n] !== 0) {
        for (let i = n + 1; i < m.length; i++) {
            m[i] = subArrays(
                m[i],
                scalarMul(m[n], m[i][n] / m[n][n])
            ) as number[];
        }
    }

    echelon(m, n + 1);
}

/**
 * Returns the multiplicative inverse of m. By definition,
 * `matMul(invert(m), m)` equals the identity matrix, as does
 * `matMul(m, invert(m))`. m must be square
 * ```
 * invert([[1, 2], [3, 4]]) // output: [[-2, 1], [1.5, -0.5]]
 * ```
 * @param m the matrix to invert
 * @returns the inverse of m
 */
export const invert = (m: number[][]): number[][] => {
    const shape = getShape(m);
    if (m.length === 0 || m.length !== m[0].length) {
        throw new Error(`Singular matrix with shape [${shape}]`);
    }

    const i = eye(m.length);
    let aug = m.map((r, ind) => r.concat(i[ind]));
    rowReduce(aug);
    for (let i = 0; i < m.length; i++) {
        for (let j = 0; j < m[i].length; j++) {
            if (!isClose(aug[i][j], +(i === j))) {
                throw new Error(
                    'Singular matrix: element at ' +
                    `[${i}, ${j}] should be ${+(i === j)} ` +
                    `but is ${aug[i][j]}`
                );
            }
        }
    }

    return aug.map(r => r.slice(m.length, aug[0].length));
}
