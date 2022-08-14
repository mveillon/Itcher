export type ndArray = number | ndArray[];

/**
 * Makes sure the two arrays are compatible for math operations
 * @param a1 the first array
 * @param a2 the second array
 */
const checkInputs = (a1: ndArray, a2: ndArray) => {
    if (
        (typeof a1 !== typeof a2) ||
        (typeof a1 !== 'number' && a1.length !== (a2 as number[]).length)
    ) {
        throw new Error(`Mismatched shapes: ${a1} and ${a2}`);
    }
}

/**
 * Adds the two n-dimensional matrices element-wise
 * @param a1 the first matrix
 * @param a2 the second matrix
 * @returns their element-wise sum
 */
export const addArrays = (a1: ndArray, a2: ndArray): ndArray => {
    checkInputs(a1, a2);
    if (typeof a1 === 'number') {
        return a1 + (a2 as number);
    }

    let res: ndArray = [];
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
export const subArrays = (a1: ndArray, a2: ndArray): ndArray => {
    return addArrays(a1, scalarMul(-1, a2));
}

/**
 * Multiplies every element of A by x and returns a new matrix
 * @param x the scalar
 * @param A the matrix to multiply
 * @returns the result of x * A
 */
export const scalarMul = (x: number, A: ndArray): ndArray => {
    if (typeof A === 'number') {
        return x * A;
    }

    let res: ndArray = [];
    for (const row of A) {
        res.push(scalarMul(x, row));
    }
    
    return res;
}

/**
 * Flattens the n-dimensional array into just one array
 * @param A the array to flatten
 */
export const flatten = (A: ndArray): number | number[] => {
    if (typeof A === 'number') {
        return A;
    }
    
    return [].concat(...A.map(flatten));
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
