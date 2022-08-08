import { Regression } from "../src/ml/models/Regression";
import { checkModel, defaultTimeout } from "./checkModel";
import { upTo } from "../src/utils/utilities";
import { trainFeatsTargs, validFeatsTargs } from "../src/ml/trainTest";
import { mse } from "../src/ml/calculations";
import { RegressionFriend } from "./friends";

jest.setTimeout(defaultTimeout);
test('Regression', async () => {
    const x: number[][] = upTo(20).map(n => [n]);
    const y: number[] = x.map(n => 5 + 3 * n[0] + 4 * Math.pow(n[0], 2));

    let reg = new RegressionFriend(2);
    await reg.fit(x, y);
    const w = [5, 3, 4];
    for (let i = 0; i < reg.w.rows; i++) {
        expect(reg.w.get(i, 0)).toBeCloseTo(w[i]);
    }
    
    const preds = reg.predict(x);
    for (let i = 0; i < preds.length; i++) {
        expect(preds[i]).toBeCloseTo(y[i]);
    }

    const backAgain = RegressionFriend.fromRegression(Regression.fromObj(reg.toObj()));
    expect(backAgain.degree).toBe(reg.degree);
    expect(backAgain.w).toEqual(reg.w);
});

test('overall sensibility', async () => {
    await checkModel(new Regression(2));
});

const searching = false;
test('best hypers', async () => {
    // d = 2 => 0.048
    if (searching) {
        const [trainFeats, trainTargs] = trainFeatsTargs();
        const [validFeats, validTargs] = validFeatsTargs();

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