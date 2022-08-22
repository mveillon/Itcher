import { checkModel, defaultTimeout } from "./checkModel";
import { InteractionRegression } from "../src/ml/models/InteractionRegression";
import { IRFriend } from "./friends"; 
import { allClose, arange, reshape } from "../src/utils/arrayOps";

jest.setTimeout(defaultTimeout);
// test('overall sensibility', async () => {
//     await checkModel(new InteractionRegression(3, 0.005));
// });

test('terms', async () => {
    let reg = new IRFriend(2);
    const xs: number[][] = reshape(arange(24), [6, 4]) as number[][];
    const ys: number[] = xs.map((row) => {
        return 5 + Math.pow(row[0], 2) - row[0] * row[1] - row[2] * row[3];
    });

    await reg.fit(xs, ys);
    for (const t of reg.terms) {
        let count = +!t.length;
        for (const t2 of reg.terms) {
            count += +(t.length === t2.length && allClose(t, t2));
        }
        expect(count).toBe(1);
    }
    expect(reg.terms.length).toBeLessThanOrEqual(4);

    const preds = reg.predict(xs);
    expect(allClose(ys, preds)).toBe(true);
});