import { checkModel, defaultTimeout } from "./checkModel";
import { regression } from "../src/ml/models/Regression";
import { UpdatingPriors } from "../src/ml/models/UpdatingPriors";

jest.setTimeout(defaultTimeout);
test('overall sensibility', async () => {
    await checkModel(new UpdatingPriors(regression));
})