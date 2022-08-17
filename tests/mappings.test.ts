import { GameState } from "../src/baseballLogic/GameState";
import { 
    numAttributes, 
    getFeature 
} from "../src/ml/mappings";
import { randInt } from "../src/utils/random";
import { readAllPitchers } from "../src/baseballLogic/Pitcher";

test('getFeature', () => {
    const pitcher = readAllPitchers()['Felix Hernandez'];
    let feats: number[][] = [];
    for (let i = 0; i < 50; i++) {
        let state = new GameState();
        state.balls = randInt(4);
        state.strikes = randInt(3);
        state.outs = randInt(2);
        state.lineup = ['L', 'R'];
        state.pitcher = pitcher;
        state.lineSpot = randInt(state.lineup.length);

        for (const pitch in state.pitcher.pitches) {
            const feat = getFeature(pitch, state);
            expect(feat.length).toBe(numAttributes());
            feats.push(feat);
        }
    }

    let foundDiff: boolean[] = [];
    let foundVals: Set<number>[] = [];
    for (let j = 0; j < feats[0].length; j++) {
        foundDiff.push(false);
        foundVals.push(new Set<number>());
    }
    for (let i = 0; i < feats.length; i++) {
        for (let j = 0; j < feats[i].length; j++) {
            foundDiff[j] ||= foundVals[j].has(feats[i][j]);
            foundVals[j].add(feats[i][j]);
        }
    }
    expect(foundDiff).toEqual(Array(foundDiff.length).fill(true));
});
