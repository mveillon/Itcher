import { nextPitch } from "../src/ml/nextPitch";
import { pitchToInd } from "../src/ml/mappings";
import { state, resetState } from "../src/baseballLogic/GameState";

test('next pitch', () => {
    resetState();
    state.lineup = ['r'];
    for (let b = 0; b < 4; b++) {
        for (let s = 0; s < 3; s++) {
            for (let p = 0; p < 2; p++) {
                state.balls = b;
                state.strikes = s;
                state.pitcher.hand = p ? 'r' : 'l';
                expect(nextPitch() in pitchToInd);
            }
        }
    }
});
