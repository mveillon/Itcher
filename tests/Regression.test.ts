import { Regression } from "../src/ml/models/Regression";
import { 
    checkModel, 
    defaultTimeout,
    trainFeats,
    trainTargs,
    validFeats,
    validTargs
} from "./checkModel";
import { 
    arange, 
    full, 
    isClose, 
    any, 
    reshape, 
    mse, 
    allEqual,
    sumList,
    toNum,
    transpose
} from "../src/utils/numJS";
import { RegressionFriend } from "./friends";

jest.setTimeout(defaultTimeout);
test('Regression', async () => {
    const x: number[][] = reshape(arange(20), [20, 1]) as number[][];
    const y: number[] = x.map(n => 5 + 3 * n[0] + 4 * Math.pow(n[0], 2));

    let reg = new RegressionFriend(2, false);
    await reg.fit(x, y);
    const w = [5, 3, 4];
    for (let i = 0; i < reg.w.length; i++) {
        expect(any(
            isClose(
                full(
                    [w.length], 
                    reg.w[i]), 
                w)))
            .toBe(true);

        expect(any(isClose(full([w.length], w[i]), reg.w))).toBe(true);
    }
    
    const preds = reg.predict(x);
    for (let i = 0; i < preds.length; i++) {
        expect(preds[i]).toBeCloseTo(y[i]);
    }

    const zs = reg.getZs(x);
    expect(zs[0].length).toBe(3);
    expect(zs.length).toBe(x.length);
    const cols: number[][] = transpose(zs);
    expect(sumList(toNum(cols.map(r => allEqual(r, 1))))).toBe(1);
});

test('overall sensibility', async () => {
    await checkModel(new Regression(2));
});

const searching = false;
test('best hypers', async () => {
    // d = 2 => 0.048
    if (searching) {
        const errs: number[] = [];  
        for (let d = 2; d < 15; d++) {
            let knn = new Regression(d);
            await knn.fit(trainFeats, trainTargs);
            const err = mse(knn.predict(validFeats), validTargs);
            errs.push(err);
        }

        let best = 0;
        for (let i = 0; i < errs.length; i++) {
            if (errs[i] < errs[best]) best = i;
        }

        console.log(`Regression: d = ${best + 2} => ${errs[best]}`);
    }
});