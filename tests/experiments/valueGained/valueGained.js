const { nextPitch, getWs } = require("../../../dist/ml/nextPitch");
const { getLearner } = require("../../../dist/ml/models/getLearner");
const { getState, setState } = require("../../../dist/baseballLogic/GameState");
const { extractFeaturesTargets, completeFeatsTargs } = require("../../../dist/ml/trainTest");
const { dataPaths, readSpreadSheet, writeFile } = require("../../../dist/utils/files");
const { readAllPitchers } = require("../../../dist/baseballLogic/Pitcher");
const { aidToPitcher } = require("../../../dist/ml/parseData");
const { getFeature } = require("../../../dist/ml/mappings");
const { colAverage, argMin, ndMap, subArrays, sumList } = require("../../../dist/utils/numJS");
const { Pitcher } = require("../../../dist/baseballLogic/Pitcher");

/**
 * Updates the global game state based on the feature row
 * @param {number[]} feat the feature row as produced from pitchFeature
 * @param {Pitcher} pitcher the current pitcher
 */
const updateState = (feat, pitcher) => {
    let s = getState();
    s.balls = feat[0];
    s.strikes = feat[1];
    s.lineup[0] = feat[2] ? pitcher.hand : 'Z';
    s.bases = feat.slice(3, 6);
    s.outs = feat[6];
    s.pitcher = pitcher;
    setState(s);
}

let learner;
let pitchers;

let avgGood = 0;
let avgBad = 0;

/**
 * Figures out what the average wOBA for a good event is
 * and that of a bad event and saves them to avgGood and avgBad
 */
const setAvgs = () => {
    const [feats, targs] = completeFeatsTargs();
    let nums = [0, 0];
    let denoms = [0, 0];
    for (const t of targs) {
        const ind = +(t > 0);
        nums[ind] += t;
        denoms[ind]++;
    }
    avgBad = nums[0] / denoms[0];
    avgGood = nums[1] / denoms[1];
}

/**
 * Returns the wOBA added of the actual pitch, the pitch selected
 * by nextPitch, and the theoretically optimal pitch to throw
 * @param {{[key: string]: string}} row one row from the spreadsheet
 * @returns {[number, number, number]} the wOBA added
 */
const getValue = (row) => {
    const currentPitcher = aidToPitcher(parseInt(row['ab_id']), pitchers);
    const [feat, actual] = extractFeaturesTargets(row, pitchers);
    if (feat.length === 0) {
        return [];
    }
    updateState(feat, currentPitcher);
    const pitches = Object.keys(currentPitcher.pitches);
    let allFeats = [];
    const state = getState();
    for (const p of pitches) {
        allFeats.push(getFeature(p, state));
    }
    const preds = learner.predict(allFeats);
    const ws = getWs(learner, pitches);
    const pitchInd = pitches.indexOf(nextPitch(learner));

    const selected = preds[pitchInd];
    const optimal = Math.max(...preds);
    const weight = pitchInd === 0 ? ws[0] : ws[pitchInd] - ws[pitchInd - 1];
    const prob = weight / ws[ws.length - 1];
    const avg = sumList(preds) / preds.length;

    const diffs = subArrays(feat[3], pitches.map(p => currentPitcher.pitches[p].velo));
    const actInd = argMin(ndMap(diffs, Math.abs));
    const actProb = preds[actInd];

    return [
        +(actual > 0), 
        selected, 
        optimal, 
        prob, 
        preds.length,
        avg,
        actProb
    ];
}

/**
 * Goes through every pitch and finds the difference in wOBA between them
 */
