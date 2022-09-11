import { neuralNet, NeuralNet } from "../src/ml/models/NeuralNet";
import { 
    checkModel, 
    defaultTimeout,
    trainFeats,
    trainTargs,
    validFeats,
    validTargs
} from "./checkModel";
import { mse } from "../src/utils/numJS";
import { numAttributes } from "../src/ml/mappings";
jest.setTimeout(defaultTimeout);

test('overall sensibility', async () => {
    await checkModel(neuralNet());
});

test('different layer sizes', async () => {
    const bad = new NeuralNet(numAttributes(), 1);
    await bad.fit(trainFeats, trainTargs);
    const preds = bad.predict(validFeats);
    expect(validTargs.length).toBe(preds.length);
    expect(() => new NeuralNet(numAttributes())).toThrowError();
});

const searching = false;
test('best hypers', async () => {
    //layer sizes of 64,16,16 => 0.047741495995480485
    if (searching) {
        let best = Infinity;
        let bestLayers: number[] = [];
        for (let numHidden = 1; numHidden < 4; numHidden++) {
            let layers = getLayerSizes(numHidden);
            for (const sizes of layers) {
                let net = new NeuralNet(...([numAttributes()].concat(sizes, [1])));
                await net.fit(trainFeats, trainTargs);
                const preds = net.predict(validFeats);
                const err = mse(preds, validTargs);                    
                console.log(`${sizes} => ${err}`);
                if (err < best) {
                    best = err;
                    bestLayers = sizes;
                }
            }
        }

        console.log(`Neural net: layer sizes of ${bestLayers} => ${best}`);
    }
});

/**
 * Recursively finds all possible configurations of layer sizes of length === len
 * @param len the size of all configurations
 * @returns all possible sets of layer sizes
 */
const getLayerSizes = (len: number): number[][] => {
    if (len === 0) {
        return [[]];
    } else {
        const possibleSizes = [16, 32, 64, 128];
        let res: number[][] = [];
        const smaller = getLayerSizes(len - 1);
        for (const s of possibleSizes) {
            for (const small of smaller) {
                res.push([s].concat(small));
            }
        }

        return res;
    }
}
