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
    reshape,
    arange,
    arrEqual,
    arrLT,
    arrLTEq,
    arrGT,
    arrGTEq,
    arrOr,
    arrAnd,
    arrNot,
    allEqual,
    arrIndex,
    zeros,
    ones
} from "../src/utils/numJS";
import { shuffle, randArr } from "../src/utils/random";

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

    expect(colAverage([])).toEqual([]);
});

test('argMin/Max', () => {
    expect(() => argMin([])).toThrow(Error);
    expect(() => argMin([])).toThrow(Error);
    
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

test('arange', () => {
    expect(arange(0, 5, 1)).toEqual([0, 1, 2, 3, 4]);
    expect(arange(5)).toEqual([0, 1, 2, 3, 4]);
    expect(arange(-5, 0)).toEqual([-5, -4, -3, -2, -1]);
    expect(arange(0, -5, -1)).toEqual([0, -1, -2, -3, -4]);
    expect(allClose(arange(0, 2, 0.5), [0, 0.5, 1, 1.5])).toBe(true);
    expect(allClose(arange(2, 0, -0.5), [2, 1.5, 1, 0.5])).toBe(true);
    expect(() => arange(0, -5)).toThrow();
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
    expect(all(arrEqual(ored, e))).toBe(true);
    expect(allEqual(f, ored)).toBe(true);
    expect(all(arrEqual(ored, e))).toBe(true);

    const g = reshape(a, [2, 12]);
    const h = subArrays(a, g);
    expect(getShape(h)).toEqual(getShape(a));

    const i = arange(12);
    const j = reshape(i, [3, 4]);
    const k = reshape(i, [4, 3]);
    const l = addArrays(j, k);
    expect(getShape(l)).toEqual(getShape(j));
});

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
