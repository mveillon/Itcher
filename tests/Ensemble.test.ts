import { Ensemble } from "../src/ml/models/Ensemble";
import { checkModel, defaultTimeout } from "./checkModel";
import { KNNkd } from "../src/ml/models/KNNkd";
import { Regression } from "../src/ml/models/Regression";
import { EnsembleFriend, kdFriend, RegressionFriend } from "./friends";

jest.setTimeout(defaultTimeout);
test('Ensemble', async () => {
    const mod = new EnsembleFriend(() => new kdFriend(2), 4);
    for (let i = 0; i < 4; i++) {
        expect(mod.models[i] instanceof kdFriend).toBe(true);
    }
    
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
        expect(feats.includes((mod.models[i] as kdFriend).features[0])).toEqual(true);
        expect(targs.includes((mod.models[i] as kdFriend).targets[0])).toEqual(true);
    }

    const preds = mod.predict(feats);
    expect(preds.length).toBe(feats.length);
    for (const p of preds) {
        expect(p).toBeGreaterThanOrEqual(Math.min(...targs));
        expect(p).toBeLessThanOrEqual(Math.max(...targs));
    }
});

test('read/write', async () => {
    const mod = new EnsembleFriend(() => new RegressionFriend(2), 5);
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
    const ens = Ensemble.fromObjEnsemble(mod.toObj(), RegressionFriend.fromObj);
    const backAgain = EnsembleFriend.fromEnsemble(
        ens,
        (obj) => RegressionFriend.fromRegression(Regression.fromObj(obj))
    );
    for (let i = 0; i < mod.models.length; i++) {
        const friend1 = backAgain.models[i] as RegressionFriend;
        const friend2 = mod.models[i] as RegressionFriend;
        expect(friend1.degree).toBe(friend2.degree);
        expect(friend1.w).toEqual(friend2.w);
    }
});

test('overall sensibility', async () => {
    await checkModel(new Ensemble(() => new KNNkd(5), 4));
});
