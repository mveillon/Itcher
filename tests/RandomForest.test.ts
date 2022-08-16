import { checkModel, defaultTimeout } from "./checkModel";
import { randomForest } from "../src/ml/models/RandomForest";

jest.setTimeout(defaultTimeout);
test('overall sensibility', async () => {
    checkModel(randomForest());
});