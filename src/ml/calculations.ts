import { sumList } from "../utils/arrayOps.js";

/**
 * Finds the mean squared error
 * @param x the first array
 * @param y the second array
 * @returns the mean squared error of x and y
 */
 export const mse = (x: number[], y: number[]): number => {
    const minLen = Math.min(x.length, y.length);
    return minLen > 0 ? squareDistance(x, y) / minLen : 0;
}

/**
 * Returns the distance between x and y, but squared for efficiency
 * @param x the first vector
 * @param y the second vector
 * @returns the square of the Pythagorean distance between x and y
 */
export const squareDistance = (x: number[], y: number[]): number => {
    let total = 0;
    for (let i = 0; i < Math.min(x.length, y.length); i++) {
        total += Math.pow(x[i] - y[i], 2);
    }
    return total;
}

/**
 * Returns the manhattan distance or L1 norm of x and y
 * @returns the manhattan distance of x and y
 */
export const manhattanDistance = (x: number[], y: number[]): number => {
    let total = 0;
    for (let i = 0; i < Math.min(x.length, y.length); i++) {
        total += Math.abs(x[i] - y[i]);
    }
    return total;
}

/**
 * Finds the square of the magnitude (distance from origin) of x
 * @param x the vector to measure
 * @returns the square (for efficiency reasons) of the magnitude
 */
export const squaredMag = (x: number[]): number => {
    return x.reduce((prev, n) => prev + Math.pow(n, 2), 0);
}

/**
 * Returns the average of an array of numbers
 * @param x the array to average
 * @returns the mean of x
 */
export const average = (x: number[]): number => {
    return avgVar(x)[0];
}

/**
 * Returns the dot product of x and y
 * @param x the first vector
 * @param y the second vector
 * @returns the dot product
 */
 export const dot = (x: number[], y: number[]): number => {
    let res = 0;
    for (let i = 0; i < Math.min(x.length, y.length); i++) {
        res += x[i] * y[i];
    }
    return res;
}

/**
 * Finds the average and the variance of x
 * @param x the array to measure
 * @returns the average and variance of x
 */
export const avgVar = (x: number[]): [number, number] => {
    const mean = sumList(x) / x.length;
    
    let total = 0;
    for (const n of x) {
        total += Math.pow(n - mean, 2);
    }

    return [mean, total / x.length];
}

/**
 * Finds the variance of x
 * @param x the array to measure
 * @returns the variance of x
 */
export const variance = (x: number[]): number => {
    return avgVar(x)[1];
}

/**
 * Sigmoid function to floor x to somewhere between 0 and 1
 * @param x the number to reduce
 * @returns $1 / (1 + e^-x)$
 */
export const sigmoid = (x: number): number => {
    return 1 / (1 + Math.exp(-x));
}

/**
 * Returns the pearson correlation between x and y
 * @param x the first array
 * @param y the second array
 * @returns the correlation between x and y
 */
export const correlation = (x: number[], y: number[]): number => {
    let minLen;
    if (x.length === y.length) {
        minLen = x.length;
    } else if (x.length < y.length) {
        minLen = x.length;
        y = y.slice(0, minLen);
    } else {
        minLen = y.length;
        x = x.slice(0, minLen);
    }
    
    const xAvg = average(x);
    const yAvg = average(y);
    let num = 0;
    let denom = [0, 0];

    for (let i = 0; i < minLen; i++) {
        const xDiff = x[i] - xAvg;
        const yDiff = y[i] - yAvg;
        num += xDiff * yDiff;
        denom[0] += Math.pow(xDiff, 2);
        denom[1] += Math.pow(yDiff, 2);
    }

    const prod = denom[0] * denom[1];
    return prod === 0 ? 0 : num / Math.sqrt(prod);
}

