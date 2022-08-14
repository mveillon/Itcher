(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.pitchChooser = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetState = exports.state = exports.GameState = void 0;
const Pitcher_js_1 = require("./Pitcher.js");
const LinkedList_js_1 = require("../utils/LinkedList.js");
class GameState {
    /**
     * Keeps track of the current state of a baseball game
     */
    constructor() {
        this.groundout = this.out;
        this.flyout = this.out;
        this.lineout = this.out;
        this.undo = this.restore;
        this._outs = 0;
        this._strikes = 0;
        this._balls = 0;
        this._lineSpot = 0;
        this.pitcher = new Pitcher_js_1.Pitcher('Unknown (change me!)', '');
        this.lineup = ['Unknown (change me!)'];
        this.lastStates = new LinkedList_js_1.List();
        this.bases = [false, false, false];
    }
    get strikes() {
        return this._strikes;
    }
    get balls() {
        return this._balls;
    }
    set strikes(s) {
        if (s >= 3) {
            this.strikeout();
        }
        else {
            this._strikes = s;
        }
    }
    set balls(b) {
        if (b >= 4) {
            this.walk();
        }
        else {
            this._balls = b;
        }
    }
    get outs() {
        return this._outs;
    }
    set outs(o) {
        if (o >= 3) {
            this._outs = 0;
        }
        else {
            this._outs = o;
        }
    }
    get lineSpot() {
        return this._lineSpot;
    }
    set lineSpot(l) {
        this._lineSpot = l % 9;
    }
    /**
     * Saves a backup of the game state
     */
    backup() {
        let toAdd = new GameState();
        toAdd._outs = this._outs;
        toAdd._strikes = this._strikes;
        toAdd._balls = this._balls;
        toAdd._lineSpot = this._lineSpot;
        toAdd.pitcher = this.pitcher.copy();
        toAdd.lineup = [...this.lineup];
        toAdd.lastStates = this.lastStates;
        toAdd.bases = [...this.bases];
        this.lastStates.addRight(toAdd);
        if (this.lastStates.length > GameState.maxBackups) {
            this.lastStates.popLeft();
        }
    }
    /**
     * Restores the most recent backup of the game state
     */
    restore() {
        if (this.lastStates.length > 0) {
            const last = this.lastStates.popRight();
            this._outs = last._outs;
            this._strikes = last._strikes;
            this._balls = last._balls;
            this._lineSpot = last._lineSpot;
            this.pitcher = last.pitcher;
            this.lineup = [...last.lineup];
            this.lastStates = last.lastStates;
            this.bases = [...last.bases];
        }
    }
    /**
     * Changes the batter to the next batter
     */
    newBatter() {
        this._balls = 0;
        this._strikes = 0;
        this.lineSpot += 1;
    }
    /**
     * Moves every batter ahead by the same number of bases
     * @param numBases how many bases the runners should move
     */
    nBaseHit(numBases) {
        if (numBases === 0)
            return;
        this.backup();
        this.newBatter();
        /* Runner on third */
        this.bases[2] = false;
        /* Runner on second */
        if (this.bases[1]) {
            if (numBases === 1) {
                this.bases[2] = true;
            }
            this.bases[1] = false;
        }
        /* Runner on first */
        if (this.bases[0]) {
            if (numBases <= 2) {
                this.bases[numBases] = true;
            }
            this.bases[0] = false;
        }
        /* Batter */
        if (numBases < 4) {
            this.bases[numBases - 1] = true;
        }
    }
    /**
     * Determines whether the pitcher has the platoon advantage
     * @returns if the pitcher has the platoon advantage
     */
    pitcherPlatoon() {
        return this.pitcher.hand === 'S' || this.pitcher.hand === this.lineup[this._lineSpot];
    }
    ball() {
        this.backup();
        this.balls += 1;
    }
    walk() {
        this.newBatter();
        let tailRunner = 0;
        while (tailRunner < this.bases.length && this.bases[tailRunner]) {
            tailRunner++;
        }
        if (tailRunner < this.bases.length) {
            this.bases[tailRunner] = true;
        }
    }
    strike() {
        this.backup();
        this.strikes += 1;
    }
    strikeout() {
        this.newBatter();
        this.outs += 1;
    }
    foul() {
        if (this._strikes < 2) {
            this.backup();
            this.strikes += 1;
        }
    }
    single() {
        this.nBaseHit(1);
    }
    double() {
        this.nBaseHit(2);
    }
    triple() {
        this.nBaseHit(3);
    }
    homeRun() {
        this.nBaseHit(4);
    }
    out() {
        this.backup();
        this.newBatter();
        this.outs += 1;
    }
    error() {
        this.single();
    }
    doublePlay() {
        this.backup();
        this.newBatter();
        this.outs += 2;
        this.bases[0] = false;
    }
}
exports.GameState = GameState;
GameState.maxBackups = 20;
exports.state = new GameState();
/**
 * Resets the global state variable, keeping only a few fields
 * @param keepPitcher whether to retain the old pitcher. Default is true
 * @param keepLineup whether to retain the old lineup. Default is true
 * @param keepStates whether to retain the old backups. Default is true
 */
const resetState = (keepPitcher = true, keepLineup = true, keepStates = true) => {
    const oldPitch = exports.state.pitcher;
    const oldLine = exports.state.lineup;
    exports.state.backup();
    const oldStates = exports.state.lastStates;
    exports.state = new GameState();
    if (keepPitcher)
        exports.state.pitcher = oldPitch;
    if (keepLineup)
        exports.state.lineup = oldLine;
    if (keepStates)
        exports.state.lastStates = oldStates;
};
exports.resetState = resetState;

},{"../utils/LinkedList.js":8,"./Pitcher.js":3}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pitch = void 0;
class Pitch {
    /**
     * Container class for one pitch of one pitcher
     * @param _name the name of the pitch
     */
    constructor(_name) {
        this.name = _name;
        this.timesThrown = 0;
        this.velo = 0;
        this.spinRate = 0;
        this.spinDirection = 0;
    }
    /**
     * Converts an object as read from a JSON into a pitch
     * @param obj the object to convert
     * @returns an instance of the Pitch class
     */
    static fromObj(obj) {
        let res = new Pitch(obj.name);
        res.timesThrown = obj.timesThrown;
        res.velo = obj.velo;
        res.spinRate = obj.spinRate;
        res.spinDirection = obj.spinDirection;
        return res;
    }
}
exports.Pitch = Pitch;

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readAllPitchers = exports.Pitcher = void 0;
const files_js_1 = require("../utils/files.js");
const Pitch_js_1 = require("./Pitch.js");
class Pitcher {
    /**
     * Represents a baseball pitcher
     * @param _name the name of the pitcher
     * @param _hand the handedness of the pitcher; either 'R', 'L', or 'S'
     */
    constructor(_name, _hand) {
        this.name = _name;
        this.pitches = {};
        this.hand = _hand;
    }
    /**
     * Takes an object (like something generated from JSON) and turns it into a Pitcher
     * @param obj the raw object
     * @returns an object of type Pitcher
     */
    static fromObj(obj) {
        let res = new Pitcher(obj.name, obj.hand);
        for (const pitch in obj.pitches) {
            res.pitches[pitch] = Pitch_js_1.Pitch.fromObj(obj.pitches[pitch]);
        }
        return res;
    }
    /**
     * Makes a shallow copy of this
     * @returns a copy of this pitcher
     */
    copy() {
        let res = new Pitcher(this.name, this.hand);
        res.pitches = this.pitches;
        return res;
    }
}
exports.Pitcher = Pitcher;
const parseData_js_1 = require("../ml/parseData.js");
/**
 * Reads pitchers.json and returns all pitchers in it
 * @returns all of the pitchers in the dataset
 */
