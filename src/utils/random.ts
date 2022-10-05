/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */

import { copyArr, arrGTEq, all, numArray, reshape } from "./numJS.js";
import seedrandom from "seedrandom";

const rng = seedrandom('Itcher');

/**
 * Returns a random integer in between min (inclusive) and max (exclusive)
 * @param min the lower bound
 * @param max the upper bound. If not provided, the number will be between 0 and min
 * @returns a random integer in the provided range
 */
 export const randInt = (min: number, max?: number): number => {
    if (typeof max === 'undefined') {
        max = min;
        min = 0;
    }
    return Math.floor(rng() * (max - min) + min);
}

/**
 * Returns a randomly selected element of the array
 * @param arr the array to select an element from 
 * @param ws optional cumulative weights for each element in arr
 * @returns one choice from the array
 */
export const choice = <T>(arr: T[], ws?: number[]): T => {
    if (arr.length === 0) {
        throw new Error('Empty array not allowed in choice function');
    }

    if (typeof ws === 'undefined') {
        return arr[randInt(arr.length)];
    }

    if (ws.length !== arr.length) {
        throw new Error(
            `Incompatible sizes between ${arr} and ${ws}: ${arr.length} vs ${ws.length}`
        );
    }

    if (!all(arrGTEq(ws, 0))) {
        throw new Error(
            `Negative cumulative weights not allowed: ${ws}`
        );
    }
    
    for (let i = 1; i < ws.length; i++) {
        if (ws[i] < ws[i - 1]) {
            throw new Error(
                `Cumulative weights must be monotonically increasing: ${ws}`
            );
        }
    }

    const seed = rng() * ws[ws.length - 1];
    for (let i = 0; i < arr.length; i++) {
        if (ws[i] > seed) {
            return arr[i];
        }
    }
    return arr[arr.length - 1];
}

/**
 * Shuffles the array in place, using Fisher-Yates
 * O(arr.length)
 * @param arr the array to shuffle
 */
export const shuffle = <T>(arr: T[]) => {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = randInt(i + 1);
        var temp = arr[j];
        arr[j] = arr[i];
        arr[i] = temp;
    }
}

/**
 * Returns n randomly selected elements from arr
 * O(arr.length)
 * @param arr the array to select the elements from
 * @param n how many elements to select
 * @returns n random elements from arr
 */
export const choices = <T>(arr: T[], n: number): T[] => {
    var arrCopy: T[] = copyArr(arr) as T[];
    shuffle(arrCopy);
    return arrCopy.slice(0, n);
}

/**
 * Creates an array of random integers with the given shape
 * @param shape the shape of the output array
 * @param min the minimum possible integer. If max is `undefined`, this will
 * be the maximum possible integer, with `min` being `0`
 * @param max the maximum possible integer. If not specified, see above
 * @returns an array of random integers, each ranging from `[min, max)`
 */
export const randArr = (shape: number[], min: number, max?: number): numArray => {
    const size = shape.reduce((a, b) => a * b, 1);
    let flat: number[] = [];
    for (let i = 0; i < size; i++) {
        flat.push(randInt(min, max));
    }
    return reshape(flat, shape);
}
