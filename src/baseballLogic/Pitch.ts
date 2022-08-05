export type pitchJSON = {
    name: string,
    timesThrown: number,
    spinRate: number,
    spinDirection: number
};

export class Pitch {
    name: string;
    timesThrown: number;
    spinRate: number;
    spinDirection: number;

    /**
     * Container class for one pitch of one pitcher
     * @param _name the name of the pitch
     */
    constructor(_name: string) {
        this.name = _name;
        this.timesThrown = 0;
        this.spinRate = 0;
        this.spinDirection = 0;
    }

    /**
     * Converts an object as read from a JSON into a pitch
     * @param obj the object to convert
     * @returns an instance of the Pitch class
     */
    static fromObj(obj: pitchJSON): Pitch {
        let res = new Pitch(obj.name);
        res.timesThrown = obj.timesThrown;
        res.spinRate = obj.spinRate;
        res.spinDirection = obj.spinDirection;
        return res;
    }
}