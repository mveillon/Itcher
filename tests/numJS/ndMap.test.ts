import {
    ndMap,
    toBool,
    toNum,
    zeros,
    ones,
    any,
    all,
    arrEqual,
    sumList
} from "../../src/utils/numJS";
import { randArr } from "../../src/utils/random";

test('ndMap', () => {
    const square = (n: number): number => Math.pow(n, 2);
    expect(ndMap(2, square)).toBe(4);
    expect(ndMap([1, 2, 3], square)).toEqual([1, 4, 9]);
    expect(ndMap([
        [1, 2, 3],
        [4, 5, 6]
    ], square)).toEqual([
        [1, 4, 9],
        [16, 25, 36]
    ]);

    const isZero = (n: number): boolean => !n;
    expect(ndMap([[0, 1, 2]], isZero)).toEqual([[true, false, false]]);
});

test('converting', () => {
    expect(toNum(true)).toBe(1);
    expect(toNum(false)).toBe(0);
    expect(toNum([true, false, true])).toEqual([1, 0, 1]);
    expect(toNum([[true, false], [false, true]])).toEqual([[1, 0], [0, 1]]);
    expect(toNum([
        [
            [true, false],
            [true, false]
        ],
        [
            [false, true],
            [false, false, false]
        ],
        [
            [true, true, true],
            [false]
        ]
    ])).toEqual([
        [
            [1, 0],
            [1, 0]
        ],
        [
            [0, 1],
            [0, 0, 0]
        ],
        [
            [1, 1, 1],
            [0]
        ]
    ]);

    expect(toBool(0)).toBe(false);
    expect(toBool(1)).toBe(true);
    expect(toBool([0, 1, 1])).toEqual([false, true, true]);
    expect(toBool([[0, 1], [1, 0]])).toEqual([[false, true], [true, false]]);
    expect(toBool([
        [
            [1, 0],
            [1, 0]
        ],
        [
            [0, 1],
            [0, 0, 0]
        ],
        [
            [1, 1, 1],
            [0]
        ]
    ])).toEqual([
        [
            [true, false],
            [true, false]
        ],
        [
            [false, true],
            [false, false, false]
        ],
        [
            [true, true, true],
            [false]
        ]
    ]);

    expect(any(toBool(zeros([10])))).toBe(false);
    expect(all(toBool(ones([10])))).toBe(true);
    expect(sumList(toNum(arrEqual(zeros([10]), 0)))).toBe(10);
    expect(sumList(toNum(arrEqual(ones([10]), 0)))).toBe(0);

    for (let i = 0; i < 10; i++) {
        const a = randArr([10, i + 1], 2);
        expect(toNum(toBool(a))).toEqual(a);
    }
});
