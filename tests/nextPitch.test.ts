import { nextPitch } from "../src/ml/nextPitch";
import { state, resetState } from "../src/baseballLogic/GameState";
import { allPitchers } from "../src/baseballLogic/Pitcher";

test('next pitch', () => {
    resetState();
    state.lineup = ['R'];
    const pitcher = allPitchers['Justin Verlander'];
    state.pitcher = pitcher;
    for (let b = 0; b < 4; b++) {
        for (let s = 0; s < 3; s++) {
            for (let p = 0; p < 2; p++) {
                state.balls = b;
                state.strikes = s;
                state.lineup[0] = p ? 'R' : 'L';
                expect(nextPitch() in pitcher.pitches).toBe(true);
            }
        }
    }
});
