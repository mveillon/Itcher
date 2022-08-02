import { KNN } from "../src/ml/models/KNN";
import { learnerMSE, mse, trainLearner } from "../src/ml/trainTest";
import { rewards } from "../src/ml/rewards";
import { BinaryTree } from "../src/utils/BinaryTree";

test('fake data', () => {
    let feats: number[][] = [];
    let targs: number[] = [];
    for (let i = 0; i < 20; i++) {
        feats.push([i, i, i, i]);
        targs.push(i);
    }

    let knn = new KNN(1);
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

    expect(knn.predict(valid)).toEqual(actual);

    let knn2 = new KNN(2);
    knn2.fit(feats, targs);
    expect(mse(knn2.predict(valid), actual)).toBeLessThan(1);
});

test('train learner', () => {
    let knn = new KNN(8);
    trainLearner(knn);
    expect(knn.k).toBe(8);
    expect(typeof knn.features).not.toBe('undefined');
    expect(typeof knn.targets).not.toBe('undefined');
    expect(typeof knn.tree).not.toBe('undefined');
    expect(knn.tree instanceof BinaryTree<number[][]>).toBe(true);
    expect(knn.tree.left instanceof BinaryTree<number[][]>).toBe(true);
    expect(knn.tree.right instanceof BinaryTree<number[][]>).toBe(true);

    expect(knn.features.length).toBeGreaterThan(10000);
    expect(knn.features[0].length).toBe(20);
    expect(knn.targets.length).toBe(knn.features.length);

    const minReward = Math.min(...Object.values(rewards));
    const maxReward = Math.max(...Object.values(rewards));
    for (const t of knn.targets) {
        expect(t).toBeGreaterThanOrEqual(minReward);
        expect(t).toBeLessThanOrEqual(maxReward);
    }
});

test('overall accuracy', () => {
    let knn = new KNN(8);
    trainLearner(knn);
    const [err, preds] = learnerMSE(knn);
    const minReward = Math.min(...Object.values(rewards));
    const maxReward = Math.max(...Object.values(rewards));
    for (const p of preds) {
        expect(p).toBeGreaterThanOrEqual(minReward);
        expect(p).toBeLessThanOrEqual(maxReward);
    }
    expect(err).toBeLessThan(1);
    console.log(err);
});
