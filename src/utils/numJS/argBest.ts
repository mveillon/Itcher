/**
 * Finds the index of the best element in x, based on comp.
 * ```
 * argBest([3, 4, 5], (a, b) => a < b) // output: 0
 * argBest([3, 4, 5], (a, b) => a >= b) // output: 2
 * ```
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
 * Returns the index of the smallest element of x.
 * ```
 * argMin([3, 4, 5]) // output: 0
 * ```
 * @param x the array to look at
 * @returns where the smallest element is
 */
 export const argMin = <T>(x: T[]): number => {
    return argBest(x, (a, b) => a < b);
}

/**
 * Returns the index of the largest element of x.
 * ```
 * argMax([3, 4, 5]) // output: 2
 * ```
 * @param x the array to look at
 * @returns where the largest element is
 */
export const argMax = <T>(x: T[]): number => {
    return argBest(x, (a, b) => a > b);
}
