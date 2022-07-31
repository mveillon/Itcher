/**
 * All of the pitch types that this code recognizes
 */
export const allPitchTypes = [
    '4-seam',
    '2-seam',
    'cutter',
    'sinker',
    'curveball',
    'slider',
    'knuckle-curve',
    'changeup',
    'splitter',
    'eephus',
    'pitchout',
    'intentional ball',
    'knuckleball',
    'screwball',
    'unknown'
];

/**
 * Returns the dot product of x and y
 * @param x the first vector
 * @param y the second vector
 * @returns the dot product
 */
export const dot = (x: number[], y: number[]): number => {
    let res = 0;
    for (let i = 0; i < Math.min(x.length, y.length); i++) {
        res += x[i] * y[i];
    }
    return res;
}

