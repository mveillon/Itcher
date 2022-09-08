import { 
    mse, 
    squareDistance, 
    manhattanDistance, 
    squaredMag, 
    dot, 
    average, 
    variance, 
    sigmoid, 
    correlation 
} from "../src/ml/calculations";
import { arange } from "../src/utils/numJS";

test('mse', () => {
    expect(mse([1, 1, 1], [1, 1, 1])).toBe(0);
    expect(mse([1, 2, 3], [4, 5, 6])).toBe(9);
    expect(mse([4, 5, 6], [1, 2, 3])).toBe(9);
    expect(mse([1, 2, 3, 4], [1, 2, 3])).toBe(0);
    expect(mse([1, 2, 3], [1, 2, 3, 4])).toBe(0);
    expect(mse([], [])).toBe(0);
});

test('square distance', () => {
    expect(squareDistance([3], [4])).toBe(1);
    expect(squareDistance([1, 2], [4, 6])).toBe(25);
    expect(squareDistance([1, 2, 3], [4, 5, 6, 7])).toBe(27);
    expect(squareDistance([4, 5, 6, 7], [1, 2, 3])).toBe(27);
    expect(squareDistance([], [])).toBe(0);
})

test('manhattan', () => {
    expect(manhattanDistance([1, 2, 3], [4, 5, 6])).toBe(9);
    expect(manhattanDistance([4, 5, 6], [1, 2, 3])).toBe(9);
    expect(manhattanDistance([1, 2, 3, 4], [4, 5, 6])).toBe(9);
    expect(manhattanDistance([4, 5, 6], [1, 2, 3, 4])).toBe(9);
    expect(manhattanDistance([], [])).toBe(0);
})

test('magnitude', () => {
    expect(squaredMag([3, 4])).toBe(25);
    expect(squaredMag([5, 12])).toBe(169);
    expect(squaredMag([12, 5])).toBe(169);
    expect(squaredMag([1, 2, 3, 4])).toBe(30);
    expect(squaredMag([])).toBe(0);
})

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

test('average', () => {
    expect(average([1, 2, 3, 4, 5])).toBe(3);
    expect(average([-3, -2, -1, 0, 1, 2, 3])).toBe(0);
});

test('variance', () => {
    expect(variance([1, 1, 1, 1])).toBe(0);
    expect(variance([0, 1, 1, 2])).toBeCloseTo(0.5);
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
    expect(correlation([0, 1], [1, 2, 3])).toBeCloseTo(1);
    expect(correlation([0, 1, 2], [1, 2])).toBeCloseTo(1);
    expect(correlation([1, 2, 3], [4, 3, 4])).toBeCloseTo(0);
    expect(correlation([1, 2, 3], [1, 1, 1])).toBeCloseTo(0);
});