const allValues = async () => {
    console.log('Finding pitchers...');
    pitchers = readAllPitchers();
    console.log('Pitchers found!\n\nTraining learner...');
    
    learner = await getLearner();
    console.log('Learner trained!\n\nSetting averages...');

    setAvgs();
    console.log('Averages set!\n\nReading spreadsheet...');

    const dPaths = dataPaths();
    const fName = '/raw.ignore.csv';
    const paths = [
        dPaths.train + fName,
        dPaths.valid + fName,
        dPaths.test + fName
    ];

    const sheet = readSpreadSheet(paths[0]);
    console.log('Spreadsheet read!\n\nProcessing spreadsheet...');

    let res = [];
    const totalDots = 20;
    const perDisp = Math.floor(sheet.length / totalDots);
    let dots = 0;
    for (let i = 0; i < sheet.length; i++) {
        if (i % perDisp === 0) {
            const spaces = totalDots - dots;
            process.stdout.write(
                `Progress: [${'.'.repeat(dots++)}${' '.repeat(spaces)}]\r`
            );
        }
        const val = getValue(sheet[i]);
        if (val.length > 0) {
            res.push(val);
        }
    }
    const avgs = colAverage(res);
    console.log(`Progress: [${".".repeat(totalDots)}]\nSpreadsheet processed!`);

    console.log(`Averages are [${avgs}]`);
    writeFile(
        './tests/experiments/valueGained/valueGained.txt',
        toReadMe(avgs)
    );
}

