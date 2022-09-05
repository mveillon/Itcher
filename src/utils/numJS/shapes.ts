import { ndArray, numArray } from "./types.js";

/**
 * Allows for element-wise operations to be performed on arrays of different sizes.
 * Similar in concept to Numpy's broadcasting, but the rules and implementation differ
 * greatly. If either argument is a scaler, it is transformed to have the same shape as
 * the other argument. Otherwise, the argument with the more complex 
 * (higher dimensionality) shape is taken as the "ground truth" and the other array is
 * reshaped to have the same shape. In this case, both arrays must have the same
 * total number of arrays. If both arrays have the same complexity, the first argument
 * is taken as the "ground truth".
 * @param a1 the first array
 * @param a2 the second array
 * @returns both arrays reshaped to have the same shape
 */
export const broadcast = <T>(a1: ndArray<T>, a2: ndArray<T>): [ndArray<T>, ndArray<T>] => {
    const shape1 = getShape(a1);
    const shape2 = getShape(a2);
    const getTotal = (shape: number[]): number => shape.reduce((a, b) => a * b, 1);
    const t1 = getTotal(shape1);
    const t2 = getTotal(shape2);

    const erStr = (
        `Arguments could not be broadcast together: ${shape1} (${t1} elements) and ${shape2} (${t2} elements).`
    );
    if (t1 !== t2 && shape1.length > 0 && shape2.length > 0) {
        throw new Error(erStr);
    }

    if (shape1.length === shape2.length) {
        let same = true;
        for (let i = 0; i < shape1.length; i++) {
            same &&= shape1[i] === shape2[i];
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