const readAllPitchers = () => {
    (0, parseData_js_1.findAllPitchers)();
    const objs = (0, files_js_1.readJSON)(files_js_1.pitcherPath);
    let res = {};
    for (const k in objs) {
        res[k] = Pitcher.fromObj(objs[k]);
    }
    return res;
};
exports.readAllPitchers = readAllPitchers;

},{"../ml/parseData.js":5,"../utils/files.js":9,"./Pitch.js":2}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const buttons_js_1 = require("./ui/buttons.js");
const scorebug_js_1 = require("./ui/scorebug.js");
const init = () => {
    (0, buttons_js_1.bindButtons)();
    (0, scorebug_js_1.bindToggles)();
};
exports.init = init;

},{"./ui/buttons.js":6,"./ui/scorebug.js":7}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pitchAbbreviations = exports.findAllPitchers = exports.getPlayType = exports.aidToPitcher = exports.abToPlat = exports.idToEvent = void 0;
const files_js_1 = require("../utils/files.js");
const Pitch_js_1 = require("../baseballLogic/Pitch.js");
const Pitcher_js_1 = require("../baseballLogic/Pitcher.js");
const GameState_js_1 = require("../baseballLogic/GameState.js");
exports.idToEvent = new Map();
exports.abToPlat = new Map();
let abToPitcher = new Map();
let idToName = new Map();
/**
 * Returns the pitcher of a given at bat
 * @param aid the at bat id
 * @returns the pitcher object
 */
