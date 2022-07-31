import { findAllPitchers, trainAllPitches, pitchAbbreviations } from "../src/ml/parseData";
import { allPitchTypes } from "../src/utils/utilities";

// kinda slow so you don't want it to always be on
const enableTraining = false; 

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
    if (enableTraining) {
        findAllPitchers();
        trainAllPitches();
    }
});