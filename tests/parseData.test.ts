import { learner } from "../src/ml/KNN";
import { pitchAbbreviations, learnerMSE } from "../src/ml/parseData";
import { allPitchTypes } from "../src/utils/utilities";

const training = true;

test('pitch types', () => {
    for (const p of allPitchTypes) {
        let found = false;
        for (const abb in pitchAbbreviations) {
            if (p === pitchAbbreviations[abb]) {
                found = true;
                break;
            }
        }
        expect(found).toBe(true);
    }

    for (const abb in pitchAbbreviations) {
        expect(allPitchTypes.includes(pitchAbbreviations[abb]));
    }
});

test('read data', () => {
    if (training) {
        console.log(learnerMSE(learner));
    }
});