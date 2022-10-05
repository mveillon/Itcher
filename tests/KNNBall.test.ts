/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */

import { 
    checkModel, 
    defaultTimeout, 
    training,
    trainFeats,
    trainTargs,
    validFeats,
    validTargs
} from "./checkModel";
import { KNNBall, knnBall } from "../src/ml/models/KNNBall";
import { BinaryTree } from "../src/utils/BinaryTree";
import { mse } from "../src/utils/numJS";
import { BallFriend } from "./friends";
import { numAttributes } from "../src/ml/mappings";

jest.setTimeout(defaultTimeout);
test('train learner', async () => {
    if (training) {
        let knn = new BallFriend(8);
        await knn.fit(trainFeats, trainTargs);
        expect(knn.k).toBe(8);
        expect(typeof knn.features).not.toBe('undefined');
        expect(typeof knn.targets).not.toBe('undefined');
        expect(typeof knn.tree).not.toBe('undefined');
        expect(knn.tree instanceof BinaryTree<number[]>).toBe(true);
        expect(knn.tree.left instanceof BinaryTree<number[]>).toBe(true);
        expect(knn.tree.right instanceof BinaryTree<number[]>).toBe(true);

        expect(knn.features.length).toBe(trainFeats.length);
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
    await checkModel(knnBall());
});

const searching = false;
test ('best hypers', async () => {
    if (searching) {
        // k = 14 => 0.053
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
