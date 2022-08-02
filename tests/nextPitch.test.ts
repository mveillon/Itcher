import { nextPitch } from "../src/ml/nextPitch";
import { state, resetState } from "../src/baseballLogic/GameState";
import { readAllPitchers } from "../src/baseballLogic/Pitcher";
import { getLearner } from "../src/ml/models/getLearner";

test('next pitch', () => {
    const learner = getLearner();
    resetState(false);
    state.lineup = ['R'];
    const pitcher = readAllPitchers()['Justin Verlander'];
    state.pitcher = pitcher;
    for (let b = 0; b < 4; b++) {
        for (let s = 0; s < 3; s++) {
            for (let p = 0; p < 2; p++) {
                state.balls = b;
                state.strikes = s;
                state.lineup[0] = p ? 'R' : 'L';
                const pitch = nextPitch(learner);
                const contained = pitch in pitcher.pitches;
                if (!contained) {
                    console.log(
                        `${pitch} not found in ${JSON.stringify(pitcher.pitches)}`
                    );
                }
                expect(contained).toBe(true);
            }
        }
    }
});
