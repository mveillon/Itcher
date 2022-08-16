import { pitchAbbreviations } from "../src/ml/parseData";
import { allPitchTypes } from "../src/utils/utilities";

test('pitch types', () => {
    const pitchTypes = allPitchTypes();
    const abbrs = pitchAbbreviations();
    for (const p of pitchTypes) {
        let found = false;
        for (const abb in abbrs) {
            if (p === abbrs[abb]) {
                found = true;
                break;
            }
        }
        expect(found).toBe(true);
    }

    for (const abb in abbrs) {
        expect(pitchTypes.includes(abbrs[abb]));
    }
});
