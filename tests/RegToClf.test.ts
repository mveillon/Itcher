import { Regression } from "../src/ml/models/Regression";
import { RegToClfFriend } from "./friends";
import { 
    defaultTimeout,
    trainFeats,
    trainTargs,
    validFeats
} from "./checkModel";
import { sumList, arrOr, arrEqual, all } from "../src/utils/numJS";

jest.setTimeout(defaultTimeout);
test('overall sensibility', async () => {
    const model = new RegToClfFriend(new Regression(3));

    const [eqFeats, eqTargs] = model.eqClasses(trainFeats, trainTargs);
    expect(all(arrOr(
        arrEqual(eqTargs, 0), 
        arrEqual(eqTargs, 1)
    ))).toBe(true);
    expect(eqFeats.length).toBe(eqTargs.length);
    expect(eqFeats.length).toBeGreaterThan(0.8 * trainFeats.length);
    expect(eqFeats[0].length).toBe(trainFeats[0].length);
    expect(sumList(eqTargs) / eqTargs.length).toBeCloseTo(0.5);

    await model.fit(trainFeats, trainTargs);
    const preds = model.predict(validFeats);

    expect(all(arrOr(
        arrEqual(preds, 0),
        arrEqual(preds, 1)
    ))).toBe(true);
  
    const avg = sumList(preds) / preds.length;
    const trueAvg = sumList(model.binarize(trainTargs)) / trainTargs.length;
    expect(avg).toBeGreaterThan(0.9 * trueAvg);
    expect(avg).toBeLessThan(1.2 * trueAvg);
});
