import { regression } from "../src/ml/models/Regression";
import { regToClf } from "../src/ml/models/RegToClf";
import { 
    defaultTimeout,
    trainFeats,
    trainTargs,
    validFeats
} from "./checkModel";
import { sumList } from "../src/utils/numJS";

jest.setTimeout(defaultTimeout);
test('overall sensibility', async () => {
    const model = regToClf(regression());

    await model.fit(trainFeats, trainTargs);
    const preds = model.predict(validFeats);

    for (const p of preds) {
        expect([0, 1]).toContain(p);
    }

    const total = sumList(preds);
    expect(total).toBeGreaterThan(0.1);
    expect(total).toBeLessThan(0.9 * preds.length);
});
