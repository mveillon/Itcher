import { checkModel, defaultTimeout } from "./checkModel";
import { AlwaysMean } from "../src/ml/models/AlwaysMean";
import { upTo } from "../src/utils/utilities";

jest.setTimeout(defaultTimeout)
test('right mean', () => {
    const x: number[][] = upTo(20).map(n => [n]);
    let y: number[] = [];
    for (let i = 0; i < x.length; i++) {
        y.push(5);
    }

    let aMean = new AlwaysMean();
    aMean.fit(x, y);
    expect(aMean.mean).toBeCloseTo(5);

    const preds = aMean.predict(x);
    expect(preds.length).toBe(x.length);
    for (let i = 0; i < preds.length; i++) {
        expect(preds[i]).toBeCloseTo(5);
    }

    const backAgain = AlwaysMean.fromObj(aMean.toObj());
    expect(backAgain.mean).toBe(aMean.mean);
})

test('overall sensibility', async () => {
    await checkModel(new AlwaysMean());
})
