const trainTest = require("../../../dist/ml/trainTest");
const files = require("../../../dist/utils/files");

const ROOT = './src/ml/data/'

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

    files.writeFile(dirName + '/feats.ignore.csv', toStr(feats));    
    files.writeFile(dirName + '/targs.ignore.csv', targs.join('\n'));
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
    for (const d of dirs) {
        const [feats, targs] = trainTest.allFeatsTargs(
            files.readSpreadSheet(ROOT + d + '/raw.ignore.csv')
        );
        saveSheets(feats, targs, d);
    }
}

saveAll()
