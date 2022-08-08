import { checkModel, defaultTimeout } from "./checkModel";
import { InteractionRegression } from "../src/ml/models/InteractionRegression";

jest.setTimeout(defaultTimeout);
test('overall sensibility', async () => {
    await checkModel(new InteractionRegression(3, 0.005));
})