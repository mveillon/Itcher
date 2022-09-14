/**
 * Returns an array from start to stop with values separated by step. Same syntax as
 * Python's `range` constructor, i.e. if stop is omitted, the array will go from 0 to
 * stop, and step defaults to 1.
 * ```
 * arange(4) // output: [0, 1, 2, 3]
 * arange(1, 5) // output: [1, 2, 3, 4]
 * arange(1, 6, 2) // output: [1, 3, 5]
 * arange(5, 0, -1) // output: [5, 4, 3, 2, 1]
 * ```
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