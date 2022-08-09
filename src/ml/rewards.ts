import { state } from "../baseballLogic/GameState.js";

/**
 * Finds the reward given the current reward and what happened
 * Values courtesy of https://www.draysbay.com/platform/amp/2016/4/28/11521790/an-introduction-to-per-pitch-run-values
 * @param res what happened
 * @returns the run value of that pitch
 */
export const rewards = (res: string): number => {
    let count: number[][];
    switch (res) {
        case 'k':
            count = [
                [0.037, 0.051, 0.15],
                [0.035, 0.054, 0.171],
                [0.062, 0.069, 0.209],
                [0.117, 0.066, 0.294]
            ];
            break;
        case 'b':
            count = [
                [-0.032, -0.024, -0.021],
                [-0.088, -0.048, -0.038],
                [-0.143, -0.064, -0.085],
                [-0.051, -0.168, -0.234]   
            ];
            break;
        case 'kk':
            // included for legacy reasons basically
            return rewards('k');
            break;
        case 'bb':
            return rewards('b');
            break;
        case '1b':
            count = [
                [-0.466, -0.483, -0.534],
                [-0.412, -0.459, -0.513],
                [-0.35,  -0.414, -0.475],
                [-0.207, -0.324, -0.39]
            ];
            break;
        case '2b':
            count = [
                [-0.746, -0.783, -0.834],
                [-0.712, -0.759, -0.813],
                [-0.65,  -0.714, -0.775],
                [-0.507, -0.623, -0.689]
            ];
            break;
        case '3b':
            count = [
                [-1.016, -1.053, -1.104],
                [-0.982, -1.029, -1.083],
                [-0.919, -0.984, -1.044],
                [-0.777, -0.893, -0.959]
            ];
            break;
        case 'hr':
            count = [
                [-1.4,   -1.436, -1.487],
                [-1.365, -1.413, -1.466],
                [-1.303, -1.367, -1.428],
                [-1.16,  -1.277, -1.343]
            ];
            break;
        case 'dp':
            return rewards('o') * 2;
            break;
        case 'o':
            count = [
                [0.31,  0.262, 0.196],
                [0.355, 0.293, 0.223],
                [0.436, 0.352, 0.273],
                [0.622, 0.47,  0.384]
            ];
            break;
        case 'f':
            if (state.strikes === 2) return 0;
            else return rewards('k');
            break;
        default:
            throw new Error(`Unexpected result: ${res}`);
            break;
    }

    return count[state.balls][state.strikes];
}