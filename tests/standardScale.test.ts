/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */

import { standardScale } from "../src/ml/standardScale";
import { 
    colVariance, 
    colAverage, 
    mean, 
    variance, 
    allClose, 
    any, 
    ndMap,
    sumList,
    transpose
} from "../src/utils/numJS"; 
import { randArr } from "../src/utils/random";
import { readFile } from "../src/utils/files";

test('standardScale', () => {
    expect(() => standardScale(10)).toThrowError();
    expect(standardScale([1, 2, 3])).toEqual([-1, 0, 1]);
    expect(standardScale([
        [3, 1, 1, 0],
        [2, 2, 3, 0],
        [1, 3, 2, 0]
    ], false)).toEqual([
        [1, -1, -1, 0],
        [0, 0, 1, 0],
        [-1, 1, 0, 0]
    ]);

    for (let i = 0; i < 10; i++) {
        const a: number[][] = randArr([10, 5], -10, 15) as number[][];
        for (const row of a) {
            const s: number[] = standardScale(row) as number[];
            expect(mean(s)).toBeCloseTo(0);
            expect(variance(s)).toBeCloseTo(1);
            expect(s.length).toBe(row.length);
        }
        const scaled: number[][] = standardScale(a) as number[][];
        expect(allClose(colAverage(scaled), 0)).toBe(true);
        expect(allClose(colVariance(scaled), 1)).toBe(true);
        expect(any(ndMap(scaled, isNaN))).toBe(false);
        expect(a.length).toBe(scaled.length);
        for (let i = 0; i < a.length; i++) {
            expect(a[i].length).toBe(scaled[i].length);
        }
    }

    expect(sumList(standardScale([[0], [0], [0], [0]], true))).toBe(0);
    expect(standardScale([[1, 2, 3, 4]])).toEqual([[1, 2, 3, 4]]);
});

test('scaling features', () => {
    const trainSheets: string[] = [
        readFile("./src/ml/data/train/feats.ignore.csv", 'utf-8'),
        readFile("./src/ml/data/valid/feats.ignore.csv", "utf-8"),
        readFile("./src/ml/data/test/feats.ignore.csv", "utf-8")
    ];
    const strMats: string[][][] = (
        trainSheets.map(s => s.split('\n').map(r => r.split(',')))
    );
    const mat: number[][] = (
        ([] as number[][])
            .concat(...(ndMap(strMats, parseFloat) as number[][][]))
    );

    for (const row of mat) {
        expect(row.length).toBe(mat[0].length);
    }
    expect(any(ndMap(mat, isNaN))).toBe(false);

    const processed = standardScale(mat) as number[][];
    for (const row of processed) {
        expect(row.length).toBe(processed[0].length);
    }
    expect(any(ndMap(processed, isNaN))).toBe(false);

    expect(allClose(colAverage(processed), 0)).toBe(true);
    const vars = colVariance(processed);
    expect(allClose(vars, 1)).toBe(true);

    expect(any(transpose(processed).map(r => allClose(r, 0)))).toBe(false);
});

