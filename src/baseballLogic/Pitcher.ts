import { pitcherPath, readJSON } from "../utils/files.js";
import { Pitch, pitchJSON } from "./Pitch.js";
import { usingNode } from "../utils/usingNode.js";

export type pitcherJSON = {
    name: string,
    pitches: { [key: string]: pitchJSON },
    hand: string
};

export class Pitcher {
    name: string;
    pitches: { [key: string]: Pitch }
    hand: string;

    /**
     * Represents a baseball pitcher
     * @param _name the name of the pitcher
     * @param _hand the handedness of the pitcher; either 'R', 'L', or 'S'
     */
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

        for (const pitch in obj.pitches) {
            res.pitches[pitch] = Pitch.fromObj(obj.pitches[pitch]);
        }
        return res;
    }

    /**
     * Converts this pitcher into JSON that fromObj can read
     * @returns a JSON
     */
    toObj(): pitcherJSON {
        return {
            name: this.name,
            pitches: this.pitches,
            hand: this.hand
        };
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

import { findAllPitchers } from "../ml/parseData.js";
/**
 * Reads pitchers.json and returns all pitchers in it
 * @returns all of the pitchers in the dataset
 */
export const readAllPitchers = (): { [key: string]: Pitcher; } => {
    findAllPitchers();
    let objs: { [key: string]: any };
    if (usingNode()) {
        objs = readJSON(pitcherPath);
    } else {
        objs = JSON.parse(localStorage.getItem('pitchers.json'));
    }
    let res: { [key: string]: Pitcher } = {};
    for (const k in objs) {
        res[k] = Pitcher.fromObj(objs[k]);
    }
    return res;
}
