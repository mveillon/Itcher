import { Ensemble } from "../src/ml/models/Ensemble";
import { checkModel, defaultTimeout } from "./checkModel";
import { regression, Regression } from "../src/ml/models/Regression";
import { knnKD, KNNkd } from "../src/ml/models/KNNkd";

jest.setTimeout(defaultTimeout);
test('Ensemble', async () => {
    const mod = new Ensemble(knnKD, 4);
    const feats = [
        [1, 2, 3], 
        [4, 5, 6], 
        [7, 8, 9],
        [10, 11, 12],
        [13, 14, 15]
    ];
    const targs = [
        1, 
        2, 
        3, 
        4, 
        5
    ];

    await mod.fit(feats, targs);

    for (let i = 0; i < 3; i++) {
        expect(feats.includes((mod.models[i] as KNNkd).features[0])).toEqual(true);
        expect(targs.includes((mod.models[i] as KNNkd).targets[0])).toEqual(true);
    }

    const preds = mod.predict(feats);
    expect(preds.length).toBe(feats.length);
    for (const p of preds) {
        expect(p).toBeGreaterThanOrEqual(Math.min(...targs));
        expect(p).toBeLessThanOrEqual(Math.max(...targs));
    }
});

test('read/write', async () => {
    const mod = new Ensemble(regression, 5);
    await mod.fit(
        [
            [1, 2, 3], 
            [4, 5, 6], 
            [7, 8, 9],
            [10, 11, 12],
            [13, 14, 15]
        ], 
        [
            1, 
            2, 
            3, 
            4, 
            5
        ]
    );
    const backAgain = Ensemble.fromObjEnsemble(mod.toObj(), Regression.fromObj);
    for (let i = 0; i < mod.models.length; i++) {
        expect((backAgain.models[i] as Regression).degree).toBe((mod.models[i] as Regression).degree);
        expect((backAgain.models[i] as Regression).w).toEqual((mod.models[i] as Regression).w);
    }
});

test('overall sensibility', async () => {
    await checkModel(new Ensemble(() => new KNNkd(5), 4));
});
