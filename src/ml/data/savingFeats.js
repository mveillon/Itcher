const { allFeatsTargs } = require("../../../dist/ml/trainTest");
const { readSpreadSheet, writeFile } = require("../../../dist/utils/files");

const ROOT = './src/ml/data/';

/**
 * Saves the features and targets to the directory with the given name
 * @param {number[][]} feats the features matrix
 * @param {number[]} targs the targets array
 * @param {string} name the name of the directory to save the files to
 */
const saveSheets = (feats, targs, name) => {
    const dirName = ROOT + name;
    const toStr = (sheet) => {
        return sheet.map(row => row.join()).join('\n');
    }

    writeFile(dirName + '/feats.ignore.csv', toStr(feats));    
    writeFile(dirName + '/targs.ignore.csv', targs.join('\n'));
}

/**
 * Saves the training, validation, and testing datasets
 */
const saveAll = () => {
    const dirs = [
        'train',
        'valid',
        'test'
    ];
    for (let d = 0; d < dirs.length; d++) {
        process.stdout.write(
            `Progress: [${'.'.repeat(d)}${' '.repeat(dirs.length - d)}]\r`
        );
        const [feats, targs] = allFeatsTargs(
            readSpreadSheet(ROOT + dirs[d] + '/raw.ignore.csv')
        );
        saveSheets(feats, targs, dirs[d]);
    }
    console.log(`Progress: [${'.'.repeat(dirs.length)}]\nDone!\n`);
}

saveAll();
