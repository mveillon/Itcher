/**
 * Finds the mean squared error
 * @param x the first array
 * @param y the second array
 * @returns the mean squared error of x and y
 */
 export const mse = (x: number[], y: number[]): number => {
    let total = 0;
    const len = Math.min(x.length, y.length);
    for (let i = 0; i < len; i++) {
        total += Math.pow(x[i] - y[i], 2) / len;
    }
    return total;
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

