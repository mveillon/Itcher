import { flatten, zeros } from "../utils/arrayOps.js";
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
    return pitchFeature(
        state, 
        pitchO.velo, 
        pitchO.spinRate, 
        pitchO.spinDirection,
        pitchO.heatmap
    );
}

/**
 * Takes specific information about the pitch being thrown and returns the feature
 * that an ML model can use
 * @param state the current game state
 * @param velo the velocity of the pitch
 * @param spinRate the spinrate of the pitch
 * @param direc the direction of the pitch's spin in degrees
 * @returns one list of features
 */
export const pitchFeature = (
    state: GameState, 
    velo: number, 
    spinRate: number, 
    direc: number,
    heatmap: number[][]
    ): number[] => {
    const radDirec = direc * Math.PI / 360;
    return [
        state.balls,
        state.strikes,
        +state.pitcherPlatoon(),
        velo,
        spinRate,
        Math.cos(radDirec),
        Math.sin(radDirec),
        ...flatten(heatmap) as number[]
    ];
}

/**
 * The number of attributes in each feature row that are NOT dependent
 * on the pitch being thrown
 * @returns the number of attributes dependent on the current game state
 */
export const stateAttrs = (): number => {
    return 3;
}

/**
 * Converts the pitch's x and y location to an n x n heatmap using one-hot encoding
 * @param x the horizontal location
 * @param y the vertical location. Called z in the dataset
 * @param numCells the width and height of the heatmap in cells e.g. `numCells = 3` means
 * a 3x3 heatmap with 9 total cells
 * @returns a one hot encoding of the heatmap
 */
export const oneHotHeatmap = (
    x: number, 
    y: number, 
    numCells: number
    ): number[][] => {
    y *= -1;
    let res: number[][] = zeros([numCells, numCells]) as number[][];
    const getInd = (loc: number): number => {
        return Math.min(Math.max(Math.floor((loc + 1) * numCells / 2), 0), numCells - 1);
    }

    res[getInd(y)][getInd(x)] = 1;
    return res;
}
