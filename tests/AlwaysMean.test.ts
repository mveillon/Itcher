import { checkModel, defaultTimeout } from "./checkModel";
import { alwaysMean, AlwaysMean } from "../src/ml/models/AlwaysMean";
import { arange, reshape } from "../src/utils/numJS";

jest.setTimeout(defaultTimeout);
test('right mean', async () => {
    const x: number[][] = reshape(arange(20), [20, 1]) as number[][];
    let y: number[] = [];
    for (let i = 0; i < x.length; i++) {
        y.push(5);
    }

    let aMean = alwaysMean();
    await aMean.fit(x, y);
    expect(aMean.mean).toBeCloseTo(5);

    const preds = aMean.predict(x);
    expect(preds.length).toBe(x.length);
    for (let i = 0; i < preds.length; i++) {
        expect(preds[i]).toBeCloseTo(5);
    }
})

test('overall sensibility', async () => {
    await checkModel(new AlwaysMean());
});
