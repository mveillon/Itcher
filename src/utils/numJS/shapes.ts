import { ndArray, numArray } from "./types.js";

/**
 * Allows for element-wise operations to be performed on arrays of different sizes.
 * Similar in concept to Numpy's broadcasting, but the rules and implementation differ
 * greatly. If either argument is a scaler, it is transformed to have the same shape as
 * the other argument. Otherwise, the argument with the more complex 
 * (higher dimensionality) shape is taken as the "ground truth" and the other array is
 * reshaped to have the same shape. In this case, both arrays must have the same
 * total number of elements. If both arrays have the same complexity, the first argument
 * is taken as the "ground truth".
 * ```
 * broadcast([1, 2, 3], [4, 5, 6]) // output: [[1, 2, 3], [4, 5, 6]]
 * broadcast([1, 2, 3], 4) // output: [[1, 2, 3], [4, 4, 4]]
 * broadcast(4, [1, 2, 3]) // output: [[4, 4, 4], [1, 2, 3]]
 * broadcast([1, 2, 3, 4], [[5, 6], [7, 8]]) // output: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]]
 * broadcast([[1, 2]], [[3], [4]]) // output: [[[1, 2]], [[3, 4]]]
 * ```
 * @param a1 the first array
 * @param a2 the second array
 * @returns both arrays reshaped to have the same shape
 */
export const broadcast = <T, U>(
    a1: ndArray<T>, 
    a2: ndArray<U>
): [ndArray<T>, ndArray<U>] => {
    const shape1 = getShape(a1);
    const shape2 = getShape(a2);
    const t1 = getSize(a1);
    const t2 = getSize(a2);

    const showArr = Math.max(t1, t2) <= 10;
    const erStr = (
        'Arguments could not be broadcast together: ' + 
        (showArr ? `${a1}: ` : '') +
        `[${shape1}] (${t1} elements) and ` +
        (showArr ? `${a2}: ` : '') +
        `[${shape2}] (${t2} elements).`
    );
    if (t1 !== t2 && shape1.length > 0 && shape2.length > 0) {
        throw new Error(erStr);
    }

    if (shape1.length === shape2.length) {
        let same = true;
        for (let i = 0; i < shape1.length; i++) {
            if (shape1[i] !== shape2[i]) {
                same = false;
                break;
            }
        }
        if (same) {
            return [a1, a2];
        }

        return [a1, reshape(a2, shape1)];
    }

    if (shape1.length > shape2.length) {
        if (shape2.length === 0) {
            return [a1, full(shape1, a2)];
        }
        return [a1, reshape(a2, shape1)];
    }

    if (shape1.length === 0) {
        return [full(shape2, a1), a2];
    }
    return [reshape(a1, shape2), a2];
}

/**
 * Flattens the n-dimensional array into just one array.
 * ```
 * flatten(5) // output: [5]
 * flatten([1, 2, 3]) // output: [1, 2, 3]
 * flatten([[1, 2], [3, 4]]) // output: [1, 2, 3, 4]
 * ```
 * @param A the array to flatten
 * @returns the flattened array
 */
 export const flatten = <T>(A: ndArray<T>): T | T[] => {
    if (Array.isArray(A)) {
        return [].concat(...A.map(flatten));
    } else {
        return A;
    }
}

/**
 * Returns an array full of whatever the value is in any arbitrary shape.
 * ```
 * full([3], 1) // output: [1, 1, 1]
 * full([2, 2], 3) // output: [[3, 3], [3, 3]]
 * full([2], undefined, () => 4) // output: [4, 4]
 * full([3], 3, () => 2) // output: [3, 3, 3]
 * ```
 * @param shape the size of each dimension of the output
 * @param value what value to fill the array with. If undefined, the values
 * will be filled with the return value of valueGen
 * @param valueGen a function that generates values to fill the array with. Only
 * called if value is undefined
 * @returns an array with the given shape and every value equal to the given value
 */
export const full = <T>(shape: number[], value?: T, valueGen?: () => T): ndArray<T> => {
    if (shape.length === 0) {
        if (typeof value === 'undefined') {
            if (typeof valueGen === 'undefined') {
                throw new Error('Both of value and valueGen cannot be undefined');
            }
            return valueGen();
        }
        return value;
    }
    let res: ndArray<T> = [];
    const rest = shape.slice(1, shape.length);
    for (let i = 0; i < shape[0]; i++) {
        res.push(full(rest, value, valueGen));
    }

    return res;
}

/**
 * Returns the shape of the array, which should be of uniform dimension
 * to allow for basically constant time calculation.
 * ```
 * getShape(1) // output: []
 * getShape([1, 2, 3]) // output: [3]
 * getShape([[1, 2, 3], [4, 5, 6]]) // output: [2, 3]
 * ```
 * @param arr the array to measure
 * @returns the shape of the array as an array
 */
export const getShape = <T>(arr: ndArray<T>): number[] => {
    let res: number[] = [];
    let current = arr;
    while (Array.isArray(current)) {
        res.push(current.length);
        if (current.length === 0) break;
        current = current[0];
    }
    return res;
} 

/**
 * Convenience function to create an array full of zeros.
 * ```
 * zeros([3])) // output: [0, 0, 0]
 * zeros([2, 2])) // output: [[0, 0], [0, 0]]
 * ```
 * @param shape the shape of the array to create
 * @returns an array of all zeros
 */
 export const zeros = (shape: number[]): numArray => {
    return full(shape, 0);
}

/**
 * Convenience function to create an array full of ones.
 * ```
 * ones([3]) // output: [1, 1, 1]
 * ones([2, 2]) // output: [[1, 1], [1, 1]]
 * ```
 * @param shape the shape of the array to create
 * @returns an array of all ones
 */
export const ones = (shape: number[]): numArray => {
    return full(shape, 1);
}

export const empty = <T>(shape: number[]): ndArray<T> => {
    if (shape.length === 0) {
        return undefined;
    }
    if (shape.length === 1) {
        return new Array<T>(shape[0]);
    }

    let res: ndArray<T> = new Array<ndArray<T>>(shape[0]);
    const rest = shape.slice(1, shape.length);
    for (let i = 0; i < shape[0]; i++) {
        res[i] = empty(rest);
    }

    return res;
}

/**
 * Reshapes arr to be the given shape.
 * ```
 * reshape([1, 2, 3, 4], [2, 2]) // output: [[1, 2], [3, 4]]
 * reshape([[1, 2], [3, 4]], [4])  // output: [1, 2, 3, 4]
 * ```
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

/**
 * Finds the total number of elements in the array
 * ```
 * getSize(1) // output: 1
 * getSize([]) // output: 0
 * getSize([1, 2, 3]) // output: 3
 * getSize([[1, 2], [3, 4]]) // output: 4
 * ```
 * @param arr the array to measure
 * @returns the number of elements in arr
 */
export const getSize = <T>(arr: ndArray<T>): number => {
    return getShape(arr).reduce((a, b) => a * b, 1);
}

