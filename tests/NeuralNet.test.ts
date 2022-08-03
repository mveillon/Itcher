import { NeuralNet } from "../src/ml/models/NeuralNet";
import { checkModel } from "./checkModel";

test('overall sensibility', () => {
    checkModel(new NeuralNet(20, 32, 128, 1));
})