const aidToPitcher = (aid, allPitchers) => {
    return allPitchers[idToName.get(abToPitcher.get(aid))];
};
exports.aidToPitcher = aidToPitcher;
/**
 * Returns a key into rewards based on the play type
 * @param result the result from the pitches sheet
 * @param event the event from the at bat spreadsheet
 * @returns the play type as a key into rewards
 */
const getPlayType = (result, event) => {
    if (!(result in playTypes)) {
        throw new Error(`Unexpected result: ${result}`);
    }
    result = playTypes[result];
    const outTypes = new Set([
        'Flyout',
        'Groundout',
        'Lineout',
        'Pop Out',
        'Fielders Choice Out',
        'Sac Fly',
        'Field Error',
        'Forceout',
        'Sac Bunt',
        'Fan Interference',
        'Batter Interference',
    ]);
    if (result === 'ibb') {
        return 'bb';
    }
    else if (result === 'b' && GameState_js_1.state.balls === 3) {
        return 'bb';
    }
    else if (result === 'k' && GameState_js_1.state.strikes === 2) {
        return 'kk';
    }
    else if ((result === 'o' || result === 'h') &&
        (event.includes('DP') || event.includes('Double Play'))) {
        return 'dp';
    }
    else if (result === 'h') {
        if (outTypes.has(event)) {
            return 'o';
        }
        else {
            switch (event) {
                case 'Single':
                    return '1b';
                    break;
                case 'Double':
                    return '2b';
                    break;
                case 'Triple':
                    return '3b';
                    break;
                case 'Home Run':
                    return 'hr';
                    break;
                case 'Fielders Choice':
                    return '1b';
                    break;
                case 'Catcher Interference':
                    return '1b';
                    break;
                default:
                    throw new Error(`Unexpected hit type ${event}`);
                    break;
            }
        }
    }
    return result;
};
exports.getPlayType = getPlayType;
/**
 * Goes through the train, validation, and testing sets and finds all pitchers present
 */
const findAllPitchers = () => {
    let accum = {};
    const paths = [
        files_js_1.dataPaths.train,
        files_js_1.dataPaths.valid,
        files_js_1.dataPaths.test,
    ];
    for (const pth of paths) {
        pitchersInSheet(pth, accum);
    }
    for (const player in accum) {
        let total = 0;
        for (const p in accum[player].pitches) {
            const pitchO = accum[player].pitches[p];
            total += pitchO.timesThrown;
            pitchO.velo /= pitchO.timesThrown;
            pitchO.spinRate /= pitchO.timesThrown;
            pitchO.spinDirection /= pitchO.timesThrown;
        }
        for (const p in accum[player].pitches) {
            accum[player].pitches[p].timesThrown /= total;
        }
    }
    (0, files_js_1.writeJSON)(files_js_1.pitcherPath, accum);
};
exports.findAllPitchers = findAllPitchers;
/**
 * Goes through the data at path and records all pitchers in it
 * @param path where to find the spreadsheet of all pitches to read
 * @param pitchers the JSONs read thus far. This will be updated by the function
 */
