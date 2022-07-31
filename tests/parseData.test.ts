import { findAllPitchers, trainAllSheets, pitchAbbreviations } from "../src/ml/parseData";
import { allPitchTypes } from "../src/utils/utilities";

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
    findAllPitchers();
    trainAllSheets();
});