import { dot } from "../src/utils/utilities";

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