const pitchersInSheet = (path, pitchers) => {
    let names = (0, files_js_1.readSpreadSheet)(files_js_1.dataPaths.playerNames);
    for (const player of names) {
        idToName.set(parseInt(player['id']), `${player['first_name']} ${player['last_name']}`);
    }
    names = undefined; // free up memory hopefully
    let abs = (0, files_js_1.readSpreadSheet)(files_js_1.dataPaths.atBats);
    let idToHand = new Map();
    const allowed = ['R', 'L', 'S'];
    for (const ab of abs) {
        const pid = parseInt(ab['pitcher_id']);
        const aid = parseInt(ab['ab_id']);
        if (isNaN(aid))
            continue;
        const pHand = ab['p_throws'];
        const hHand = ab['stand'];
        if (!allowed.includes(pHand) || !allowed.includes(hHand)) {
            throw new Error(`Unknown handedness of aid ${aid}. Pitcher: ${pHand}, Hitter: ${hHand}`);
        }
        abToPitcher.set(aid, pid);
        idToHand.set(pid, pHand);
        exports.idToEvent.set(aid, ab['event']);
        exports.abToPlat.set(aid, pHand === 'S' || pHand === hHand);
    }
    abs = undefined;
    let pitches = (0, files_js_1.readSpreadSheet)(path);
    for (const p of pitches) {
        const pid = abToPitcher.get(parseInt(p['ab_id']));
        const playerName = idToName.get(pid);
        if (typeof playerName === 'undefined') {
            continue;
        }
        if (!(playerName in pitchers)) {
            pitchers[playerName] = new Pitcher_js_1.Pitcher(playerName, idToHand.get(pid));
        }
        const pitchName = exports.pitchAbbreviations[p['pitch_type']];
        if (typeof pitchName !== 'undefined') {
            if (!(pitchName in pitchers[playerName].pitches)) {
                pitchers[playerName].pitches[pitchName] = new Pitch_js_1.Pitch(pitchName);
            }
            const sRate = parseFloat(p['spin_rate']);
            const sDirec = parseFloat(p['spin_dir']);
            const velo = parseFloat(p['start_speed']);
            if (isNaN(sRate) || isNaN(sDirec) || isNaN(velo))
                continue;
            const pitchObj = pitchers[playerName].pitches[pitchName];
            pitchObj.timesThrown += 1;
            pitchObj.velo += velo;
            pitchObj.spinRate += sRate;
            pitchObj.spinDirection += sDirec;
        }
    }
};
exports.pitchAbbreviations = {
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
const playTypes = {
    B: 'b',
    '*B': 'b',
    S: 'k',
    C: 'k',
    F: 'f',
    T: 'k',
    L: 'f',
    I: 'b',
    W: 'k',
    M: 'k',
    P: 'b',
    Q: 'k',
    R: 'f',
    X: 'o',
    D: 'h',
    E: 'h',
    H: 'bb',
    V: 'ibb',
    O: 'dp',
};

},{"../baseballLogic/GameState.js":1,"../baseballLogic/Pitch.js":2,"../baseballLogic/Pitcher.js":3,"../utils/files.js":9}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindButtons = exports.undo = exports.lineout = exports.flyout = exports.groundout = exports.doublePlay = exports.error = exports.out = exports.homeRun = exports.triple = exports.double = exports.single = exports.foul = exports.strike = exports.ball = void 0;
const GameState_js_1 = require("../baseballLogic/GameState.js");
const usingNode_js_1 = require("../utils/usingNode.js");
const utilities_js_1 = require("../utils/utilities.js");
const scorebug_js_1 = require("./scorebug.js");
const ball = () => {
    GameState_js_1.state.ball();
    (0, scorebug_js_1.updateBug)();
};
exports.ball = ball;
const strike = () => {
    GameState_js_1.state.strike();
    (0, scorebug_js_1.updateBug)();
};
exports.strike = strike;
const foul = () => {
    GameState_js_1.state.foul();
    (0, scorebug_js_1.updateBug)();
};
exports.foul = foul;
const single = () => {
    GameState_js_1.state.single();
    (0, scorebug_js_1.updateBug)();
};
exports.single = single;
const double = () => {
    GameState_js_1.state.double();
    (0, scorebug_js_1.updateBug)();
};
exports.double = double;
const triple = () => {
    GameState_js_1.state.triple();
    (0, scorebug_js_1.updateBug)();
};
exports.triple = triple;
const homeRun = () => {
    GameState_js_1.state.homeRun();
    (0, scorebug_js_1.updateBug)();
};
exports.homeRun = homeRun;
const out = () => {
    GameState_js_1.state.out();
    (0, scorebug_js_1.updateBug)();
};
exports.out = out;
const error = () => {
    GameState_js_1.state.error();
    (0, scorebug_js_1.updateBug)();
};
exports.error = error;
const doublePlay = () => {
    GameState_js_1.state.doublePlay();
    (0, scorebug_js_1.updateBug)();
};
exports.doublePlay = doublePlay;
const groundout = () => {
    GameState_js_1.state.groundout();
    (0, scorebug_js_1.updateBug)();
};
exports.groundout = groundout;
const flyout = () => {
    GameState_js_1.state.flyout();
    (0, scorebug_js_1.updateBug)();
};
exports.flyout = flyout;
const lineout = () => {
    GameState_js_1.state.lineout();
    (0, scorebug_js_1.updateBug)();
};
exports.lineout = lineout;
const undo = () => {
    GameState_js_1.state.undo();
    (0, scorebug_js_1.updateBug)();
};
exports.undo = undo;
const bindButtons = () => {
    if (!(0, usingNode_js_1.usingNode)()) {
        const buttonFuncs = {
            'ball': exports.ball,
            'strike': exports.strike,
            'foul': exports.foul,
            '1b': exports.single,
            '2b': exports.double,
            '3b': exports.triple,
            'hr': exports.homeRun,
            'error': exports.error,
            'go': exports.groundout,
            'lo': exports.lineout,
            'fo': exports.flyout,
            'dp': exports.doublePlay,
            'undo': exports.undo,
        };
        for (const id in buttonFuncs) {
            (0, utilities_js_1.$)(id).onclick = buttonFuncs[id];
        }
    }
};
exports.bindButtons = bindButtons;

},{"../baseballLogic/GameState.js":1,"../utils/usingNode.js":10,"../utils/utilities.js":11,"./scorebug.js":7}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindToggles = exports.updateBug = exports.updateNext = exports.changeLineSpot = exports.changeLineup = exports.changePitcher = exports.changeCount = exports.toggleOuts = exports.toggleBase = void 0;
const GameState_js_1 = require("../baseballLogic/GameState.js");
const Pitcher_js_1 = require("../baseballLogic/Pitcher.js");
const usingNode_js_1 = require("../utils/usingNode.js");
const utilities_js_1 = require("../utils/utilities.js");
/**
 * Toggles whether the base is occupied or not
 * @param baseInd which base to toggle
 */
