/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */

import {
    mse,
    squareDistance,
    manhattanDistance,
    squaredMag,
    dot,
    variance,
    arange,
    sigmoid,
    correlation,
    colVariance,
    allClose
} from "../../src/utils/numJS";

test('mse', () => {
    expect(mse(1, 2)).toBe(1);
    expect(mse([1, 1, 1], [1, 1, 1])).toBe(0);
    expect(mse([1, 2, 3], [4, 5, 6])).toBe(9);
    expect(mse([4, 5, 6], [1, 2, 3])).toBe(9);
    expect(mse([1, 2, 3], [1, 2, 3])).toBe(0);
    expect(mse([1, 2, 3], [1, 2, 3])).toBe(0);
    expect(mse([], [])).toBe(0);
    expect(mse([1, 2, 3], 1)).toBeCloseTo(5 / 3);
    expect(mse([[1, 2], [3, 4]], 2)).toBeCloseTo(1.5);
});

test('square distance', () => {
    expect(squareDistance(1, 3)).toBe(4);
    expect(squareDistance([1, 2, 3], 1)).toBe(5);
    expect(squareDistance([3], [4])).toBe(1);
    expect(squareDistance([1, 2], [4, 6])).toBe(25);
    expect(squareDistance([1, 2, 3], [4, 5, 6])).toBe(27);
    expect(squareDistance([4, 5, 6], [1, 2, 3])).toBe(27);
    expect(squareDistance([], [])).toBe(0);
    expect(squareDistance([[1, 2], [3, 4]], 2)).toBe(6);
});

test('manhattan', () => {
    expect(manhattanDistance([1, 2, 3], [4, 5, 6])).toBe(9);
    expect(manhattanDistance([4, 5, 6], [1, 2, 3])).toBe(9);
    expect(manhattanDistance([1, 2, 3], [4, 5, 6])).toBe(9);
    expect(manhattanDistance([4, 5, 6], [1, 2, 3])).toBe(9);
    expect(manhattanDistance([], [])).toBe(0);
    expect(manhattanDistance(1, 2)).toBe(1);
    expect(manhattanDistance([1, 2, 3], 1)).toBe(3);
    expect(manhattanDistance([[1, 2], [3, 4]], 2)).toBe(4);
});

test('magnitude', () => {
    expect(squaredMag([3, 4])).toBe(25);
    expect(squaredMag([5, 12])).toBe(169);
    expect(squaredMag([12, 5])).toBe(169);
    expect(squaredMag([1, 2, 3, 4])).toBe(30);
    expect(squaredMag([])).toBe(0);
    expect(squaredMag(2)).toBe(4);
    expect(squaredMag([[1, 2], [3, 4]])).toBe(30);
});

test('dot', () => {
    expect(dot(
        [1, 2, 3, 4],
        [5, 6, 7, 8]
    )).toBe(70);

    expect(dot(
        [1],
        [2, 3, 4]
    )).toBe(2);

    expect(dot(
        [2, 3, 4],
        [1]
    )).toBe(2);
});

test('variance', () => {
    expect(variance([1, 1, 1, 1])).toBe(0);
    expect(variance([0, 1, 1, 2])).toBeCloseTo(2 / 3);
    expect(variance([[2, 2], [2, 2]])).toBe(0);
    expect(variance([1, 2, 3])).toBeCloseTo(1);
});

test('sigmoid', () => {
    const s = arange(100).map(sigmoid);
    for (let i = 1; i < s.length; i++) {
        expect(s[i]).toBeGreaterThanOrEqual(0);
        expect(s[i]).toBeLessThanOrEqual(1);
        expect(s[i]).toBeGreaterThanOrEqual(s[i - 1]);
    }
});

test('correlation', () => {
    expect(correlation([1, 2, 3], [4, 5, 6])).toBeCloseTo(1);
    expect(correlation([1, 2, 3], [-1, -2, -3])).toBeCloseTo(-1);
    expect(correlation([0, 1], [1, 2])).toBeCloseTo(1);
    expect(correlation([0, 1], [1, 2])).toBeCloseTo(1);
    expect(correlation([1, 2, 3], [4, 3, 4])).toBeCloseTo(0);
    expect(correlation([1, 2, 3], [1, 1, 1])).toBeCloseTo(0);
    expect(correlation([1, 2, 3], 1)).toBe(0);
    expect(correlation([[1, 2], [3, 4]], [-1, -2, -3, -4])).toBe(-1);
});

test('col variance', () => {
    expect(allClose(
        colVariance([
            [0, 1, 2],
            [0, 2, 1],
            [0, 1, 1],
            [0, 2, 2]
        ]),
        [0, 1 / 3, 1 / 3]
    )).toBe(true);
});
