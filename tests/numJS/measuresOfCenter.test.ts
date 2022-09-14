import { 
    mean,
    median,
    mode
} from "../../src/utils/numJS";
import { shuffle } from "../../src/utils/random";

test('median', () => {
    const a = [0, 1, 2];
    const b = [0, 1, 2, 3];
    const c = [[-2, -1], [1, 2]];
    for (let i = 0; i < 10; i++) {
        shuffle(a);
        expect(median(a)).toBe(1);
        shuffle(b);
        expect(median(b)).toBeCloseTo(1.5);
        shuffle(c);
        expect(median(c)).toBe(0);
    }
    expect(median(2)).toBe(2);
    expect(() => median([])).toThrowError();
});

test('mode', () => {
    const a = [0, 0, 1, 1, 1, 2];
    const b = [0, 0, 0, 1, 1, 2];
    const c = [[0, 1], [1, 2], [2, 2]];
    for (let i = 0; i < 10; i++) {
        shuffle(a);
        shuffle(b);
        shuffle(c);
        expect(mode(a)).toBe(1);
        expect(mode(b)).toBe(0);
        expect(mode(c)).toBe(2);
    }
    expect(mode(2)).toBe(2);
    expect(() => mode([])).toThrowError();
});

test('average', () => {
    expect(mean([1, 2, 3, 4, 5])).toBe(3);
    expect(mean([-3, -2, -1, 0, 1, 2, 3])).toBe(0);
    expect(mean(1)).toBe(1);
    expect(mean([[1, 2], [3, 4]])).toBeCloseTo(2.5);
    expect(() => mean([])).toThrowError();
});
