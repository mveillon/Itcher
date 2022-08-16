import { usingNode } from "./usingNode.js";

/**
 * All of the pitch types that this code recognizes
 */
export const allPitchTypes = (): string[] => {
    return [
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
}

export let $: (id: string) => HTMLElement;
if (usingNode()) {
    $ = (id: string): HTMLElement => {
        throw new Error('Cannot use $ when running via node!');
    }
} else {
    $ = (id: string): HTMLElement => {
        return document.getElementById(id);
    }
}

/**
 * Returns a sorted array with every int in the range [0, n)
 * @param n 1 + the max number in the array
 * @returns an array with every int up to n
 */
export const upTo = (n: number): number[] => {
    return [...Array(n).keys()];
}
