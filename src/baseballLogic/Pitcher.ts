import { pitcherPath, readJSON } from "../utils/files";

export type pitcherJSON = {
    name: string,
    pitches: { [key: string]: number },
    hand: string
};

export class Pitcher {
    name: string;
    pitches: { [key: string]: number }
    hand: string;

    constructor(_name: string, _hand: string) {
        this.name = _name;
        this.pitches = {};
        this.hand = _hand;
    }

    /**
     * Takes an object (like something generated from JSON) and turns it into a Pitcher
     * @param obj the raw object
     * @returns an object of type Pitcher
     */
    static fromObj(obj: pitcherJSON): Pitcher {
        let res = new Pitcher(obj.name, obj.hand);
        let total = 0;
        for (const pitch in obj.pitches) {
            total += obj.pitches[pitch];
        }

        for (const pitch in obj.pitches) {
            if (obj.pitches[pitch] / total > 0.05) {
                res.pitches[pitch] = obj.pitches[pitch];
            }
        }
        return res;
    }

    /**
     * Makes a shallow copy of this
     * @returns a copy of this pitcher
     */
    copy(): Pitcher {
        let res = new Pitcher(this.name, this.hand);
        res.pitches = this.pitches;
        return res;
    }
}

/**
 * Reads pitchers.json and returns all pitchers in it
 * @returns all of the pitchers in the dataset
 */
const readAllPitchers = (): { [key: string]: Pitcher; } => {
    const objs = readJSON(pitcherPath) as { [key: string]: pitcherJSON };
    let res: { [key: string]: Pitcher } = {};
    for (const k in objs) {
        res[k] = Pitcher.fromObj(objs[k]);
    }
    return res;
}

export const allPitchers = readAllPitchers();
