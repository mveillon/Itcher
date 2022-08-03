import { Regression } from "../src/ml/models/Regression";
import { checkModel } from "./checkModel";

test('Regression', () => {
    const x: number[][] = [...Array(20).keys()].map(n => [n]);
    const y: number[] = x.map(n => 5 + 3 * n[0] + 4 * Math.pow(n[0], 2));

    let reg = new Regression(2);
    reg.fit(x, y);
    const w = [5, 3, 4];
    for (let i = 0; i < reg.w.rows; i++) {
        expect(reg.w.get(i, 0)).toBeCloseTo(w[i]);
    }
    
    const preds = reg.predict(x);
    for (let i = 0; i < preds.length; i++) {
        expect(preds[i]).toBeCloseTo(y[i]);
    }
});

test('overall sensibility', () => {
    checkModel(new Regression(2));
})