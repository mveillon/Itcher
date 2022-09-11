import {
    arange,
    allClose
} from "../../src/utils/numJS";

test('arange', () => {
    expect(arange(0, 5, 1)).toEqual([0, 1, 2, 3, 4]);
    expect(arange(5)).toEqual([0, 1, 2, 3, 4]);
    expect(arange(-5, 0)).toEqual([-5, -4, -3, -2, -1]);
    expect(arange(0, -5, -1)).toEqual([0, -1, -2, -3, -4]);
    expect(allClose(arange(0, 2, 0.5), [0, 0.5, 1, 1.5])).toBe(true);
    expect(allClose(arange(2, 0, -0.5), [2, 1.5, 1, 0.5])).toBe(true);
    expect(() => arange(0, -5)).toThrow();
});
