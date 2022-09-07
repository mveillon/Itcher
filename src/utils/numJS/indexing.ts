import { ndArray, boolArray, numArray } from "./types.js";
import { broadcast, getShape } from "./shapes.js";

/**
 * Returns the elements at arr whose positions are equal to the
 * true values in inds
 * @param arr the array to index
 * @param inds the array of booleans used to index arr
 * @returns arr indexed at every true value of inds
 */
const boolIndex = <T>(arr: ndArray<T>, inds: boolArray): ndArray<T> => {
    [arr, inds] = broadcast(arr, inds);

    if (Array.isArray(arr)) {
        let res: ndArray<T> = [];
        for (let i = 0; i < arr.length; i++) {
            const sub = boolIndex(arr[i], (inds as boolean[])[i]);
            if (!Array.isArray(sub) || sub.length > 0) {
                res.push(sub);
            }
        }
        return res;
    }
    return inds ? arr : [];
}

/**
 * Indices arr with each value of inds. Inds should either be a single integer,
 * an array of integers, or a 2D array of integers, with each element having length
 * less than or equal to the dimensionality of arr. The values of indices are used
 * to index arr
 * @param arr the array to index
 * @param inds what values to get from arr
 * @returns all values of arr at the indices specified in inds
 */
const numIndex = <T>(arr: ndArray<T>, inds: numArray): ndArray<T> => {
    if (!Array.isArray(arr)) {
        throw new Error(`Scalars cannot be indexed: ${arr}`);
    }

    let res: ndArray<T>;
    switch (getShape(inds).length) {
        case 0:
            res = arr[inds as number];
            break;
        case 1:
            res = (inds as number[]).map(i => arr[i]);
            break;
        case 2:
            res = [];
            for (const i of (inds as number[][])) {
                let current: ndArray<T> = arr;
                for (const j of i) {
                    if (!Array.isArray(current)) {
                        throw new Error(
                            `Length of ${i} is greater than dimensionality of ${arr}`
                        );
                    }
                    current = current[j];
                }
                res.push(current);
            }
            break;
        default:
            throw new Error(
                `Numerical indices cannot have dimensionality greater than 2: ${inds}`
            );
    }
    return res;
}

/**
 * Indexes arr using an array of either numbers or booleans
 * @param arr the array to index
 * @param inds what values to get from arr
 * @returns arr indexed at each value of inds
 */
export const arrIndex = <T>(
    arr: ndArray<T>, 
    inds: numArray | boolArray
): ndArray<T> => {
    let current = inds;
    while (Array.isArray(current)) {
        current = current[0];
    }

    if (typeof current === 'number') {
        return numIndex(arr, inds as numArray);
    } else if (typeof current === 'boolean') {
        return boolIndex(arr, inds as boolArray);
    }
}
