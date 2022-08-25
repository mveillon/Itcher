export type ndArray<T> = T | ndArray<T>[];

export type numArray = ndArray<number>;
export type boolArray = ndArray<boolean>;

/**
 * Makes sure the two arrays are compatible for math operations
 * @param a1 the first array
 * @param a2 the second array
 */
const checkInputs = <T>(a1: ndArray<T>, a2: ndArray<T>) => {
    if (
        (Array.isArray(a1) !== Array.isArray(a2)) ||
        (Array.isArray(a1) && a1.length !== (a2 as T[]).length)
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
export const addArrays = (a1: numArray, a2: numArray): numArray => {
    checkInputs(a1, a2);
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
 * Flattens the n-dimensional array into just one array
 * @param A the array to flatten
 */
export const flatten = <T>(A: ndArray<T>): T | T[] => {
    if (Array.isArray(A)) {
        return [].concat(...A.map(flatten));
    } else {
        return A;
    }
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
 * Finds the index of the best element in x, based on comp
 * @param x the array to look through
 * @param comp how to compare the elements of x. Should return true if the first arg is "better"
 * than the second
 * @returns the index of the best element in x
 */
export const argBest = <T>(x: T[], comp: (a: T, b: T) => boolean): number => {
    if (x.length === 0) {
        throw new Error('Empty array');
    }
    let b = 0;
    for (let i = 0; i < x.length; i++) {
        if (comp(x[i], x[b])) {
            b = i;
        }
    }
    return b;
}

/**
 * Returns the index of the smallest elemeent of x
 * @param x the array to look at
 * @returns where the smallest element is
 */
export const argMin = <T>(x: T[]): number => {
    return argBest(x, (a, b) => a < b);
}

/**
 * Returns the index of the largest elemeent of x
 * @param x the array to look at
 * @returns where the largest element is
 */
export const argMax = <T>(x: T[]): number => {
    return argBest(x, (a, b) => a > b);
}

/**
 * Returns an array where `ith` element corresponds to whether `x[i]` is close enough to `y[i]`,
 * where close enough means within floating-point error bars. Uses the formula `abs(x - y) <= atol + rtol * abs(y)`
 * @param x the first array
 * @param y the second array
 * @param rtol the relative tolerance, which is multiplied by the elements of b
 * @param atol the absolute tolerance. Should be non-zero when x and y have elements that are both zero
 * @returns an ndArray of which values of x and y are close
 */
export const isClose = (x: numArray, y: numArray, rtol: number = 1e-5, atol: number = 1e-8): boolArray => {
    checkInputs(x, y);
    if (typeof x === 'number') {
        return Math.abs(x - (y as number)) <= atol + rtol * Math.abs(y as number);
    }

    let res: ndArray<boolean> = [];
    for (let i = 0; i < x.length; i++) {
        res.push(isClose(x[i], (y as number[])[i], rtol, atol));
    }
    return res;
}

/**
 * Helper function for any and all. Goes through each subarray of bools and
 * checks if any satisfy the criterion. If they do, this will return ifTrue.
 * Otherwise, it returns !ifTrue
 * @param bools the ndArray of booleans to look at
 * @param criterion a function that determines when to early return
 * @param ifTrue what to return when criterion returns tre
 * @returns ifTrue if at least one subarray satisfies criterion, else !ifTrue
 */
const nestedSatisfies = (
    bools: boolArray, 
    criterion: (b: boolean) => boolean, 
    ifTrue: boolean
    ): boolean => {
    if (typeof bools === 'boolean') {
        return bools;
    }
    if (bools.length === 0) return false;

    for (const nested of bools) {
        if (criterion(nestedSatisfies(nested, criterion, ifTrue))) {
            return ifTrue;
        }
    }

    return !ifTrue;
}

/**
 * Returns whether every element of bools is true. 
 * Returns false if bools is empty
 * @param bools an n-dimensional array of booleans
 * @returns whether all elements of bools are true
 */
export const all = (bools: boolArray): boolean => {
    return nestedSatisfies(bools, b => !all(b), false);
}

/**
 * Returns whether any element of bools is true.
 * Returns false if bools is empty
 * @param bools an n-dimensional array of booleans
 * @returns whether any elements of bools are true
 */
 export const any = (bools: boolArray): boolean => {
    return nestedSatisfies(bools, b => any(b), true);
}

/**
 * Returns whether every element of x is close to every element of y, using the formula
 * `abs(x - y) <= atol + rtol * abs(y)
 * @param x the first array
 * @param y the second array
 * @param rtol the relative tolerance, which is multiplied by the elements of b
 * @param atol the absolute tolerance. Should be non-zero when x and y have elements that are both zero
 * @returns whether every element of x is close to every element of y
 */
export const allClose = (x: numArray, y: numArray, rtol: number = 1e-5, atol: number = 1e-8): boolean => {
    return all(isClose(x, y, rtol, atol));
}

/**
 * Maps func onto every element of x and returns a new array of the same shape as x
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

/**
 * Returns an array full of whatever the value is in any arbitrary shape
 * @param shape the size of each dimension of the output
 * @param value what value to fill the array with
 * @returns an array with the given shape and every value equal to the given value
 */
export const full = <T>(shape: number[], value: T): ndArray<T> => {
    if (shape.length === 0) {
        return value;
    }
    let res: ndArray<T> = [];
    const rest = shape.slice(1, shape.length);
    for (let i = 0; i < shape[0]; i++) {
        res.push(full(rest, value));
    }

    return res;
}

/**
 * Returns the shape of the array, which should be of uniform dimension
 * to allow for basically constant time calculation
 * @param arr the array to measure
 * @returns the shape of the array as an array
 */
export const getShape = <T>(arr: ndArray<T>): number[] => {
    if (Array.isArray(arr)) {
        let res = [arr.length];
        if (arr.length === 0) return res;
        return res.concat(getShape(arr[0]));
    } else {
        return [];
    }
} 

/**
 * Returns a shallow copy of arr. Changing any of the subarrays of the copy
 * will not change the original, but changing a value within a subarray might
 * change the same value in the original
 * @param arr the array to copy
 * @returns a shallow copy of arr with the same elements
 */
export const copyArr = <T>(arr: ndArray<T>): ndArray<T> => {
    if (Array.isArray(arr)) {
        let res: ndArray<T> = [];
        for (let i = 0; i < arr.length; i++) {
            res.push(copyArr(arr[i]));
        }
        return res;
    } else {
        return arr;
    }
}

/**
 * Convenience function to create an array full of zeros
 * @param shape the shape of the array to create
 * @returns an array of all zeros
 */
export const zeros = (shape: number[]): numArray => {
    return full(shape, 0);
}

/**
 * Convenience function to create an array full of ones
 * @param shape the shape of the array to create
 * @returns an array of all ones
 */
export const ones = (shape: number[]): numArray => {
    return full(shape, 1);
}

/**
 * Returns a sorted array with every int in the range [0, n)
 * @param n 1 + the max number in the array
 * @returns an array with every int up to n
 */
 export const upTo = (n: number): number[] => {
    return [...Array(n).keys()];
}

/**
 * Returns an array from start to stop with values separated by step. Same syntax as
 * Python's `range` constructor, i.e. if stop is omitted, the array will go from 0 to
 * stop, and step defaults to 1
 * @param start the first element of the array, or the exclusive maximum if stop is omitted
 * @param stop the exclusive max of the return array
 * @param step the difference between the `i`th element and the `i + 1` of the return array
 * @returns an array from start (inclusive) to stop (exclusive)
 */
export const arange = (start: number, stop?: number, step?: number): number[] => {
    step = step || 1;
    if (typeof stop === 'undefined') {
        stop = start;
        start = 0;
    }

    if (Math.sign(stop - start) !== Math.sign(step)) {
        throw new Error(`Infinite range from ${start} to ${stop} using step ${step} not allowed.`);
    }
    let comp = (a: number, b: number): boolean => a < b;
    if (step < 0) {
        comp = (a, b) => a > b;
    }

    let res: number[] = [];
    for (let n = start; comp(n, stop); n += step) {
        res.push(n);
    }
    return res;
}

/**
 * Reshapes arr to be the given shape
 * @param arr the array to reshape
 * @param shape the shape of the output array
 * @returns an array of the given shape with all the elements as arr in order
 */
export const reshape = <T>(arr: ndArray<T>, shape: number[]): ndArray<T> => {
    const errStr = `Cannot broadcast array with shape ${getShape(arr)} to ${shape}`;
    if (!Array.isArray(arr)) {
        throw new Error(`Scalars not allowed in reshape function: ${arr}`);
    }
    
    if (shape.length === 0) {
        if (arr.length === 1) {
            return arr[0];
        } else {
            throw new Error(errStr);
        }
    }

    const flat: T[] = flatten(arr) as T[];
    if (flat.length % shape[0] !== 0) {
        throw new Error(errStr);
    }

    const perBlock = Math.round(flat.length / shape[0]);
    const restShape = shape.slice(1, shape.length);
    let res: ndArray<T> = [];
    for (let i = 0; i < flat.length; i += perBlock) {
        const end = i + perBlock;
        res.push(reshape(flat.slice(i, end), restShape));
    }

    return res;
}
