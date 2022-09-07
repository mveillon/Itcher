import {
    randInt,
    choice,
    shuffle,
    randArr,
    choices
} from "../src/utils/random";
import { 
    zeros, 
    allClose, 
    full, 
    arange, 
    scalarMul,
    sumList,
    getShape,
    all,
    arrGTEq,
    arrLT
} from "../src/utils/numJS";

const randIters = 10_000

test('randInt', () => {
    let dists: number[] = zeros([10]) as number[];
    for (let i = 0; i < randIters; i++) {
        const rand = randInt(dists.length);
        expect(Number.isInteger(rand)).toBe(true);
        expect(rand).toBeGreaterThanOrEqual(0);
        expect(rand).toBeLessThan(dists.length);
        dists[rand]++;
    }
    expect(allClose(
        dists, 
        full([dists.length], randIters / dists.length), 
        0.3
    ));
});

test('choice', () => {
    expect(() => choice([], [])).toThrow(Error);
    expect(() => choice([1], [])).toThrow(Error);
    expect(() => choice([1, 2, 3], [-1, 2, 3])).toThrow(Error);
    expect(() => choice([1, 2, 3], [1, 0, 2])).toThrow(Error);
    
    let dists: number[] = zeros([10]) as number[];
    let wDists: number[] = zeros([dists.length]) as number[];
    let fwDists: number[] = zeros([dists.length]) as number[];
    const vals = arange(dists.length);
    const ws = vals.map(n => Math.pow(n, 2));
    const floatWs = scalarMul(1 / sumList(ws), ws) as number[];

    const checkN = (n: number) => {
        expect(Number.isInteger(n)).toBe(true);
        expect(n).toBeGreaterThanOrEqual(vals[0]);
        expect(n).toBeLessThanOrEqual(vals[vals.length - 1]);
    }

    for (let i = 0; i < randIters; i++) {
        const v = choice(vals);
        checkN(v);
        dists[v]++;

        const w = choice(vals, ws);
        checkN(w);
        wDists[w]++;

        const fw = choice(vals, floatWs);
        checkN(fw);
        fwDists[fw]++;
    }

    expect(allClose(
        dists, 
        full([dists.length], randIters / dists.length), 
        0.3
    )).toBe(true);

    expect(allClose(
        scalarMul(1 / randIters, wDists),
        floatWs,
        undefined,
        randIters / 100
    )).toBe(true);

    expect(allClose(
        scalarMul(1 / randIters, fwDists),
        floatWs,
        undefined,
        randIters / 100
    ));
});

test('shuffle', () => {
    let inds = zeros([10]) as number[];
    let vals = arange(inds.length);

    for (let i = 0; i < randIters; i++) {
        shuffle(vals);
        inds[vals.indexOf(0)]++;
    }

    expect(allClose(
        inds,
        full([inds.length], randIters / inds.length),
        0.3
    )).toBe(true);
});

test('rand array', () => {
    const a = randArr([], 2);
    expect(typeof a).toBe('number');
    expect(Number.isInteger(a)).toBe(true);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(2);

    const b = randArr([], 1, 3);
    expect(typeof b).toBe('number');
    expect(Number.isInteger(b)).toBe(true);
    expect(b).toBeGreaterThanOrEqual(1);
    expect(b).toBeLessThan(3);

    const c = randArr([10], 10);
    expect(getShape(c)).toEqual([10]);
    expect(all(arrGTEq(c, 0))).toBe(true);
    expect(all(arrLT(c, 10))).toBe(true);

    const d = randArr([2, 3, 4], 5, 10);
    expect(getShape(d)).toEqual([2, 3, 4]);
    expect(all(arrGTEq(d, 5))).toBe(true);
    expect(all(arrLT(d, 10))).toBe(true);
});

test('choices', () => {
    const a: number[] = arange(12);
    let counts: number[] = zeros([a.length]) as number[];

    for (let i = 0; i < randIters; i++) {
        const c = choices(a, 3);
        for (const n of c) {
            counts[n]++;
        }
    }

    expect(allClose(
        counts, 
        3 * randIters / a.length,
        0.3
    )).toBe(true);
});

