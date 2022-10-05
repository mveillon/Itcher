/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */

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
 * Use for sorting by last name. Returns a negative number if p1 is alphabetically 
 * less than p2, a positive number if p1 is alphabetically greater than p2, and returns
 * zero if they are the same. Can be used in `Array.sort`
 * @param p1 the name of the first player
 * @param p2 the name of the second player
 * @returns a number that `Array.sort` can interpret to sort the names
 */
export const nameLT = (p1: string, p2: string): number => {
    const p1Names = p1.toLowerCase().split(' ');
    const p2Names = p2.toLowerCase().split(' ');
    if (p1Names[p1Names.length - 1] < p2Names[p2Names.length - 1]) return -1;
    if (p1Names[p1Names.length - 1] > p2Names[p2Names.length - 1]) return 1;
    for (let i = 0; i < Math.min(p1Names.length, p2Names.length) - 1; i++) {
        if (p1Names[i] < p2Names[i]) return -1;
        if (p1Names[i] > p2Names[i]) return 1;
    }
    return p1Names.length - p2Names.length;
}
