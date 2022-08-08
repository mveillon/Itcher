import { pitchAbbreviations } from "../src/ml/parseData";
import { allPitchTypes } from "../src/utils/utilities";

test('pitch types', () => {
    const pitchTypes = allPitchTypes();
    for (const p of pitchTypes) {
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
        expect(pitchTypes.includes(pitchAbbreviations[abb]));
    }
});