const toReadMe = (avgs) => {
    const perc = n => (100 * n).toFixed(1);
    const p1 = (
        'This code would be impossible to predict reliably because ' +
        'it uses a much truer randomness than what an MLB pitcher/catcher/manager ' +
        'can come up with while also trying to pay attention to everything else ' +
        'happening in the game. The average probability of Itcher selecting the ' +
        `pitch it ends up selecting is ${perc(avgs[3])}%, which provides a hard ceiling for ` +
        'the accuracy of any human or machine trying to predict it.'
    );

    const p2 = (
        'Along with the randomness, the pitches this model suggests would perform better ' +
        'than the pitches selected in the dataset. Sticking to the framework of measuring ' +
        'outcomes based on the binary of whether they were good or bad for the pitcher, ' +
        'unsurprisingly, as currently chosen, a given pitch is good for the pitcher about ' +
        `50% of the time. The specific figure is ${perc(avgs[0])}%. Based on the machine learning's ` +
        'valuation, the pitch the model selects would give the pitcher a good outcome ' +
        `${perc(avgs[1])}% of the time. The optimal pitch would give the pitcher a good ` +
        `outcome ${perc(avgs[2])}% of the time, but it would be too predictable to use.`
    );

    const bias = avgs[0] - avgs[6];
    const centered = avgs[1] + bias;
    const p3 = (
        'The model does have a slight bias, which is evident in the fact that, ' +
        'of the pitches the pitcher actually threw, the model predicted they ' + 
        `would have a good outcome ${perc(avgs[6])}% of the time despite the ` +
        `actual figure being ${perc(avgs[0])}%. We account for this by ` +
        "adjusting the average predicting on Itcher's selected pitch up by " +
        `${avgs[0].toFixed(3)} - ${avgs[6].toFixed(3)} = ${bias.toFixed(3)}, meaning the ` +
        'actual average prediction is ' +
        `${avgs[1].toFixed(3)} + ${bias.toFixed(3)} = ${centered.toFixed(3)}.`
    );

    const goodModels = Math.round(1000 * centered);
    const badModels = 1000 - goodModels;
    const acc = 0.7112290658602151;
    const fixedAcc = acc.toFixed(3);
    const goodGood = acc * goodModels;
    const badGood = (1 - acc) * badModels;
    const adjGood = goodGood + badGood;
    const adjProb = adjGood / 1000;
    const p4 = (
        "However, we still have to factor in the model's inaccuracy. The model uses a " +
        `bagging ensemble, which means the ${centered.toFixed(3)} roughly ` +
        `translates to ${goodModels} models predicting a good outcome while ` +
        `1000 - ${goodModels} = ${badModels} models predict a bad outcome ` +
        "(we don't actually use 1000 models but this is just for illustration). The " +
        `average child model has an accuracy of ${perc(acc)}%, and if ${perc(acc)}% ` +
        `of those ${goodModels} "good" models are right, that results in ` +
        `${fixedAcc} * ${goodModels} = ${goodGood.toFixed(2)} good outcomes, and (1 - ` +
        `${fixedAcc}) * ${goodModels} = ${((1 - acc) * goodModels).toFixed(2)} ` +
        `bad outcomes. When we do the same with the "bad" models, we get ` + 
        `${fixedAcc} * ${badModels} = ${(acc * badModels).toFixed(2)} bad outcomes and ` +
        `(1 - ${fixedAcc}) * ${badModels} = ${badGood.toFixed(2)} good outcomes. This ` +
        `means, adjusting for the inaccuracy, we get about ${goodGood.toFixed(2)} ` +
        `+ ${badGood.toFixed(2)} = ${adjGood.toFixed(2)} good outcomes, i.e. a ` +
        `${perc(adjProb)}% chance of a good outcome. This estimate is more ` +
        "conservative, which makes sense since it is taking the model's output with " +
        'a grain of salt.'
    );

    const p5 = (
        'We can convert these figures to a run value by measuring the wOBA before and ' +
        'after the pitch, and then using that to find the wRAA over a full season. ' +
        'Note that the training data is originally categorized into "good" and "bad" ' +
        'events based on this difference in wOBA, although the magnitude is lost. '
    );

    const acDiff = avgs[0] * -avgGood + (1 - avgs[0]) * -avgBad;
    const selDiff = adjProb * -avgGood + (1 - adjProb) * -avgBad;
    const p6 = (
        'For pitches that resulted in a "good" event, the average wOBA difference before ' +
        `and after is ${-avgGood.toFixed(4)} (negative is good for the pitcher). Pitches that resulted ` +
        `in a "bad" event averaged a wOBA difference of ${-avgBad.toFixed(4)}. The selected pitch thus ` +
        `has an average wOBA difference of ${avgs[0].toFixed(3)} * ${-avgGood.toFixed(4)} + ` +
        `(1 - ${avgs[0].toFixed(3)}) * ${-avgBad.toFixed(4)} = ${acDiff.toFixed(4)}, which is unsurprisingly basically ` +
        "zero. On the other hand, this code's selected pitch has an average wOBA " +
        `difference of ${adjProb.toFixed(3)} * ${-avgGood.toFixed(4)} + ` +
        `(1 - ${adjProb.toFixed(3)}) * ${-avgBad.toFixed(4)} = ${selDiff}.`
    );

    const pitchesPer = 3.87;
    const paDiff = -selDiff * pitchesPer;
    const p7 = (
        `In the dataset Itcher uses, there was an average of ${pitchesPer.toFixed(2)} ` +
        'pitches per plate appearance. Each pitch Itcher suggests lowers ' +
        `the batter's wOBA by ${-selDiff.toFixed(4)}, meaning over the course of a ` +
        'full plate appearance, this accumulates to a difference of ' +
        `${-selDiff.toFixed(4)} * ${pitchesPer.toFixed(2)} = ${paDiff.toFixed(6)}.`
    );

    const leagueWoba = 0.32;
    const wobaScale = 1.157;
    const runsPerPa = 0.126;
    const paWoba = leagueWoba - paDiff;
    const wobaFixed = paWoba.toFixed(3);
    const p8 = (
        'The league-average pitch by definition allows the league-average wOBA. ' +
        'This project uses 2019 data, and in 2019 the league-wide wOBA was ' +
        `${leagueWoba.toFixed(3)}, the wOBA scale was ${wobaScale.toFixed(3)}, and ` +
        `the number of runs per plate appearance was ${runsPerPa.toFixed(3)} ` +
        '(all figures from [fangraphs](https://www.fangraphs.com/guts.aspx?type=cn)). ' +
        'A plate apperance using pitches selected from Itcher would thus ' +
        `have a wOBA of ${leagueWoba.toFixed(3)} - ${paDiff.toFixed(5)} = ${wobaFixed}.`
    );

    const battersPer = 38.39;
    const perSeason = battersPer * 162;
    const fixedBatters = perSeason.toFixed(2);
    const runsSaved = ((paWoba - leagueWoba) / wobaScale) * fixedBatters;
    const runsFixed = (-runsSaved).toFixed(2);
    const p9 = (
        `In 2019, the average team faced ${battersPer.toFixed(2)} batters per game ` +
        '(from [here](https://www.baseball-reference.com/leagues/majors/pitch.shtml)), ' +
        `meaning ${battersPer.toFixed(2)} * 162 = ${fixedBatters} per season. To see how ` +
        `valuable a ${wobaFixed} wOBA over ${fixedBatters} plate appearances is, ` +
        "it's easiest to convert the figures to wRAA. Using [this formula]" +
        '(https://library.fangraphs.com/offense/wraa/), we find wRAA = ' +
        `((${paWoba.toFixed(3)} - ${leagueWoba.toFixed(3)}) / ${wobaScale.toFixed(3)}) ` +
        `* ${fixedBatters} = ${runsSaved}, ` +
        'which is to say that a team using Itcher over a full season would ' +
        `allow something on the order of ${runsFixed} ` +
        'fewer runs than the same team not using Itcher.'
    );

    const p10 = (
        'Note that this is a somewhat different calculation than what a ' +
        "sabermetrician is typically used to when converted a *player's* " +
        'wOBA to a run value. Because the team can use Itcher for every ' +
        'pitcher in every game, a smaller difference in wOBA adds up to a ' +
        'much larger difference in runs compared to a single starting pitcher ' +
        `with a ${wobaFixed} wOBA allowed.`
    );

    const runsPerWin = 4.83 * 1.5 + 3;
    const wins = -runsSaved / runsPerWin;
    const winsFixed = wins.toFixed(2);
    const p11 = (
        'Fangraphs calculates the amount of runs per win using the formula ' +
        '[here](https://library.fangraphs.com/misc/war/converting-runs-to-wins/). ' +
        `In 2019, this figure was 4.83 * 1.5 + 3 = ${runsPerWin.toFixed(3)} ` +
        '(runs per game from [here](https://www.baseball-reference.com/leagues/majors/pitch.shtml)), ' +
        'meaning that runs saved figure translates to ' +
        `${-runsSaved.toFixed(7)} / ${runsPerWin.toFixed(3)} = ${wins.toFixed(7)} ` +
        'wins over a full season.'
    );

    const dollarsPerWar = 6.37;
    const worth = dollarsPerWar * wins;
    const p12 = (
        `Using Itcher provides a team with ${winsFixed} extra wins. ` +
        'If Itcher were a free agent, it would be worth ' +
        `$${dollarsPerWar.toFixed(2)} million per win * ${winsFixed} wins ` +
        `= $${worth.toFixed(2)} million ` +
        'dollars in 2022 for just one year. (Dollars per win from ' +
        '[here](https://blogs.fangraphs.com/what-did-teams-pay-per-win-in-free-agency/).)'
    );

    return [
        p1, p2, p3, p4, p5, p6, p7,
        p8, p9, p10, p11, p12
    ].join('\n\n');
}

/**
 * Generates the ReadMe excerpt without having to do all the work
 * of allValues. Meant to be called instead of allValues using the
 * averages array that it finds and prints.
 * @param {number[]} avgs the averages collected from allValues
 */
const writeFromArray = (avgs) => {
    setAvgs();
    writeFile(
        './tests/experiments/valueGained/valueGained.txt',
        toReadMe(avgs)
    )
}

allValues();
// writeFromArray([
//   0.5138044015202685,
//   0.5329747260391118,
//   0.6448037865574436,
//   0.1823873310861851,
//   6.009553093464256,
//   0.4088585667229699,
//   0.495952718437764
// ]);
