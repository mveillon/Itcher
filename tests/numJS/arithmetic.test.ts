/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */

import {
    addArrays,
    subArrays,
    scalarMul,
    colAverage,
    sumList
} from "../../src/utils/numJS";

test('add arrays', () => {
    expect(addArrays(1, 2)).toBe(3);
    expect(addArrays([1], [2])).toEqual([3]);
    expect(addArrays([[1, 2], [3, 4]], [[4, 5], [6, 7]])).toEqual([[5, 7], [9, 11]]);
    expect(addArrays(
        [
            [
                [1, 2],
                [3, 4]
            ],
            [
                [5, 6],
                [7, 8]
            ]
        ],
        [
            [
                [9, 10],
                [11, 12]
            ],
            [
                [13, 14],
                [15, 16]
            ]
        ]
    )).toEqual(
        [
            [
                [10, 12],
                [14, 16]
            ],
            [
                [18, 20],
                [22, 24]
            ]
        ]
    )
});

test('sub arrays', () => {
    expect(subArrays(1, 2)).toBe(-1);
    expect(subArrays(2, 1)).toBe(1);
    expect(subArrays([1], [2])).toEqual([-1]);
    expect(subArrays([[1, 2], [3, 4]], [[4, 5], [6, 7]])).toEqual([[-3, -3], [-3, -3]]);
    expect(subArrays(
        [
            [
                [1, 2],
                [3, 4]
            ],
            [
                [5, 6],
                [7, 8]
            ]
        ],
        [
            [
                [9, 10],
                [11, 12]
            ],
            [
                [13, 14],
                [15, 16]
            ]
        ]
    )).toEqual(
        [
            [
                [-8, -8],
                [-8, -8]
            ],
            [
                [-8, -8],
                [-8, -8]
            ]
        ]
    )
});

test('scalar mul', () => {
    expect(scalarMul(1, 2)).toBe(2);
    expect(scalarMul([3], 2)).toEqual([6]);
    expect(scalarMul([[1, 2], [3, 4]], -1)).toEqual([[-1, -2], [-3, -4]]);
});

test('colAverage', () => {
    expect(colAverage([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ])).toEqual([4, 5, 6]);

    expect(colAverage([[1, 2, 3]])).toEqual([1, 2, 3]);

    const avgs = colAverage([
        [1, 2, 3, 4],
        [6, 5, 4, 3],
        [7, 8, 9, 10]
    ]);
    const trueVals = [14 / 3, 15 / 3, 16 / 3, 17 / 3];
    expect(avgs.length).toBe(trueVals.length);
    for (let i = 0; i < avgs.length; i++) {
        expect(avgs[i]).toBeCloseTo(trueVals[i]);
    }

    expect(colAverage([])).toEqual([]);
});

test('sumList', () => {
    expect(sumList(1)).toBe(1);
    expect(sumList([1, 2, 3])).toBe(6);
    expect(sumList([
        [1, 2, 3],
        [4, 5, 6]
    ])).toBe(21);
    expect(sumList([
        [
            [1, 2, 3],
            [4, 5, 6]
        ],
        [
            [7, 8, 9],
        ]
    ])).toBe(45);
});
