import { 
    numArray, 
    getShape, 
    subArrays, 
    scalarMul, 
    colAverage,
    colVariance,
    mean,
    variance,
    isClose
} from "../utils/numJS.js";

/**
 * Scales a 1D array to have a mean of zero and a standard deviation
 * of one
 * @param arr the array to scale
 * @returns the scaled array
 */
const scale1d = (arr: number[]): number[] => {
    return scalarMul(
        subArrays(arr, mean(arr)),
        1 / Math.sqrt(variance(arr))
    ) as number[];
}

/**
 * Scales a matrix such that each column has a mean of zero
 * and a standard deviation of one
 * @param arr the matrix to scale
 * @param fixSingular whether to fix columns whose values are all the same by 
 * injecting one fake value in after processing. Means and variances are
 * still preserved. Default is true
 * @returns the same matrix scaled to have a standard normal distribution
 */
const scale2d = (arr: number[][], fixSingular: boolean = true): number[][] => {
    if (arr.length <= 1) return arr;
    const avgs = colAverage(arr);
    const vars = colVariance(arr);
    const roots = vars.map(Math.sqrt);
    let res: number[][] = [];
    for (const row of arr) {
        let newRow: number[] = [];
        for (let j = 0; j < row.length; j++) {
            newRow.push(
                roots[j] === 0 ? 0 : (row[j] - avgs[j]) / roots[j]
            );
        }
        res.push(newRow);
    }

    if (fixSingular && arr.length > vars.length) {
        const filler = Math.sqrt((arr.length - 1) / 2);
        for (let i = 0; i < vars.length; i++) {
            if (vars[i] === 0) {
                res[i][i] = filler;
                res[i + 1][i] = -filler;
            }
        }
    }

    return res;
}

/**
 * Scales the n-dimensional array of numbers to have a column-wise
 * mean of zero and standard deviation of one.
 * Uses the formula `(x - u) / s` where u is the mean and s is the 
 * standard deviation
 * @param arr the array to scale
 * @param fixSingular whether to fix columns whose values are all the same by 
 * injecting one fake value in after processing. Means and variances are
 * still preserved. Default is true
 * @returns the scaled version of arr
 */
export const standardScale = (arr: numArray, fixSingular: boolean = true): numArray => {
    switch (getShape(arr).length) {
        case 1:
            return scale1d(arr as number[]);
        case 2:
            return scale2d(arr as number[][], fixSingular);
        default:
            throw new Error(`Unsupported shape for standard scale: ${getShape(arr)}`);
    }
}
