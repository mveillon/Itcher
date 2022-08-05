import { readAllPitchers } from "../src/baseballLogic/Pitcher";

test('reading pitchers', () => {
    const pitchers = readAllPitchers();

    const allowed = ['L', 'R', 'S'];
    for (const p in pitchers) {
        expect(p).toBe(pitchers[p].name);
        expect(allowed.includes(pitchers[p].hand)).toBe(true);
        let total = 0;
        for (const pitch in pitchers[p].pitches) {
            const prob = pitchers[p].pitches[pitch].timesThrown;
            total += prob;
            expect(prob).toBeLessThanOrEqual(1.1);
        }
        expect(total).toBeLessThanOrEqual(1.1);  
    }
});