const toggleBase = (baseInd) => {
    GameState_js_1.state.backup();
    GameState_js_1.state.bases[baseInd] = !GameState_js_1.state.bases[baseInd];
};
exports.toggleBase = toggleBase;
/**
 * Toggles whether there are outInd outs
 * @param outInd which out button was clicked (0, 1, or 2)
 */
const toggleOuts = (outInd) => {
    GameState_js_1.state.backup();
    if (outInd === 2) {
        if (GameState_js_1.state.outs === 0) {
            GameState_js_1.state.undo();
        }
        GameState_js_1.state.outs = 0;
    }
    else {
        GameState_js_1.state.outs = outInd + +(outInd >= GameState_js_1.state.outs);
    }
};
exports.toggleOuts = toggleOuts;
/**
 * Changes the count to the user's input
 * @param balls how many balls there should be
 * @param strikes how many strikes there should be
 */
const changeCount = (balls, strikes) => {
    if (balls > 4 || strikes > 3)
        return;
    if (balls === 4 && strikes === 3) {
        return;
    }
    else if (balls !== GameState_js_1.state.balls || strikes !== GameState_js_1.state.strikes) {
        GameState_js_1.state.backup();
        if (strikes < 3)
            GameState_js_1.state.balls = balls;
        if (balls < 4)
            GameState_js_1.state.strikes = strikes;
    }
};
exports.changeCount = changeCount;
/**
 * Changes who's throwing
 * @param pitcherName the new pitcher
 */
