import { checkModel, defaultTimeout, training } from "./checkModel";
import { KNNBall } from "../src/ml/models/KNNBall";
import { trainLearner } from "../src/ml/trainTest";
import { BinaryTree } from "../src/utils/BinaryTree";

jest.setTimeout(defaultTimeout);
test('train learner', () => {
    if (training) {
        let knn = new KNNBall(8);
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
    await checkModel(new KNNBall(8));
});
