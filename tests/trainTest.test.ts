import { mse } from "../src/ml/trainTest";

test('mse', () => {
    expect(mse([1, 1, 1], [1, 1, 1])).toBe(0);
    expect(mse([1, 2, 3], [4, 5, 6])).toBe(9);
    expect(mse([4, 5, 6], [1, 2, 3])).toBe(9);
});
