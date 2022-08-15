import { nextPitch } from "../src/ml/nextPitch";
import { getState, resetState, setState } from "../src/baseballLogic/GameState";
import { readAllPitchers } from "../src/baseballLogic/Pitcher";
import { getLearner } from "../src/ml/models/getLearner";
import { defaultTimeout } from "./checkModel";
jest.setTimeout(defaultTimeout);

test('next pitch', async () => {
    const learner = await getLearner();
    resetState(false);
    const state = getState();
    state.lineup = ['R'];
    const pitcher = readAllPitchers()['Felix Hernandez'];
    state.pitcher = pitcher;
    for (let b = 0; b < 4; b++) {
        for (let s = 0; s < 3; s++) {
            for (let p = 0; p < 2; p++) {
                state.balls = b;
                state.strikes = s;
                state.lineup[0] = p ? 'R' : 'L';
                setState(state);
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
