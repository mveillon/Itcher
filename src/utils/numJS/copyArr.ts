import { ndArray } from "./types.js";

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