const changePitcher = (pitcherName) => {
    const allPitchers = (0, Pitcher_js_1.readAllPitchers)();
    if (pitcherName !== GameState_js_1.state.pitcher.name && pitcherName in allPitchers) {
        GameState_js_1.state.backup();
        GameState_js_1.state.pitcher = allPitchers[pitcherName];
    }
};
exports.changePitcher = changePitcher;
/**
 * Changes the handnedness of the lineup
 * @param newLineup the new lineup
 */
const changeLineup = (newLineup) => {
    if (newLineup.length === GameState_js_1.state.lineup.length) {
        const allowed = ['R', 'L', 'S'];
        let diff = false;
        for (let i = 0; i < newLineup.length; i++) {
            if (!allowed.includes(newLineup[i]))
                return;
            diff || (diff = newLineup[i] !== GameState_js_1.state.lineup[i]);
        }
        if (!diff)
            return;
    }
    GameState_js_1.state.backup();
    GameState_js_1.state.lineup = newLineup;
};
exports.changeLineup = changeLineup;
/**
 * Changes where in the order we are
 * @param newSpot the new lineup spot
 */
const changeLineSpot = (newSpot) => {
    if (newSpot >= 0 && newSpot < 9 && newSpot !== GameState_js_1.state.lineSpot) {
        GameState_js_1.state.backup();
        GameState_js_1.state.lineSpot = newSpot;
    }
};
exports.changeLineSpot = changeLineSpot;
/**
 * Finds the next pitch to throw and updates the html
 * to reflect that
 */
