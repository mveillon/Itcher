import { extractFeaturesTargets } from "../trainTest.js";
import { readSpreadSheet, writeFile, readFile } from "../../utils/files.js";
import { readAllPitchers } from "../../baseballLogic/Pitcher.js";

const appendRewards = (inPath: string, outPath: string) => {
    const raw = readFile(inPath, 'utf-8');
    const sheet = readSpreadSheet(inPath);
    const pitchers = readAllPitchers();
    let rawRows = raw.split('\n');
    rawRows[0] += ',reward';

    for (let i = 1; i < rawRows.length; i++) {
        const [feat, targ] = extractFeaturesTargets(sheet[i - 1], pitchers);
        const realTarg: string = feat.length > 0 ? targ.toString() : '';
        rawRows[i] += ',' + realTarg;
    }

    const arrStr = rawRows.join('\n');
    writeFile(outPath, arrStr);
}

const rootPath = "./src/ml/data/";

appendRewards(
    rootPath + "pitches_reduced.ignore.csv", 
    rootPath + "with_rewards.ignore.csv"
);
