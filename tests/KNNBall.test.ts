import { checkModel, defaultTimeout, training } from "./checkModel";
import { KNNBall } from "../src/ml/models/KNNBall";
import { trainLearner } from "../src/ml/trainTest";
import { BinaryTree } from "../src/utils/BinaryTree";
import { trainFeatsTargs, validFeatsTargs } from "../src/ml/trainTest";
import { mse } from "../src/ml/calculations";
import { BallFriend } from "./friends";

jest.setTimeout(defaultTimeout);
test('train learner', async () => {
    if (training) {
        let knn = new BallFriend(8);
        await trainLearner(knn);
        expect(knn.k).toBe(8);
        expect(typeof knn.features).not.toBe('undefined');
        expect(typeof knn.targets).not.toBe('undefined');
        expect(typeof knn.tree).not.toBe('undefined');
        expect(knn.tree instanceof BinaryTree<number[][]>).toBe(true);
        expect(knn.tree.left instanceof BinaryTree<number[][]>).toBe(true);
        expect(knn.tree.right instanceof BinaryTree<number[][]>).toBe(true);

        expect(knn.features.length).toBeGreaterThan(10000);
        expect(knn.features[0].length).toBe(7);
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

const searching = false;
test ('best hypers', async () => {
    if (searching) {
        // k = 14 => 0.053
        const [trainFeats, trainTargs] = trainFeatsTargs();
        const [validFeats, validTargs] = validFeatsTargs();

        const errs: number[] = [];  
        for (let k = 2; k < 15; k++) {
            let knn = new KNNBall(k);
            await knn.fit(trainFeats, trainTargs);
            const err = mse(knn.predict(validFeats), validTargs);
            errs.push(err);
        }

        let best = 0;
        for (let i = 0; i < errs.length; i++) {
            if (errs[i] < errs[best]) best = i;
        }

        console.log(`KNNBall: k = ${best + 2} => ${errs[best]}`);
    }
});
