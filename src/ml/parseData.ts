import { learner } from "./ReinforcementLearning";

/**
 * Reads one spreadsheet and returns it as an array
 * @param path the path to the spreadsheet
 * @returns a 2D string array
 */
const readSpreadSheet = (path: string): string[][] => {
    return [['']];
}

/**
 * Parses one play (row) and updates the weights accordingly
 * @param play the play to review
 */
const parsePlay = (play: string) => {

}

/**
 * Trains the model based on all data in '2010-2019 data'
 */
export const trainAllSheets = () => {

}

/**
 * Goes through the data and records all pitchers in it
 */
export const findAllPitchers = () => {

}

export const pitchAbbreviations: { [key: string]: string } = {
    CH: 'changeup',
    CU: 'curveball',
    EP: 'eephus',
    FC: 'cutter',
    FF: '4-seam',
    FO: 'pitchout',
    PO: 'pitchout',
    FS: 'splitter',
    FT: '2-seam',
    IN: 'intentional ball',
    KC: 'knuckle-curve',
    KN: 'knuckleball',
    SC: 'screwball',
    SI: 'sinker',
    SL: 'slider',
    UN: 'unknown'
};
