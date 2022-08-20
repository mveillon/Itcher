import { 
    addArrays, 
    subArrays, 
    scalarMul, 
    flatten,
    colAverage,
    argMax,
    argMin,
    all,
    any,
    isClose,
    allClose,
    ndMap,
    sumList,
    full,
    getShape,
    copyArr,
    upTo,
    reshape
} from "../src/utils/arrayOps";
import { shuffle } from "../src/utils/random";

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
});

test('argMin/Max', () => {
    const a = [1, 2, 3, 4];
    expect(argMax(a)).toBe(a.length - 1);
    expect(argMin(a)).toBe(0);
    shuffle(a);
    expect(a[argMax(a)]).toBe(4);
    expect(a[argMin(a)]).toBe(1);
});

test('any and all', () => {
    expect(all(false)).toBe(false);
    expect(all(true)).toBe(true);
    expect(all([])).toBe(false);
    expect(all([false, true, true])).toBe(false);
    expect(all([true, true, false])).toBe(false);
    expect(all([true, true, true])).toBe(true);
    expect(all([
        [true, true, true],
        [false, true, false]
    ])).toBe(false);
    expect(all([
        [true, true, true],
        [true, true, true]
    ])).toBe(true);
    expect(all([
        [
            [true, true, true],
            [false, true, true]
        ],
        [
            [true, true]
        ]
    ])).toBe(false);
    expect(all([
        [
            [true, true, true],
            [true, true, true]
        ],
        [
            [true, true]
        ]
    ])).toBe(true);

    expect(any(false)).toBe(false);
    expect(any(true)).toBe(true);
    expect(any([])).toBe(false);
    expect(any([false, true, true])).toBe(true);
    expect(any([true, true, false])).toBe(true);
    expect(any([false, false, false])).toBe(false);
    expect(any([
        [true, true, true],
        [false, true, false]
    ])).toBe(true);
    expect(any([
        [false, false, false],
        [false, false, false]
    ])).toBe(false);
    expect(any([
        [
            [true, true, true],
            [false, true, true]
        ],
        [
            [true, true]
        ]
    ])).toBe(true);
    expect(any([
        [
            [false, false, false],
            [false, false, false]
        ],
        [
            [false, false]
        ]
    ])).toBe(false);
});

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

test('full', () => {
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

test('copy', () => {
    const as = [
        0,
        [1, 2, 3],
        [
            [4, 5, 6],
            [7, 8, 9]
        ],
        [
            [
                [10, 11, 12, 13],
                [14, 15, 16, 17]
            ],
            [
                [18, 19, 20, 21],
                [22, 23, 24, 25]
            ]
        ]
    ];
    for (const a of as) {
        const cop = copyArr(a);
        expect(cop).toEqual(a);
        let current = a;
        let last: any;
        while (Array.isArray(current)) {
            last = current;
            current = current[0];
        }
        if (Array.isArray(last)) {
            last[0] += 1;
            expect(cop).not.toEqual(a);
        }
        
    }
})

test('up to', () => {
    expect(upTo(0)).toEqual([]);
    const ten = upTo(10);
    expect(ten.length).toBe(10);
    for (let i = 0; i < 10; i++) {
        expect(ten[i]).toBe(i);
    }
});

test('reshape', () => {
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