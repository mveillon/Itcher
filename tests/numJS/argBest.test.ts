import {
    argMin,
    argMax
} from "../../src/utils/numJS";
import { shuffle } from "../../src/utils/random";

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
