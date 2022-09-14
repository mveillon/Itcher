import { GameState } from "../src/baseballLogic/GameState";
import { 
    numAttributes, 
    getFeature,
    oneHotHeatmap
} from "../src/ml/mappings";
import { randInt } from "../src/utils/random";
import { readAllPitchers } from "../src/baseballLogic/Pitcher";
import { copyArr, zeros } from "../src/utils/numJS";

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

test('heatmap', () => {
    const base: number[][] = zeros([5, 5]) as number[][];
    let copy: number[][] = [];
    const c = () => {
        copy = copyArr(base) as number[][];
    }
    c();
    copy[0][0] = 1;
    expect(oneHotHeatmap(-2, 2, 5)).toEqual(copy);
    c();
    copy[4][4] = 1;
    expect(oneHotHeatmap(2, -2, 5)).toEqual(copy);

    const locs = [-0.9, 0, 0.9];
    for (let i = 0; i < locs.length; i++) {
        c();
        copy[i + 1][i + 1] = 1;
        expect(oneHotHeatmap(locs[i], -locs[i], locs.length + 2)).toEqual(copy);
    }
});
