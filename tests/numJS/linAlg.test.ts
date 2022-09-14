import {
    matMul,
    invert,
    transpose,
    allClose,
    getShape,
    eye
} from "../../src/utils/numJS";

const A = [[1, 2], [3, 4]];
const I = [[1, 0], [0, 1]];

test('transpose', () => {
    expect(transpose(A)).toEqual([[1, 3], [2, 4]]);
    expect(transpose([[1, 2, 3, 4]])).toEqual([[1], [2], [3], [4]]);
    expect(transpose([[1, 2, 3], [4, 5, 6]])).toEqual([[1, 4], [2, 5], [3, 6]]);
    expect(
        transpose(transpose([[1, 2], [3, 4], [5, 6]]))
    ).toEqual([[1, 2], [3, 4], [5, 6]]);
});

test('matMul', () => {
    expect(matMul(2, 3)).toBe(6);
    expect(matMul(5, A)).toEqual([[5, 10], [15, 20]]);
    expect(matMul(A, 5)).toEqual([[5, 10], [15, 20]]);
    expect(matMul(5, [1, 2, 3, 4])).toEqual([5, 10, 15, 20]);
    expect(matMul([1, 2, 3, 4], 5)).toEqual([5, 10, 15, 20]);
    expect(matMul([1, 2, 3], [4, 5, 6])).toBe(32);
    expect(matMul(A, I)).toEqual(A);
    expect(matMul(I, A)).toEqual(A);
    expect(matMul(A, [5, 6])).toEqual([17, 39]);
    expect(matMul([5, 6], A)).toEqual([23, 34]);
    expect(() => matMul(A, [[1, 2], [3, 4], [5, 6]])).toThrowError();
});

test('invert', () => {
    expect(() => invert([[1, 2]])).toThrowError();
    expect(() => invert([[1, 0], [0, 0]])).toThrowError();
    const i = invert(A);
    expect(getShape(i)).toEqual(getShape(A));
    expect(allClose(i, [[-2, 1], [1.5, -0.5]])).toBe(true);
    const i2 = invert(I);
    expect(getShape(i2)).toEqual(getShape(I));
    expect(allClose(i2, I)).toBe(true);
});

test('eye', () => {
    expect(eye(1)).toEqual([[1]]);
    expect(eye(2)).toEqual([[1, 0], [0, 1]]);
    expect(eye(3)).toEqual([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
});
