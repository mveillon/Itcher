import { KNNkd, knnKD } from "../src/ml/models/KNNkd";
import { 
    checkModel, 
    defaultTimeout, 
    training,
    trainFeats,
    trainTargs,
    validFeats,
    validTargs
} from "./checkModel";
import { BinaryTree } from "../src/utils/BinaryTree";
import { mse } from "../src/utils/numJS";
import { kdFriend } from "./friends";
import { numAttributes } from "../src/ml/mappings";
import { standardScale } from "../src/ml/standardScale";

jest.setTimeout(defaultTimeout)

// test('fake data', async () => {
//     let feats: number[][] = [];
//     let targs: number[] = [];
//     for (let i = 0; i < 4; i++) {
//         feats.push([
//             i, 
//             Math.pow(-1, i & 1) * i, 
//             Math.pow(i, 2), 
//             Math.pow(-1, i & 1) * Math.pow(i, 2),
//             Math.pow(i, 3)
//         ]);
//         targs.push(i);
//     }
//     const scaled = standardScale(feats) as number[][];

//     let knn = new kdFriend(1);
//     await knn.fit(feats, targs);
//     expect(scaled).toContainEqual(knn.features[0]);
//     expect(targs).toContain(knn.targets[0]);

//     for (let i = 0; i < scaled.length; i++) {
//         expect(knn.tree.traverse(scaled[i])).toEqual([i]);
//     }
//     expect(mse(knn.predict(feats), targs)).toBeCloseTo(0);

//     let knn2 = new KNNkd(2);
//     await knn2.fit(feats, targs);
//     expect(mse(knn2.predict(feats), targs)).toBeLessThanOrEqual(1);
// });

test('train learner', async () => {
    if (training) {
        let knn = new kdFriend(8);
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

// test('overall sensibility', async () => {
//     await checkModel(knnKD());
// });

// const searching = false;
// test ('best hypers', async () => {
//     if (searching) {
//         // k = 14 => 0.053
//         const errs: number[] = [];  
//         for (let k = 2; k < 15; k++) {
//             let knn = new KNNkd(k);
//             await knn.fit(trainFeats, trainTargs);
//             const err = mse(knn.predict(validFeats), validTargs);
//             errs.push(err);
//         }

//         let best = 0;
//         for (let i = 0; i < errs.length; i++) {
//             if (errs[i] < errs[best]) best = i;
//         }

//         console.log(`KNNkd: k = ${best + 2} => ${errs[best]}`);
//     }
// });
