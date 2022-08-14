import { addArrays, subArrays, scalarMul, flatten } from "../src/utils/arrayOps";

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
    expect(scalarMul(2, [3])).toEqual([6]);
    expect(scalarMul(-1, [[1, 2], [3, 4]])).toEqual([[-1, -2], [-3, -4]]);
});

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