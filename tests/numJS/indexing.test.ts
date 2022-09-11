import {
    arrIndex,
    sumList,
    reshape,
    getShape
} from "../../src/utils/numJS";
import { randArr } from "../../src/utils/random";

test('array indexing', () => {
    expect(() => arrIndex(5, [0])).toThrow(Error);
    expect(() => arrIndex([1, 2, 3], [[0, 1]])).toThrow(Error);
    expect(() => arrIndex([1, 2, 3], [[[0, 1]]])).toThrow(Error);

    const arr: number[] = randArr([24], 10) as number[];
    expect(arrIndex(arr, 0)).toBe(arr[0]);
    const numInds: number[] = randArr([10], arr.length) as number[];
    const boolInds: boolean[] = (randArr([arr.length], 2) as number[]).map(n => !!n);

    const arrNum: number[] = arrIndex(arr, numInds) as number[];
    for (let i = 0; i < arrNum.length; i++) {
        expect(arrNum[i]).toBe(arr[numInds[i]]);
    }

    const arrBool: number[] = arrIndex(arr, boolInds) as number[];
    expect(arrBool.length).toBe(sumList(boolInds.map(b => +b)));
    let next = 0;
    for (let i = 0; i < boolInds.length; i++) {
        if (boolInds[i]) {
            expect(arrBool[next++]).toBe(arr[i]);
        }
    }

    const a2d: number[][] = reshape(arr, [6, 4]) as number[][];
    const aBool2d: number[][] = arrIndex(a2d, boolInds) as number[][];
    const numInds2d: number[][] = randArr([10, 2], 4) as number[][];

    const aNum2d: number[] = arrIndex(a2d, numInds2d) as number[];
    for (let i = 0; i < numInds2d.length; i++) {
        expect(aNum2d[i]).toBe(a2d[numInds2d[i][0]][numInds2d[i][1]]);
    }

    expect(getShape(aBool2d).length).toBe(2);
    let nextI = 0;
    for (let i = 0; i < a2d.length; i++) {
        let nextJ = 0;
        for (let j = 0; j < a2d[i].length; j++) {
            if (boolInds[j + i * a2d[i].length]) {
                expect(aBool2d[nextI][nextJ++]).toBe(a2d[i][j]);
            }
        }
        nextI += +!!nextJ;
    }

    const smallNumInds: number[] = randArr([10], a2d.length) as number[];
    const aNum1d: number[][] = arrIndex(a2d, smallNumInds) as number[][];
    expect(getShape(aNum1d)).toEqual([smallNumInds.length, a2d[0].length]);
    for (let i = 0; i < aNum1d.length; i++) {
        expect(aNum1d[i]).toEqual(a2d[smallNumInds[i]]);
    }
});
