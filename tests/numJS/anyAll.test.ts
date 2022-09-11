import {
    any,
    all
} from "../../src/utils/numJS";

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