const updateNext = () => {
};
exports.updateNext = updateNext;
const updateBug = () => {
    if (!(0, usingNode_js_1.usingNode)()) {
        const baseIds = [
            'first-base',
            'second-base',
            'third-base'
        ];
        for (let i = 0; i < baseIds.length; i++) {
            const file = GameState_js_1.state.bases[i] ? 'occupied' : 'empty';
            (0, utilities_js_1.$)(baseIds[i]).src = `../../assets/${file}.png`;
        }
        const outIds = [
            'one-out',
            'two-out',
        ];
        for (let i = 0; i < outIds.length; i++) {
            const file = GameState_js_1.state.outs > i ? 'out' : 'no-out';
            (0, utilities_js_1.$)(outIds[i]).src = `../../assets/${file}.png`;
        }
    }
};
exports.updateBug = updateBug;
const updateBases = (baseInd) => {
    (0, exports.toggleBase)(baseInd);
    (0, exports.updateBug)();
};
const updateOut = (outInd) => {
    (0, exports.toggleOuts)(outInd);
    (0, exports.updateBug)();
};
const bindToggles = () => {
    if (!(0, usingNode_js_1.usingNode)()) {
        (0, utilities_js_1.$)('first-base').onclick = () => updateBases(0);
        (0, utilities_js_1.$)('second-base').onclick = () => updateBases(1);
        (0, utilities_js_1.$)('third-base').onclick = () => updateBases(2);
        (0, utilities_js_1.$)('one-out').onclick = () => updateOut(0);
        (0, utilities_js_1.$)('two-out').onclick = () => updateOut(1);
        (0, utilities_js_1.$)('three-out').onclick = () => updateOut(2);
    }
};
exports.bindToggles = bindToggles;

},{"../baseballLogic/GameState.js":1,"../baseballLogic/Pitcher.js":3,"../utils/usingNode.js":10,"../utils/utilities.js":11}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.List = void 0;
class ListNode {
    /**
     * One node in a doubly-linked list
     * @param _val the value of the node
     * @param _prev the previous node
     * @param _next the next node
     */
    constructor(_val, _prev, _next) {
        this.prev = _prev;
        this.val = _val;
        this.next = _next;
    }
}
class List {
    /**
     * A doubly linked list capable of pushing and popping
     * from the left and right
     * @param initials optional iterable of initial values
     */
    constructor(initials) {
        this._length = 0;
        this._head = undefined;
        this._tail = undefined;
        if (typeof initials !== 'undefined') {
            for (const item of initials) {
                this.addRight(item);
            }
        }
    }
    get length() {
        return this._length;
    }
    /**
     * Should be called when the first item is added to the list
     * @param val the data to add
     */
    firstNode(val) {
        const newNode = new ListNode(val);
        this._head = newNode;
        this._tail = newNode;
    }
    /**
     * Adds an item to the end of the list
     * @param val the data to add
     */
    addRight(val) {
        if (typeof this._head === 'undefined') {
            this.firstNode(val);
        }
        else {
            if (typeof this._tail === 'undefined') {
                throw new Error('Internal error: tail is undefined when head is not.');
            }
            const newNode = new ListNode(val, this._tail);
            this._tail.next = newNode;
            this._tail = newNode;
            if (typeof this._head.next === 'undefined') {
                this._head.next = newNode;
            }
        }
        this._length++;
    }
    /**
     * Adds an item to the start of the list
     * @param val the data to add
     */
    addLeft(val) {
        if (typeof this._tail === 'undefined') {
            this.firstNode(val);
        }
        else {
            if (typeof this._head === 'undefined') {
                throw new Error('Internal error: head is undefined when tail is not.');
            }
            const newNode = new ListNode(val, undefined, this._head);
            this._head.prev = newNode;
            this._head = newNode;
            if (typeof this._tail.prev === 'undefined') {
                this._tail.prev = newNode;
            }
        }
        this._length++;
    }
    /**
     * Removes an element from the start of the list and returns it
     * @returns the removed element
     */
    popLeft() {
        if (typeof this._head === 'undefined') {
            throw new Error('List.popLeft: empty list');
        }
        else {
            const res = this._head.val;
            if (typeof this._head.next === 'undefined') {
                this._head = undefined;
                this._tail = undefined;
            }
            else {
                this._head = this._head.next;
                this._head.prev = undefined;
            }
            this._length--;
            return res;
        }
    }
    /**
     * Removes an element from the end of the list and returns it
     * @returns the removed element
     */
    popRight() {
        if (typeof this._tail === 'undefined') {
            throw new Error('List.popRight: empty list');
        }
        else {
            const res = this._tail.val;
            if (typeof this._tail.prev === 'undefined') {
                this._head = undefined;
                this._tail = undefined;
            }
            else {
                this._tail = this._tail.prev;
                this._tail.next = undefined;
            }
            this._length--;
            return res;
        }
    }
    /**
     * Returns whatever the first value is without removing it
     * @returns the item at the front of the list
     */
    peekLeft() {
        if (typeof this._head === 'undefined') {
            throw new Error('List.peekLeft: empty list');
        }
        else {
            return this._head.val;
        }
    }
    /**
     * Returns whatever the last value is without removing it
     * @returns the item at the end of the list
     */
    peekRight() {
        if (typeof this._tail === 'undefined') {
            throw new Error('List.peekRight: empty list');
        }
        else {
            return this._tail.val;
        }
    }
    [Symbol.iterator]() {
        let current = this._head;
        return {
            next: () => {
                if (typeof current === 'undefined')
                    return { done: true };
                const res = current.val;
                current = current.next;
                return { value: res };
            }
        };
    }
    /**
     * Allows the list to be converted to a readable string
     * @returns a string printout of the list
     */
    toString() {
        return `(${[...this].join(', ')})`;
    }
}
exports.List = List;

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataPaths = exports.pitcherPath = exports.writeJSON = exports.readJSON = exports.readSpreadSheet = exports.writeFile = exports.readFile = void 0;
const usingNode_js_1 = require("./usingNode.js");
if ((0, usingNode_js_1.usingNode)()) {
    // running via node - we need it to work both ways for testing
    let fs = eval('require("fs")');
    exports.readFile = fs.readFileSync;
    exports.writeFile = fs.writeFileSync;
}
else {
    // running via the browser
    exports.readFile = (path, encoding) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", path, false);
        xhr.send(null);
        if (xhr.status === 0 || xhr.status === 200) {
            return xhr.responseText;
        }
        else {
            throw new Error(`
                xhr failed with status ${xhr.status}
            `);
        }
    };
    exports.writeFile = (path, data) => {
        fetch(path, {
            method: 'POST',
            body: data
        });
    };
}
/**
 * Reads one spreadsheet and returns it as an array
 * Assumed to have one row of headers
 * @param path the path to the spreadsheet
 * @returns a 2D string array
 */
