export class Pitcher {
    name: string;
    pitches: string[];
    hand: string;
    pitchInds: { [key: string]: number };
    timesThrown: number[];

    constructor(_name: string, _pitches: string[], _hand: string) {
        this.name = _name;
        this.pitches = _pitches;
        this.hand = _hand;
        this.pitchInds = {};
        this.timesThrown = [];
        for (let i = 0; i < _pitches.length; i++) {
            this.pitchInds[_pitches[i]] = i;
            this.timesThrown.push(0);
        }
    }

    /**
     * Takes an object (like something generated from JSON) and turns it into a Pitcher
     * @param obj the raw object
     * @returns an object of type Pitcher
     */
    static fromObj(obj: { 
        name: string, 
        pitches: string[], 
        timesThrown: number[], 
        hand: string 
    }): Pitcher {
        let res = new Pitcher(obj.name, obj.pitches, obj.hand);
        res.timesThrown = obj.timesThrown;
        return res;
    }

    /**
     * Makes a shallow copy of this
     * @returns a copy of this pitcher
     */
    copy(): Pitcher {
        let res = new Pitcher(this.name, this.pitches, this.hand);
        res.timesThrown = this.timesThrown;
        return res;
    }
}

/**
 * Reads pitchers.json and returns all pitchers in it
 * @returns all of the pitchers in the dataset
 */
const readAllPitchers = (): { [key: string]: Pitcher } => {
    return {
        'Justin Verlander': new Pitcher(
            'Justin Verlander', 
            ['4-seam', 'slider', 'curveball', 'changeup'],
            'r'
        )
    };
}

export const allPitchers = readAllPitchers();
