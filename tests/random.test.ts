import {
    randInt,
    choice,
    shuffle
} from "../src/utils/random";
import { 
    zeros, 
    allClose, 
    full, 
    arange, 
    scalarMul,
    sumList
} from "../src/utils/arrayOps";

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
    let dists: number[] = zeros([10]) as number[];
    let wDists: number[] = zeros([dists.length]) as number[];
    const vals = arange(dists.length);
    let ws = vals.map(n => Math.pow(n, 2));

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
    }

    console.log(dists);
    expect(allClose(
        dists, 
        full([dists.length], randIters / dists.length), 
        0.3
    )).toBe(true);

    expect(allClose(
        scalarMul(1 / randIters, wDists),
        scalarMul(1 / sumList(ws), ws),
        undefined,
        randIters / 100
    )).toBe(true);
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