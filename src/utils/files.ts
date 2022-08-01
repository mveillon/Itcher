/* AVERT YOUR EYES - THIS IS THE HELL REQUIRED TO READ A FILE IN JS */
let readFile: (path: string, encoding?: string) => string;
let writeFile: (path: string, data: string) => void;
import { usingNode } from "./usingNode.js";

if (usingNode()) {
    // running via node - we need it to work both ways for testing
    let fs = eval('require("fs")');
    readFile = fs.readFileSync;
    writeFile = fs.writeFileSync;
} else {
    // running via the browser
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
        fetch(path, {
            method: 'POST',
            body: data
        });
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
 export const readJSON = (path: string): Object => {
    return JSON.parse(readFile(path, 'utf8'));
}

/**
 * Saves the object to the given path
 * @param obj the object to save as a json
 * @param path where to save the data to
 */
export const writeJSON = (obj: Object, path: string) => {
    writeFile(path, JSON.stringify(obj));
}

export const weightPath = "./src/ml/weights.json";
export const pitcherPath = "./src/baseballLogic/pitchers.json";

const dataRoot = "./src/ml/data/";
export const dataPaths: { [key: string]: string} = {
    atBats: dataRoot + "2019_atbats.csv",
    pitches: dataRoot + "2019_pitches.csv",
    playerNames: dataRoot + "player_names.csv"
}
