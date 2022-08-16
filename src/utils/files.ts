/* AVERT YOUR EYES - THIS IS THE HELL REQUIRED TO READ A FILE IN JS */
export let readFile: (path: string, encoding?: string) => string;
export let writeFile: (path: string, data: string) => void;
import { usingNode } from "./usingNode.js";

if (usingNode()) {
    let fs = eval('require("fs")');
    readFile = fs.readFileSync;
    writeFile = fs.writeFileSync;
} else {
    readFile = (path: string, encoding?: string): string => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", path, false);
        xhr.send(null);
        if (xhr.status === 0 || xhr.status === 200) {
            return xhr.responseText;
        } else {
            throw new Error(`
                xhr failed with status ${xhr.status}
            `)
        }
    }

    writeFile = (path: string, data: string) => {
        throw new Error('Cannot write to file when running via browser.');
    }
}

/* Ok you can look now */

export type sheetRow = { [key: string]: string };
export type sheet = sheetRow[];

/**
 * Reads one spreadsheet and returns it as an array
 * Assumed to have one row of headers
 * @param path the path to the spreadsheet
 * @returns a 2D string array
 */
 export const readSpreadSheet = (path: string, delimiter: string = ','): sheet => {
    let data = readFile(path, 'utf8');
    const firstNewLine = data.indexOf('\n');
    const headers = data.slice(0, firstNewLine).split(delimiter);
    const rows = data.slice(firstNewLine + 1).split('\n');

    return rows.map((row: string): sheetRow => {
        const vals = row.split(delimiter);
        let obj: sheetRow = {};
        for (let i = 0; i < headers.length; i++) {
            obj[headers[i]] = vals[i];
        }
        return obj;
    });
}

/**
 * Reads the JSON at the given path and returns the object
 * @param path where the file is
 * @returns an object with the same data
 */
 export const readJSON = (path: string): { [key: string]: any } => {
    return JSON.parse(readFile(path, 'utf8'));
}

/**
 * Saves the object to the given path
 * @param obj the object to save as a json
 * @param path where to save the data to
 */
export const writeJSON = (path: string, obj: { [key: string]: any }) => {
    writeFile(path, JSON.stringify(obj));
}

/**
 * The path where the pitchers JSON is located
 * @returns the path to the pitchers JSON from the root dir
 */
export const pitcherPath = (): string => {
    return "./src/baseballLogic/pitchers.json";
}

/**
 * Returns the paths to all the spreadsheets
 * @returns an object with all the paths to all the sheets
 */
export const dataPaths = (): {
    atBats: string,
    pitches: string,
    playerNames: string,
    train: string,
    valid: string,
    test: string
} => {
    const dataRoot = "./src/ml/data/";
    return {
        atBats: dataRoot + "atbats.ignore.csv",
        pitches: dataRoot + "pitches.ignore.csv",
        playerNames: dataRoot + "player_names.ignore.csv",
        train: dataRoot + "train.ignore.csv",
        valid: dataRoot + "valid.ignore.csv",
        test: dataRoot + "test.ignore.csv",
    };
}
