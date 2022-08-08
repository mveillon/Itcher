import { checkModel, defaultTimeout } from "./checkModel";
import { DecisionTree } from "../src/ml/models/DecisionTree";
import { TreeFriend } from "./friends";

jest.setTimeout(defaultTimeout);
test('decision tree', async () => {
    let dt = new TreeFriend(undefined, 1);
    expect(dt.minCV).toBe(0.1);
    expect(dt.minBranchSize).toBe(1);

    const feats = [
        [1, 3, 2, 4],
        [2, 2, 3, 4],
        [3, 3, 2, 4],
        [4, 2, 3, 4],
    ];
    const targs = [0, 0, 1, 1];

    await dt.fit(feats, targs);
    expect(typeof dt.tree).not.toBe('undefined');

    expect(Array.isArray(dt.tree.left)).toBe(true);
    expect(Array.isArray(dt.tree.right)).toBe(true);

    for (let i = 0; i < feats.length; i++) {
        expect(dt.predict([feats[i]])[0]).toBeCloseTo(targs[i]);
    }
});

test('overall sensibility', async () => {
    await checkModel(new DecisionTree());
})

