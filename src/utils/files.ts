import * as fs from "fs";

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

export const weightPath = "./src/ml/weights.json";
export const pitcherPath = "./src/baseballLogic/pitchers.json";

