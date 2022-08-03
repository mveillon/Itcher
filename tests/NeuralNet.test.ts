import { NeuralNet } from "../src/ml/models/NeuralNet";
import { checkModel, defaultTimeout } from "./checkModel";
jest.setTimeout(defaultTimeout);

test('overall sensibility', async () => {
    await checkModel(new NeuralNet(20, 32, 128, 1));
})