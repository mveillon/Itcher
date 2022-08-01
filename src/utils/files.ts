let readFile: (path: string, encoding?: string) => string;
let writeFile: (path: string, data: string) => void;

if (typeof process !== 'undefined' &&
    process.release.name.search(/node|io.js/) !== -1) {
    // running via node
    let fs = eval('require("fs")');
    readFile = fs.readFileSync;
    writeFile = fs.writeFileSync;
} else {
    readFile = (path: string, encoding?: string): string => {
        let res = '';
        (async () => {
            await fetch(path)
                .then((response) => response.text())
                .then((data) => {
                    res = data;
                })
                .catch(error => {
                    throw new Error(error);
                });
        })();
        return res;
    }

    writeFile = (path: string, data: string) => {
        (async() => {
            await fetch(path, {
                method: 'POST',
                body: data
            })
        })();
    }
}

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
    // (async () => {
    //     await fetch(path, {
    //         method: 'POST',
    //         body: JSON.stringify(obj)
    //     })
    // })();
}

export const weightPath = "./src/ml/weights.json";
export const pitcherPath = "./src/baseballLogic/pitchers.json";

const dataRoot = "./src/ml/data/";
export const dataPaths: { [key: string]: string} = {
    atBats: dataRoot + "2019_atbats.csv",
    pitches: dataRoot + "2019_pitches.csv",
    playerNames: dataRoot + "player_names.csv"
}
