/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */

import {
    flatten,
    full,
    getShape,
    reshape,
    addArrays,
    arange,
    allEqual,
    all,
    any,
    arrOr,
    arrAnd,
    subArrays,
    zeros,
    ones,
    arrEqual,
    getSize,
    empty
} from "../../src/utils/numJS";
import { randArr, randInt } from "../../src/utils/random";

test('flatten', () => {
    expect(flatten(1)).toBe(1);
    expect(flatten([1, 2, 3])).toEqual([1, 2, 3]);
    expect(flatten([[1, 2], [3, 4]])).toEqual([1, 2, 3, 4]);
    expect(flatten(
        [
            [
                [1, 2],
                [3, 4]
            ],
            [
                [5, 6],
                [7, 8]
            ]
        ]
    )).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
});

test('full', () => {
    expect(() => full([])).toThrow(Error);
    expect(full([], 0)).toBe(0);
    expect(full([1], 1)).toEqual([1]);
    expect(full([2, 3], 2)).toEqual([[2, 2, 2], [2, 2, 2]]);
    expect(full([1, 2, 3], 3)).toEqual([
        [
            [3, 3, 3], 
            [3, 3, 3]
        ]
    ]);
});

test('getShape', () => {
    expect(getShape(0)).toEqual([]);
    expect(getShape([])).toEqual([0]);
    expect(getShape([1])).toEqual([1]);
    expect(getShape([1, 2, 3])).toEqual([3]);
    expect(getShape([[1, 2, 3], [4, 5, 6]])).toEqual([2, 3]);
    expect(getShape([
        [
            [1, 2, 3],
            [4, 5, 6]
        ],
        [
            [7, 8, 9],
            [10, 11, 12]
        ]
    ])).toEqual([2, 2, 3]);
});

test('reshape', () => {
    expect(() => reshape(5, [])).toThrow(Error);
    expect(() => reshape([1, 2], [])).toThrow(Error);
    expect(() => reshape([1, 2, 3, 4], [3])).toThrow(Error);

    expect(reshape([1], [1])).toEqual([1]);
    expect(reshape([1, 2, 3, 4], [2, 2])).toEqual([[1, 2], [3, 4]]);
    expect(reshape([[1, 2], [3, 4]], [4])).toEqual([1, 2, 3, 4]);
    expect(reshape([
        [
            [1, 2],
            [3, 4],
            [5, 6]
        ]
    ], [3, 2])).toEqual([
        [1, 2],
        [3, 4],
        [5, 6]
    ]);
    expect(reshape([
        [1, 2],
        [3, 4],
        [5, 6]
    ], [1, 2, 3])).toEqual([
        [
            [1, 2, 3],
            [4, 5, 6]
        ]
    ]);
});

test('broadcasting', () => {
    expect(() => addArrays([0, 1, 2], [0, 1])).toThrow(Error);

    const a = reshape(arange(24), [2, 3, 4]);
    const b = 5;
    const c = addArrays(a, b);
    const exp = addArrays(a, full(getShape(a), b));
    const exp2 = addArrays(full(getShape(a), b), a);
    expect(getShape(c)).toEqual(getShape(a));
    expect(allEqual(exp, c)).toBe(true);
    expect(allEqual(exp, exp2)).toBe(true);
    const d = addArrays(b, a);
    expect(getShape(d)).toEqual(getShape(a));
    expect(allEqual(exp, d)).toBe(true);

    const e: boolean[] = (randArr([24], 2) as number[]).map(n => !!n);
    let f: boolean[][][] = reshape(e, [2, 3, 4]) as boolean[][][];

    expect(all(arrOr(e, true))).toBe(true);
    expect(any(arrAnd(e, false))).toBe(false);
    expect(all(arrOr(true, e))).toBe(true);
    expect(any(arrAnd(false, e))).toBe(false);

    const ored = arrOr(e, f);
    expect(getShape(ored)).toEqual(getShape(f));
    expect(allEqual(ored, f)).toBe(true);
    expect(allEqual(ored, e)).toBe(true);
    expect(allEqual(f, ored)).toBe(true);
    expect(allEqual(ored, e)).toBe(true);

    const g = reshape(a, [2, 12]);
    const h = subArrays(a, g);
    expect(getShape(h)).toEqual(getShape(a));

    const i = arange(12);
    const j = reshape(i, [3, 4]);
    const k = reshape(i, [4, 3]);
    const l = addArrays(j, k);
    expect(getShape(l)).toEqual(getShape(j));

    expect(addArrays(1, 2)).toBe(3);

    expect(addArrays([1, 2, 3], [[1, 2, 3]])).toEqual([[2, 4, 6]]);
});

test('zeros and ones', () => {
    const arrs = [
        zeros([20]),
        ones([20])
    ];
    for (let i = 0; i < arrs.length; i++) {
        expect(all(arrEqual(arrs[i], i))).toBe(true);
        expect(getShape(arrs[i])).toEqual([20]);
    }
});

test('getSize', () => {
    expect(getSize(0)).toBe(1);
    expect(getSize([])).toBe(0);
    expect(getSize([1, 2, 3])).toBe(3);
    expect(getSize([[1, 2], [3, 4]])).toBe(4);
    expect(getSize([
        [
            [1, 2],
            [3, 4]
        ],
        [
            [5, 6],
            [7, 8]
        ],
        [
            [9, 10],
            [11, 12]
        ]
    ])).toBe(12);
});

test('empty', () => {
    expect(empty([])).toBeUndefined();
    const e: number[] = empty<number>([5]) as number[];
    for (let i = 0; i < 5; i++) {
        expect(e[i]).toBeUndefined();
        e[i] = i;
        expect(e[i]).toBe(i);
    }

    const e2: string[][] = empty<string>([5, 5]) as string[][];
    for (let i = 0; i < 5; i++) {
        const x = randInt(5);
        const y = randInt(5);
        expect(e2[x][y]).toBeUndefined();
        e2[x][y] = i.toString();
        expect(e2[x][y]).toBe(i.toString());
    }
})
