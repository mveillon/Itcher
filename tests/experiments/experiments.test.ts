import { NeuralNetFriend } from "../friends";
import { numAttributes } from "../../src/ml/mappings";
import { trainFeatsTargs } from "../../src/ml/trainTest";
import { writeFile } from "../../src/utils/files";
import { defaultTimeout } from "../checkModel";
import { average } from "../../src/ml/calculations";
import { colAverage } from "../../src/utils/arrayOps";
jest.setTimeout(defaultTimeout);

const gettingWeights = false;
test('weights', async () => {    
    if (!gettingWeights) return;
    const root = './tests/experiments/';

    const net = new NeuralNetFriend(numAttributes(), 1024, 1);
    const [trainFeats, trainTargs] = trainFeatsTargs();
    const avgs = colAverage(trainFeats);
    writeFile(root + 'averages.txt', avgs.join(','));
    await net.fit(trainFeats, trainTargs);
    const ws = (
        net
        .net
        .layers[0]
        .getWeights()
    );
    const asArray: number[][] = ws[0].arraySync() as number[][];
    const toWrite = asArray.map(average);
    writeFile(root + "weights.txt", toWrite.join(','));
});