const readSpreadSheet = (path, delimiter = ',') => {
    let data = (0, exports.readFile)(path, 'utf8');
    const firstNewLine = data.indexOf('\n');
    const headers = data.slice(0, firstNewLine).split(delimiter);
    const rows = data.slice(firstNewLine + 1).split('\n');
    return rows.map((row) => {
        const vals = row.split(delimiter);
        let obj = {};
        for (let i = 0; i < headers.length; i++) {
            obj[headers[i]] = vals[i];
        }
        return obj;
    });
};
exports.readSpreadSheet = readSpreadSheet;
/**
 * Reads the JSON at the given path and returns the object
 * @param path where the file is
 * @returns an object with the same data
 */
const readJSON = (path) => {
    return JSON.parse((0, exports.readFile)(path, 'utf8'));
};
exports.readJSON = readJSON;
/**
 * Saves the object to the given path
 * @param obj the object to save as a json
 * @param path where to save the data to
 */
const writeJSON = (path, obj) => {
    (0, exports.writeFile)(path, JSON.stringify(obj));
};
exports.writeJSON = writeJSON;
exports.pitcherPath = "./src/baseballLogic/pitchers.json";
const dataRoot = "./src/ml/data/";
exports.dataPaths = {
    atBats: dataRoot + "atbats.ignore.csv",
    pitches: dataRoot + "pitches.ignore.csv",
    playerNames: dataRoot + "player_names.ignore.csv",
    train: dataRoot + "train.ignore.csv",
    valid: dataRoot + "valid.ignore.csv",
    test: dataRoot + "test.ignore.csv",
};

},{"./usingNode.js":10}],10:[function(require,module,exports){
(function (process){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usingNode = void 0;
/**
 * Checks whether the code is running on the command line (true)
 * or through the browser (false)
 * @returns whether the code is running through node
 */
const usingNode = () => {
    return (typeof process !== 'undefined' &&
        typeof process.release !== 'undefined' &&
        process.release.name.search(/node|io.js/) !== -1);
};
exports.usingNode = usingNode;

}).call(this)}).call(this,require('_process'))
},{"_process":12}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upTo = exports.$ = exports.allPitchTypes = void 0;
const usingNode_js_1 = require("./usingNode.js");
/**
 * All of the pitch types that this code recognizes
 */
const allPitchTypes = () => {
    return [
        '4-seam',
        '2-seam',
        'cutter',
        'sinker',
        'curveball',
        'slider',
        'knuckle-curve',
        'changeup',
        'splitter',
        'eephus',
        'pitchout',
        'intentional ball',
        'knuckleball',
        'screwball',
        'unknown'
    ];
};
exports.allPitchTypes = allPitchTypes;
if ((0, usingNode_js_1.usingNode)()) {
    exports.$ = (id) => {
        throw new Error('Cannot use $ when running via node!');
    };
}
else {
    exports.$ = (id) => {
        return document.getElementById(id);
    };
}
/**
 * Returns a sorted array with every int in the range [0, n) inclusive
 * @param n 1 + the max number in the array
 * @returns an array with every int up to n
 */
const upTo = (n) => {
    return [...Array(n).keys()];
};
exports.upTo = upTo;

},{"./usingNode.js":10}],12:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[4])(4)
});
