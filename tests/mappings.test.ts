import { GameState } from "../src/baseballLogic/GameState";
import { 
    stateToInd, 
    pitchToInd, 
    numStates, 
    numActions, 
    numAttributes, 
    getFeature 
} from "../src/ml/mappings";
import { randInt } from "../src/utils/random";
import { readAllPitchers } from "../src/baseballLogic/Pitcher";

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
                expect(i).toBeLessThan(numStates());
            }
        }
    }
});

test('pitch to ind', () => {
    let used = new Set<number>();
    const inds = pitchToInd();
    for (const p in inds) {
        const i = inds[p];
        expect(used.has(i)).toBe(false);
        used.add(i);
        expect(i).toBeLessThan(numActions())
    }
});

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
