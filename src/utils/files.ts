import * as fs from "fs";

export type sheetRow = { [key: string]: string };
export type sheet = sheetRow[];

/**
 * Reads the JSON at the given path and returns the object
 * @param path where the file is
 * @returns an object with the same data
 */
 export const readJSON = (path: string): Object => {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
}

/**
 * Saves the object to the given path
 * @param obj the object to save as a json
 * @param path where to save the data to
 */
export const writeJSON = (obj: Object, path: string) => {
    fs.writeFileSync(path, JSON.stringify(obj));
}

/**
 * Reads one spreadsheet and returns it as an array
 * Assumed to have one row of headers
 * @param path the path to the spreadsheet
 * @returns a 2D string array
 */
 export const readSpreadSheet = (path: string, delimiter: string = ','): sheet => {
    const data = fs.readFileSync(path, 'utf8');
    const firstNewLine = data.indexOf('\n');
    const headers = data.slice(0, firstNewLine).split(delimiter);
    const rows = data.slice(firstNewLine + 1).split('\n');

    return rows.map((row) => {
        const vals = row.split(delimiter);
        let obj: sheetRow = {};
        for (let i = 0; i < headers.length; i++) {
            obj[headers[i]] = vals[i];
        }
        return obj;
    });
}

export const weightPath = "./src/ml/weights.json";
export const pitcherPath = "./src/baseballLogic/pitchers.json";

const dataRoot = "./src/ml/data/";
export const dataPaths: { [key: string]: string} = {
    atBats: dataRoot + "2019_atbats.csv",
    pitches: dataRoot + "2019_pitches.csv",
    playerNames: dataRoot + "player_names.csv"
}
