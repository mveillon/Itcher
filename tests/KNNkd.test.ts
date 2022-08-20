import { KNNkd } from "../src/ml/models/KNNkd";
import { checkModel, defaultTimeout, training } from "./checkModel";
import { BinaryTree } from "../src/utils/BinaryTree";
import { mse } from "../src/ml/calculations";
import { trainFeatsTargs, validFeatsTargs } from "../src/ml/trainTest";
import { kdFriend } from "./friends";
import { numAttributes } from "../src/ml/mappings";

jest.setTimeout(defaultTimeout)

test('fake data', async () => {
    let feats: number[][] = [];
    let targs: number[] = [];
    for (let i = 0; i < 20; i++) {
        feats.push([i, i, i, i]);
        targs.push(i);
    }

    let knn = new KNNkd(1);
    await knn.fit(feats, targs);

    let valid: number[][] = [
        [
            5, 5, 5, 5
        ],
        [
            10, 10, 10, 10
        ],
        [
            15, 15, 15, 15
        ]
    ];
    let actual: number[] = [
        5,
        10,
        15
    ];

    expect(mse(knn.predict(valid), actual)).toBeLessThan(1);

    let knn2 = new KNNkd(2);
    await knn2.fit(feats, targs);
    expect(mse(knn2.predict(valid), actual)).toBeLessThan(1);
});

test('train learner', async () => {
    if (training) {
        let knn = new kdFriend(8);
        const [feats, targs] = trainFeatsTargs();
        await knn.fit(feats, targs);
        expect(knn.k).toBe(8);
        expect(typeof knn.features).not.toBe('undefined');
        expect(typeof knn.targets).not.toBe('undefined');
        expect(typeof knn.tree).not.toBe('undefined');
        expect(knn.tree instanceof BinaryTree<number[][]>).toBe(true);
        expect(knn.tree.left instanceof BinaryTree<number[][]>).toBe(true);
        expect(knn.tree.right instanceof BinaryTree<number[][]>).toBe(true);

        expect(knn.features.length).toBe(feats.length);
        expect(knn.features[0].length).toBe(numAttributes());
        expect(knn.targets.length).toBe(knn.features.length);

        const minReward = Math.min(-2);
        const maxReward = Math.max(2);
        for (const t of knn.targets) {
            expect(t).toBeGreaterThanOrEqual(minReward);
            expect(t).toBeLessThanOrEqual(maxReward);
        }
    }
});

test('overall sensibility', async () => {
    await checkModel(new KNNkd(8));
});

const searching = false;
test ('best hypers', async () => {
    if (searching) {
        // k = 14 => 0.053
        const [trainFeats, trainTargs] = trainFeatsTargs();
        const [validFeats, validTargs] = validFeatsTargs();

        const errs: number[] = [];  
        for (let k = 2; k < 15; k++) {
            let knn = new KNNkd(k);
            await knn.fit(trainFeats, trainTargs);
            const err = mse(knn.predict(validFeats), validTargs);
            errs.push(err);
        }

        let best = 0;
        for (let i = 0; i < errs.length; i++) {
            if (errs[i] < errs[best]) best = i;
        }

        console.log(`KNNkd: k = ${best + 2} => ${errs[best]}`);
    }
});
