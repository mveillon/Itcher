import { zeros } from "../utils/numJS.js";

export type pitchJSON = {
    name: string,
    timesThrown: number,
    velo: number,
    spinRate: number,
    spinDirection: number,
    heatmap: number[][]
};

export class Pitch {
    name: string;
    timesThrown: number;
    velo: number;
    spinRate: number;
    spinDirection: number;
    heatmap: number[][];

    /**
     * Container class for one pitch of one pitcher
     * @param _name the name of the pitch
     */
    constructor(_name: string) {
        this.name = _name;
        this.timesThrown = 0;
        this.velo = 0;
        this.spinRate = 0;
        this.spinDirection = 0;
        this.heatmap = zeros([heatmapSize(), heatmapSize()]) as number[][];
    }

    /**
     * Converts an object as read from a JSON into a pitch
     * @param obj the object to convert
     * @returns an instance of the Pitch class
     */
    static fromObj(obj: pitchJSON): Pitch {
        let res = new Pitch(obj.name);
        res.timesThrown = obj.timesThrown;
        res.velo = obj.velo;
        res.spinRate = obj.spinRate;
        res.spinDirection = obj.spinDirection;
        res.heatmap = obj.heatmap;
        return res;
    }

    /**
     * Converts this pitch into a JSON that fromObj can read
     * @returns a JSON
     */
    toObj(): pitchJSON {
        return {
            name: this.name,
            timesThrown: this.timesThrown,
            velo: this.velo,
            spinRate: this.spinRate,
            spinDirection: this.spinDirection,
            heatmap: this.heatmap,
        };
    }
}

/**
 * The height and width of the heatmap of each pitch in cells
 * @returns how many cells by how many cells each heatmap is
 */
 export const heatmapSize = (): number => {
    return 5;
}
