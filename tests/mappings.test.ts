import { GameState } from "../src/baseballLogic/GameState";
import { stateToInd, pitchToInd, numStates, numActions } from "../src/ml/mappings";

test('state to ind', () => {
    let used = new Set<number>();
    for (let b = 0; b < 4; b++) {
        for (let s = 0; s < 3; s++) {
            for (let p = 0; p < 2; p++) {
                let gs = new GameState();
                gs.balls = b;
                gs.strikes = s;
                gs.lineup = ['R'];
                gs.pitcher.hand = p ? 'R' : 'L';
                const i = stateToInd(gs);
                expect(used.has(i)).toBe(false);
                used.add(i);
                expect(i).toBeLessThan(numStates);
            }
        }
    }
});

test('pitch to ind', () => {
    let used = new Set<number>();
    for (const p in pitchToInd) {
        const i = pitchToInd[p];
        expect(used.has(i)).toBe(false);
        used.add(i);
        expect(i).toBeLessThan(numActions)
    }
});

