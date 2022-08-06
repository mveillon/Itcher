import { KNNkd } from "../src/ml/models/KNNkd";
import { trainLearner } from "../src/ml/trainTest";
import { checkModel, defaultTimeout, training } from "./checkModel";
import { BinaryTree } from "../src/utils/BinaryTree";
import { mse } from "../src/ml/metrics";
jest.setTimeout(defaultTimeout)

test('fake data', () => {
    let feats: number[][] = [];
    let targs: number[] = [];
    for (let i = 0; i < 20; i++) {
        feats.push([i, i, i, i]);
        targs.push(i);
    }

    let knn = new KNNkd(1);
    knn.fit(feats, targs);

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
    knn2.fit(feats, targs);
    expect(mse(knn2.predict(valid), actual)).toBeLessThan(1);
});

test('train learner', () => {
    if (training) {
        let knn = new KNNkd(8);
        trainLearner(knn);
        expect(knn.k).toBe(8);
        expect(typeof knn.features).not.toBe('undefined');
        expect(typeof knn.targets).not.toBe('undefined');
        expect(typeof knn.tree).not.toBe('undefined');
        expect(knn.tree instanceof BinaryTree<number[][]>).toBe(true);
        expect(knn.tree.left instanceof BinaryTree<number[][]>).toBe(true);
        expect(knn.tree.right instanceof BinaryTree<number[][]>).toBe(true);

        expect(knn.features.length).toBeGreaterThan(10000);
        expect(knn.features[0].length).toBe(6);
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
