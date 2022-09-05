import { ndArray } from "./types.js";

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