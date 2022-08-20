import { GameState } from "../baseballLogic/GameState.js";
import { Pitch } from "../baseballLogic/Pitch.js";

/**
 * The total number of attributes in each feature
 * @returns the width of the features array
 */
export const numAttributes = (): number => {
    let state = new GameState();
    state.pitcher.hand = 'R';
    state.lineup = ['R'];
    state.pitcher.pitches = { '4-seam': new Pitch('4-seam') };
    return getFeature('4-seam', state).length;
}

/**
 * Returns a feature array for the given state
 * @param pitch what pitch is being thrown
 * @param state the current game state
 * @returns the corresponding feature array
 */
export const getFeature = (pitch: string, state: GameState): number[] => {
    let pitchO = state.pitcher.pitches[pitch];
    const radDirec = pitchO.spinDirection * Math.PI / 360;
    const res = [
        state.balls,
        state.strikes,
        +state.pitcherPlatoon(),
        pitchO.velo,
        pitchO.spinRate,
        Math.cos(radDirec),
        Math.sin(radDirec),
    ];
    return res;
}

/**
 * The number of attributes in each feature row that are NOT dependent
 * on the pitch being thrown
 * @returns the number of attributes dependent on the current game state
 */
export const stateAttrs = (): number => {
    return 3;
}
