/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */

import {
    isClose,
    allClose,
    getShape,
    arrEqual,
    arrLT,
    arrLTEq,
    arrGT,
    arrGTEq,
    reshape,
    arrOr,
    arrAnd,
    arrNot,
    any,
    sameArr,
    allEqual
} from "../../src/utils/numJS";
import { randArr } from "../../src/utils/random";

test('isClose', () => {
    const eps = 1e-10;
    expect(isClose(0, 0)).toBe(true);
    expect(isClose(1, 0)).toBe(false);
    expect(isClose(0, eps)).toBe(true);
    expect(isClose(0, 0.1)).toBe(false);
    
    expect(isClose([1, 2, 3], [1, 2, 3])).toEqual([true, true, true]);
    expect(isClose([1, 2, 3], [1 + eps, 2 - eps, 3 + eps])).toEqual([true, true, true]);
    expect(isClose([1, 2, 3], [1 - eps, 2 + eps, 4])).toEqual([true, true, false]);
    expect(isClose([1, 2, 3], [4, 5, 6])).toEqual([false, false, false]);

    expect(isClose([
        [1, 2, 3],
        [4, 5, 6]
    ], [
        [1 + eps, 2 - eps, 3 + eps],
        [4 - eps, 5 + eps, 6 - eps]
    ])).toEqual([
        [true, true, true],
        [true, true, true]
    ]);
    expect(isClose([
        [1, 2, 3],
        [4, 5, 6]
    ], [
        [1 + eps, 3 - eps, 3 + eps],
        [4 - eps, 5 + eps, 7 - eps]
    ])).toEqual([
        [true, false, true],
        [true, true, false]
    ]);

    expect(allClose([
        [1, 2, 3],
        [4, 5, 6]
    ], [
        [1 + eps, 2 - eps, 3 + eps],
        [4 - eps, 5 + eps, 6 - eps]
    ])).toBe(true);
    expect(allClose([
        [1, 2, 3],
        [4, 5, 6]
    ], [
        [1 + eps, 3 - eps, 3 + eps],
        [4 - eps, 5 + eps, 7 - eps]
    ])).toBe(false);
});

test('array comparing', () => {
    const a: number[] = randArr([24], 24) as number[];
    const b: number[] = randArr([24], 24) as number[];
    expect(getShape(a)).toEqual(getShape(b));

    const fs = [
        {
            arr: arrEqual,
            c: (x: number, y: number): boolean => x === y
        },
        {
            arr: arrLT,
            c: (x: number, y: number): boolean => x < y
        },
        {
            arr: arrGT,
            c: (x: number, y: number): boolean => x > y
        },
        {
            arr: arrLTEq,
            c: (x: number, y: number): boolean => x <= y
        },
        {
            arr: arrGTEq,
            c: (x: number, y: number): boolean => x >= y
        },
    ];

    for (const pair of fs) {
        const compared: boolean[] = pair.arr(a, b) as boolean[];
        expect(getShape(compared)).toEqual(getShape(a));
        for (let i = 0; i < compared.length; i++) {
            expect(compared[i]).toBe(pair.c(a[i], b[i]));
        }
    }

    const a2d: number[][] = reshape(a, [6, 4]) as number[][];
    const b2d: number[][] = reshape(b, [6, 4]) as number[][];
    expect(getShape(a2d)).toEqual(getShape(b2d));
    for (const pair of fs) {
        const compared: boolean[][] = pair.arr(a2d, b2d) as boolean[][];
        expect(getShape(compared)).toEqual(getShape(a2d));
        for (let i = 0; i < compared.length; i++) {
            for (let j = 0; j < compared[i].length; j++) {
                expect(compared[i][j]).toBe(pair.c(a2d[i][j], b2d[i][j]));
            }
        }
    }

    const a3d: number[][][] = reshape(a, [2, 3, 4]) as number[][][];
    const b3d: number[][][] = reshape(b, [2, 3, 4]) as number[][][];
    expect(getShape(a3d)).toEqual(getShape(b3d));
    for (const pair of fs) {
        const compared: boolean[][][] = pair.arr(a3d, b3d) as boolean[][][];
        expect(getShape(compared)).toEqual(getShape(a3d));
        for (let i = 0; i < compared.length; i++) {
            for (let j = 0; j < compared[i].length; j++) {
                for (let k = 0; k < compared[i][j].length; k++) {
                    expect(compared[i][j][k]).toBe(pair.c(a3d[i][j][k], b3d[i][j][k]));
                }
            }
        }
    }
});

test('array boolean compares', () => {
    const a: boolean[] = (randArr([24], 2) as number[]).map(n => !!n);
    const b: boolean[] = (randArr([24], 2) as number[]).map(n => !!n);
    expect(getShape(a)).toEqual(getShape(b));

    const fs = [
        {
            arr: arrOr,
            c: (x: boolean, y: boolean): boolean => x || y
        },
        {
            arr: arrAnd,
            c: (x: boolean, y: boolean): boolean => x && y
        }
    ];

    for (const pair of fs) {
        const compared: boolean[] = pair.arr(a, b) as boolean[];
        expect(getShape(compared)).toEqual(getShape(a));
        for (let i = 0; i < compared.length; i++) {
            expect(compared[i]).toBe(pair.c(a[i], b[i]));
        }
    }
    const notted = arrNot(a);
    expect(getShape(notted)).toEqual(getShape(a));
    expect(any(arrEqual(a, notted))).toBe(false);

    const a2d: boolean[][] = reshape(a, [6, 4]) as boolean[][];
    const b2d: boolean[][] = reshape(b, [6, 4]) as boolean[][];
    expect(getShape(a2d)).toEqual(getShape(b2d));
    for (const pair of fs) {
        const compared: boolean[][] = pair.arr(a2d, b2d) as boolean[][];
        expect(getShape(compared)).toEqual(getShape(a2d));
        for (let i = 0; i < compared.length; i++) {
            for (let j = 0; j < compared[i].length; j++) {
                expect(compared[i][j]).toBe(pair.c(a2d[i][j], b2d[i][j]));
            }
        }
    }
    const not2d = arrNot(a2d);
    expect(getShape(not2d)).toEqual(getShape(a2d));
    expect(any(arrEqual(a2d, not2d))).toBe(false);

    const a3d: boolean[][][] = reshape(a, [2, 3, 4]) as boolean[][][];
    const b3d: boolean[][][] = reshape(b, [2, 3, 4]) as boolean[][][];
    expect(getShape(a3d)).toEqual(getShape(b3d));
    for (const pair of fs) {
        const compared: boolean[][][] = pair.arr(a3d, b3d) as boolean[][][];
        expect(getShape(compared)).toEqual(getShape(a3d));
        for (let i = 0; i < compared.length; i++) {
            for (let j = 0; j < compared[i].length; j++) {
                for (let k = 0; k < compared[i][j].length; k++) {
                    expect(compared[i][j][k]).toBe(pair.c(a3d[i][j][k], b3d[i][j][k]));
                }
            }
        }
    }
    const not3d = arrNot(a3d);
    expect(getShape(not3d)).toEqual(getShape(a3d));
    expect(any(arrEqual(a3d, not3d))).toBe(false);
});

test('array equality', () => {
    expect(sameArr([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(sameArr([1, 2, 3], [[1, 2, 3]])).toBe(false);
    expect(allEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(allEqual([1, 2, 3], [[1, 2, 3]])).toBe(true);
    expect(allEqual([1, 2, 3], [[1, 2, 4]])).toBe(false);
});
