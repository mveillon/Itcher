import { checkModel } from "./checkModel";
import { AlwaysMean } from "../src/ml/models/AlwaysMean";

test('right mean', () => {
    const x: number[][] = [...Array(20).keys()].map(n => [n]);
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
})

test('overall sensibility', () => {
    checkModel(new AlwaysMean());
})
