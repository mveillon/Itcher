(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Main = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setState = exports.getState = exports.resetState = exports.GameState = void 0;
const Pitcher_js_1 = _dereq_("./Pitcher.js");
const LinkedList_js_1 = _dereq_("../utils/LinkedList.js");
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
        this.lineup = ['L', 'R', 'S', 'L', 'R', 'S', 'L', 'R', 'S'];
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
        if (s < 0)
            return;
        if (s >= 3) {
            this.strikeout();
        }
        else {
            this._strikes = s;
        }
    }
    set balls(b) {
        if (b < 0)
            return;
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
            this.bases = [false, false, false];
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
        if (numBases === 0) {
            throw new Error('numBases must be greater than zero');
        }
        ;
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
const stateContext = {
    state: new GameState()
};
/**
 * Resets the global state variable, keeping only a few fields
 * @param keepPitcher whether to retain the old pitcher. Default is true
 * @param keepLineup whether to retain the old lineup. Default is true
 * @param keepStates whether to retain the old backups. Default is true
 */
const resetState = (keepPitcher = true, keepLineup = true, keepStates = true) => {
    let oldState = (0, exports.getState)();
    const oldPitch = oldState.pitcher;
    const oldLine = oldState.lineup;
    oldState.backup();
    const oldStates = oldState.lastStates;
    oldState = new GameState();
    if (keepPitcher)
        oldState.pitcher = oldPitch;
    if (keepLineup)
        oldState.lineup = oldLine;
    if (keepStates)
        oldState.lastStates = oldStates;
    (0, exports.setState)(oldState);
};
exports.resetState = resetState;
/**
 * Gets the global state to use
 * @returns the global state
 */
const getState = () => {
    return stateContext.state;
};
exports.getState = getState;
/**
 * Updates the global state to the passed state
 * @param newState the new state
 */
const setState = (newState) => {
    stateContext.state = newState;
};
exports.setState = setState;

},{"../utils/LinkedList.js":18,"./Pitcher.js":3}],2:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.heatmapSize = exports.Pitch = void 0;
const numJS_js_1 = _dereq_("../utils/numJS.js");
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
        this.heatmap = (0, numJS_js_1.zeros)([(0, exports.heatmapSize)(), (0, exports.heatmapSize)()]);
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
        res.heatmap = obj.heatmap;
        return res;
    }
    /**
     * Converts this pitch into a JSON that fromObj can read
     * @returns a JSON
     */
    toObj() {
        return JSON.parse(JSON.stringify(this));
    }
}
exports.Pitch = Pitch;
/**
 * The height and width of the heatmap of each pitch in cells
 * @returns how many cells by how many cells each heatmap is
 */
const heatmapSize = () => {
    return 5;
};
exports.heatmapSize = heatmapSize;

},{"../utils/numJS.js":20}],3:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.readAllPitchers = exports.Pitcher = void 0;
const files_js_1 = _dereq_("../utils/files.js");
const Pitch_js_1 = _dereq_("./Pitch.js");
const usingNode_js_1 = _dereq_("../utils/usingNode.js");
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
     * Converts this pitcher into JSON that fromObj can read
     * @returns a JSON
     */
    toObj() {
        return {
            name: this.name,
            pitches: this.pitches,
            hand: this.hand
        };
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
const parseData_js_1 = _dereq_("../ml/parseData.js");
/**
 * Reads pitchers.json and returns all pitchers in it
 * @returns all of the pitchers in the dataset
 */
const readAllPitchers = () => {
    const node = (0, usingNode_js_1.usingNode)();
    if (parseData_js_1.idToEvent.size === 0)
        (0, parseData_js_1.findAllPitchers)();
    let objs;
    if (node) {
        objs = (0, files_js_1.readJSON)((0, files_js_1.pitcherPath)());
    }
    else {
        objs = JSON.parse(localStorage.getItem('pitchers.json'));
    }
    let res = {};
    for (const k in objs) {
        res[k] = Pitcher.fromObj(objs[k]);
    }
    return res;
};
exports.readAllPitchers = readAllPitchers;

},{"../ml/parseData.js":13,"../utils/files.js":19,"../utils/usingNode.js":36,"./Pitch.js":2}],4:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const scorebug_js_1 = _dereq_("./ui/scorebug.js");
const usingNode_js_1 = _dereq_("./utils/usingNode.js");
const init = () => {
    if (!(0, usingNode_js_1.usingNode)())
        (0, scorebug_js_1.initBug)();
};
exports.init = init;
__exportStar(_dereq_("./ui/buttons.js"), exports);
__exportStar(_dereq_("./ui/scorebug.js"), exports);

},{"./ui/buttons.js":16,"./ui/scorebug.js":17,"./utils/usingNode.js":36}],5:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.oneHotHeatmap = exports.pitchFeature = exports.getFeature = exports.numAttributes = void 0;
const numJS_js_1 = _dereq_("../utils/numJS.js");
const GameState_js_1 = _dereq_("../baseballLogic/GameState.js");
const Pitch_js_1 = _dereq_("../baseballLogic/Pitch.js");
/**
 * The total number of attributes in each feature
 * @returns the width of the features array
 */
const numAttributes = () => {
    let state = new GameState_js_1.GameState();
    state.pitcher.hand = 'R';
    state.lineup = ['R'];
    state.pitcher.pitches = { '4-seam': new Pitch_js_1.Pitch('4-seam') };
    return (0, exports.getFeature)('4-seam', state).length;
};
exports.numAttributes = numAttributes;
/**
 * Returns a feature array for the given state
 * @param pitch what pitch is being thrown
 * @param state the current game state
 * @returns the corresponding feature array
 */
const getFeature = (pitch, state) => {
    let pitchO = state.pitcher.pitches[pitch];
    return (0, exports.pitchFeature)(state, pitchO.velo, pitchO.spinRate, pitchO.spinDirection, pitchO.heatmap);
};
exports.getFeature = getFeature;
/**
 * Takes specific information about the pitch being thrown and returns the feature
 * that an ML model can use
 * @param state the current game state
 * @param velo the velocity of the pitch
 * @param spinRate the spinrate of the pitch
 * @param direc the direction of the pitch's spin in degrees
 * @param heatmap the pitch's heatmap
 * @returns one list of features
 */
const pitchFeature = (state, velo, spinRate, direc, heatmap) => {
    const radDirec = direc * Math.PI / 360;
    return [
        state.balls,
        state.strikes,
        +state.pitcherPlatoon(),
        velo,
        spinRate,
        Math.cos(radDirec),
        Math.sin(radDirec),
        ...(0, numJS_js_1.flatten)(heatmap)
    ];
};
exports.pitchFeature = pitchFeature;
/**
 * Converts the pitch's x and y location to an n x n heatmap using one-hot encoding.
 * The `0`th and `numCells - 1`th indices correspond to outside of the strike zone
 * @param x the horizontal location
 * @param y the vertical location. Called z in the dataset
 * @param numCells the width and height of the heatmap in cells e.g. `numCells = 3`
 * means a 3x3 heatmap with 9 total cells
 * @returns a one hot encoding of the heatmap
 */
const oneHotHeatmap = (x, y, numCells) => {
    y *= -1;
    let res = (0, numJS_js_1.zeros)([numCells, numCells]);
    const inZone = numCells - 2;
    const cellWidth = 2 / inZone;
    const translate = 1 + cellWidth;
    const getInd = (loc) => {
        return Math.min(Math.max(Math.floor((loc + translate) / cellWidth), 0), numCells - 1);
    };
    res[getInd(y)][getInd(x)] = 1;
    return res;
};
exports.oneHotHeatmap = oneHotHeatmap;

},{"../baseballLogic/GameState.js":1,"../baseballLogic/Pitch.js":2,"../utils/numJS.js":20}],6:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ensemble = void 0;
const random_js_1 = _dereq_("../../utils/random.js");
const MachineLearning_js_1 = _dereq_("./MachineLearning.js");
const numJS_js_1 = _dereq_("../../utils/numJS.js");
class Ensemble extends MachineLearning_js_1.MachineLearning {
    /**
     * A model that combines the predictions of several different models to make its predictions
     * @param models either a function that generates a new untrained ML model or a list of untrained models
     * @param numModels how many models to use. Not necessary if models is an array
     */
    constructor(models, numModels) {
        super();
        if (typeof models === 'function') {
            if (typeof numModels === 'undefined') {
                throw new Error('numModels must be specified when constructor is passed a generator function');
            }
            this._models = [];
            for (let i = 0; i < numModels; i++) {
                this._models.push(models());
            }
        }
        else {
            this._models = models;
        }
    }
    /**
     * Trains each child model on the given features and targets
     * @param features the dependent variables to train on
     * @param targets the response variables
     * @param perModel what fraction of samples to send to each child model. Default
     * is to `1 / this._models.length`
     */
    fitAsync(features, targets, perModel) {
        return __awaiter(this, void 0, void 0, function* () {
            perModel = perModel || (1 / this._models.length);
            const sampsPer = Math.floor(features.length * perModel);
            const inds = (0, numJS_js_1.arange)(features.length);
            (0, random_js_1.shuffle)(inds);
            let featureCuts = [];
            let targetCuts = [];
            for (let m = 0; m < this._models.length; m++) {
                const start = m * sampsPer;
                const end = start + sampsPer;
                const indSlice = inds.slice(start, end);
                featureCuts.push((0, numJS_js_1.arrIndex)(features, indSlice));
                targetCuts.push((0, numJS_js_1.arrIndex)(targets, indSlice));
            }
            let fitPromises = [];
            for (let m = 0; m < this._models.length; m++) {
                fitPromises.push(this._models[m].fit(featureCuts[m], targetCuts[m]));
            }
            yield Promise.all(fitPromises);
        });
    }
    predict(features) {
        return (0, numJS_js_1.colAverage)(this._models.map((m) => m.predict(features)));
    }
}
exports.Ensemble = Ensemble;

},{"../../utils/numJS.js":20,"../../utils/random.js":35,"./MachineLearning.js":8}],7:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnsembleClassifier = void 0;
const Ensemble_js_1 = _dereq_("./Ensemble.js");
const RegToClf_js_1 = _dereq_("./RegToClf.js");
class EnsembleClassifier extends Ensemble_js_1.Ensemble {
    /**
     * A model that uses children all trained to be binary
     * classifiers to make predictions that are then aggregated
     * and interpreted as probabilities of each class outcome
     * @param models either a function that generates a new untrained ML model or a list of untrained models
     * @param numModels how many models to use. Not necessary if models is an array
     */
    constructor(models, numModels) {
        super(models, numModels);
        this._models = this._models.map(RegToClf_js_1.regToClf);
    }
}
exports.EnsembleClassifier = EnsembleClassifier;

},{"./Ensemble.js":6,"./RegToClf.js":9}],8:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MachineLearning = void 0;
class MachineLearning {
    /**
     * The abstract base class for all machine learning models
     */
    /**
     * Fits the model based on the given features and targets
     * @param features the dependent variables to train on
     * @param targets the response variables
     */
    fit(features, targets) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fitAsync(features, targets);
        });
    }
}
exports.MachineLearning = MachineLearning;

},{}],9:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.regToClf = exports.RegToClf = void 0;
const MachineLearning_js_1 = _dereq_("./MachineLearning.js");
const numJS_js_1 = _dereq_("../../utils/numJS.js");
const random_js_1 = _dereq_("../../utils/random.js");
class RegToClf extends MachineLearning_js_1.MachineLearning {
    /**
     * Uses a regression model as a binary classifier, converting its outputs
     * to either zero or one
     * @param model the regression model to use
     */
    constructor(model) {
        super();
        /**
         * Converts the numeric array to one of all ones and zeros. For each value,
         * if the value is greater than `threshold` (default is 0), the outputted value
         * is one, otherwise it is zero
         * @param arr the array to binarize
         * @param threshold the threshold at which to split the data into ones and zeros
         * @returns an array of ones and zeros
         */
        this.toBinary = (arr, threshold = 0) => {
            return (0, numJS_js_1.toNum)((0, numJS_js_1.arrGT)(arr, threshold));
        };
        this._model = model;
    }
    fitAsync(features, targets) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._model.fit(...this.equalClasses(features, targets));
        });
    }
    predict(features) {
        return this.toBinary(this._model.predict(features), 0.5);
    }
    /**
     * Removes features and targets to ensure that there is an equal amount
     * of samples of each class
     * @param features the 2D array of features
     * @param targets the 1D array of targets as passed into the fit function
     * @returns the new features and targets array
     */
    equalClasses(features, targets) {
        const binTargs = this.toBinary(targets);
        const inds = (0, numJS_js_1.arange)(features.length);
        let byClass = [[], []];
        for (let i = 0; i < binTargs.length; i++) {
            byClass[binTargs[i]].push(inds[i]);
        }
        const smaller = (0, numJS_js_1.argMin)(byClass.map(a => a.length));
        (0, random_js_1.shuffle)(byClass[1 - smaller]);
        byClass[1 - smaller] = byClass[1 - smaller].slice(0, byClass[smaller].length);
        const newInds = byClass[0].concat(byClass[1]);
        (0, random_js_1.shuffle)(newInds);
        return [
            (0, numJS_js_1.arrIndex)(features, newInds),
            (0, numJS_js_1.arrIndex)(binTargs, newInds)
        ];
    }
}
exports.RegToClf = RegToClf;
/**
 * Factory function for a regression-to-classifier model
 * @param model the regression model to use
 * @returns the classifier that uses model to make its classifications
 */
const regToClf = (model) => {
    return new RegToClf(model);
};
exports.regToClf = regToClf;

},{"../../utils/numJS.js":20,"../../utils/random.js":35,"./MachineLearning.js":8}],10:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.regression = exports.Regression = void 0;
const MachineLearning_js_1 = _dereq_("./MachineLearning.js");
const ml_matrix_1 = _dereq_("ml-matrix");
class Regression extends MachineLearning_js_1.MachineLearning {
    /**
     * Finds a line of best fit of nth degree to make predictions
     * @param degree the degree of the polynomial describing the trendline
     * @param fixSingular whether to change the features to try and make them
     * not singular. This also scales the features to have a mean of zero and
     * a standard deviation of one
     */
    constructor(degree = 2, fixSingular = true) {
        super();
        this._degree = degree;
        this._fixSingular = fixSingular;
    }
    fitAsync(features, targets) {
        return __awaiter(this, void 0, void 0, function* () {
            if (features.length === 0)
                return;
            // if (this._fixSingular) {
            //     features = standardScale(features, true) as number[][];
            // }
            // const zs = this.fillZs(features);
            // const zsT = transpose(zs);
            const zs = new ml_matrix_1.Matrix(this.fillZs(features));
            const zsT = zs.transpose();
            // (zs^T * zs)^-1 * (zs^T * tarMat)
            // const left: number[][] = matMul(zsT, zs) as number[][];
            // const inv = invert(left);
            // const right = matMul(zsT, targets);
            // this._w = matMul(inv, right) as number[];
            const left = zsT.mmul(zs);
            const inv = (0, ml_matrix_1.inverse)(left, true);
            const right = zsT.mmul(ml_matrix_1.Matrix.columnVector(targets));
            this._w = inv.mmul(right).to1DArray();
        });
    }
    predict(features) {
        if (features.length === 0)
            return [];
        // if (this._fixSingular) {
        //     features = standardScale(features, false) as number[][];
        // }
        // return matMul(this.fillZs(features), this._w) as number[];
        return (new ml_matrix_1.Matrix(this.fillZs(features))
            .mmul(ml_matrix_1.Matrix.columnVector(this._w))
            .to1DArray());
    }
    /**
     * Fills out the features array to include the additional terms required to make
     * this model better than just linear regression
     * @param features the 2D array of features
     * @returns a matrix with all terms to use in training
     */
    fillZs(features) {
        let res = [];
        for (let i = 0; i < features.length; i++) {
            let row = [1];
            for (let j = 0; j < features[i].length; j++) {
                const point = features[i][j];
                let current = point;
                for (let d = 0; d < this._degree; d++) {
                    row.push(current);
                    current *= point;
                }
            }
            res.push(row);
        }
        return res;
    }
}
exports.Regression = Regression;
/**
 * Factory function for a default Regression
 * @returns default regression model
 */
const regression = () => {
    return new Regression();
};
exports.regression = regression;

},{"./MachineLearning.js":8,"ml-matrix":43}],11:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLearner = exports.ensembleChildren = void 0;
const trainTest_js_1 = _dereq_("../trainTest.js");
const Regression_js_1 = _dereq_("./Regression.js");
// import { KNNBall } from "./KNNBall.js";
const EnsembleClassifier_js_1 = _dereq_("./EnsembleClassifier.js");
exports.ensembleChildren = 100;
/**
 * Trains the machine learning network that will predict
 * the expected reward given the current state and what pitch
 * is being thrown.
 * @param numChildren the number of children to use in the ensemble method.
 * Default is 100
 * @returns a machine learning model for selecting pitches
 */
const getLearner = (numChildren = exports.ensembleChildren) => __awaiter(void 0, void 0, void 0, function* () {
    let res = new EnsembleClassifier_js_1.EnsembleClassifier(() => new Regression_js_1.Regression(2), numChildren);
    const [feats, targs] = (0, trainTest_js_1.completeFeatsTargs)();
    yield res.fit(feats, targs);
    return res;
});
exports.getLearner = getLearner;

},{"../trainTest.js":15,"./EnsembleClassifier.js":7,"./Regression.js":10}],12:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWs = exports.nextPitch = void 0;
const mappings_js_1 = _dereq_("./mappings.js");
const GameState_js_1 = _dereq_("../baseballLogic/GameState.js");
const random_js_1 = _dereq_("../utils/random.js");
const numJS_1 = _dereq_("../utils/numJS");
/**
 * Given the current game state, computes the next pitch to throw
 * Current game state is in global "state" variable
 * @param learner the ML model to use for predictions
 * @returns what pitch to throw
 */
const nextPitch = (learner) => {
    const state = (0, GameState_js_1.getState)();
    const pitches = Object.keys(state.pitcher.pitches).filter(name => {
        return state.pitcher.pitches[name].timesThrown > 0.05;
    });
    return (0, random_js_1.choice)(pitches, (0, exports.getWs)(learner, pitches));
};
exports.nextPitch = nextPitch;
/**
 * Returns the cumulative weights for each given pitch
 * @param learner the ML model to use to predict the value of each pitch
 * @param pitches the pitches to weight
 * @returns the cumulative weights for each pitch
 */
const getWs = (learner, pitches) => {
    const state = (0, GameState_js_1.getState)();
    const feats = pitches.map((pitch) => (0, mappings_js_1.getFeature)(pitch, state));
    const rewards = learner.predict(feats);
    const weights = rewards.map(numJS_1.sigmoid);
    let cum = [weights[0]];
    for (let i = 1; i < rewards.length; i++) {
        cum.push(cum[i - 1] + weights[i]);
    }
    return cum;
};
exports.getWs = getWs;

},{"../baseballLogic/GameState.js":1,"../utils/numJS":20,"../utils/random.js":35,"./mappings.js":5}],13:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.playTypes = exports.pitchAbbreviations = exports.findAllPitchers = exports.getPlayType = exports.aidToPitcher = exports.abToPlat = exports.idToEvent = void 0;
const files_js_1 = _dereq_("../utils/files.js");
const Pitch_js_1 = _dereq_("../baseballLogic/Pitch.js");
const Pitcher_js_1 = _dereq_("../baseballLogic/Pitcher.js");
const usingNode_js_1 = _dereq_("../utils/usingNode.js");
const mappings_js_1 = _dereq_("./mappings.js");
const numJS_js_1 = _dereq_("../utils/numJS.js");
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
 * @param state the current game state
 * @returns the play type as a key into rewards
 */
const getPlayType = (result, event, state) => {
    const pTypes = (0, exports.playTypes)();
    if (!(result in pTypes)) {
        throw new Error(`Unexpected result: ${result}`);
    }
    result = pTypes[result];
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
    else if (result === 'b' && state.balls === 3) {
        return 'bb';
    }
    else if (result === 'k' && state.strikes === 2) {
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
                case 'Double':
                    return '2b';
                case 'Triple':
                    return '3b';
                case 'Home Run':
                    return 'hr';
                case 'Fielders Choice':
                    return '1b';
                case 'Catcher Interference':
                    return '1b';
                default:
                    throw new Error(`Unexpected hit type ${event}`);
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
    if ((0, usingNode_js_1.usingNode)()) {
        let accum = {};
        const dPaths = (0, files_js_1.dataPaths)();
        const rawName = 'raw.ignore.csv';
        const paths = [
            dPaths.train + rawName,
            dPaths.valid + rawName,
            dPaths.test + rawName
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
                pitchO.heatmap = (0, numJS_js_1.scalarMul)(pitchO.heatmap, 1 / pitchO.timesThrown);
            }
            for (const p in accum[player].pitches) {
                accum[player].pitches[p].timesThrown /= total;
            }
        }
        let toWrite = {};
        for (const p in accum) {
            toWrite[p] = accum[p].toObj();
        }
        (0, files_js_1.writeJSON)((0, files_js_1.pitcherPath)(), toWrite);
    }
    else {
        localStorage.setItem('pitchers.json', JSON.stringify((0, files_js_1.readJSON)((0, files_js_1.pitcherPath)())));
    }
};
exports.findAllPitchers = findAllPitchers;
/**
 * Goes through the data at path and records all pitchers in it
 * @param path where to find the spreadsheet of all pitches to read
 * @param pitchers the JSONs read thus far. This will be updated by the function
 */
const pitchersInSheet = (path, pitchers) => {
    const dPaths = (0, files_js_1.dataPaths)();
    let names = (0, files_js_1.readSpreadSheet)(dPaths.playerNames);
    for (const player of names) {
        idToName.set(parseInt(player['id']), `${player['first_name']} ${player['last_name']}`);
    }
    names = undefined; // free up memory hopefully
    let abs = (0, files_js_1.readSpreadSheet)(dPaths.atBats);
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
    const abbrs = (0, exports.pitchAbbreviations)();
    for (const p of pitches) {
        const pid = abToPitcher.get(parseInt(p['ab_id']));
        const playerName = idToName.get(pid);
        if (typeof playerName === 'undefined') {
            continue;
        }
        if (!(playerName in pitchers)) {
            pitchers[playerName] = new Pitcher_js_1.Pitcher(playerName, idToHand.get(pid));
        }
        const pitchName = abbrs[p['pitch_type']];
        if (typeof pitchName !== 'undefined') {
            if (!(pitchName in pitchers[playerName].pitches)) {
                pitchers[playerName].pitches[pitchName] = new Pitch_js_1.Pitch(pitchName);
            }
            const sRate = parseFloat(p['spin_rate']);
            const sDirec = parseFloat(p['spin_dir']);
            const velo = parseFloat(p['start_speed']);
            const x = parseFloat(p['px']);
            const z = parseFloat(p['pz']);
            if ((0, numJS_js_1.any)([sRate, sDirec, velo, x, z].map(isNaN)))
                continue;
            const pitchObj = pitchers[playerName].pitches[pitchName];
            pitchObj.timesThrown += 1;
            pitchObj.velo += velo;
            pitchObj.spinRate += sRate;
            pitchObj.spinDirection += sDirec;
            pitchObj.heatmap = (0, numJS_js_1.addArrays)(pitchObj.heatmap, (0, mappings_js_1.oneHotHeatmap)(x, z, (0, Pitch_js_1.heatmapSize)()));
        }
    }
};
/**
 * Maps the pitch abbreviations found in the spreadsheets into a full pitch name
 * @returns a mapping from abbreviation to pitch name
 */
const pitchAbbreviations = () => {
    return {
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
};
exports.pitchAbbreviations = pitchAbbreviations;
/**
 * Returns a mapping from the play abbreviations the spreadsheet uses to play types
 * used by dispatch
 * @returns a mapping from spreadsheet abbreviations to ones used by this code
 */
const playTypes = () => {
    return {
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
};
exports.playTypes = playTypes;

},{"../baseballLogic/Pitch.js":2,"../baseballLogic/Pitcher.js":3,"../utils/files.js":19,"../utils/numJS.js":20,"../utils/usingNode.js":36,"./mappings.js":5}],14:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.woba = exports.rewards = void 0;
/**
 * Finds the reward given the current reward and what happened.
 * Values courtesy of https://www.draysbay.com/platform/amp/2016/4/28/11521790/an-introduction-to-per-pitch-run-values.
 * Higher reward is better
 * @param res what happened
 * @returns the run value of that pitch
 */
const rewards = (res, state) => {
    const oldWoba = (0, exports.woba)(state);
    let newWoba;
    switch (res) {
        case 'k':
            newWoba = getWoba(state.balls, state.strikes + 1);
            break;
        case 'b':
            newWoba = getWoba(state.balls + 1, state.strikes);
            break;
        case 'f':
            newWoba = getWoba(state.balls, Math.min(state.strikes + 1, 2));
            break;
        case 'kk':
            newWoba = 0;
            break;
        case 'o':
            newWoba = 0;
            break;
        case 'bb':
            newWoba = 0.72;
            break;
        case 'dp':
            newWoba = -oldWoba;
            break;
        case '1b':
            newWoba = 0.892;
            break;
        case '2b':
            newWoba = 1.283;
            break;
        case '3b':
            newWoba = 1.635;
            break;
        case 'hr':
            newWoba = 2.135;
            break;
        default:
            throw new Error(`Unexpected result ${res}`);
    }
    return oldWoba - newWoba;
};
exports.rewards = rewards;
/**
 * Returns the expected weight on base average (wOBA) given the
 * current game state. Also courtesy of
 * https://www.draysbay.com/platform/amp/2016/4/28/11521790/an-introduction-to-per-pitch-run-values
 * @param balls the number of balls in the count
 * @param strikes the number of strikes in the count
 * @returns the expected wOBA
 */
const getWoba = (balls, strikes) => {
    const arr = [
        [0.31, 0.262, 0.196],
        [0.355, 0.293, 0.223],
        [0.436, 0.352, 0.273],
        [0.622, 0.47, 0.384]
    ];
    return arr[balls][strikes];
};
/**
 * Returns the expected weight on base average (wOBA) given the
 * current game state. Also courtesy of
 * https://www.draysbay.com/platform/amp/2016/4/28/11521790/an-introduction-to-per-pitch-run-values
 * @param state the current game state
 * @returns the expected wOBA
 */
const woba = (state) => {
    return getWoba(state.balls, state.strikes);
};
exports.woba = woba;

},{}],15:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeFeatsTargs = exports.testFeatsTargs = exports.validFeatsTargs = exports.trainFeatsTargs = exports.extractFeaturesTargets = exports.learnerMSE = exports.trainLearner = exports.allFeatsTargs = void 0;
const parseData_js_1 = _dereq_("./parseData.js");
const Pitcher_js_1 = _dereq_("../baseballLogic/Pitcher.js");
const files_js_1 = _dereq_("../utils/files.js");
const GameState_js_1 = _dereq_("../baseballLogic/GameState.js");
const rewards_js_1 = _dereq_("./rewards.js");
const mappings_js_1 = _dereq_("./mappings.js");
const numJS_js_1 = _dereq_("../utils/numJS.js");
const Pitch_js_1 = _dereq_("../baseballLogic/Pitch.js");
/**
 * Splits the spreadsheet into features and targets
 * @param data the read spreadsheet
 * @returns the features of data and the targets
 */
const allFeatsTargs = (data) => {
    const allPitchers = (0, Pitcher_js_1.readAllPitchers)();
    let features = [];
    let targets = [];
    for (const row of data) {
        const [f, t] = (0, exports.extractFeaturesTargets)(row, allPitchers);
        if (f.length > 0) {
            features.push(f);
            targets.push(t);
        }
    }
    return [
        features,
        targets
    ];
};
exports.allFeatsTargs = allFeatsTargs;
/**
 * Trains the learner on the appropriate dataset
 */
const trainLearner = (learner) => __awaiter(void 0, void 0, void 0, function* () {
    const [features, targets] = (0, exports.trainFeatsTargs)();
    yield learner.fit(features, targets);
});
exports.trainLearner = trainLearner;
/**
 * Returns the mean squared error and the predictions of learner on the validation set
 * @returns the mse
 */
const learnerMSE = (learner) => {
    const [features, targets] = (0, exports.validFeatsTargs)();
    const preds = learner.predict(features);
    return [(0, numJS_js_1.mse)(preds, targets), preds];
};
exports.learnerMSE = learnerMSE;
/**
 * Extracts the set of features and the target from one row
 * @param play one row of data
 * @returns the features of that row and the target
 */
const extractFeaturesTargets = (play, allPitchers) => {
    const aid = parseInt(play['ab_id']);
    let result = play['code'];
    let event = parseData_js_1.idToEvent.get(aid);
    const x = parseFloat(play['px']);
    const z = parseFloat(play['pz']);
    if (isNaN(aid) ||
        result === '' ||
        isNaN(x) ||
        isNaN(z)) {
        return [[], 0];
    }
    if (typeof result === 'undefined') {
        throw new Error(`Undefined result with event ${event} and aid ${aid}`);
    }
    if (typeof event === 'undefined') {
        throw new Error(`Undefined event with result ${result} and aid ${aid}`);
    }
    let state = new GameState_js_1.GameState();
    state.pitcher = (0, parseData_js_1.aidToPitcher)(aid, allPitchers);
    if (typeof state.pitcher === 'undefined') {
        return [[], 0];
    }
    state.bases = [
        !!parseInt(play['on_1b']),
        !!parseInt(play['on_2b']),
        !!parseInt(play['on_3b'])
    ];
    state.lineSpot = 0;
    if (parseData_js_1.abToPlat.get(aid)) {
        state.lineup = [state.pitcher.hand];
    }
    else {
        state.lineup = ['Z'];
    }
    state.balls = parseInt(play['b_count']);
    state.strikes = parseInt(play['s_count']);
    state.outs = parseInt(play['outs']);
    result = (0, parseData_js_1.getPlayType)(result, event, state);
    const target = (0, rewards_js_1.rewards)(result, state);
    const features = (0, mappings_js_1.pitchFeature)(state, parseFloat(play['start_speed']), parseFloat(play['spin_rate']), parseFloat(play['spin_dir']), (0, mappings_js_1.oneHotHeatmap)(x, z, (0, Pitch_js_1.heatmapSize)()));
    return [features, target];
};
exports.extractFeaturesTargets = extractFeaturesTargets;
/**
 * Splits the data read from a CSV into a 2D array of floats
 * @param data the raw string data from the CSV file
 * @returns a float matrix
 */
const splitCSV = (data) => {
    return (0, numJS_js_1.ndMap)(data.split('\n').map(r => r.split(',')), parseFloat);
};
/**
 * Reads the features csv and targets csv from dirName
 * @param dirName the path from the root directory to the relevant files
 * @returns the features and targets array
 */
const fromDir = (dirName) => {
    return [
        splitCSV((0, files_js_1.readFile)(dirName + 'feats.ignore.csv', 'utf-8')),
        splitCSV((0, files_js_1.readFile)(dirName + 'targs.ignore.csv', 'utf-8')).flat()
    ];
};
/**
 * Returns all the features and targets for training an ML model
 * @returns the features and targets from 'train/raw.ignore..csv'
 */
const trainFeatsTargs = () => {
    return fromDir((0, files_js_1.dataPaths)().train);
};
exports.trainFeatsTargs = trainFeatsTargs;
/**
 * Returns all the features and targets for validating an ML model
 * @returns the features and the targets from 'valid/raw.ignore.csv'
 */
const validFeatsTargs = () => {
    return fromDir((0, files_js_1.dataPaths)().valid);
};
exports.validFeatsTargs = validFeatsTargs;
/**
 * Returns all the features and targets for testing an ML model
 * @returns the features and targets from 'test/raw.ignore.csv'
 */
const testFeatsTargs = () => {
    return fromDir((0, files_js_1.dataPaths)().test);
};
exports.testFeatsTargs = testFeatsTargs;
/**
 * Returns the concatenation of the training, validation, and testing sets
 * @returns all features and targets from all sets
 */
const completeFeatsTargs = () => {
    const arrs = [
        (0, exports.trainFeatsTargs)(),
        (0, exports.validFeatsTargs)(),
        (0, exports.testFeatsTargs)()
    ];
    return [
        [].concat(...arrs.map(a => a[0])),
        [].concat(...arrs.map(a => a[1]))
    ];
};
exports.completeFeatsTargs = completeFeatsTargs;

},{"../baseballLogic/GameState.js":1,"../baseballLogic/Pitch.js":2,"../baseballLogic/Pitcher.js":3,"../utils/files.js":19,"../utils/numJS.js":20,"./mappings.js":5,"./parseData.js":13,"./rewards.js":14}],16:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.undo = exports.lineout = exports.flyout = exports.groundout = exports.doublePlay = exports.error = exports.out = exports.homeRun = exports.triple = exports.double = exports.single = exports.foul = exports.strike = exports.ball = void 0;
const GameState_js_1 = _dereq_("../baseballLogic/GameState.js");
const scorebug_js_1 = _dereq_("./scorebug.js");
const ball = () => {
    const state = (0, GameState_js_1.getState)();
    changeState(state, state.ball);
};
exports.ball = ball;
const strike = () => {
    const state = (0, GameState_js_1.getState)();
    changeState(state, state.strike);
};
exports.strike = strike;
const foul = () => {
    const state = (0, GameState_js_1.getState)();
    changeState(state, state.foul);
};
exports.foul = foul;
const single = () => {
    const state = (0, GameState_js_1.getState)();
    changeState(state, state.single);
};
exports.single = single;
const double = () => {
    const state = (0, GameState_js_1.getState)();
    changeState(state, state.double);
};
exports.double = double;
const triple = () => {
    const state = (0, GameState_js_1.getState)();
    changeState(state, state.triple);
};
exports.triple = triple;
const homeRun = () => {
    const state = (0, GameState_js_1.getState)();
    changeState(state, state.homeRun);
};
exports.homeRun = homeRun;
const out = () => {
    const state = (0, GameState_js_1.getState)();
    changeState(state, state.out);
};
exports.out = out;
const error = () => {
    const state = (0, GameState_js_1.getState)();
    changeState(state, state.error);
};
exports.error = error;
const doublePlay = () => {
    const state = (0, GameState_js_1.getState)();
    changeState(state, state.doublePlay);
};
exports.doublePlay = doublePlay;
const groundout = () => {
    const state = (0, GameState_js_1.getState)();
    changeState(state, state.groundout);
};
exports.groundout = groundout;
const flyout = () => {
    const state = (0, GameState_js_1.getState)();
    changeState(state, state.flyout);
};
exports.flyout = flyout;
const lineout = () => {
    const state = (0, GameState_js_1.getState)();
    changeState(state, state.lineout);
};
exports.lineout = lineout;
const undo = () => {
    const state = (0, GameState_js_1.getState)();
    changeState(state, state.undo);
};
exports.undo = undo;
/**
 * Changes the state and updates the html safely
 * @param state the state to update
 * @param meth which of the state's methods to use
 */
const changeState = (state, meth) => {
    meth.bind(state)();
    (0, GameState_js_1.setState)(state);
    (0, scorebug_js_1.updateBug)();
};

},{"../baseballLogic/GameState.js":1,"./scorebug.js":17}],17:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initBug = exports.sendLineSpot = exports.toggleShowLineup = exports.filterPitcher = exports.toggleDropdown = exports.addBall = exports.addStrike = exports.updateBug = exports.updateNext = exports.changeLineSpot = exports.changeLineup = exports.changePitcher = exports.toggleOuts = exports.toggleBase = void 0;
const GameState_js_1 = _dereq_("../baseballLogic/GameState.js");
const Pitcher_js_1 = _dereq_("../baseballLogic/Pitcher.js");
const usingNode_js_1 = _dereq_("../utils/usingNode.js");
const utilities_js_1 = _dereq_("../utils/utilities.js");
const nextPitch_js_1 = _dereq_("../ml/nextPitch.js");
const getLearner_js_1 = _dereq_("../ml/models/getLearner.js");
/**
 * Toggles whether the base is occupied or not
 * @param baseInd which base to toggle
 */
const toggleBase = (baseInd) => {
    const state = (0, GameState_js_1.getState)();
    state.backup();
    state.bases[baseInd] = !state.bases[baseInd];
    (0, GameState_js_1.setState)(state);
    (0, exports.updateBug)();
};
exports.toggleBase = toggleBase;
/**
 * Toggles whether there are outInd outs
 * @param outInd which out button was clicked (0, 1, or 2)
 */
const toggleOuts = (outInd) => {
    const state = (0, GameState_js_1.getState)();
    state.backup();
    if (outInd === 2) {
        if (state.outs === 0) {
            state.undo();
        }
        state.outs = 0;
    }
    else {
        state.outs = outInd + +(outInd >= state.outs);
    }
    (0, GameState_js_1.setState)(state);
    (0, exports.updateBug)();
};
exports.toggleOuts = toggleOuts;
/**
 * Changes who's throwing
 * @param pitcherName the new pitcher
 */
const changePitcher = (pitcherName) => {
    const state = (0, GameState_js_1.getState)();
    const allPitchers = (0, Pitcher_js_1.readAllPitchers)();
    if (pitcherName !== state.pitcher.name && pitcherName in allPitchers) {
        state.backup();
        state.pitcher = allPitchers[pitcherName];
    }
    (0, GameState_js_1.setState)(state);
    (0, exports.updateBug)();
};
exports.changePitcher = changePitcher;
/**
 * Changes the handnedness of the lineup
 * @param newLineup the new lineup
 */
const changeLineup = (newLineup) => {
    const state = (0, GameState_js_1.getState)();
    if (newLineup.length === state.lineup.length) {
        const allowed = ['R', 'L', 'S'];
        let diff = false;
        for (let i = 0; i < newLineup.length; i++) {
            if (!allowed.includes(newLineup[i]))
                return;
            diff || (diff = newLineup[i] !== state.lineup[i]);
        }
        if (!diff)
            return;
        state.backup();
        state.lineup = newLineup;
        (0, GameState_js_1.setState)(state);
        (0, exports.updateBug)();
    }
};
exports.changeLineup = changeLineup;
/**
 * Changes where in the order we are
 * @param newSpot the new lineup spot
 */
const changeLineSpot = (newSpot) => {
    const state = (0, GameState_js_1.getState)();
    if (newSpot >= 0 && newSpot < 9 && newSpot !== state.lineSpot) {
        state.backup();
        state.lineSpot = newSpot;
    }
    (0, GameState_js_1.setState)(state);
    // not udpating bug because sendLineSpot does that for us
};
exports.changeLineSpot = changeLineSpot;
let learner;
/**
 * Finds the next pitch to throw and updates the html
 * to reflect that
 */
const updateNext = () => {
    if (typeof learner === 'undefined' ||
        Object.keys((0, GameState_js_1.getState)().pitcher.pitches).length === 0) {
        return;
    }
    (0, utilities_js_1.$)('next-pitch').innerHTML = 'Next pitch: ' + (0, nextPitch_js_1.nextPitch)(learner);
};
exports.updateNext = updateNext;
/**
 * Updates the scorebug based on the current state
 */
const updateBug = () => {
    if (!(0, usingNode_js_1.usingNode)()) {
        const state = (0, GameState_js_1.getState)();
        const baseIds = [
            'first-base',
            'second-base',
            'third-base'
        ];
        for (let i = 0; i < baseIds.length; i++) {
            const file = state.bases[i] ? 'occupied' : 'empty';
            (0, utilities_js_1.$)(baseIds[i]).src = `../../assets/${file}.png`;
        }
        const outIds = [
            'one-out',
            'two-out',
        ];
        for (let i = 0; i < outIds.length; i++) {
            const file = state.outs > i ? 'out' : 'no-out';
            (0, utilities_js_1.$)(outIds[i]).src = `../../assets/${file}.png`;
        }
        (0, utilities_js_1.$)('count-text').innerHTML = `${state.balls}-${state.strikes}`;
        let pitcherName = 'Pitching: ' + state.pitcher.name;
        if (state.pitcher.hand !== '')
            pitcherName += ` (${state.pitcher.hand})`;
        (0, utilities_js_1.$)('drop-button').innerHTML = pitcherName;
        (0, utilities_js_1.$)('lineup-button').innerHTML = `Batter: ${state.lineup[state.lineSpot]}`;
        (0, utilities_js_1.$)('lineup-text').value = state.lineup.join(', ');
        (0, utilities_js_1.$)('change-linespot').value = (state.lineSpot + 1).toString();
        (0, exports.updateNext)();
    }
};
exports.updateBug = updateBug;
/**
 * Adds toAdd to the global state's strike count
 * @param toAdd how much to add. Can be negative
 */
const addStrike = (toAdd) => {
    const state = (0, GameState_js_1.getState)();
    const newS = state.strikes + toAdd;
    if (newS >= 0) {
        state.backup();
        state.strikes = newS;
        (0, GameState_js_1.setState)(state);
        (0, exports.updateBug)();
    }
};
exports.addStrike = addStrike;
/**
 * Adds toAdd to the global state's ball count
 * @param toAdd how much to add. Can be negative
 */
const addBall = (toAdd) => {
    const state = (0, GameState_js_1.getState)();
    const newB = state.balls + toAdd;
    if (newB >= 0) {
        state.backup();
        state.balls = newB;
        (0, GameState_js_1.setState)(state);
        (0, exports.updateBug)();
    }
};
exports.addBall = addBall;
/**
 * Toggles whether the dropdown to change the pitcher is active or not
 */
const toggleDropdown = () => {
    if (!(0, usingNode_js_1.usingNode)()) {
        (0, utilities_js_1.$)('pitcher-dropdown').classList.toggle('show');
        const pInput = (0, utilities_js_1.$)('pitcher-input');
        pInput.value = '';
        (0, exports.filterPitcher)();
        if (pInput === document.activeElement) {
            pInput.blur();
        }
        else {
            pInput.focus();
        }
    }
};
exports.toggleDropdown = toggleDropdown;
/**
 * Finds the pitcher that the user inputted
 */
const filterPitcher = () => {
    if (!(0, usingNode_js_1.usingNode)()) {
        const input = (0, utilities_js_1.$)('pitcher-input');
        const filter = input.value.toLowerCase();
        const div = (0, utilities_js_1.$)('pitcher-dropdown');
        const buttons = div.getElementsByTagName('button');
        for (let i = 0; i < buttons.length; i++) {
            const pName = buttons[i].textContent || buttons[i].innerText;
            if (pName.toLowerCase().indexOf(filter) > -1) {
                buttons[i].style.display = '';
            }
            else {
                buttons[i].style.display = 'none';
            }
        }
    }
};
exports.filterPitcher = filterPitcher;
/**
 * Reads the pitchers from disk and adds the names to the dropdown menu
 */
const initPitcherDropdown = () => {
    if (!(0, usingNode_js_1.usingNode)()) {
        const dropdown = (0, utilities_js_1.$)('pitcher-names');
        const allPs = (0, Pitcher_js_1.readAllPitchers)();
        const names = Object.keys(allPs).sort(utilities_js_1.nameLT);
        for (const name of names) {
            const newB = document.createElement('button');
            newB.innerText = name + ` (${allPs[name].hand})`;
            newB.className = 'pitcher-name';
            newB.onclick = () => {
                (0, exports.toggleDropdown)();
                (0, exports.changePitcher)(name);
            };
            dropdown.appendChild(newB);
        }
    }
};
/**
 * Toggles the display of the current lineup
 */
const toggleShowLineup = () => {
    if (!(0, usingNode_js_1.usingNode)()) {
        const changeDiv = (0, utilities_js_1.$)('change-lineup');
        const otherDisp = 'block';
        const text = (0, utilities_js_1.$)('lineup-text');
        if (changeDiv.style.display !== otherDisp) {
            changeDiv.style.display = otherDisp;
            text.focus();
        }
        else {
            changeDiv.style.display = 'none';
            text.blur();
            sendLineup();
        }
    }
};
exports.toggleShowLineup = toggleShowLineup;
/**
 * Finds the value of the lineup form and sends that to the global state
 */
const sendLineup = () => {
    if (!(0, usingNode_js_1.usingNode)()) {
        const raw = (0, utilities_js_1.$)('lineup-text').value;
        const lst = raw.toUpperCase().replace(/\s+/g, '').split(',');
        (0, exports.changeLineup)(lst);
    }
};
/**
 * Retrieves the user's lineup spot and updates the game state
 */
const sendLineSpot = () => {
    if (!(0, usingNode_js_1.usingNode)()) {
        const input = (0, utilities_js_1.$)('change-linespot');
        const asInt = parseInt(input.value);
        if (typeof asInt !== undefined) {
            (0, exports.changeLineSpot)(asInt - 1);
        }
        (0, exports.updateBug)();
    }
};
exports.sendLineSpot = sendLineSpot;
/**
 * Initializes the element the user uses to change the lineup and the linespot
 */
const initLineup = () => {
    (0, utilities_js_1.$)('change-linespot').addEventListener('focusout', exports.sendLineSpot);
};
/**
 * Creates and trains the machine learning model responsible for choosing
 * the next pitch
 */
const initBug = () => __awaiter(void 0, void 0, void 0, function* () {
    (0, GameState_js_1.setState)(new GameState_js_1.GameState());
    learner = yield (0, getLearner_js_1.getLearner)();
    initPitcherDropdown();
    initLineup();
    (0, exports.updateBug)();
});
exports.initBug = initBug;

},{"../baseballLogic/GameState.js":1,"../baseballLogic/Pitcher.js":3,"../ml/models/getLearner.js":11,"../ml/nextPitch.js":12,"../utils/usingNode.js":36,"../utils/utilities.js":37}],18:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
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

},{}],19:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataPaths = exports.pitcherPath = exports.writeJSON = exports.readJSON = exports.readSpreadSheet = exports.writeFile = exports.readFile = void 0;
const usingNode_js_1 = _dereq_("./usingNode.js");
if ((0, usingNode_js_1.usingNode)()) {
    let fs = eval('require("fs")');
    exports.readFile = fs.readFileSync;
    exports.writeFile = fs.writeFileSync;
}
else {
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
        throw new Error('Cannot write to file when running via browser.');
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
/**
 * The path where the pitchers JSON is located
 * @returns the path to the pitchers JSON from the root dir
 */
const pitcherPath = () => {
    return "./src/baseballLogic/pitchers.json";
};
exports.pitcherPath = pitcherPath;
/**
 * Returns the paths to all the spreadsheets
 * @returns an object with all the paths to all the sheets
 */
const dataPaths = () => {
    const rawRoot = "./src/allData/";
    const processedRoot = "./src/ml/data/";
    return {
        atBats: rawRoot + "atbats.ignore.csv",
        pitches: rawRoot + "pitches.ignore.csv",
        playerNames: rawRoot + "player_names.ignore.csv",
        train: processedRoot + "train/",
        valid: processedRoot + "valid/",
        test: processedRoot + "test/",
    };
};
exports.dataPaths = dataPaths;

},{"./usingNode.js":36}],20:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(_dereq_("./numJS/anyAll.js"), exports);
__exportStar(_dereq_("./numJS/arange.js"), exports);
__exportStar(_dereq_("./numJS/argBest.js"), exports);
__exportStar(_dereq_("./numJS/arithmetic.js"), exports);
__exportStar(_dereq_("./numJS/calculations.js"), exports);
__exportStar(_dereq_("./numJS/comparing.js"), exports);
__exportStar(_dereq_("./numJS/copyArr.js"), exports);
__exportStar(_dereq_("./numJS/indexing.js"), exports);
__exportStar(_dereq_("./numJS/metrics.js"), exports);
__exportStar(_dereq_("./numJS/ndMap.js"), exports);
__exportStar(_dereq_("./numJS/shapes.js"), exports);
__exportStar(_dereq_("./numJS/types.js"), exports);
__exportStar(_dereq_("./numJS/measuresOfCenter.js"), exports);
__exportStar(_dereq_("./numJS/linAlg.js"), exports);

},{"./numJS/anyAll.js":21,"./numJS/arange.js":22,"./numJS/argBest.js":23,"./numJS/arithmetic.js":24,"./numJS/calculations.js":25,"./numJS/comparing.js":26,"./numJS/copyArr.js":27,"./numJS/indexing.js":28,"./numJS/linAlg.js":29,"./numJS/measuresOfCenter.js":30,"./numJS/metrics.js":31,"./numJS/ndMap.js":32,"./numJS/shapes.js":33,"./numJS/types.js":34}],21:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.any = exports.all = void 0;
/**
 * Helper function for any and all. Goes through each subarray of bools and
 * checks if any satisfy the criterion. If they do, this will return ifTrue.
 * Otherwise, it returns !ifTrue
 * @param bools the ndArray of booleans to look at
 * @param criterion a function that determines when to early return
 * @param ifTrue what to return when criterion returns tre
 * @returns ifTrue if at least one subarray satisfies criterion, else !ifTrue
 */
const nestedSatisfies = (bools, criterion, ifTrue) => {
    if (Array.isArray(bools)) {
        if (bools.length === 0)
            return false;
        for (const nested of bools) {
            if (criterion(nested)) {
                return ifTrue;
            }
        }
        return !ifTrue;
    }
    return bools;
};
/**
 * Returns whether every element of bools is true.
 * Returns false if bools is empty.
 * ```
 * all([]) // output: false
 * all(true) // output: true
 * all([true, false, true]) // output: true
 * all([true, true, true]) // output: true
 * ```
 * @param bools an n-dimensional array of booleans
 * @returns whether all elements of bools are true
 */
const all = (bools) => {
    return nestedSatisfies(bools, b => !(0, exports.all)(b), false);
};
exports.all = all;
/**
 * Returns whether any element of bools is true.
 * Returns false if bools is empty.
 * ```
 * any([]) // output: false
 * any(true) // output: true
 * any([true, false, false]) // output: true
 * any([false, false, false]) // output: false
 * ```
 * @param bools an n-dimensional array of booleans
 * @returns whether any elements of bools are true
 */
const any = (bools) => {
    return nestedSatisfies(bools, b => (0, exports.any)(b), true);
};
exports.any = any;

},{}],22:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.arange = void 0;
/**
 * Returns an array from start to stop with values separated by step. Same syntax as
 * Python's `range` constructor, i.e. if stop is omitted, the array will go from 0 to
 * stop, and step defaults to 1.
 * ```
 * arange(4) // output: [0, 1, 2, 3]
 * arange(1, 5) // output: [1, 2, 3, 4]
 * arange(1, 6, 2) // output: [1, 3, 5]
 * arange(5, 0, -1) // output: [5, 4, 3, 2, 1]
 * ```
 * @param start the first element of the array, or the exclusive maximum if stop is omitted
 * @param stop the exclusive max of the return array
 * @param step the difference between the `i`th element and the `i + 1` of the return array
 * @returns an array from start (inclusive) to stop (exclusive)
 */
const arange = (start, stop, step) => {
    step = step || 1;
    if (typeof stop === 'undefined') {
        stop = start;
        start = 0;
    }
    if (Math.sign(stop - start) !== Math.sign(step)) {
        throw new Error(`Infinite range from ${start} to ${stop} using step ${step} not allowed.`);
    }
    let comp = (a, b) => a < b;
    if (step < 0) {
        comp = (a, b) => a > b;
    }
    let res = [];
    for (let n = start; comp(n, stop); n += step) {
        res.push(n);
    }
    return res;
};
exports.arange = arange;

},{}],23:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.argMax = exports.argMin = exports.argBest = void 0;
/**
 * Finds the index of the best element in x, based on comp.
 * ```
 * argBest([3, 4, 5], (a, b) => a < b) // output: 0
 * argBest([3, 4, 5], (a, b) => a >= b) // output: 2
 * ```
 * @param x the array to look through
 * @param comp how to compare the elements of x. Should return true if the first arg is "better"
 * than the second
 * @returns the index of the best element in x
 */
const argBest = (x, comp) => {
    if (x.length === 0) {
        throw new Error('Empty array');
    }
    let b = 0;
    for (let i = 0; i < x.length; i++) {
        if (comp(x[i], x[b])) {
            b = i;
        }
    }
    return b;
};
exports.argBest = argBest;
/**
 * Returns the index of the smallest element of x.
 * ```
 * argMin([3, 4, 5]) // output: 0
 * ```
 * @param x the array to look at
 * @returns where the smallest element is
 */
const argMin = (x) => {
    return (0, exports.argBest)(x, (a, b) => a < b);
};
exports.argMin = argMin;
/**
 * Returns the index of the largest element of x.
 * ```
 * argMax([3, 4, 5]) // output: 2
 * ```
 * @param x the array to look at
 * @returns where the largest element is
 */
const argMax = (x) => {
    return (0, exports.argBest)(x, (a, b) => a > b);
};
exports.argMax = argMax;

},{}],24:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sumList = exports.colAverage = exports.scalarMul = exports.subArrays = exports.addArrays = void 0;
const shapes_js_1 = _dereq_("./shapes.js");
/**
 * Adds the two n-dimensional matrices element-wise.
 * ```
 * addArrays(1, 2) // output: 3
 * addArrays([1, 2, 3], [3, 4, 5]) // output: [4, 6, 8]
 * addArrays(2, [1, 2, 3]) // output: [3, 5, 7]
 * ```
 * @param a1 the first matrix
 * @param a2 the second matrix
 * @returns their element-wise sum
 */
const addArrays = (a1, a2) => {
    [a1, a2] = (0, shapes_js_1.broadcast)(a1, a2);
    if (Array.isArray(a1)) {
        let res = [];
        for (let i = 0; i < a1.length; i++) {
            res.push((0, exports.addArrays)(a1[i], a2[i]));
        }
        return res;
    }
    return a1 + a2;
};
exports.addArrays = addArrays;
/**
 * Subtracts the two n-dimensional matrices element-wise.
 * ```
 * subArrays(2, 1) // output: 1
 * subArrays([3, 4, 5], [1, 2, 3]) // output: [2, 2, 2]
 * subArrays([1, 2, 3], 1) // output: [0, 1, 2]
 * subArrays(3, [1, 2, 3]) // output: [2, 1, 0]
 * ```
 * @param a1 the first matrix
 * @param a2 the second matrix
 * @returns a1 - a2 element-wise
 */
const subArrays = (a1, a2) => {
    return (0, exports.addArrays)(a1, (0, exports.scalarMul)(a2, -1));
};
exports.subArrays = subArrays;
/**
 * Multiplies every element of A by x and returns a new matrix.
 * ```
 * scalarMul(1, 2) // output: 2
 * scalarMul([1, 2, 3], 3) // output: [3, 6, 9]
 * scalarMul([2, 4, 6], 0.5) // output: [1, 2, 3]
 * ```
 * @param x the scalar
 * @param A the matrix to multiply
 * @returns the result of x * A
 */
const scalarMul = (A, x) => {
    if (Array.isArray(A)) {
        let res = [];
        for (const row of A) {
            res.push((0, exports.scalarMul)(row, x));
        }
        return res;
    }
    return x * A;
};
exports.scalarMul = scalarMul;
/**
 * Returns the averages of the columns of A.
 * ```
 * colAverage([[1, 2], [3, 4]]) // output: [2, 3]
 * ```
 * @param A the 2D matrix to average
 * @returns the column-wise average of A
 */
const colAverage = (A) => {
    if (A.length === 0)
        return [];
    const total = A.reduce((accum, row) => (0, exports.addArrays)(accum, row), (0, shapes_js_1.zeros)([A[0].length]));
    return (0, exports.scalarMul)(total, 1 / A.length);
};
exports.colAverage = colAverage;
/**
 * Returns the sum of every element of the n-dimensional list.
 * ```
 * sumList(1) // output: 1
 * sumList([1, 2, 3]) // output: 6
 * sumList([[1, 2], [3, 4]]) // output: 10
 * ```
 * @param x the array of numbers
 * @returns the sum of every element in x
 */
const sumList = (x) => {
    if (Array.isArray(x)) {
        return x.map(exports.sumList).reduce((a, b) => a + b, 0);
    }
    return x;
};
exports.sumList = sumList;

},{"./shapes.js":33}],25:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.colVariance = exports.sigmoid = exports.variance = exports.dot = void 0;
const shapes_js_1 = _dereq_("./shapes.js");
const metrics_js_1 = _dereq_("./metrics.js");
const measuresOfCenter_js_1 = _dereq_("./measuresOfCenter.js");
const arithmetic_js_1 = _dereq_("./arithmetic.js");
/**
 * Returns the dot product of x and y
 * ```
 * dot([1], [2]) // output: 2
 * dot([1, 2, 3], [4, 5, 6]) // output: 32
 * ```
 * @param x the first vector
 * @param y the second vector
 * @returns the dot product
 */
const dot = (x, y) => {
    let res = 0;
    for (let i = 0; i < Math.min(x.length, y.length); i++) {
        res += x[i] * y[i];
    }
    return res;
};
exports.dot = dot;
/**
 * Computes the variance (square of the standard deviation) of x.
 * ```
 * variance([1, 1, 1, 1]) // output: 0
 * variance([0, 1, 1, 2]) // output; 0.6666667
 * ```
 * @param x the array to measure
 * @returns the variance of x
 */
const variance = (x) => {
    return (0, metrics_js_1.squareDistance)(x, (0, measuresOfCenter_js_1.mean)(x)) / ((0, shapes_js_1.getSize)(x) - 1);
};
exports.variance = variance;
/**
 * Sigmoid function to floor x to somewhere between 0 and 1
 * ```
 * sigmoid(0) // output: 0.5
 * sigmoid(1) // output: ~0.731
 * sigmoid(-1) // output: ~0.2689
 * ```
 * @param x the number to reduce
 * @returns `1 / (1 + Math.exp(-x))`
 */
const sigmoid = (x) => {
    return 1 / (1 + Math.exp(-x));
};
exports.sigmoid = sigmoid;
/**
 * Returns the column-wise variances of x.
 * ```
 * colVariance([[0, 1, 2], [0, 2, 1]]) // output: [0, 0.5, 0.5]
 * ```
 * @param x the matrix to measure
 * @returns the column-wise variances of x
 */
const colVariance = (x) => {
    const avgs = (0, arithmetic_js_1.colAverage)(x);
    let sums = (0, shapes_js_1.zeros)([avgs.length]);
    for (const row of x) {
        let diffs = [];
        for (let i = 0; i < row.length; i++) {
            diffs.push(Math.pow(row[i] - avgs[i], 2));
        }
        sums = (0, arithmetic_js_1.addArrays)(sums, diffs);
    }
    return (0, arithmetic_js_1.scalarMul)(sums, 1 / (x.length - 1));
};
exports.colVariance = colVariance;

},{"./arithmetic.js":24,"./measuresOfCenter.js":30,"./metrics.js":31,"./shapes.js":33}],26:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sameArr = exports.allEqual = exports.arrNot = exports.arrAnd = exports.arrOr = exports.arrGTEq = exports.arrGT = exports.arrLTEq = exports.arrLT = exports.arrEqual = exports.allClose = exports.isClose = void 0;
const shapes_js_1 = _dereq_("./shapes.js");
const anyAll_js_1 = _dereq_("./anyAll.js");
const ndMap_js_1 = _dereq_("./ndMap.js");
/**
 * Returns an array where `ith` element corresponds to whether `x[i]` is close enough to `y[i]`,
 * where close enough means within floating-point error bars. Uses the formula `abs(x - y) <= atol + rtol * abs(y)`.
 * ```
 * isClose(1, 1.0000000001) // output: true
 * isClose(1, 2) // output: false
 * isClose(1, 2, undefined, 1) // output: true
 * isClose([1, 2, 3], [1, 3, 3]) // output: [true, false, true]
 * isClose([[1, 2], [3, 4]], [[1, 3], [4, 4]]) // output: [[true, false], [false, true]]
 * ```
 * @param x the first array
 * @param y the second array
 * @param rtol the relative tolerance, which is multiplied by the elements of b
 * @param atol the absolute tolerance. Should be non-zero when x and y have elements that are both zero
 * @returns an ndArray of which values of x and y are close
 */
const isClose = (x, y, rtol = 1e-5, atol = 1e-8) => {
    [x, y] = (0, shapes_js_1.broadcast)(x, y);
    if (Array.isArray(x)) {
        let res = [];
        for (let i = 0; i < x.length; i++) {
            res.push((0, exports.isClose)(x[i], y[i], rtol, atol));
        }
        return res;
    }
    return Math.abs(x - y) <= atol + rtol * Math.abs(y);
};
exports.isClose = isClose;
/**
 * Returns whether every element of x is close to every element of y, using the formula
 * `abs(x - y) <= atol + rtol * abs(y)`.
 * ```
 * allClose(1, 1) // output: true
 * allClose(1, 2) // output: false
 * allClose([1, 2, 3], [1.000000001, 2, 3]) // output: true
 * allClose([1, 2, 3], [2, 2, 3]) // output: false
 * ```
 * @param x the first array
 * @param y the second array
 * @param rtol the relative tolerance, which is multiplied by the elements of b
 * @param atol the absolute tolerance. Should be non-zero when x and y have elements that are both zero
 * @returns whether every element of x is close to every element of y
 */
const allClose = (x, y, rtol = 1e-5, atol = 1e-8) => {
    return (0, anyAll_js_1.all)((0, exports.isClose)(x, y, rtol, atol));
};
exports.allClose = allClose;
/**
 * Compares a and b element-wise using the comp function
 * @param a the first array to compare
 * @param b the second array to compare
 * @param comp how to compare each element from a and b
 * @returns an ndArray of booleans corresponding to the result
 * of comp on each element of a and b
 */
const arrayComp = (a, b, comp) => {
    [a, b] = (0, shapes_js_1.broadcast)(a, b);
    if (Array.isArray(a)) {
        let res = [];
        for (let i = 0; i < a.length; i++) {
            res.push(arrayComp(a[i], b[i], comp));
        }
        return res;
    }
    return comp(a, b);
};
/**
 * Checks for equality of a and b element-wise and returns a new array
 * with the results.
 * ```
 * arrEqual(1, 1) // output: true
 * arrEqual(1, 2) // output: false
 * arrEqual([1, 2, 3], [2, 2, 3]) // output: [false, true, true]
 * arrEqual([1, 2, 3], [1.00000001, 2, 3]) // output: [false, true, true] (see isClose)
 * ```
 * @param a the first array
 * @param b the second array
 * @returns an array of booleans, each corresponding to whether the
 * elements in the same position of a and b are equal
 */
const arrEqual = (a, b) => {
    return arrayComp(a, b, (x, y) => x === y);
};
exports.arrEqual = arrEqual;
/**
 * Checks for a < b element-wise and returns a new array
 * with the results.
 * ```
 * arrLT(1, 2) // output: true
 * arrLT(2, 1) // output: false
 * arrLT(1, 1) // output: false
 * arrLT([1, 2, 3], [1, 3, 2]) // output: [false, true, false]
 * ```
 * @param a the first array
 * @param b the second array
 * @returns an array of booleans, each corresponding to whether the
 * element in the same position of a is less than that of b
 */
const arrLT = (a, b) => {
    return arrayComp(a, b, (x, y) => x < y);
};
exports.arrLT = arrLT;
/**
 * Checks for a <= b element-wise and returns a new array
 * with the results.
 * ```
 * arrLTEq(1, 2) // output: true
 * arrLTEq(2, 1) // output: false
 * arrLTEq(1, 1) // output: true
 * arrLTEq([1, 2, 3], [1, 3, 2]) // output: [true, true, false]
 * ```
 * @param a the first array
 * @param b the second array
 * @returns an array of booleans, each corresponding to whether the
 * element in the same position of a is less than or equal to that of b
 */
const arrLTEq = (a, b) => {
    return arrayComp(a, b, (x, y) => x <= y);
};
exports.arrLTEq = arrLTEq;
/**
 * Checks for a > b element-wise and returns a new array
 * with the results.
 * ```
 * arrGT(1, 2) // output: false
 * arrGT(2, 1) // output: true
 * arrGT(1, 1) // output: false
 * arrGT([1, 2, 3], [1, 3, 2]) // output: [false, false, true]
 * ```
 * @param a the first array
 * @param b the second array
 * @returns an array of booleans, each corresponding to whether the
 * element in the same position of a is greater than that of b
 */
const arrGT = (a, b) => {
    return arrayComp(a, b, (x, y) => x > y);
};
exports.arrGT = arrGT;
/**
 * Checks for a >= b element-wise and returns a new array
 * with the results.
 * ```
 * arrGTEq(1, 2) // output: false
 * arrGTEq(2, 1) // output: true
 * arrGTEq(1, 1) // output: true
 * arrGTEq([1, 2, 3], [1, 3, 2]) // output: [true, false, true]
 * ```
 * @param a the first array
 * @param b the second array
 * @returns an array of booleans, each corresponding to whether the
 * element in the same position of a is greater than that of b
 */
const arrGTEq = (a, b) => {
    return arrayComp(a, b, (x, y) => x >= y);
};
exports.arrGTEq = arrGTEq;
/**
 * Computes the element-wise OR of two boolean arrays.
 * ```
 * arrOr(true, false) // output: true
 * arrOr(false, false) // output: false
 * arrOr([true, true, false], [false, false, false]) // output: [true, true, false]
 * arrOr([true, false, true], false) // output: [true, false, true]
 * arrOr(true, [[false, false], [false, false]]) // output: [[true, true], [true, true]]
 * ```
 * @param a the first array
 * @param b the second array
 * @returns an array of booleans, each corresponding to whether
 * either the element in the same position of a is true or that
 * of b is true
 */
const arrOr = (a, b) => {
    return arrayComp(a, b, (x, y) => x || y);
};
exports.arrOr = arrOr;
/**
 * Computes the element-wise AND of two boolean arrays.
 * ```
 * arrOr(true, false) // output: false
 * arrOr(true, true) // output: true
 * arrOr([true, true, false], [false, true, false]) // output: [false, true, false]
 * arrOr([true, false, true], true) // output: [true, false, true]
 * arrOr(true, [[false, false], [false, false]]) // output: [[false, false], [false, false]]
 * ```
 * @param a the first array
 * @param b the second array
 * @returns an array of booleans, each corresponding to whether
 * both the element in the same position of a is true and that
 * of b is true
 */
const arrAnd = (a, b) => {
    return arrayComp(a, b, (x, y) => x && y);
};
exports.arrAnd = arrAnd;
/**
 * Computes the element-wise NOT of a.
 * ```
 * arrNot(true) // output: false
 * arrNot(false) // output: true
 * arrNot([true, false, true]) // output: [false, true, false]
 * arrNot([[true, true], [false, false]]) // output: [[false, false], [true, true]]
 * ```
 * @param a the array to negate
 * @returns an array of booleans, each with the opposite value
 * of the same position in a
 */
const arrNot = (a) => {
    return (0, ndMap_js_1.ndMap)(a, x => !x);
};
exports.arrNot = arrNot;
/**
 * Returns whether a and b are all equal after broadcasting. Note that
 * a and b can have different shapes and this function can still return `true`.
 * If this is not desired, see `sameArr`.
 * ```
 * allEqual(1, 1) // output: true
 * allEqual(1, 2) // output: false
 * allEqual([1, 2, 3], [1, 2, 3]) // output: true
 * allEqual([1, 2, 3], [[1, 2, 3])) // output: false
 * ```
 * @param a the first array
 * @param b the second array
 * @returns whether a and b are element-wise equal
 */
const allEqual = (a, b) => {
    return (0, anyAll_js_1.all)((0, exports.arrEqual)(a, b));
};
exports.allEqual = allEqual;
/**
 * Returns whether every element of a and b are equal and that their shapes
 * are equal.
 * ```
 * allEqual(1, 1) // output: true
 * allEqual(1, 2) // output: false
 * allEqual([1, 2, 3], [1, 2, 3]) // output: true
 * allEqual([1, 2, 3], [[1, 2, 3]]) // output: true
 * ```
 * @param a the first array
 * @param b the second array
 * @returns whether a and b are recursively equal
 */
const sameArr = (a, b) => {
    const shape1 = (0, shapes_js_1.getShape)(a);
    const shape2 = (0, shapes_js_1.getShape)(b);
    return (shape1.length === shape2.length &&
        (0, exports.allEqual)(shape1, shape2) &&
        (0, exports.allEqual)(a, b));
};
exports.sameArr = sameArr;

},{"./anyAll.js":21,"./ndMap.js":32,"./shapes.js":33}],27:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyArr = void 0;
/**
 * Returns a semi-shallow copy of arr. Changing any of the subarrays of the copy
 * will not change the original, but changing a value within a subarray might
 * change the same value in the original.
 * ```
 * let a = [1, 2, 3];
 * let b = a;
 * a[0] = 0;
 * console.log(b[0]); // output: 0
 * a = [1, 2, 3]
 * let c = copyArr(a);
 * a[0] = 0;
 * console.log(c[0]); // output: 1
 *
 * a[0] = {one: 1, two: 2, three: 3};
 * c = copyArr(a);
 * a[0].one = 2;
 * console.log(c[0].one); // output: 2
 * ```
 * @param arr the array to copy
 * @returns a shallow copy of arr with the same elements
 */
const copyArr = (arr) => {
    if (Array.isArray(arr)) {
        let res = [];
        for (let i = 0; i < arr.length; i++) {
            res.push((0, exports.copyArr)(arr[i]));
        }
        return res;
    }
    else {
        return arr;
    }
};
exports.copyArr = copyArr;

},{}],28:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrIndex = void 0;
const shapes_js_1 = _dereq_("./shapes.js");
/**
 * Returns the elements at arr whose positions are equal to the
 * true values in inds
 * @param arr the array to index
 * @param inds the array of booleans used to index arr
 * @returns arr indexed at every true value of inds
 */
const boolIndex = (arr, inds) => {
    [arr, inds] = (0, shapes_js_1.broadcast)(arr, inds);
    if (Array.isArray(arr)) {
        let res = [];
        for (let i = 0; i < arr.length; i++) {
            const sub = boolIndex(arr[i], inds[i]);
            if (!Array.isArray(sub) || sub.length > 0) {
                res.push(sub);
            }
        }
        return res;
    }
    return inds ? arr : [];
};
/**
 * Indices arr with each value of inds. Inds should either be a single integer,
 * an array of integers, or a 2D array of integers, with each element having length
 * less than or equal to the dimensionality of arr. The values of indices are used
 * to index arr
 * @param arr the array to index
 * @param inds what values to get from arr
 * @returns all values of arr at the indices specified in inds
 */
const numIndex = (arr, inds) => {
    if (!Array.isArray(arr)) {
        throw new Error(`Scalars cannot be indexed: ${arr}`);
    }
    let res;
    switch ((0, shapes_js_1.getShape)(inds).length) {
        case 0:
            res = arr[inds];
            break;
        case 1:
            res = inds.map(i => arr[i]);
            break;
        case 2:
            res = [];
            for (const i of inds) {
                let current = arr;
                for (const j of i) {
                    if (!Array.isArray(current)) {
                        throw new Error(`Length of ${i} is greater than dimensionality of ${arr}`);
                    }
                    current = current[j];
                }
                res.push(current);
            }
            break;
        default:
            throw new Error(`Numerical indices cannot have dimensionality greater than 2: ${inds}`);
    }
    return res;
};
/**
 * Indexes arr using an array of either numbers or booleans.
 * ```
 * arrIndex([1, 2, 3], 0) // output: 1
 * arrIndex([1, 2, 3], [1, 2]) // output: [2, 3]
 * arrIndex([[1, 2, 3], [4, 5, 6]], 0) // output: [1, 2, 3]
 * arrIndex([[1, 2, 3], [4, 5, 6]], [0]) // output: [[1, 2, 3]]
 * arrIndex([[1, 2, 3], [4, 5, 6]], [[0, 1]]) // output: [2]
 *
 * arrIndex([1, 2, 3], true) // output: [1, 2, 3]
 * arrIndex([1, 2, 3], false) // output: []
 * arrIndex([1, 2, 3], [true, false, false]) // output: [1]
 * arrIndex([[1, 2], [3, 4]], [[true, false], [true, true]]) // output: [[1], [3, 4]]
 * ```
 * @param arr the array to index
 * @param inds what values to get from arr
 * @returns arr indexed at each value of inds
 */
const arrIndex = (arr, inds) => {
    let current = inds;
    while (Array.isArray(current)) {
        current = current[0];
    }
    if (typeof current === 'number') {
        return numIndex(arr, inds);
    }
    else if (typeof current === 'boolean') {
        return boolIndex(arr, inds);
    }
};
exports.arrIndex = arrIndex;

},{"./shapes.js":33}],29:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.invert = exports.eye = exports.transpose = exports.matMul = void 0;
const shapes_js_1 = _dereq_("./shapes.js");
const arithmetic_js_1 = _dereq_("./arithmetic.js");
const calculations_js_1 = _dereq_("./calculations.js");
const comparing_js_1 = _dereq_("./comparing.js");
/**
 * Multiplies the two matrices together. If both matrices are vectors,
 * computes their dot product.
 * ```
 * matMul(2, 3) // output: 6
 * matMul(5, [1, 2, 3, 4]) // output: [5, 10, 15, 20]
 * matMul(5, [[1, 2], [3, 4]]) // output: [[5, 10], [15, 20]]
 * matMul([1, 2, 3], [4, 5, 6]) // output: 32
 * matMul([[1, 2], [3, 4]], [[1, 0], [0, 1]]) // output: [[1, 2], [3, 4]]
 * matMul([[1, 2], [3, 4]], [5, 6]) // output: [17, 39]
 * matMul([5, 6], [[1, 2], [3, 4]]) // output: [23, 34]
 * ```
 * @param m1 the first matrix
 * @param m2 the second matrix
 * @returns the matrix multiplication of m1 and m2
 */
const matMul = (m1, m2) => {
    let shape1 = (0, shapes_js_1.getShape)(m1);
    let shape2 = (0, shapes_js_1.getShape)(m2);
    if (shape1.length === 0) {
        return (0, arithmetic_js_1.scalarMul)(m2, m1);
    }
    if (shape2.length === 0) {
        return (0, arithmetic_js_1.scalarMul)(m1, m2);
    }
    if (shape1.length === 1 && shape2.length === 1) {
        return (0, calculations_js_1.dot)(m1, m2);
    }
    if (shape1.length === 1) {
        m1 = [m1];
        shape1 = [1, shape1[0]];
    }
    else if (shape2.length === 1) {
        shape2 = [shape2[0], 1];
        m2 = (0, shapes_js_1.reshape)(m2, shape2);
    }
    if (shape1[1] !== shape2[0]) {
        throw new Error('Matrix multiplication shapes not compatible ' +
            `[${(0, shapes_js_1.getShape)(m1)}] vs [${(0, shapes_js_1.getShape)(m2)}]`);
    }
    let res = (0, shapes_js_1.zeros)([shape1[0], shape2[1]]);
    // iteration order from https://cs61.seas.harvard.edu/wiki/images/0/0f/Lec14-Cache_measurement.pdf
    for (let k = 0; k < shape1[1]; k++) {
        for (let i = 0; i < shape1[0]; i++) {
            const point = m1[i][k];
            for (let j = 0; j < shape2[1]; j++) {
                res[i][j] += point * m2[k][j];
            }
        }
    }
    if (shape1[0] === 1) {
        return res[0];
    }
    if (shape2[1] === 1) {
        return (0, shapes_js_1.reshape)(res, [shape1[0]]);
    }
    return res;
};
exports.matMul = matMul;
/**
 * Transposes m.
 * ```
 * transpose([[1, 2], [3, 4]]) // output: [[1, 3], [2, 4]]
 * transpose([[1, 2], [3, 4], [5, 6]]) // output: [[1, 3, 5], [2, 4, 6]]
 * ```
 * @param m the matrix to transpose
 * @returns the transposed matrix
 */
const transpose = (m) => {
    let res = [];
    for (let j = 0; j < m[0].length; j++) {
        let row = [];
        for (let i = 0; i < m.length; i++) {
            row.push(m[i][j]);
        }
        res.push(row);
    }
    return res;
};
exports.transpose = transpose;
/**
 * Returns the identity matrix with a length and width of len.
 * By definition, `matMul(eye, m)` for any `m` returns `m`, and
 * the same is true of `matMul(m, eye)`.
 * @param len how large the matrix should be
 * @returns a matrix with all zeros except along the diagonal are ones
 */
const eye = (len) => {
    let res = (0, shapes_js_1.zeros)([len, len]);
    for (let i = 0; i < len; i++) {
        res[i][i] = 1;
    }
    return res;
};
exports.eye = eye;
/**
 * Finds the row-reduced echelon form of m, meaning the matrix is
 * in echelon form, the column of each row's left-most
 * non-zero value (the pivot) has only one non-zero value, located
 * in that row, and that pivot value is always a one. Output is saved to m
 * @param m the matrix to row-reduce. Assumed to be square. Output is saved here
 */
const rowReduce = (m) => {
    echelon(m, 0);
    for (let i = 0; i < m.length; i++) {
        let pivot = -1;
        while (++pivot < m[i].length && m[i][pivot] === 0) { }
        if (pivot === m[i].length)
            break;
        m[i] = (0, arithmetic_js_1.scalarMul)(m[i], 1 / m[i][pivot]);
        for (let i2 = 0; i2 < m.length; i2++) {
            if (i !== i2) {
                m[i2] = (0, arithmetic_js_1.subArrays)(m[i2], (0, arithmetic_js_1.scalarMul)(m[i], m[i2][pivot]));
            }
        }
    }
};
/**
 * Converts the matrix to echelon form, meaning the column of
 * each row's left-most non-zero value is to the right of that of
 * the row above it. The output is saved to m
 * @param m the matrix to reduce. Assumed to be square. Output is saved here
 * @param n which row and column to change in this recursion
 */
const echelon = (m, n) => {
    if (n === m.length)
        return;
    let largest = n;
    for (let i = n + 1; i < m.length; i++) {
        if (m[largest][n] < m[i][n]) {
            largest = i;
        }
    }
    let temp;
    if (largest !== n) {
        temp = m[n];
        m[n] = m[largest];
        m[largest] = temp;
    }
    if (m[n][n] !== 0) {
        for (let i = n + 1; i < m.length; i++) {
            m[i] = (0, arithmetic_js_1.subArrays)(m[i], (0, arithmetic_js_1.scalarMul)(m[n], m[i][n] / m[n][n]));
        }
    }
    echelon(m, n + 1);
};
/**
 * Returns the multiplicative inverse of m. By definition,
 * `matMul(invert(m), m)` equals the identity matrix, as does
 * `matMul(m, invert(m))`. m must be square
 * ```
 * invert([[1, 2], [3, 4]]) // output: [[-2, 1], [1.5, -0.5]]
 * ```
 * @param m the matrix to invert
 * @returns the inverse of m
 */
const invert = (m) => {
    const shape = (0, shapes_js_1.getShape)(m);
    if (m.length === 0 || m.length !== m[0].length) {
        throw new Error(`Singular matrix with shape [${shape}]`);
    }
    const i = (0, exports.eye)(m.length);
    let aug = m.map((r, ind) => r.concat(i[ind]));
    rowReduce(aug);
    for (let i = 0; i < m.length; i++) {
        for (let j = 0; j < m[i].length; j++) {
            if (!(0, comparing_js_1.isClose)(aug[i][j], +(i === j))) {
                throw new Error('Singular matrix: element at ' +
                    `[${i}, ${j}] should be ${+(i === j)} ` +
                    `but is ${aug[i][j]}`);
            }
        }
    }
    return aug.map(r => r.slice(m.length, aug[0].length));
};
exports.invert = invert;

},{"./arithmetic.js":24,"./calculations.js":25,"./comparing.js":26,"./shapes.js":33}],30:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.median = exports.mode = exports.mean = void 0;
const arithmetic_js_1 = _dereq_("./arithmetic.js");
const shapes_js_1 = _dereq_("./shapes.js");
/**
 * Computes the average aka mean of x.
 * ```
 * mean(1) // output; 1
 * mean([1, 2, 3]) // output: 1
 * mean([[1, 2], [3, 4]]) // output: 2.5
 * ```
 * @param x the array to measure
 * @returns the mean of x
 */
const mean = (x) => {
    const size = (0, shapes_js_1.getSize)(x);
    if (size === 0) {
        throw new Error('Trying to find the mean of empty array');
    }
    return (0, arithmetic_js_1.sumList)(x) / size;
};
exports.mean = mean;
/**
 * Finds the most common element in arr
 * ```
 * mode(1) // output: 1
 * mode([0, 0, 1, 2]) // output: 0
 * mode([1, 1, 0, 2, 2, 2]) // output: 2
 * mode([[0, 1], [1, 2]]) // output: 1
 * ```
 * @param arr the array to search through
 * @returns the most common element in arr
 */
const mode = (arr) => {
    arr = (0, shapes_js_1.flatten)(arr);
    if (Array.isArray(arr)) {
        const flat = arr;
        if (arr.length === 0) {
            throw new Error('Trying to find mode of empty array');
        }
        ;
        let counts = {};
        for (const n of flat) {
            counts[n] = n in counts ? counts[n] + 1 : 1;
        }
        let best = flat[0];
        for (const k in counts) {
            if (counts[k] > counts[best]) {
                best = parseInt(k);
            }
        }
        return best;
    }
    return arr;
};
exports.mode = mode;
/**
 * Returns the element n such that there are an equal number of elements
 * in arr greater than or equal to n as there are less than or equal to n
 * ```
 * median(1) // output: 1
 * median([0, 1, 2]) // output: 1
 * median([0, 0, 1, 1]) // output: 0.5
 * median([2, 2, 0, 1, 1]) // output: 1
 * median([[1, 2], [3, 4]]) // output: 2.5
 * ```
 * @param arr the array to search through
 * @returns the median of arr
 */
const median = (arr) => {
    arr = (0, shapes_js_1.flatten)(arr);
    if (Array.isArray(arr)) {
        const flat = arr;
        if (flat.length === 0) {
            throw new Error('Trying to find median of empty array');
        }
        const s = flat.sort((a, b) => a - b);
        if (flat.length % 2 === 0) {
            return (s[arr.length / 2 - 1] + s[arr.length / 2]) / 2;
        }
        return s[Math.floor(arr.length / 2)];
    }
    return arr;
};
exports.median = median;

},{"./arithmetic.js":24,"./shapes.js":33}],31:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.squaredMag = exports.correlation = exports.manhattanDistance = exports.squareDistance = exports.mse = void 0;
const arithmetic_js_1 = _dereq_("./arithmetic.js");
const shapes_js_1 = _dereq_("./shapes.js");
const measuresOfCenter_1 = _dereq_("./measuresOfCenter");
/**
 * Calculates the mean squared error between x and y.
 * x and y can be of any shape and are broadcast and compared
 * element-wise.
 * ```
 * mse([0, 1, 2], [3, 2, 1]) // output: 3.66666667
 * mse([0, 1, 2], 1) // output: 0.66666667
 * mse([[0, 1], [2, 3]], [0, 1, 2, 3]) // output: 0
 * ```
 * @param x the first array of numbers
 * @param y the second array of numbers
 * @returns the mean squared error between x and y
 */
const mse = (x, y) => {
    const l = Math.max((0, shapes_js_1.getSize)(x), (0, shapes_js_1.getSize)(y));
    return l === 0 ? 0 : (0, exports.squareDistance)(x, y) / l;
};
exports.mse = mse;
/**
 * Returns the square (for efficiency) of the Euclidean distance
 * between x and y. Arrays are broadcast and compared element-wise
 * ```
 * squareDistance([0, 1, 2], [3, 2, 1]) // output: 11
 * squareDistance([0, 1, 2], 1) // output: 2
 * squareDistance([[0, 1], [2, 3]], [0, 1, 2, 3]) // output: 0
 * ```
 * @param x the first array/vector
 * @param y the second array/vector
 * @returns the squared distance between x and y
 */
const squareDistance = (x, y) => {
    [x, y] = (0, shapes_js_1.broadcast)(x, y);
    if (Array.isArray(x)) {
        let total = 0;
        for (let i = 0; i < x.length; i++) {
            total += (0, exports.squareDistance)(x[i], y[i]);
        }
        return total;
    }
    return Math.pow(x - y, 2);
};
exports.squareDistance = squareDistance;
/**
 * Computes the Manhattan distance between x and y. x and y are broadcast
 * together and compared element-wise.
 * ```
 * manhattanDistance([0, 1, 2], [3, 2, 1]) // output: 5
 * manhattanDistance([0, 1, 2], 1) // output: 2
 * manhattanDistance([[0, 1], [2, 3]], [0, 1, 2, 3]) // output: 0
 * ```
 * @param x the first array of numbers
 * @param y the second array of numbers
 * @returns the Manhattan distance between x and y
 */
const manhattanDistance = (x, y) => {
    [x, y] = (0, shapes_js_1.broadcast)(x, y);
    if (Array.isArray(x)) {
        let total = 0;
        for (let i = 0; i < x.length; i++) {
            total += (0, exports.manhattanDistance)(x[i], y[i]);
        }
        return total;
    }
    return Math.abs(x - y);
};
exports.manhattanDistance = manhattanDistance;
/**
 * Returns the correlation between x and y. x and y are broadcast together
 * and compared element-wise. A correlation of 1 means a perfect positive
 * correlation, while -1 means a perfect negative correlation. 0 means no
 * correlation.
 * ```
 * correlation([1, 2, 3], [4, 5, 6]) // output: 1
 * correlation([[1, 2], [3, 4]], [-1, -2, -3, -4]) // output: -1
 * correlation([1, 2, 3], [1, 1, 1]) // output: 0
 * correlation([1, 2, 3], 1) // output: 0
 * ```
 * @param x
 * @param y
 * @returns
 */
const correlation = (x, y) => {
    [x, y] = (0, shapes_js_1.broadcast)(x, y);
    const xAvg = (0, measuresOfCenter_1.mean)(x);
    const yAvg = (0, measuresOfCenter_1.mean)(y);
    const helper = (arr1, arr2) => {
        if (Array.isArray(arr1)) {
            let num = 0;
            let denom = [0, 0];
            for (let i = 0; i < arr1.length; i++) {
                const [subNum, subDenom] = helper(arr1[i], arr2[i]);
                num += subNum;
                denom = (0, arithmetic_js_1.addArrays)(denom, subDenom);
            }
            return [num, denom];
        }
        const xDiff = arr1 - xAvg;
        const yDiff = arr2 - yAvg;
        return [
            xDiff * yDiff,
            [Math.pow(xDiff, 2), Math.pow(yDiff, 2)]
        ];
    };
    const [num, [d1, d2]] = helper(x, y);
    const prod = d1 * d2;
    return prod === 0 ? 0 : num / Math.sqrt(prod);
};
exports.correlation = correlation;
/**
 * Returns the square (for efficiency) of the magnitude (distance from origin)
 * of x.
 * ```
 * squaredMag(1) // output: 1
 * squaredMag([1, 2, 3]) // output: 14
 * squaredMag([[1, 2], [3, 4]]) // output: 30
 * ```
 * @param x
 * @returns
 */
const squaredMag = (x) => {
    return (0, exports.squareDistance)(x, 0);
};
exports.squaredMag = squaredMag;

},{"./arithmetic.js":24,"./measuresOfCenter":30,"./shapes.js":33}],32:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBool = exports.toNum = exports.ndMap = void 0;
/**
 * Maps func onto every element of x and returns a new array of the same shape as x.
 * ```
 * let double = n => 2 * n;
 * ndMap(1, double) // output: 2
 * ndMap([1, 2, 3], double) // output: [2, 4, 6]
 * ndMap([[1, 2], [3, 4, 5]], double) // output: [[2, 4], [6, 8, 10]]
 * ```
 * @param x the ndArray of any type
 * @param func a function that takes an element of x and returns something else
 * @returns func mapped onto x
 */
const ndMap = (x, func) => {
    if (Array.isArray(x)) {
        let res = [];
        for (const nested of x) {
            res.push((0, exports.ndMap)(nested, func));
        }
        return res;
    }
    return func(x);
};
exports.ndMap = ndMap;
/**
 * Converts the array of booleans to numbers.
 * ```
 * toNum(false) // output: 0
 * toNum(true) // output: 1
 * toNum([true, false, false]) // output: [1, 0, 0]
 * toNum([[true, false], [false, false]]) // output: [[1, 0], [0, 0]]
 * ```
 * @param bools an nd array of bools
 * @returns the same array with every `true` mapped to one and every `false`
 * mapped to 0
 */
const toNum = (bools) => {
    return (0, exports.ndMap)(bools, b => +b);
};
exports.toNum = toNum;
/**
 * Converts the array of numbers to booleans.
 * ```
 * toBool(0) // output: false
 * toBool(2) // output: true
 * toBool([0, 1, 2]) // output: [false, true, true]
 * toBool([[0, 1], [-2, 0]]) // output: [[false, true], [true, false]]
 * ```
 * @param nums an nd array of numbers
 * @returns the same array with every zero mapped to `false` and every other
 * value mapped to `true`
 */
const toBool = (nums) => {
    return (0, exports.ndMap)(nums, n => !!n);
};
exports.toBool = toBool;

},{}],33:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSize = exports.reshape = exports.empty = exports.ones = exports.zeros = exports.getShape = exports.full = exports.flatten = exports.broadcast = void 0;
/**
 * Allows for element-wise operations to be performed on arrays of different sizes.
 * Similar in concept to Numpy's broadcasting, but the rules and implementation differ
 * greatly. If either argument is a scaler, it is transformed to have the same shape as
 * the other argument. Otherwise, the argument with the more complex
 * (higher dimensionality) shape is taken as the "ground truth" and the other array is
 * reshaped to have the same shape. In this case, both arrays must have the same
 * total number of elements. If both arrays have the same complexity, the first argument
 * is taken as the "ground truth".
 * ```
 * broadcast([1, 2, 3], [4, 5, 6]) // output: [[1, 2, 3], [4, 5, 6]]
 * broadcast([1, 2, 3], 4) // output: [[1, 2, 3], [4, 4, 4]]
 * broadcast(4, [1, 2, 3]) // output: [[4, 4, 4], [1, 2, 3]]
 * broadcast([1, 2, 3, 4], [[5, 6], [7, 8]]) // output: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]]
 * broadcast([[1, 2]], [[3], [4]]) // output: [[[1, 2]], [[3, 4]]]
 * ```
 * @param a1 the first array
 * @param a2 the second array
 * @returns both arrays reshaped to have the same shape
 */
const broadcast = (a1, a2) => {
    const shape1 = (0, exports.getShape)(a1);
    const shape2 = (0, exports.getShape)(a2);
    const t1 = (0, exports.getSize)(a1);
    const t2 = (0, exports.getSize)(a2);
    const showArr = Math.max(t1, t2) <= 10;
    const erStr = ('Arguments could not be broadcast together: ' +
        (showArr ? `${a1}: ` : '') +
        `[${shape1}] (${t1} elements) and ` +
        (showArr ? `${a2}: ` : '') +
        `[${shape2}] (${t2} elements).`);
    if (t1 !== t2 && shape1.length > 0 && shape2.length > 0) {
        throw new Error(erStr);
    }
    if (shape1.length === shape2.length) {
        let same = true;
        for (let i = 0; i < shape1.length; i++) {
            if (shape1[i] !== shape2[i]) {
                same = false;
                break;
            }
        }
        if (same) {
            return [a1, a2];
        }
        return [a1, (0, exports.reshape)(a2, shape1)];
    }
    if (shape1.length > shape2.length) {
        if (shape2.length === 0) {
            return [a1, (0, exports.full)(shape1, a2)];
        }
        return [a1, (0, exports.reshape)(a2, shape1)];
    }
    if (shape1.length === 0) {
        return [(0, exports.full)(shape2, a1), a2];
    }
    return [(0, exports.reshape)(a1, shape2), a2];
};
exports.broadcast = broadcast;
/**
 * Flattens the n-dimensional array into just one array.
 * ```
 * flatten(5) // output: [5]
 * flatten([1, 2, 3]) // output: [1, 2, 3]
 * flatten([[1, 2], [3, 4]]) // output: [1, 2, 3, 4]
 * ```
 * @param A the array to flatten
 * @returns the flattened array
 */
const flatten = (A) => {
    if (Array.isArray(A)) {
        return [].concat(...A.map(exports.flatten));
    }
    else {
        return A;
    }
};
exports.flatten = flatten;
/**
 * Returns an array full of whatever the value is in any arbitrary shape.
 * ```
 * full([3], 1) // output: [1, 1, 1]
 * full([2, 2], 3) // output: [[3, 3], [3, 3]]
 * full([2], undefined, () => 4) // output: [4, 4]
 * full([3], 3, () => 2) // output: [3, 3, 3]
 * ```
 * @param shape the size of each dimension of the output
 * @param value what value to fill the array with. If undefined, the values
 * will be filled with the return value of valueGen
 * @param valueGen a function that generates values to fill the array with. Only
 * called if value is undefined
 * @returns an array with the given shape and every value equal to the given value
 */
const full = (shape, value, valueGen) => {
    if (shape.length === 0) {
        if (typeof value === 'undefined') {
            if (typeof valueGen === 'undefined') {
                throw new Error('Both of value and valueGen cannot be undefined');
            }
            return valueGen();
        }
        return value;
    }
    let res = [];
    const rest = shape.slice(1, shape.length);
    for (let i = 0; i < shape[0]; i++) {
        res.push((0, exports.full)(rest, value, valueGen));
    }
    return res;
};
exports.full = full;
/**
 * Returns the shape of the array, which should be of uniform dimension
 * to allow for basically constant time calculation.
 * ```
 * getShape(1) // output: []
 * getShape([1, 2, 3]) // output: [3]
 * getShape([[1, 2, 3], [4, 5, 6]]) // output: [2, 3]
 * ```
 * @param arr the array to measure
 * @returns the shape of the array as an array
 */
const getShape = (arr) => {
    let res = [];
    let current = arr;
    while (Array.isArray(current)) {
        res.push(current.length);
        if (current.length === 0)
            break;
        current = current[0];
    }
    return res;
};
exports.getShape = getShape;
/**
 * Convenience function to create an array full of zeros.
 * ```
 * zeros([3])) // output: [0, 0, 0]
 * zeros([2, 2])) // output: [[0, 0], [0, 0]]
 * ```
 * @param shape the shape of the array to create
 * @returns an array of all zeros
 */
const zeros = (shape) => {
    return (0, exports.full)(shape, 0);
};
exports.zeros = zeros;
/**
 * Convenience function to create an array full of ones.
 * ```
 * ones([3]) // output: [1, 1, 1]
 * ones([2, 2]) // output: [[1, 1], [1, 1]]
 * ```
 * @param shape the shape of the array to create
 * @returns an array of all ones
 */
const ones = (shape) => {
    return (0, exports.full)(shape, 1);
};
exports.ones = ones;
const empty = (shape) => {
    if (shape.length === 0) {
        return undefined;
    }
    if (shape.length === 1) {
        return new Array(shape[0]);
    }
    let res = new Array(shape[0]);
    const rest = shape.slice(1, shape.length);
    for (let i = 0; i < shape[0]; i++) {
        res[i] = (0, exports.empty)(rest);
    }
    return res;
};
exports.empty = empty;
/**
 * Reshapes arr to be the given shape.
 * ```
 * reshape([1, 2, 3, 4], [2, 2]) // output: [[1, 2], [3, 4]]
 * reshape([[1, 2], [3, 4]], [4])  // output: [1, 2, 3, 4]
 * ```
 * @param arr the array to reshape
 * @param shape the shape of the output array
 * @returns an array of the given shape with all the elements as arr in order
 */
const reshape = (arr, shape) => {
    const errStr = `Cannot broadcast array with shape ${(0, exports.getShape)(arr)} to ${shape}`;
    if (!Array.isArray(arr)) {
        throw new Error(`Scalars not allowed in reshape function: ${arr}`);
    }
    if (shape.length === 0) {
        if (arr.length === 1) {
            return arr[0];
        }
        else {
            throw new Error(errStr);
        }
    }
    const flat = (0, exports.flatten)(arr);
    if (flat.length % shape[0] !== 0) {
        throw new Error(errStr);
    }
    const perBlock = Math.round(flat.length / shape[0]);
    const restShape = shape.slice(1, shape.length);
    let res = [];
    for (let i = 0; i < flat.length; i += perBlock) {
        const end = i + perBlock;
        res.push((0, exports.reshape)(flat.slice(i, end), restShape));
    }
    return res;
};
exports.reshape = reshape;
/**
 * Finds the total number of elements in the array
 * ```
 * getSize(1) // output: 1
 * getSize([]) // output: 0
 * getSize([1, 2, 3]) // output: 3
 * getSize([[1, 2], [3, 4]]) // output: 4
 * ```
 * @param arr the array to measure
 * @returns the number of elements in arr
 */
const getSize = (arr) => {
    return (0, exports.getShape)(arr).reduce((a, b) => a * b, 1);
};
exports.getSize = getSize;

},{}],34:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
Object.defineProperty(exports, "__esModule", { value: true });

},{}],35:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.randArr = exports.choices = exports.shuffle = exports.choice = exports.randInt = void 0;
const numJS_js_1 = _dereq_("./numJS.js");
const seedrandom_1 = __importDefault(_dereq_("seedrandom"));
const rng = (0, seedrandom_1.default)('Itcher');
/**
 * Returns a random integer in between min (inclusive) and max (exclusive)
 * @param min the lower bound
 * @param max the upper bound. If not provided, the number will be between 0 and min
 * @returns a random integer in the provided range
 */
const randInt = (min, max) => {
    if (typeof max === 'undefined') {
        max = min;
        min = 0;
    }
    return Math.floor(rng() * (max - min) + min);
};
exports.randInt = randInt;
/**
 * Returns a randomly selected element of the array
 * @param arr the array to select an element from
 * @param ws optional cumulative weights for each element in arr
 * @returns one choice from the array
 */
const choice = (arr, ws) => {
    if (arr.length === 0) {
        throw new Error('Empty array not allowed in choice function');
    }
    if (typeof ws === 'undefined') {
        return arr[(0, exports.randInt)(arr.length)];
    }
    if (ws.length !== arr.length) {
        throw new Error(`Incompatible sizes between ${arr} and ${ws}: ${arr.length} vs ${ws.length}`);
    }
    if (!(0, numJS_js_1.all)((0, numJS_js_1.arrGTEq)(ws, 0))) {
        throw new Error(`Negative cumulative weights not allowed: ${ws}`);
    }
    for (let i = 1; i < ws.length; i++) {
        if (ws[i] < ws[i - 1]) {
            throw new Error(`Cumulative weights must be monotonically increasing: ${ws}`);
        }
    }
    const seed = rng() * ws[ws.length - 1];
    for (let i = 0; i < arr.length; i++) {
        if (ws[i] > seed) {
            return arr[i];
        }
    }
    return arr[arr.length - 1];
};
exports.choice = choice;
/**
 * Shuffles the array in place, using Fisher-Yates
 * O(arr.length)
 * @param arr the array to shuffle
 */
const shuffle = (arr) => {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = (0, exports.randInt)(i + 1);
        var temp = arr[j];
        arr[j] = arr[i];
        arr[i] = temp;
    }
};
exports.shuffle = shuffle;
/**
 * Returns n randomly selected elements from arr
 * O(arr.length)
 * @param arr the array to select the elements from
 * @param n how many elements to select
 * @returns n random elements from arr
 */
const choices = (arr, n) => {
    var arrCopy = (0, numJS_js_1.copyArr)(arr);
    (0, exports.shuffle)(arrCopy);
    return arrCopy.slice(0, n);
};
exports.choices = choices;
/**
 * Creates an array of random integers with the given shape
 * @param shape the shape of the output array
 * @param min the minimum possible integer. If max is `undefined`, this will
 * be the maximum possible integer, with `min` being `0`
 * @param max the maximum possible integer. If not specified, see above
 * @returns an array of random integers, each ranging from `[min, max)`
 */
const randArr = (shape, min, max) => {
    const size = shape.reduce((a, b) => a * b, 1);
    let flat = [];
    for (let i = 0; i < size; i++) {
        flat.push((0, exports.randInt)(min, max));
    }
    return (0, numJS_js_1.reshape)(flat, shape);
};
exports.randArr = randArr;

},{"./numJS.js":20,"seedrandom":45}],36:[function(_dereq_,module,exports){
(function (process){(function (){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
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

}).call(this)}).call(this,_dereq_('_process'))
},{"_process":44}],37:[function(_dereq_,module,exports){
"use strict";
/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.nameLT = exports.$ = exports.allPitchTypes = void 0;
const usingNode_js_1 = _dereq_("./usingNode.js");
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
 * Use for sorting by last name. Returns a negative number if p1 is alphabetically
 * less than p2, a positive number if p1 is alphabetically greater than p2, and returns
 * zero if they are the same. Can be used in `Array.sort`
 * @param p1 the name of the first player
 * @param p2 the name of the second player
 * @returns a number that `Array.sort` can interpret to sort the names
 */
const nameLT = (p1, p2) => {
    const p1Names = p1.toLowerCase().split(' ');
    const p2Names = p2.toLowerCase().split(' ');
    if (p1Names[p1Names.length - 1] < p2Names[p2Names.length - 1])
        return -1;
    if (p1Names[p1Names.length - 1] > p2Names[p2Names.length - 1])
        return 1;
    for (let i = 0; i < Math.min(p1Names.length, p2Names.length) - 1; i++) {
        if (p1Names[i] < p2Names[i])
            return -1;
        if (p1Names[i] > p2Names[i])
            return 1;
    }
    return p1Names.length - p2Names.length;
};
exports.nameLT = nameLT;

},{"./usingNode.js":36}],38:[function(_dereq_,module,exports){

},{}],39:[function(_dereq_,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAnyArray = void 0;
const toString = Object.prototype.toString;
/**
 * Checks if an object is an instance of an Array (array or typed array).
 *
 * @param {any} value - Object to check.
 * @returns {boolean} True if the object is an array.
 */
function isAnyArray(value) {
    return toString.call(value).endsWith('Array]');
}
exports.isAnyArray = isAnyArray;

},{}],40:[function(_dereq_,module,exports){
'use strict';

var isAnyArray = _dereq_('is-any-array');

function max(input, options = {}) {
  if (!isAnyArray.isAnyArray(input)) {
    throw new TypeError('input must be an array');
  }

  if (input.length === 0) {
    throw new TypeError('input must not be empty');
  }

  const { fromIndex = 0, toIndex = input.length } = options;

  if (
    fromIndex < 0 ||
    fromIndex >= input.length ||
    !Number.isInteger(fromIndex)
  ) {
    throw new Error('fromIndex must be a positive integer smaller than length');
  }

  if (
    toIndex <= fromIndex ||
    toIndex > input.length ||
    !Number.isInteger(toIndex)
  ) {
    throw new Error(
      'toIndex must be an integer greater than fromIndex and at most equal to length',
    );
  }

  let maxValue = input[fromIndex];
  for (let i = fromIndex + 1; i < toIndex; i++) {
    if (input[i] > maxValue) maxValue = input[i];
  }
  return maxValue;
}

module.exports = max;

},{"is-any-array":39}],41:[function(_dereq_,module,exports){
'use strict';

var isAnyArray = _dereq_('is-any-array');

function min(input, options = {}) {
  if (!isAnyArray.isAnyArray(input)) {
    throw new TypeError('input must be an array');
  }

  if (input.length === 0) {
    throw new TypeError('input must not be empty');
  }

  const { fromIndex = 0, toIndex = input.length } = options;

  if (
    fromIndex < 0 ||
    fromIndex >= input.length ||
    !Number.isInteger(fromIndex)
  ) {
    throw new Error('fromIndex must be a positive integer smaller than length');
  }

  if (
    toIndex <= fromIndex ||
    toIndex > input.length ||
    !Number.isInteger(toIndex)
  ) {
    throw new Error(
      'toIndex must be an integer greater than fromIndex and at most equal to length',
    );
  }

  let minValue = input[fromIndex];
  for (let i = fromIndex + 1; i < toIndex; i++) {
    if (input[i] < minValue) minValue = input[i];
  }
  return minValue;
}

module.exports = min;

},{"is-any-array":39}],42:[function(_dereq_,module,exports){
'use strict';

var isAnyArray = _dereq_('is-any-array');
var max = _dereq_('ml-array-max');
var min = _dereq_('ml-array-min');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var max__default = /*#__PURE__*/_interopDefaultLegacy(max);
var min__default = /*#__PURE__*/_interopDefaultLegacy(min);

function rescale(input, options = {}) {
  if (!isAnyArray.isAnyArray(input)) {
    throw new TypeError('input must be an array');
  } else if (input.length === 0) {
    throw new TypeError('input must not be empty');
  }

  let output;
  if (options.output !== undefined) {
    if (!isAnyArray.isAnyArray(options.output)) {
      throw new TypeError('output option must be an array if specified');
    }
    output = options.output;
  } else {
    output = new Array(input.length);
  }

  const currentMin = min__default['default'](input);
  const currentMax = max__default['default'](input);

  if (currentMin === currentMax) {
    throw new RangeError(
      'minimum and maximum input values are equal. Cannot rescale a constant array',
    );
  }

  const {
    min: minValue = options.autoMinMax ? currentMin : 0,
    max: maxValue = options.autoMinMax ? currentMax : 1,
  } = options;

  if (minValue >= maxValue) {
    throw new RangeError('min option must be smaller than max option');
  }

  const factor = (maxValue - minValue) / (currentMax - currentMin);
  for (let i = 0; i < input.length; i++) {
    output[i] = (input[i] - currentMin) * factor + minValue;
  }

  return output;
}

module.exports = rescale;

},{"is-any-array":39,"ml-array-max":40,"ml-array-min":41}],43:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var isAnyArray = _dereq_('is-any-array');
var rescale = _dereq_('ml-array-rescale');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var rescale__default = /*#__PURE__*/_interopDefaultLegacy(rescale);

const indent = ' '.repeat(2);
const indentData = ' '.repeat(4);

function inspectMatrix() {
  return inspectMatrixWithOptions(this);
}

function inspectMatrixWithOptions(matrix, options = {}) {
  const { maxRows = 15, maxColumns = 10, maxNumSize = 8 } = options;
  return `${matrix.constructor.name} {
${indent}[
${indentData}${inspectData(matrix, maxRows, maxColumns, maxNumSize)}
${indent}]
${indent}rows: ${matrix.rows}
${indent}columns: ${matrix.columns}
}`;
}

function inspectData(matrix, maxRows, maxColumns, maxNumSize) {
  const { rows, columns } = matrix;
  const maxI = Math.min(rows, maxRows);
  const maxJ = Math.min(columns, maxColumns);
  const result = [];
  for (let i = 0; i < maxI; i++) {
    let line = [];
    for (let j = 0; j < maxJ; j++) {
      line.push(formatNumber(matrix.get(i, j), maxNumSize));
    }
    result.push(`${line.join(' ')}`);
  }
  if (maxJ !== columns) {
    result[result.length - 1] += ` ... ${columns - maxColumns} more columns`;
  }
  if (maxI !== rows) {
    result.push(`... ${rows - maxRows} more rows`);
  }
  return result.join(`\n${indentData}`);
}

function formatNumber(num, maxNumSize) {
  const numStr = String(num);
  if (numStr.length <= maxNumSize) {
    return numStr.padEnd(maxNumSize, ' ');
  }
  const precise = num.toPrecision(maxNumSize - 2);
  if (precise.length <= maxNumSize) {
    return precise;
  }
  const exponential = num.toExponential(maxNumSize - 2);
  const eIndex = exponential.indexOf('e');
  const e = exponential.slice(eIndex);
  return exponential.slice(0, maxNumSize - e.length) + e;
}

function installMathOperations(AbstractMatrix, Matrix) {
  AbstractMatrix.prototype.add = function add(value) {
    if (typeof value === 'number') return this.addS(value);
    return this.addM(value);
  };

  AbstractMatrix.prototype.addS = function addS(value) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) + value);
      }
    }
    return this;
  };

  AbstractMatrix.prototype.addM = function addM(matrix) {
    matrix = Matrix.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
      this.columns !== matrix.columns) {
      throw new RangeError('Matrices dimensions must be equal');
    }
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) + matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.add = function add(matrix, value) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.add(value);
  };

  AbstractMatrix.prototype.sub = function sub(value) {
    if (typeof value === 'number') return this.subS(value);
    return this.subM(value);
  };

  AbstractMatrix.prototype.subS = function subS(value) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) - value);
      }
    }
    return this;
  };

  AbstractMatrix.prototype.subM = function subM(matrix) {
    matrix = Matrix.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
      this.columns !== matrix.columns) {
      throw new RangeError('Matrices dimensions must be equal');
    }
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) - matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.sub = function sub(matrix, value) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.sub(value);
  };
  AbstractMatrix.prototype.subtract = AbstractMatrix.prototype.sub;
  AbstractMatrix.prototype.subtractS = AbstractMatrix.prototype.subS;
  AbstractMatrix.prototype.subtractM = AbstractMatrix.prototype.subM;
  AbstractMatrix.subtract = AbstractMatrix.sub;

  AbstractMatrix.prototype.mul = function mul(value) {
    if (typeof value === 'number') return this.mulS(value);
    return this.mulM(value);
  };

  AbstractMatrix.prototype.mulS = function mulS(value) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) * value);
      }
    }
    return this;
  };

  AbstractMatrix.prototype.mulM = function mulM(matrix) {
    matrix = Matrix.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
      this.columns !== matrix.columns) {
      throw new RangeError('Matrices dimensions must be equal');
    }
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) * matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.mul = function mul(matrix, value) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.mul(value);
  };
  AbstractMatrix.prototype.multiply = AbstractMatrix.prototype.mul;
  AbstractMatrix.prototype.multiplyS = AbstractMatrix.prototype.mulS;
  AbstractMatrix.prototype.multiplyM = AbstractMatrix.prototype.mulM;
  AbstractMatrix.multiply = AbstractMatrix.mul;

  AbstractMatrix.prototype.div = function div(value) {
    if (typeof value === 'number') return this.divS(value);
    return this.divM(value);
  };

  AbstractMatrix.prototype.divS = function divS(value) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) / value);
      }
    }
    return this;
  };

  AbstractMatrix.prototype.divM = function divM(matrix) {
    matrix = Matrix.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
      this.columns !== matrix.columns) {
      throw new RangeError('Matrices dimensions must be equal');
    }
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) / matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.div = function div(matrix, value) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.div(value);
  };
  AbstractMatrix.prototype.divide = AbstractMatrix.prototype.div;
  AbstractMatrix.prototype.divideS = AbstractMatrix.prototype.divS;
  AbstractMatrix.prototype.divideM = AbstractMatrix.prototype.divM;
  AbstractMatrix.divide = AbstractMatrix.div;

  AbstractMatrix.prototype.mod = function mod(value) {
    if (typeof value === 'number') return this.modS(value);
    return this.modM(value);
  };

  AbstractMatrix.prototype.modS = function modS(value) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) % value);
      }
    }
    return this;
  };

  AbstractMatrix.prototype.modM = function modM(matrix) {
    matrix = Matrix.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
      this.columns !== matrix.columns) {
      throw new RangeError('Matrices dimensions must be equal');
    }
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) % matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.mod = function mod(matrix, value) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.mod(value);
  };
  AbstractMatrix.prototype.modulus = AbstractMatrix.prototype.mod;
  AbstractMatrix.prototype.modulusS = AbstractMatrix.prototype.modS;
  AbstractMatrix.prototype.modulusM = AbstractMatrix.prototype.modM;
  AbstractMatrix.modulus = AbstractMatrix.mod;

  AbstractMatrix.prototype.and = function and(value) {
    if (typeof value === 'number') return this.andS(value);
    return this.andM(value);
  };

  AbstractMatrix.prototype.andS = function andS(value) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) & value);
      }
    }
    return this;
  };

  AbstractMatrix.prototype.andM = function andM(matrix) {
    matrix = Matrix.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
      this.columns !== matrix.columns) {
      throw new RangeError('Matrices dimensions must be equal');
    }
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) & matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.and = function and(matrix, value) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.and(value);
  };

  AbstractMatrix.prototype.or = function or(value) {
    if (typeof value === 'number') return this.orS(value);
    return this.orM(value);
  };

  AbstractMatrix.prototype.orS = function orS(value) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) | value);
      }
    }
    return this;
  };

  AbstractMatrix.prototype.orM = function orM(matrix) {
    matrix = Matrix.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
      this.columns !== matrix.columns) {
      throw new RangeError('Matrices dimensions must be equal');
    }
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) | matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.or = function or(matrix, value) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.or(value);
  };

  AbstractMatrix.prototype.xor = function xor(value) {
    if (typeof value === 'number') return this.xorS(value);
    return this.xorM(value);
  };

  AbstractMatrix.prototype.xorS = function xorS(value) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) ^ value);
      }
    }
    return this;
  };

  AbstractMatrix.prototype.xorM = function xorM(matrix) {
    matrix = Matrix.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
      this.columns !== matrix.columns) {
      throw new RangeError('Matrices dimensions must be equal');
    }
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) ^ matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.xor = function xor(matrix, value) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.xor(value);
  };

  AbstractMatrix.prototype.leftShift = function leftShift(value) {
    if (typeof value === 'number') return this.leftShiftS(value);
    return this.leftShiftM(value);
  };

  AbstractMatrix.prototype.leftShiftS = function leftShiftS(value) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) << value);
      }
    }
    return this;
  };

  AbstractMatrix.prototype.leftShiftM = function leftShiftM(matrix) {
    matrix = Matrix.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
      this.columns !== matrix.columns) {
      throw new RangeError('Matrices dimensions must be equal');
    }
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) << matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.leftShift = function leftShift(matrix, value) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.leftShift(value);
  };

  AbstractMatrix.prototype.signPropagatingRightShift = function signPropagatingRightShift(value) {
    if (typeof value === 'number') return this.signPropagatingRightShiftS(value);
    return this.signPropagatingRightShiftM(value);
  };

  AbstractMatrix.prototype.signPropagatingRightShiftS = function signPropagatingRightShiftS(value) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) >> value);
      }
    }
    return this;
  };

  AbstractMatrix.prototype.signPropagatingRightShiftM = function signPropagatingRightShiftM(matrix) {
    matrix = Matrix.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
      this.columns !== matrix.columns) {
      throw new RangeError('Matrices dimensions must be equal');
    }
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) >> matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.signPropagatingRightShift = function signPropagatingRightShift(matrix, value) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.signPropagatingRightShift(value);
  };

  AbstractMatrix.prototype.rightShift = function rightShift(value) {
    if (typeof value === 'number') return this.rightShiftS(value);
    return this.rightShiftM(value);
  };

  AbstractMatrix.prototype.rightShiftS = function rightShiftS(value) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) >>> value);
      }
    }
    return this;
  };

  AbstractMatrix.prototype.rightShiftM = function rightShiftM(matrix) {
    matrix = Matrix.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
      this.columns !== matrix.columns) {
      throw new RangeError('Matrices dimensions must be equal');
    }
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) >>> matrix.get(i, j));
      }
    }
    return this;
  };

  AbstractMatrix.rightShift = function rightShift(matrix, value) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.rightShift(value);
  };
  AbstractMatrix.prototype.zeroFillRightShift = AbstractMatrix.prototype.rightShift;
  AbstractMatrix.prototype.zeroFillRightShiftS = AbstractMatrix.prototype.rightShiftS;
  AbstractMatrix.prototype.zeroFillRightShiftM = AbstractMatrix.prototype.rightShiftM;
  AbstractMatrix.zeroFillRightShift = AbstractMatrix.rightShift;

  AbstractMatrix.prototype.not = function not() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, ~(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.not = function not(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.not();
  };

  AbstractMatrix.prototype.abs = function abs() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.abs(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.abs = function abs(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.abs();
  };

  AbstractMatrix.prototype.acos = function acos() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.acos(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.acos = function acos(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.acos();
  };

  AbstractMatrix.prototype.acosh = function acosh() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.acosh(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.acosh = function acosh(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.acosh();
  };

  AbstractMatrix.prototype.asin = function asin() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.asin(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.asin = function asin(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.asin();
  };

  AbstractMatrix.prototype.asinh = function asinh() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.asinh(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.asinh = function asinh(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.asinh();
  };

  AbstractMatrix.prototype.atan = function atan() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.atan(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.atan = function atan(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.atan();
  };

  AbstractMatrix.prototype.atanh = function atanh() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.atanh(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.atanh = function atanh(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.atanh();
  };

  AbstractMatrix.prototype.cbrt = function cbrt() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.cbrt(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.cbrt = function cbrt(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.cbrt();
  };

  AbstractMatrix.prototype.ceil = function ceil() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.ceil(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.ceil = function ceil(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.ceil();
  };

  AbstractMatrix.prototype.clz32 = function clz32() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.clz32(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.clz32 = function clz32(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.clz32();
  };

  AbstractMatrix.prototype.cos = function cos() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.cos(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.cos = function cos(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.cos();
  };

  AbstractMatrix.prototype.cosh = function cosh() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.cosh(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.cosh = function cosh(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.cosh();
  };

  AbstractMatrix.prototype.exp = function exp() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.exp(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.exp = function exp(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.exp();
  };

  AbstractMatrix.prototype.expm1 = function expm1() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.expm1(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.expm1 = function expm1(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.expm1();
  };

  AbstractMatrix.prototype.floor = function floor() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.floor(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.floor = function floor(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.floor();
  };

  AbstractMatrix.prototype.fround = function fround() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.fround(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.fround = function fround(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.fround();
  };

  AbstractMatrix.prototype.log = function log() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.log(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.log = function log(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.log();
  };

  AbstractMatrix.prototype.log1p = function log1p() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.log1p(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.log1p = function log1p(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.log1p();
  };

  AbstractMatrix.prototype.log10 = function log10() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.log10(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.log10 = function log10(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.log10();
  };

  AbstractMatrix.prototype.log2 = function log2() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.log2(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.log2 = function log2(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.log2();
  };

  AbstractMatrix.prototype.round = function round() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.round(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.round = function round(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.round();
  };

  AbstractMatrix.prototype.sign = function sign() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.sign(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.sign = function sign(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.sign();
  };

  AbstractMatrix.prototype.sin = function sin() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.sin(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.sin = function sin(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.sin();
  };

  AbstractMatrix.prototype.sinh = function sinh() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.sinh(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.sinh = function sinh(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.sinh();
  };

  AbstractMatrix.prototype.sqrt = function sqrt() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.sqrt(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.sqrt = function sqrt(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.sqrt();
  };

  AbstractMatrix.prototype.tan = function tan() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.tan(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.tan = function tan(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.tan();
  };

  AbstractMatrix.prototype.tanh = function tanh() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.tanh(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.tanh = function tanh(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.tanh();
  };

  AbstractMatrix.prototype.trunc = function trunc() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.trunc(this.get(i, j)));
      }
    }
    return this;
  };

  AbstractMatrix.trunc = function trunc(matrix) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.trunc();
  };

  AbstractMatrix.pow = function pow(matrix, arg0) {
    const newMatrix = new Matrix(matrix);
    return newMatrix.pow(arg0);
  };

  AbstractMatrix.prototype.pow = function pow(value) {
    if (typeof value === 'number') return this.powS(value);
    return this.powM(value);
  };

  AbstractMatrix.prototype.powS = function powS(value) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.pow(this.get(i, j), value));
      }
    }
    return this;
  };

  AbstractMatrix.prototype.powM = function powM(matrix) {
    matrix = Matrix.checkMatrix(matrix);
    if (this.rows !== matrix.rows ||
      this.columns !== matrix.columns) {
      throw new RangeError('Matrices dimensions must be equal');
    }
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, Math.pow(this.get(i, j), matrix.get(i, j)));
      }
    }
    return this;
  };
}

/**
 * @private
 * Check that a row index is not out of bounds
 * @param {Matrix} matrix
 * @param {number} index
 * @param {boolean} [outer]
 */
function checkRowIndex(matrix, index, outer) {
  let max = outer ? matrix.rows : matrix.rows - 1;
  if (index < 0 || index > max) {
    throw new RangeError('Row index out of range');
  }
}

/**
 * @private
 * Check that a column index is not out of bounds
 * @param {Matrix} matrix
 * @param {number} index
 * @param {boolean} [outer]
 */
function checkColumnIndex(matrix, index, outer) {
  let max = outer ? matrix.columns : matrix.columns - 1;
  if (index < 0 || index > max) {
    throw new RangeError('Column index out of range');
  }
}

/**
 * @private
 * Check that the provided vector is an array with the right length
 * @param {Matrix} matrix
 * @param {Array|Matrix} vector
 * @return {Array}
 * @throws {RangeError}
 */
function checkRowVector(matrix, vector) {
  if (vector.to1DArray) {
    vector = vector.to1DArray();
  }
  if (vector.length !== matrix.columns) {
    throw new RangeError(
      'vector size must be the same as the number of columns',
    );
  }
  return vector;
}

/**
 * @private
 * Check that the provided vector is an array with the right length
 * @param {Matrix} matrix
 * @param {Array|Matrix} vector
 * @return {Array}
 * @throws {RangeError}
 */
function checkColumnVector(matrix, vector) {
  if (vector.to1DArray) {
    vector = vector.to1DArray();
  }
  if (vector.length !== matrix.rows) {
    throw new RangeError('vector size must be the same as the number of rows');
  }
  return vector;
}

function checkRowIndices(matrix, rowIndices) {
  if (!isAnyArray.isAnyArray(rowIndices)) {
    throw new TypeError('row indices must be an array');
  }

  for (let i = 0; i < rowIndices.length; i++) {
    if (rowIndices[i] < 0 || rowIndices[i] >= matrix.rows) {
      throw new RangeError('row indices are out of range');
    }
  }
}

function checkColumnIndices(matrix, columnIndices) {
  if (!isAnyArray.isAnyArray(columnIndices)) {
    throw new TypeError('column indices must be an array');
  }

  for (let i = 0; i < columnIndices.length; i++) {
    if (columnIndices[i] < 0 || columnIndices[i] >= matrix.columns) {
      throw new RangeError('column indices are out of range');
    }
  }
}

function checkRange(matrix, startRow, endRow, startColumn, endColumn) {
  if (arguments.length !== 5) {
    throw new RangeError('expected 4 arguments');
  }
  checkNumber('startRow', startRow);
  checkNumber('endRow', endRow);
  checkNumber('startColumn', startColumn);
  checkNumber('endColumn', endColumn);
  if (
    startRow > endRow ||
    startColumn > endColumn ||
    startRow < 0 ||
    startRow >= matrix.rows ||
    endRow < 0 ||
    endRow >= matrix.rows ||
    startColumn < 0 ||
    startColumn >= matrix.columns ||
    endColumn < 0 ||
    endColumn >= matrix.columns
  ) {
    throw new RangeError('Submatrix indices are out of range');
  }
}

function newArray(length, value = 0) {
  let array = [];
  for (let i = 0; i < length; i++) {
    array.push(value);
  }
  return array;
}

function checkNumber(name, value) {
  if (typeof value !== 'number') {
    throw new TypeError(`${name} must be a number`);
  }
}

function checkNonEmpty(matrix) {
  if (matrix.isEmpty()) {
    throw new Error('Empty matrix has no elements to index');
  }
}

function sumByRow(matrix) {
  let sum = newArray(matrix.rows);
  for (let i = 0; i < matrix.rows; ++i) {
    for (let j = 0; j < matrix.columns; ++j) {
      sum[i] += matrix.get(i, j);
    }
  }
  return sum;
}

function sumByColumn(matrix) {
  let sum = newArray(matrix.columns);
  for (let i = 0; i < matrix.rows; ++i) {
    for (let j = 0; j < matrix.columns; ++j) {
      sum[j] += matrix.get(i, j);
    }
  }
  return sum;
}

function sumAll(matrix) {
  let v = 0;
  for (let i = 0; i < matrix.rows; i++) {
    for (let j = 0; j < matrix.columns; j++) {
      v += matrix.get(i, j);
    }
  }
  return v;
}

function productByRow(matrix) {
  let sum = newArray(matrix.rows, 1);
  for (let i = 0; i < matrix.rows; ++i) {
    for (let j = 0; j < matrix.columns; ++j) {
      sum[i] *= matrix.get(i, j);
    }
  }
  return sum;
}

function productByColumn(matrix) {
  let sum = newArray(matrix.columns, 1);
  for (let i = 0; i < matrix.rows; ++i) {
    for (let j = 0; j < matrix.columns; ++j) {
      sum[j] *= matrix.get(i, j);
    }
  }
  return sum;
}

function productAll(matrix) {
  let v = 1;
  for (let i = 0; i < matrix.rows; i++) {
    for (let j = 0; j < matrix.columns; j++) {
      v *= matrix.get(i, j);
    }
  }
  return v;
}

function varianceByRow(matrix, unbiased, mean) {
  const rows = matrix.rows;
  const cols = matrix.columns;
  const variance = [];

  for (let i = 0; i < rows; i++) {
    let sum1 = 0;
    let sum2 = 0;
    let x = 0;
    for (let j = 0; j < cols; j++) {
      x = matrix.get(i, j) - mean[i];
      sum1 += x;
      sum2 += x * x;
    }
    if (unbiased) {
      variance.push((sum2 - (sum1 * sum1) / cols) / (cols - 1));
    } else {
      variance.push((sum2 - (sum1 * sum1) / cols) / cols);
    }
  }
  return variance;
}

function varianceByColumn(matrix, unbiased, mean) {
  const rows = matrix.rows;
  const cols = matrix.columns;
  const variance = [];

  for (let j = 0; j < cols; j++) {
    let sum1 = 0;
    let sum2 = 0;
    let x = 0;
    for (let i = 0; i < rows; i++) {
      x = matrix.get(i, j) - mean[j];
      sum1 += x;
      sum2 += x * x;
    }
    if (unbiased) {
      variance.push((sum2 - (sum1 * sum1) / rows) / (rows - 1));
    } else {
      variance.push((sum2 - (sum1 * sum1) / rows) / rows);
    }
  }
  return variance;
}

function varianceAll(matrix, unbiased, mean) {
  const rows = matrix.rows;
  const cols = matrix.columns;
  const size = rows * cols;

  let sum1 = 0;
  let sum2 = 0;
  let x = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      x = matrix.get(i, j) - mean;
      sum1 += x;
      sum2 += x * x;
    }
  }
  if (unbiased) {
    return (sum2 - (sum1 * sum1) / size) / (size - 1);
  } else {
    return (sum2 - (sum1 * sum1) / size) / size;
  }
}

function centerByRow(matrix, mean) {
  for (let i = 0; i < matrix.rows; i++) {
    for (let j = 0; j < matrix.columns; j++) {
      matrix.set(i, j, matrix.get(i, j) - mean[i]);
    }
  }
}

function centerByColumn(matrix, mean) {
  for (let i = 0; i < matrix.rows; i++) {
    for (let j = 0; j < matrix.columns; j++) {
      matrix.set(i, j, matrix.get(i, j) - mean[j]);
    }
  }
}

function centerAll(matrix, mean) {
  for (let i = 0; i < matrix.rows; i++) {
    for (let j = 0; j < matrix.columns; j++) {
      matrix.set(i, j, matrix.get(i, j) - mean);
    }
  }
}

function getScaleByRow(matrix) {
  const scale = [];
  for (let i = 0; i < matrix.rows; i++) {
    let sum = 0;
    for (let j = 0; j < matrix.columns; j++) {
      sum += Math.pow(matrix.get(i, j), 2) / (matrix.columns - 1);
    }
    scale.push(Math.sqrt(sum));
  }
  return scale;
}

function scaleByRow(matrix, scale) {
  for (let i = 0; i < matrix.rows; i++) {
    for (let j = 0; j < matrix.columns; j++) {
      matrix.set(i, j, matrix.get(i, j) / scale[i]);
    }
  }
}

function getScaleByColumn(matrix) {
  const scale = [];
  for (let j = 0; j < matrix.columns; j++) {
    let sum = 0;
    for (let i = 0; i < matrix.rows; i++) {
      sum += Math.pow(matrix.get(i, j), 2) / (matrix.rows - 1);
    }
    scale.push(Math.sqrt(sum));
  }
  return scale;
}

function scaleByColumn(matrix, scale) {
  for (let i = 0; i < matrix.rows; i++) {
    for (let j = 0; j < matrix.columns; j++) {
      matrix.set(i, j, matrix.get(i, j) / scale[j]);
    }
  }
}

function getScaleAll(matrix) {
  const divider = matrix.size - 1;
  let sum = 0;
  for (let j = 0; j < matrix.columns; j++) {
    for (let i = 0; i < matrix.rows; i++) {
      sum += Math.pow(matrix.get(i, j), 2) / divider;
    }
  }
  return Math.sqrt(sum);
}

function scaleAll(matrix, scale) {
  for (let i = 0; i < matrix.rows; i++) {
    for (let j = 0; j < matrix.columns; j++) {
      matrix.set(i, j, matrix.get(i, j) / scale);
    }
  }
}

class AbstractMatrix {
  static from1DArray(newRows, newColumns, newData) {
    let length = newRows * newColumns;
    if (length !== newData.length) {
      throw new RangeError('data length does not match given dimensions');
    }
    let newMatrix = new Matrix(newRows, newColumns);
    for (let row = 0; row < newRows; row++) {
      for (let column = 0; column < newColumns; column++) {
        newMatrix.set(row, column, newData[row * newColumns + column]);
      }
    }
    return newMatrix;
  }

  static rowVector(newData) {
    let vector = new Matrix(1, newData.length);
    for (let i = 0; i < newData.length; i++) {
      vector.set(0, i, newData[i]);
    }
    return vector;
  }

  static columnVector(newData) {
    let vector = new Matrix(newData.length, 1);
    for (let i = 0; i < newData.length; i++) {
      vector.set(i, 0, newData[i]);
    }
    return vector;
  }

  static zeros(rows, columns) {
    return new Matrix(rows, columns);
  }

  static ones(rows, columns) {
    return new Matrix(rows, columns).fill(1);
  }

  static rand(rows, columns, options = {}) {
    if (typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }
    const { random = Math.random } = options;
    let matrix = new Matrix(rows, columns);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        matrix.set(i, j, random());
      }
    }
    return matrix;
  }

  static randInt(rows, columns, options = {}) {
    if (typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }
    const { min = 0, max = 1000, random = Math.random } = options;
    if (!Number.isInteger(min)) throw new TypeError('min must be an integer');
    if (!Number.isInteger(max)) throw new TypeError('max must be an integer');
    if (min >= max) throw new RangeError('min must be smaller than max');
    let interval = max - min;
    let matrix = new Matrix(rows, columns);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        let value = min + Math.round(random() * interval);
        matrix.set(i, j, value);
      }
    }
    return matrix;
  }

  static eye(rows, columns, value) {
    if (columns === undefined) columns = rows;
    if (value === undefined) value = 1;
    let min = Math.min(rows, columns);
    let matrix = this.zeros(rows, columns);
    for (let i = 0; i < min; i++) {
      matrix.set(i, i, value);
    }
    return matrix;
  }

  static diag(data, rows, columns) {
    let l = data.length;
    if (rows === undefined) rows = l;
    if (columns === undefined) columns = rows;
    let min = Math.min(l, rows, columns);
    let matrix = this.zeros(rows, columns);
    for (let i = 0; i < min; i++) {
      matrix.set(i, i, data[i]);
    }
    return matrix;
  }

  static min(matrix1, matrix2) {
    matrix1 = this.checkMatrix(matrix1);
    matrix2 = this.checkMatrix(matrix2);
    let rows = matrix1.rows;
    let columns = matrix1.columns;
    let result = new Matrix(rows, columns);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        result.set(i, j, Math.min(matrix1.get(i, j), matrix2.get(i, j)));
      }
    }
    return result;
  }

  static max(matrix1, matrix2) {
    matrix1 = this.checkMatrix(matrix1);
    matrix2 = this.checkMatrix(matrix2);
    let rows = matrix1.rows;
    let columns = matrix1.columns;
    let result = new this(rows, columns);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        result.set(i, j, Math.max(matrix1.get(i, j), matrix2.get(i, j)));
      }
    }
    return result;
  }

  static checkMatrix(value) {
    return AbstractMatrix.isMatrix(value) ? value : new Matrix(value);
  }

  static isMatrix(value) {
    return value != null && value.klass === 'Matrix';
  }

  get size() {
    return this.rows * this.columns;
  }

  apply(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function');
    }
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        callback.call(this, i, j);
      }
    }
    return this;
  }

  to1DArray() {
    let array = [];
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        array.push(this.get(i, j));
      }
    }
    return array;
  }

  to2DArray() {
    let copy = [];
    for (let i = 0; i < this.rows; i++) {
      copy.push([]);
      for (let j = 0; j < this.columns; j++) {
        copy[i].push(this.get(i, j));
      }
    }
    return copy;
  }

  toJSON() {
    return this.to2DArray();
  }

  isRowVector() {
    return this.rows === 1;
  }

  isColumnVector() {
    return this.columns === 1;
  }

  isVector() {
    return this.rows === 1 || this.columns === 1;
  }

  isSquare() {
    return this.rows === this.columns;
  }

  isEmpty() {
    return this.rows === 0 || this.columns === 0;
  }

  isSymmetric() {
    if (this.isSquare()) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j <= i; j++) {
          if (this.get(i, j) !== this.get(j, i)) {
            return false;
          }
        }
      }
      return true;
    }
    return false;
  }

  isEchelonForm() {
    let i = 0;
    let j = 0;
    let previousColumn = -1;
    let isEchelonForm = true;
    let checked = false;
    while (i < this.rows && isEchelonForm) {
      j = 0;
      checked = false;
      while (j < this.columns && checked === false) {
        if (this.get(i, j) === 0) {
          j++;
        } else if (this.get(i, j) === 1 && j > previousColumn) {
          checked = true;
          previousColumn = j;
        } else {
          isEchelonForm = false;
          checked = true;
        }
      }
      i++;
    }
    return isEchelonForm;
  }

  isReducedEchelonForm() {
    let i = 0;
    let j = 0;
    let previousColumn = -1;
    let isReducedEchelonForm = true;
    let checked = false;
    while (i < this.rows && isReducedEchelonForm) {
      j = 0;
      checked = false;
      while (j < this.columns && checked === false) {
        if (this.get(i, j) === 0) {
          j++;
        } else if (this.get(i, j) === 1 && j > previousColumn) {
          checked = true;
          previousColumn = j;
        } else {
          isReducedEchelonForm = false;
          checked = true;
        }
      }
      for (let k = j + 1; k < this.rows; k++) {
        if (this.get(i, k) !== 0) {
          isReducedEchelonForm = false;
        }
      }
      i++;
    }
    return isReducedEchelonForm;
  }

  echelonForm() {
    let result = this.clone();
    let h = 0;
    let k = 0;
    while (h < result.rows && k < result.columns) {
      let iMax = h;
      for (let i = h; i < result.rows; i++) {
        if (result.get(i, k) > result.get(iMax, k)) {
          iMax = i;
        }
      }
      if (result.get(iMax, k) === 0) {
        k++;
      } else {
        result.swapRows(h, iMax);
        let tmp = result.get(h, k);
        for (let j = k; j < result.columns; j++) {
          result.set(h, j, result.get(h, j) / tmp);
        }
        for (let i = h + 1; i < result.rows; i++) {
          let factor = result.get(i, k) / result.get(h, k);
          result.set(i, k, 0);
          for (let j = k + 1; j < result.columns; j++) {
            result.set(i, j, result.get(i, j) - result.get(h, j) * factor);
          }
        }
        h++;
        k++;
      }
    }
    return result;
  }

  reducedEchelonForm() {
    let result = this.echelonForm();
    let m = result.columns;
    let n = result.rows;
    let h = n - 1;
    while (h >= 0) {
      if (result.maxRow(h) === 0) {
        h--;
      } else {
        let p = 0;
        let pivot = false;
        while (p < n && pivot === false) {
          if (result.get(h, p) === 1) {
            pivot = true;
          } else {
            p++;
          }
        }
        for (let i = 0; i < h; i++) {
          let factor = result.get(i, p);
          for (let j = p; j < m; j++) {
            let tmp = result.get(i, j) - factor * result.get(h, j);
            result.set(i, j, tmp);
          }
        }
        h--;
      }
    }
    return result;
  }

  set() {
    throw new Error('set method is unimplemented');
  }

  get() {
    throw new Error('get method is unimplemented');
  }

  repeat(options = {}) {
    if (typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }
    const { rows = 1, columns = 1 } = options;
    if (!Number.isInteger(rows) || rows <= 0) {
      throw new TypeError('rows must be a positive integer');
    }
    if (!Number.isInteger(columns) || columns <= 0) {
      throw new TypeError('columns must be a positive integer');
    }
    let matrix = new Matrix(this.rows * rows, this.columns * columns);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        matrix.setSubMatrix(this, this.rows * i, this.columns * j);
      }
    }
    return matrix;
  }

  fill(value) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, value);
      }
    }
    return this;
  }

  neg() {
    return this.mulS(-1);
  }

  getRow(index) {
    checkRowIndex(this, index);
    let row = [];
    for (let i = 0; i < this.columns; i++) {
      row.push(this.get(index, i));
    }
    return row;
  }

  getRowVector(index) {
    return Matrix.rowVector(this.getRow(index));
  }

  setRow(index, array) {
    checkRowIndex(this, index);
    array = checkRowVector(this, array);
    for (let i = 0; i < this.columns; i++) {
      this.set(index, i, array[i]);
    }
    return this;
  }

  swapRows(row1, row2) {
    checkRowIndex(this, row1);
    checkRowIndex(this, row2);
    for (let i = 0; i < this.columns; i++) {
      let temp = this.get(row1, i);
      this.set(row1, i, this.get(row2, i));
      this.set(row2, i, temp);
    }
    return this;
  }

  getColumn(index) {
    checkColumnIndex(this, index);
    let column = [];
    for (let i = 0; i < this.rows; i++) {
      column.push(this.get(i, index));
    }
    return column;
  }

  getColumnVector(index) {
    return Matrix.columnVector(this.getColumn(index));
  }

  setColumn(index, array) {
    checkColumnIndex(this, index);
    array = checkColumnVector(this, array);
    for (let i = 0; i < this.rows; i++) {
      this.set(i, index, array[i]);
    }
    return this;
  }

  swapColumns(column1, column2) {
    checkColumnIndex(this, column1);
    checkColumnIndex(this, column2);
    for (let i = 0; i < this.rows; i++) {
      let temp = this.get(i, column1);
      this.set(i, column1, this.get(i, column2));
      this.set(i, column2, temp);
    }
    return this;
  }

  addRowVector(vector) {
    vector = checkRowVector(this, vector);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) + vector[j]);
      }
    }
    return this;
  }

  subRowVector(vector) {
    vector = checkRowVector(this, vector);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) - vector[j]);
      }
    }
    return this;
  }

  mulRowVector(vector) {
    vector = checkRowVector(this, vector);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) * vector[j]);
      }
    }
    return this;
  }

  divRowVector(vector) {
    vector = checkRowVector(this, vector);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) / vector[j]);
      }
    }
    return this;
  }

  addColumnVector(vector) {
    vector = checkColumnVector(this, vector);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) + vector[i]);
      }
    }
    return this;
  }

  subColumnVector(vector) {
    vector = checkColumnVector(this, vector);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) - vector[i]);
      }
    }
    return this;
  }

  mulColumnVector(vector) {
    vector = checkColumnVector(this, vector);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) * vector[i]);
      }
    }
    return this;
  }

  divColumnVector(vector) {
    vector = checkColumnVector(this, vector);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, this.get(i, j) / vector[i]);
      }
    }
    return this;
  }

  mulRow(index, value) {
    checkRowIndex(this, index);
    for (let i = 0; i < this.columns; i++) {
      this.set(index, i, this.get(index, i) * value);
    }
    return this;
  }

  mulColumn(index, value) {
    checkColumnIndex(this, index);
    for (let i = 0; i < this.rows; i++) {
      this.set(i, index, this.get(i, index) * value);
    }
    return this;
  }

  max(by) {
    if (this.isEmpty()) {
      return NaN;
    }
    switch (by) {
      case 'row': {
        const max = new Array(this.rows).fill(Number.NEGATIVE_INFINITY);
        for (let row = 0; row < this.rows; row++) {
          for (let column = 0; column < this.columns; column++) {
            if (this.get(row, column) > max[row]) {
              max[row] = this.get(row, column);
            }
          }
        }
        return max;
      }
      case 'column': {
        const max = new Array(this.columns).fill(Number.NEGATIVE_INFINITY);
        for (let row = 0; row < this.rows; row++) {
          for (let column = 0; column < this.columns; column++) {
            if (this.get(row, column) > max[column]) {
              max[column] = this.get(row, column);
            }
          }
        }
        return max;
      }
      case undefined: {
        let max = this.get(0, 0);
        for (let row = 0; row < this.rows; row++) {
          for (let column = 0; column < this.columns; column++) {
            if (this.get(row, column) > max) {
              max = this.get(row, column);
            }
          }
        }
        return max;
      }
      default:
        throw new Error(`invalid option: ${by}`);
    }
  }

  maxIndex() {
    checkNonEmpty(this);
    let v = this.get(0, 0);
    let idx = [0, 0];
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        if (this.get(i, j) > v) {
          v = this.get(i, j);
          idx[0] = i;
          idx[1] = j;
        }
      }
    }
    return idx;
  }

  min(by) {
    if (this.isEmpty()) {
      return NaN;
    }

    switch (by) {
      case 'row': {
        const min = new Array(this.rows).fill(Number.POSITIVE_INFINITY);
        for (let row = 0; row < this.rows; row++) {
          for (let column = 0; column < this.columns; column++) {
            if (this.get(row, column) < min[row]) {
              min[row] = this.get(row, column);
            }
          }
        }
        return min;
      }
      case 'column': {
        const min = new Array(this.columns).fill(Number.POSITIVE_INFINITY);
        for (let row = 0; row < this.rows; row++) {
          for (let column = 0; column < this.columns; column++) {
            if (this.get(row, column) < min[column]) {
              min[column] = this.get(row, column);
            }
          }
        }
        return min;
      }
      case undefined: {
        let min = this.get(0, 0);
        for (let row = 0; row < this.rows; row++) {
          for (let column = 0; column < this.columns; column++) {
            if (this.get(row, column) < min) {
              min = this.get(row, column);
            }
          }
        }
        return min;
      }
      default:
        throw new Error(`invalid option: ${by}`);
    }
  }

  minIndex() {
    checkNonEmpty(this);
    let v = this.get(0, 0);
    let idx = [0, 0];
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        if (this.get(i, j) < v) {
          v = this.get(i, j);
          idx[0] = i;
          idx[1] = j;
        }
      }
    }
    return idx;
  }

  maxRow(row) {
    checkRowIndex(this, row);
    if (this.isEmpty()) {
      return NaN;
    }
    let v = this.get(row, 0);
    for (let i = 1; i < this.columns; i++) {
      if (this.get(row, i) > v) {
        v = this.get(row, i);
      }
    }
    return v;
  }

  maxRowIndex(row) {
    checkRowIndex(this, row);
    checkNonEmpty(this);
    let v = this.get(row, 0);
    let idx = [row, 0];
    for (let i = 1; i < this.columns; i++) {
      if (this.get(row, i) > v) {
        v = this.get(row, i);
        idx[1] = i;
      }
    }
    return idx;
  }

  minRow(row) {
    checkRowIndex(this, row);
    if (this.isEmpty()) {
      return NaN;
    }
    let v = this.get(row, 0);
    for (let i = 1; i < this.columns; i++) {
      if (this.get(row, i) < v) {
        v = this.get(row, i);
      }
    }
    return v;
  }

  minRowIndex(row) {
    checkRowIndex(this, row);
    checkNonEmpty(this);
    let v = this.get(row, 0);
    let idx = [row, 0];
    for (let i = 1; i < this.columns; i++) {
      if (this.get(row, i) < v) {
        v = this.get(row, i);
        idx[1] = i;
      }
    }
    return idx;
  }

  maxColumn(column) {
    checkColumnIndex(this, column);
    if (this.isEmpty()) {
      return NaN;
    }
    let v = this.get(0, column);
    for (let i = 1; i < this.rows; i++) {
      if (this.get(i, column) > v) {
        v = this.get(i, column);
      }
    }
    return v;
  }

  maxColumnIndex(column) {
    checkColumnIndex(this, column);
    checkNonEmpty(this);
    let v = this.get(0, column);
    let idx = [0, column];
    for (let i = 1; i < this.rows; i++) {
      if (this.get(i, column) > v) {
        v = this.get(i, column);
        idx[0] = i;
      }
    }
    return idx;
  }

  minColumn(column) {
    checkColumnIndex(this, column);
    if (this.isEmpty()) {
      return NaN;
    }
    let v = this.get(0, column);
    for (let i = 1; i < this.rows; i++) {
      if (this.get(i, column) < v) {
        v = this.get(i, column);
      }
    }
    return v;
  }

  minColumnIndex(column) {
    checkColumnIndex(this, column);
    checkNonEmpty(this);
    let v = this.get(0, column);
    let idx = [0, column];
    for (let i = 1; i < this.rows; i++) {
      if (this.get(i, column) < v) {
        v = this.get(i, column);
        idx[0] = i;
      }
    }
    return idx;
  }

  diag() {
    let min = Math.min(this.rows, this.columns);
    let diag = [];
    for (let i = 0; i < min; i++) {
      diag.push(this.get(i, i));
    }
    return diag;
  }

  norm(type = 'frobenius') {
    let result = 0;
    if (type === 'max') {
      return this.max();
    } else if (type === 'frobenius') {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          result = result + this.get(i, j) * this.get(i, j);
        }
      }
      return Math.sqrt(result);
    } else {
      throw new RangeError(`unknown norm type: ${type}`);
    }
  }

  cumulativeSum() {
    let sum = 0;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        sum += this.get(i, j);
        this.set(i, j, sum);
      }
    }
    return this;
  }

  dot(vector2) {
    if (AbstractMatrix.isMatrix(vector2)) vector2 = vector2.to1DArray();
    let vector1 = this.to1DArray();
    if (vector1.length !== vector2.length) {
      throw new RangeError('vectors do not have the same size');
    }
    let dot = 0;
    for (let i = 0; i < vector1.length; i++) {
      dot += vector1[i] * vector2[i];
    }
    return dot;
  }

  mmul(other) {
    other = Matrix.checkMatrix(other);

    let m = this.rows;
    let n = this.columns;
    let p = other.columns;

    let result = new Matrix(m, p);

    let Bcolj = new Float64Array(n);
    for (let j = 0; j < p; j++) {
      for (let k = 0; k < n; k++) {
        Bcolj[k] = other.get(k, j);
      }

      for (let i = 0; i < m; i++) {
        let s = 0;
        for (let k = 0; k < n; k++) {
          s += this.get(i, k) * Bcolj[k];
        }

        result.set(i, j, s);
      }
    }
    return result;
  }

  strassen2x2(other) {
    other = Matrix.checkMatrix(other);
    let result = new Matrix(2, 2);
    const a11 = this.get(0, 0);
    const b11 = other.get(0, 0);
    const a12 = this.get(0, 1);
    const b12 = other.get(0, 1);
    const a21 = this.get(1, 0);
    const b21 = other.get(1, 0);
    const a22 = this.get(1, 1);
    const b22 = other.get(1, 1);

    // Compute intermediate values.
    const m1 = (a11 + a22) * (b11 + b22);
    const m2 = (a21 + a22) * b11;
    const m3 = a11 * (b12 - b22);
    const m4 = a22 * (b21 - b11);
    const m5 = (a11 + a12) * b22;
    const m6 = (a21 - a11) * (b11 + b12);
    const m7 = (a12 - a22) * (b21 + b22);

    // Combine intermediate values into the output.
    const c00 = m1 + m4 - m5 + m7;
    const c01 = m3 + m5;
    const c10 = m2 + m4;
    const c11 = m1 - m2 + m3 + m6;

    result.set(0, 0, c00);
    result.set(0, 1, c01);
    result.set(1, 0, c10);
    result.set(1, 1, c11);
    return result;
  }

  strassen3x3(other) {
    other = Matrix.checkMatrix(other);
    let result = new Matrix(3, 3);

    const a00 = this.get(0, 0);
    const a01 = this.get(0, 1);
    const a02 = this.get(0, 2);
    const a10 = this.get(1, 0);
    const a11 = this.get(1, 1);
    const a12 = this.get(1, 2);
    const a20 = this.get(2, 0);
    const a21 = this.get(2, 1);
    const a22 = this.get(2, 2);

    const b00 = other.get(0, 0);
    const b01 = other.get(0, 1);
    const b02 = other.get(0, 2);
    const b10 = other.get(1, 0);
    const b11 = other.get(1, 1);
    const b12 = other.get(1, 2);
    const b20 = other.get(2, 0);
    const b21 = other.get(2, 1);
    const b22 = other.get(2, 2);

    const m1 = (a00 + a01 + a02 - a10 - a11 - a21 - a22) * b11;
    const m2 = (a00 - a10) * (-b01 + b11);
    const m3 = a11 * (-b00 + b01 + b10 - b11 - b12 - b20 + b22);
    const m4 = (-a00 + a10 + a11) * (b00 - b01 + b11);
    const m5 = (a10 + a11) * (-b00 + b01);
    const m6 = a00 * b00;
    const m7 = (-a00 + a20 + a21) * (b00 - b02 + b12);
    const m8 = (-a00 + a20) * (b02 - b12);
    const m9 = (a20 + a21) * (-b00 + b02);
    const m10 = (a00 + a01 + a02 - a11 - a12 - a20 - a21) * b12;
    const m11 = a21 * (-b00 + b02 + b10 - b11 - b12 - b20 + b21);
    const m12 = (-a02 + a21 + a22) * (b11 + b20 - b21);
    const m13 = (a02 - a22) * (b11 - b21);
    const m14 = a02 * b20;
    const m15 = (a21 + a22) * (-b20 + b21);
    const m16 = (-a02 + a11 + a12) * (b12 + b20 - b22);
    const m17 = (a02 - a12) * (b12 - b22);
    const m18 = (a11 + a12) * (-b20 + b22);
    const m19 = a01 * b10;
    const m20 = a12 * b21;
    const m21 = a10 * b02;
    const m22 = a20 * b01;
    const m23 = a22 * b22;

    const c00 = m6 + m14 + m19;
    const c01 = m1 + m4 + m5 + m6 + m12 + m14 + m15;
    const c02 = m6 + m7 + m9 + m10 + m14 + m16 + m18;
    const c10 = m2 + m3 + m4 + m6 + m14 + m16 + m17;
    const c11 = m2 + m4 + m5 + m6 + m20;
    const c12 = m14 + m16 + m17 + m18 + m21;
    const c20 = m6 + m7 + m8 + m11 + m12 + m13 + m14;
    const c21 = m12 + m13 + m14 + m15 + m22;
    const c22 = m6 + m7 + m8 + m9 + m23;

    result.set(0, 0, c00);
    result.set(0, 1, c01);
    result.set(0, 2, c02);
    result.set(1, 0, c10);
    result.set(1, 1, c11);
    result.set(1, 2, c12);
    result.set(2, 0, c20);
    result.set(2, 1, c21);
    result.set(2, 2, c22);
    return result;
  }

  mmulStrassen(y) {
    y = Matrix.checkMatrix(y);
    let x = this.clone();
    let r1 = x.rows;
    let c1 = x.columns;
    let r2 = y.rows;
    let c2 = y.columns;
    if (c1 !== r2) {
      // eslint-disable-next-line no-console
      console.warn(
        `Multiplying ${r1} x ${c1} and ${r2} x ${c2} matrix: dimensions do not match.`,
      );
    }

    // Put a matrix into the top left of a matrix of zeros.
    // `rows` and `cols` are the dimensions of the output matrix.
    function embed(mat, rows, cols) {
      let r = mat.rows;
      let c = mat.columns;
      if (r === rows && c === cols) {
        return mat;
      } else {
        let resultat = AbstractMatrix.zeros(rows, cols);
        resultat = resultat.setSubMatrix(mat, 0, 0);
        return resultat;
      }
    }

    // Make sure both matrices are the same size.
    // This is exclusively for simplicity:
    // this algorithm can be implemented with matrices of different sizes.

    let r = Math.max(r1, r2);
    let c = Math.max(c1, c2);
    x = embed(x, r, c);
    y = embed(y, r, c);

    // Our recursive multiplication function.
    function blockMult(a, b, rows, cols) {
      // For small matrices, resort to naive multiplication.
      if (rows <= 512 || cols <= 512) {
        return a.mmul(b); // a is equivalent to this
      }

      // Apply dynamic padding.
      if (rows % 2 === 1 && cols % 2 === 1) {
        a = embed(a, rows + 1, cols + 1);
        b = embed(b, rows + 1, cols + 1);
      } else if (rows % 2 === 1) {
        a = embed(a, rows + 1, cols);
        b = embed(b, rows + 1, cols);
      } else if (cols % 2 === 1) {
        a = embed(a, rows, cols + 1);
        b = embed(b, rows, cols + 1);
      }

      let halfRows = parseInt(a.rows / 2, 10);
      let halfCols = parseInt(a.columns / 2, 10);
      // Subdivide input matrices.
      let a11 = a.subMatrix(0, halfRows - 1, 0, halfCols - 1);
      let b11 = b.subMatrix(0, halfRows - 1, 0, halfCols - 1);

      let a12 = a.subMatrix(0, halfRows - 1, halfCols, a.columns - 1);
      let b12 = b.subMatrix(0, halfRows - 1, halfCols, b.columns - 1);

      let a21 = a.subMatrix(halfRows, a.rows - 1, 0, halfCols - 1);
      let b21 = b.subMatrix(halfRows, b.rows - 1, 0, halfCols - 1);

      let a22 = a.subMatrix(halfRows, a.rows - 1, halfCols, a.columns - 1);
      let b22 = b.subMatrix(halfRows, b.rows - 1, halfCols, b.columns - 1);

      // Compute intermediate values.
      let m1 = blockMult(
        AbstractMatrix.add(a11, a22),
        AbstractMatrix.add(b11, b22),
        halfRows,
        halfCols,
      );
      let m2 = blockMult(AbstractMatrix.add(a21, a22), b11, halfRows, halfCols);
      let m3 = blockMult(a11, AbstractMatrix.sub(b12, b22), halfRows, halfCols);
      let m4 = blockMult(a22, AbstractMatrix.sub(b21, b11), halfRows, halfCols);
      let m5 = blockMult(AbstractMatrix.add(a11, a12), b22, halfRows, halfCols);
      let m6 = blockMult(
        AbstractMatrix.sub(a21, a11),
        AbstractMatrix.add(b11, b12),
        halfRows,
        halfCols,
      );
      let m7 = blockMult(
        AbstractMatrix.sub(a12, a22),
        AbstractMatrix.add(b21, b22),
        halfRows,
        halfCols,
      );

      // Combine intermediate values into the output.
      let c11 = AbstractMatrix.add(m1, m4);
      c11.sub(m5);
      c11.add(m7);
      let c12 = AbstractMatrix.add(m3, m5);
      let c21 = AbstractMatrix.add(m2, m4);
      let c22 = AbstractMatrix.sub(m1, m2);
      c22.add(m3);
      c22.add(m6);

      // Crop output to the desired size (undo dynamic padding).
      let resultat = AbstractMatrix.zeros(2 * c11.rows, 2 * c11.columns);
      resultat = resultat.setSubMatrix(c11, 0, 0);
      resultat = resultat.setSubMatrix(c12, c11.rows, 0);
      resultat = resultat.setSubMatrix(c21, 0, c11.columns);
      resultat = resultat.setSubMatrix(c22, c11.rows, c11.columns);
      return resultat.subMatrix(0, rows - 1, 0, cols - 1);
    }

    return blockMult(x, y, r, c);
  }

  scaleRows(options = {}) {
    if (typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }
    const { min = 0, max = 1 } = options;
    if (!Number.isFinite(min)) throw new TypeError('min must be a number');
    if (!Number.isFinite(max)) throw new TypeError('max must be a number');
    if (min >= max) throw new RangeError('min must be smaller than max');
    let newMatrix = new Matrix(this.rows, this.columns);
    for (let i = 0; i < this.rows; i++) {
      const row = this.getRow(i);
      if (row.length > 0) {
        rescale__default["default"](row, { min, max, output: row });
      }
      newMatrix.setRow(i, row);
    }
    return newMatrix;
  }

  scaleColumns(options = {}) {
    if (typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }
    const { min = 0, max = 1 } = options;
    if (!Number.isFinite(min)) throw new TypeError('min must be a number');
    if (!Number.isFinite(max)) throw new TypeError('max must be a number');
    if (min >= max) throw new RangeError('min must be smaller than max');
    let newMatrix = new Matrix(this.rows, this.columns);
    for (let i = 0; i < this.columns; i++) {
      const column = this.getColumn(i);
      if (column.length) {
        rescale__default["default"](column, {
          min: min,
          max: max,
          output: column,
        });
      }
      newMatrix.setColumn(i, column);
    }
    return newMatrix;
  }

  flipRows() {
    const middle = Math.ceil(this.columns / 2);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < middle; j++) {
        let first = this.get(i, j);
        let last = this.get(i, this.columns - 1 - j);
        this.set(i, j, last);
        this.set(i, this.columns - 1 - j, first);
      }
    }
    return this;
  }

  flipColumns() {
    const middle = Math.ceil(this.rows / 2);
    for (let j = 0; j < this.columns; j++) {
      for (let i = 0; i < middle; i++) {
        let first = this.get(i, j);
        let last = this.get(this.rows - 1 - i, j);
        this.set(i, j, last);
        this.set(this.rows - 1 - i, j, first);
      }
    }
    return this;
  }

  kroneckerProduct(other) {
    other = Matrix.checkMatrix(other);

    let m = this.rows;
    let n = this.columns;
    let p = other.rows;
    let q = other.columns;

    let result = new Matrix(m * p, n * q);
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < p; k++) {
          for (let l = 0; l < q; l++) {
            result.set(p * i + k, q * j + l, this.get(i, j) * other.get(k, l));
          }
        }
      }
    }
    return result;
  }

  kroneckerSum(other) {
    other = Matrix.checkMatrix(other);
    if (!this.isSquare() || !other.isSquare()) {
      throw new Error('Kronecker Sum needs two Square Matrices');
    }
    let m = this.rows;
    let n = other.rows;
    let AxI = this.kroneckerProduct(Matrix.eye(n, n));
    let IxB = Matrix.eye(m, m).kroneckerProduct(other);
    return AxI.add(IxB);
  }

  transpose() {
    let result = new Matrix(this.columns, this.rows);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        result.set(j, i, this.get(i, j));
      }
    }
    return result;
  }

  sortRows(compareFunction = compareNumbers) {
    for (let i = 0; i < this.rows; i++) {
      this.setRow(i, this.getRow(i).sort(compareFunction));
    }
    return this;
  }

  sortColumns(compareFunction = compareNumbers) {
    for (let i = 0; i < this.columns; i++) {
      this.setColumn(i, this.getColumn(i).sort(compareFunction));
    }
    return this;
  }

  subMatrix(startRow, endRow, startColumn, endColumn) {
    checkRange(this, startRow, endRow, startColumn, endColumn);
    let newMatrix = new Matrix(
      endRow - startRow + 1,
      endColumn - startColumn + 1,
    );
    for (let i = startRow; i <= endRow; i++) {
      for (let j = startColumn; j <= endColumn; j++) {
        newMatrix.set(i - startRow, j - startColumn, this.get(i, j));
      }
    }
    return newMatrix;
  }

  subMatrixRow(indices, startColumn, endColumn) {
    if (startColumn === undefined) startColumn = 0;
    if (endColumn === undefined) endColumn = this.columns - 1;
    if (
      startColumn > endColumn ||
      startColumn < 0 ||
      startColumn >= this.columns ||
      endColumn < 0 ||
      endColumn >= this.columns
    ) {
      throw new RangeError('Argument out of range');
    }

    let newMatrix = new Matrix(indices.length, endColumn - startColumn + 1);
    for (let i = 0; i < indices.length; i++) {
      for (let j = startColumn; j <= endColumn; j++) {
        if (indices[i] < 0 || indices[i] >= this.rows) {
          throw new RangeError(`Row index out of range: ${indices[i]}`);
        }
        newMatrix.set(i, j - startColumn, this.get(indices[i], j));
      }
    }
    return newMatrix;
  }

  subMatrixColumn(indices, startRow, endRow) {
    if (startRow === undefined) startRow = 0;
    if (endRow === undefined) endRow = this.rows - 1;
    if (
      startRow > endRow ||
      startRow < 0 ||
      startRow >= this.rows ||
      endRow < 0 ||
      endRow >= this.rows
    ) {
      throw new RangeError('Argument out of range');
    }

    let newMatrix = new Matrix(endRow - startRow + 1, indices.length);
    for (let i = 0; i < indices.length; i++) {
      for (let j = startRow; j <= endRow; j++) {
        if (indices[i] < 0 || indices[i] >= this.columns) {
          throw new RangeError(`Column index out of range: ${indices[i]}`);
        }
        newMatrix.set(j - startRow, i, this.get(j, indices[i]));
      }
    }
    return newMatrix;
  }

  setSubMatrix(matrix, startRow, startColumn) {
    matrix = Matrix.checkMatrix(matrix);
    if (matrix.isEmpty()) {
      return this;
    }
    let endRow = startRow + matrix.rows - 1;
    let endColumn = startColumn + matrix.columns - 1;
    checkRange(this, startRow, endRow, startColumn, endColumn);
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.columns; j++) {
        this.set(startRow + i, startColumn + j, matrix.get(i, j));
      }
    }
    return this;
  }

  selection(rowIndices, columnIndices) {
    checkRowIndices(this, rowIndices);
    checkColumnIndices(this, columnIndices);
    let newMatrix = new Matrix(rowIndices.length, columnIndices.length);
    for (let i = 0; i < rowIndices.length; i++) {
      let rowIndex = rowIndices[i];
      for (let j = 0; j < columnIndices.length; j++) {
        let columnIndex = columnIndices[j];
        newMatrix.set(i, j, this.get(rowIndex, columnIndex));
      }
    }
    return newMatrix;
  }

  trace() {
    let min = Math.min(this.rows, this.columns);
    let trace = 0;
    for (let i = 0; i < min; i++) {
      trace += this.get(i, i);
    }
    return trace;
  }

  clone() {
    let newMatrix = new Matrix(this.rows, this.columns);
    for (let row = 0; row < this.rows; row++) {
      for (let column = 0; column < this.columns; column++) {
        newMatrix.set(row, column, this.get(row, column));
      }
    }
    return newMatrix;
  }

  sum(by) {
    switch (by) {
      case 'row':
        return sumByRow(this);
      case 'column':
        return sumByColumn(this);
      case undefined:
        return sumAll(this);
      default:
        throw new Error(`invalid option: ${by}`);
    }
  }

  product(by) {
    switch (by) {
      case 'row':
        return productByRow(this);
      case 'column':
        return productByColumn(this);
      case undefined:
        return productAll(this);
      default:
        throw new Error(`invalid option: ${by}`);
    }
  }

  mean(by) {
    const sum = this.sum(by);
    switch (by) {
      case 'row': {
        for (let i = 0; i < this.rows; i++) {
          sum[i] /= this.columns;
        }
        return sum;
      }
      case 'column': {
        for (let i = 0; i < this.columns; i++) {
          sum[i] /= this.rows;
        }
        return sum;
      }
      case undefined:
        return sum / this.size;
      default:
        throw new Error(`invalid option: ${by}`);
    }
  }

  variance(by, options = {}) {
    if (typeof by === 'object') {
      options = by;
      by = undefined;
    }
    if (typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }
    const { unbiased = true, mean = this.mean(by) } = options;
    if (typeof unbiased !== 'boolean') {
      throw new TypeError('unbiased must be a boolean');
    }
    switch (by) {
      case 'row': {
        if (!isAnyArray.isAnyArray(mean)) {
          throw new TypeError('mean must be an array');
        }
        return varianceByRow(this, unbiased, mean);
      }
      case 'column': {
        if (!isAnyArray.isAnyArray(mean)) {
          throw new TypeError('mean must be an array');
        }
        return varianceByColumn(this, unbiased, mean);
      }
      case undefined: {
        if (typeof mean !== 'number') {
          throw new TypeError('mean must be a number');
        }
        return varianceAll(this, unbiased, mean);
      }
      default:
        throw new Error(`invalid option: ${by}`);
    }
  }

  standardDeviation(by, options) {
    if (typeof by === 'object') {
      options = by;
      by = undefined;
    }
    const variance = this.variance(by, options);
    if (by === undefined) {
      return Math.sqrt(variance);
    } else {
      for (let i = 0; i < variance.length; i++) {
        variance[i] = Math.sqrt(variance[i]);
      }
      return variance;
    }
  }

  center(by, options = {}) {
    if (typeof by === 'object') {
      options = by;
      by = undefined;
    }
    if (typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }
    const { center = this.mean(by) } = options;
    switch (by) {
      case 'row': {
        if (!isAnyArray.isAnyArray(center)) {
          throw new TypeError('center must be an array');
        }
        centerByRow(this, center);
        return this;
      }
      case 'column': {
        if (!isAnyArray.isAnyArray(center)) {
          throw new TypeError('center must be an array');
        }
        centerByColumn(this, center);
        return this;
      }
      case undefined: {
        if (typeof center !== 'number') {
          throw new TypeError('center must be a number');
        }
        centerAll(this, center);
        return this;
      }
      default:
        throw new Error(`invalid option: ${by}`);
    }
  }

  scale(by, options = {}) {
    if (typeof by === 'object') {
      options = by;
      by = undefined;
    }
    if (typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }
    let scale = options.scale;
    switch (by) {
      case 'row': {
        if (scale === undefined) {
          scale = getScaleByRow(this);
        } else if (!isAnyArray.isAnyArray(scale)) {
          throw new TypeError('scale must be an array');
        }
        scaleByRow(this, scale);
        return this;
      }
      case 'column': {
        if (scale === undefined) {
          scale = getScaleByColumn(this);
        } else if (!isAnyArray.isAnyArray(scale)) {
          throw new TypeError('scale must be an array');
        }
        scaleByColumn(this, scale);
        return this;
      }
      case undefined: {
        if (scale === undefined) {
          scale = getScaleAll(this);
        } else if (typeof scale !== 'number') {
          throw new TypeError('scale must be a number');
        }
        scaleAll(this, scale);
        return this;
      }
      default:
        throw new Error(`invalid option: ${by}`);
    }
  }

  toString(options) {
    return inspectMatrixWithOptions(this, options);
  }
}

AbstractMatrix.prototype.klass = 'Matrix';
if (typeof Symbol !== 'undefined') {
  AbstractMatrix.prototype[Symbol.for('nodejs.util.inspect.custom')] =
    inspectMatrix;
}

function compareNumbers(a, b) {
  return a - b;
}

function isArrayOfNumbers(array) {
  return array.every((element) => {
    return typeof element === 'number';
  });
}

// Synonyms
AbstractMatrix.random = AbstractMatrix.rand;
AbstractMatrix.randomInt = AbstractMatrix.randInt;
AbstractMatrix.diagonal = AbstractMatrix.diag;
AbstractMatrix.prototype.diagonal = AbstractMatrix.prototype.diag;
AbstractMatrix.identity = AbstractMatrix.eye;
AbstractMatrix.prototype.negate = AbstractMatrix.prototype.neg;
AbstractMatrix.prototype.tensorProduct =
  AbstractMatrix.prototype.kroneckerProduct;

class Matrix extends AbstractMatrix {
  constructor(nRows, nColumns) {
    super();
    if (Matrix.isMatrix(nRows)) {
      // eslint-disable-next-line no-constructor-return
      return nRows.clone();
    } else if (Number.isInteger(nRows) && nRows >= 0) {
      // Create an empty matrix
      this.data = [];
      if (Number.isInteger(nColumns) && nColumns >= 0) {
        for (let i = 0; i < nRows; i++) {
          this.data.push(new Float64Array(nColumns));
        }
      } else {
        throw new TypeError('nColumns must be a positive integer');
      }
    } else if (isAnyArray.isAnyArray(nRows)) {
      // Copy the values from the 2D array
      const arrayData = nRows;
      nRows = arrayData.length;
      nColumns = nRows ? arrayData[0].length : 0;
      if (typeof nColumns !== 'number') {
        throw new TypeError(
          'Data must be a 2D array with at least one element',
        );
      }
      this.data = [];
      for (let i = 0; i < nRows; i++) {
        if (arrayData[i].length !== nColumns) {
          throw new RangeError('Inconsistent array dimensions');
        }
        if (!isArrayOfNumbers(arrayData[i])) {
          throw new TypeError('Input data contains non-numeric values');
        }
        this.data.push(Float64Array.from(arrayData[i]));
      }
    } else {
      throw new TypeError(
        'First argument must be a positive number or an array',
      );
    }
    this.rows = nRows;
    this.columns = nColumns;
  }

  set(rowIndex, columnIndex, value) {
    this.data[rowIndex][columnIndex] = value;
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.data[rowIndex][columnIndex];
  }

  removeRow(index) {
    checkRowIndex(this, index);
    this.data.splice(index, 1);
    this.rows -= 1;
    return this;
  }

  addRow(index, array) {
    if (array === undefined) {
      array = index;
      index = this.rows;
    }
    checkRowIndex(this, index, true);
    array = Float64Array.from(checkRowVector(this, array));
    this.data.splice(index, 0, array);
    this.rows += 1;
    return this;
  }

  removeColumn(index) {
    checkColumnIndex(this, index);
    for (let i = 0; i < this.rows; i++) {
      const newRow = new Float64Array(this.columns - 1);
      for (let j = 0; j < index; j++) {
        newRow[j] = this.data[i][j];
      }
      for (let j = index + 1; j < this.columns; j++) {
        newRow[j - 1] = this.data[i][j];
      }
      this.data[i] = newRow;
    }
    this.columns -= 1;
    return this;
  }

  addColumn(index, array) {
    if (typeof array === 'undefined') {
      array = index;
      index = this.columns;
    }
    checkColumnIndex(this, index, true);
    array = checkColumnVector(this, array);
    for (let i = 0; i < this.rows; i++) {
      const newRow = new Float64Array(this.columns + 1);
      let j = 0;
      for (; j < index; j++) {
        newRow[j] = this.data[i][j];
      }
      newRow[j++] = array[i];
      for (; j < this.columns + 1; j++) {
        newRow[j] = this.data[i][j - 1];
      }
      this.data[i] = newRow;
    }
    this.columns += 1;
    return this;
  }
}

installMathOperations(AbstractMatrix, Matrix);

class BaseView extends AbstractMatrix {
  constructor(matrix, rows, columns) {
    super();
    this.matrix = matrix;
    this.rows = rows;
    this.columns = columns;
  }
}

class MatrixColumnView extends BaseView {
  constructor(matrix, column) {
    checkColumnIndex(matrix, column);
    super(matrix, matrix.rows, 1);
    this.column = column;
  }

  set(rowIndex, columnIndex, value) {
    this.matrix.set(rowIndex, this.column, value);
    return this;
  }

  get(rowIndex) {
    return this.matrix.get(rowIndex, this.column);
  }
}

class MatrixColumnSelectionView extends BaseView {
  constructor(matrix, columnIndices) {
    checkColumnIndices(matrix, columnIndices);
    super(matrix, matrix.rows, columnIndices.length);
    this.columnIndices = columnIndices;
  }

  set(rowIndex, columnIndex, value) {
    this.matrix.set(rowIndex, this.columnIndices[columnIndex], value);
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.matrix.get(rowIndex, this.columnIndices[columnIndex]);
  }
}

class MatrixFlipColumnView extends BaseView {
  constructor(matrix) {
    super(matrix, matrix.rows, matrix.columns);
  }

  set(rowIndex, columnIndex, value) {
    this.matrix.set(rowIndex, this.columns - columnIndex - 1, value);
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.matrix.get(rowIndex, this.columns - columnIndex - 1);
  }
}

class MatrixFlipRowView extends BaseView {
  constructor(matrix) {
    super(matrix, matrix.rows, matrix.columns);
  }

  set(rowIndex, columnIndex, value) {
    this.matrix.set(this.rows - rowIndex - 1, columnIndex, value);
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.matrix.get(this.rows - rowIndex - 1, columnIndex);
  }
}

class MatrixRowView extends BaseView {
  constructor(matrix, row) {
    checkRowIndex(matrix, row);
    super(matrix, 1, matrix.columns);
    this.row = row;
  }

  set(rowIndex, columnIndex, value) {
    this.matrix.set(this.row, columnIndex, value);
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.matrix.get(this.row, columnIndex);
  }
}

class MatrixRowSelectionView extends BaseView {
  constructor(matrix, rowIndices) {
    checkRowIndices(matrix, rowIndices);
    super(matrix, rowIndices.length, matrix.columns);
    this.rowIndices = rowIndices;
  }

  set(rowIndex, columnIndex, value) {
    this.matrix.set(this.rowIndices[rowIndex], columnIndex, value);
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.matrix.get(this.rowIndices[rowIndex], columnIndex);
  }
}

class MatrixSelectionView extends BaseView {
  constructor(matrix, rowIndices, columnIndices) {
    checkRowIndices(matrix, rowIndices);
    checkColumnIndices(matrix, columnIndices);
    super(matrix, rowIndices.length, columnIndices.length);
    this.rowIndices = rowIndices;
    this.columnIndices = columnIndices;
  }

  set(rowIndex, columnIndex, value) {
    this.matrix.set(
      this.rowIndices[rowIndex],
      this.columnIndices[columnIndex],
      value,
    );
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.matrix.get(
      this.rowIndices[rowIndex],
      this.columnIndices[columnIndex],
    );
  }
}

class MatrixSubView extends BaseView {
  constructor(matrix, startRow, endRow, startColumn, endColumn) {
    checkRange(matrix, startRow, endRow, startColumn, endColumn);
    super(matrix, endRow - startRow + 1, endColumn - startColumn + 1);
    this.startRow = startRow;
    this.startColumn = startColumn;
  }

  set(rowIndex, columnIndex, value) {
    this.matrix.set(
      this.startRow + rowIndex,
      this.startColumn + columnIndex,
      value,
    );
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.matrix.get(
      this.startRow + rowIndex,
      this.startColumn + columnIndex,
    );
  }
}

class MatrixTransposeView extends BaseView {
  constructor(matrix) {
    super(matrix, matrix.columns, matrix.rows);
  }

  set(rowIndex, columnIndex, value) {
    this.matrix.set(columnIndex, rowIndex, value);
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.matrix.get(columnIndex, rowIndex);
  }
}

class WrapperMatrix1D extends AbstractMatrix {
  constructor(data, options = {}) {
    const { rows = 1 } = options;

    if (data.length % rows !== 0) {
      throw new Error('the data length is not divisible by the number of rows');
    }
    super();
    this.rows = rows;
    this.columns = data.length / rows;
    this.data = data;
  }

  set(rowIndex, columnIndex, value) {
    let index = this._calculateIndex(rowIndex, columnIndex);
    this.data[index] = value;
    return this;
  }

  get(rowIndex, columnIndex) {
    let index = this._calculateIndex(rowIndex, columnIndex);
    return this.data[index];
  }

  _calculateIndex(row, column) {
    return row * this.columns + column;
  }
}

class WrapperMatrix2D extends AbstractMatrix {
  constructor(data) {
    super();
    this.data = data;
    this.rows = data.length;
    this.columns = data[0].length;
  }

  set(rowIndex, columnIndex, value) {
    this.data[rowIndex][columnIndex] = value;
    return this;
  }

  get(rowIndex, columnIndex) {
    return this.data[rowIndex][columnIndex];
  }
}

function wrap(array, options) {
  if (isAnyArray.isAnyArray(array)) {
    if (array[0] && isAnyArray.isAnyArray(array[0])) {
      return new WrapperMatrix2D(array);
    } else {
      return new WrapperMatrix1D(array, options);
    }
  } else {
    throw new Error('the argument is not an array');
  }
}

class LuDecomposition {
  constructor(matrix) {
    matrix = WrapperMatrix2D.checkMatrix(matrix);

    let lu = matrix.clone();
    let rows = lu.rows;
    let columns = lu.columns;
    let pivotVector = new Float64Array(rows);
    let pivotSign = 1;
    let i, j, k, p, s, t, v;
    let LUcolj, kmax;

    for (i = 0; i < rows; i++) {
      pivotVector[i] = i;
    }

    LUcolj = new Float64Array(rows);

    for (j = 0; j < columns; j++) {
      for (i = 0; i < rows; i++) {
        LUcolj[i] = lu.get(i, j);
      }

      for (i = 0; i < rows; i++) {
        kmax = Math.min(i, j);
        s = 0;
        for (k = 0; k < kmax; k++) {
          s += lu.get(i, k) * LUcolj[k];
        }
        LUcolj[i] -= s;
        lu.set(i, j, LUcolj[i]);
      }

      p = j;
      for (i = j + 1; i < rows; i++) {
        if (Math.abs(LUcolj[i]) > Math.abs(LUcolj[p])) {
          p = i;
        }
      }

      if (p !== j) {
        for (k = 0; k < columns; k++) {
          t = lu.get(p, k);
          lu.set(p, k, lu.get(j, k));
          lu.set(j, k, t);
        }

        v = pivotVector[p];
        pivotVector[p] = pivotVector[j];
        pivotVector[j] = v;

        pivotSign = -pivotSign;
      }

      if (j < rows && lu.get(j, j) !== 0) {
        for (i = j + 1; i < rows; i++) {
          lu.set(i, j, lu.get(i, j) / lu.get(j, j));
        }
      }
    }

    this.LU = lu;
    this.pivotVector = pivotVector;
    this.pivotSign = pivotSign;
  }

  isSingular() {
    let data = this.LU;
    let col = data.columns;
    for (let j = 0; j < col; j++) {
      if (data.get(j, j) === 0) {
        return true;
      }
    }
    return false;
  }

  solve(value) {
    value = Matrix.checkMatrix(value);

    let lu = this.LU;
    let rows = lu.rows;

    if (rows !== value.rows) {
      throw new Error('Invalid matrix dimensions');
    }
    if (this.isSingular()) {
      throw new Error('LU matrix is singular');
    }

    let count = value.columns;
    let X = value.subMatrixRow(this.pivotVector, 0, count - 1);
    let columns = lu.columns;
    let i, j, k;

    for (k = 0; k < columns; k++) {
      for (i = k + 1; i < columns; i++) {
        for (j = 0; j < count; j++) {
          X.set(i, j, X.get(i, j) - X.get(k, j) * lu.get(i, k));
        }
      }
    }
    for (k = columns - 1; k >= 0; k--) {
      for (j = 0; j < count; j++) {
        X.set(k, j, X.get(k, j) / lu.get(k, k));
      }
      for (i = 0; i < k; i++) {
        for (j = 0; j < count; j++) {
          X.set(i, j, X.get(i, j) - X.get(k, j) * lu.get(i, k));
        }
      }
    }
    return X;
  }

  get determinant() {
    let data = this.LU;
    if (!data.isSquare()) {
      throw new Error('Matrix must be square');
    }
    let determinant = this.pivotSign;
    let col = data.columns;
    for (let j = 0; j < col; j++) {
      determinant *= data.get(j, j);
    }
    return determinant;
  }

  get lowerTriangularMatrix() {
    let data = this.LU;
    let rows = data.rows;
    let columns = data.columns;
    let X = new Matrix(rows, columns);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        if (i > j) {
          X.set(i, j, data.get(i, j));
        } else if (i === j) {
          X.set(i, j, 1);
        } else {
          X.set(i, j, 0);
        }
      }
    }
    return X;
  }

  get upperTriangularMatrix() {
    let data = this.LU;
    let rows = data.rows;
    let columns = data.columns;
    let X = new Matrix(rows, columns);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        if (i <= j) {
          X.set(i, j, data.get(i, j));
        } else {
          X.set(i, j, 0);
        }
      }
    }
    return X;
  }

  get pivotPermutationVector() {
    return Array.from(this.pivotVector);
  }
}

function hypotenuse(a, b) {
  let r = 0;
  if (Math.abs(a) > Math.abs(b)) {
    r = b / a;
    return Math.abs(a) * Math.sqrt(1 + r * r);
  }
  if (b !== 0) {
    r = a / b;
    return Math.abs(b) * Math.sqrt(1 + r * r);
  }
  return 0;
}

class QrDecomposition {
  constructor(value) {
    value = WrapperMatrix2D.checkMatrix(value);

    let qr = value.clone();
    let m = value.rows;
    let n = value.columns;
    let rdiag = new Float64Array(n);
    let i, j, k, s;

    for (k = 0; k < n; k++) {
      let nrm = 0;
      for (i = k; i < m; i++) {
        nrm = hypotenuse(nrm, qr.get(i, k));
      }
      if (nrm !== 0) {
        if (qr.get(k, k) < 0) {
          nrm = -nrm;
        }
        for (i = k; i < m; i++) {
          qr.set(i, k, qr.get(i, k) / nrm);
        }
        qr.set(k, k, qr.get(k, k) + 1);
        for (j = k + 1; j < n; j++) {
          s = 0;
          for (i = k; i < m; i++) {
            s += qr.get(i, k) * qr.get(i, j);
          }
          s = -s / qr.get(k, k);
          for (i = k; i < m; i++) {
            qr.set(i, j, qr.get(i, j) + s * qr.get(i, k));
          }
        }
      }
      rdiag[k] = -nrm;
    }

    this.QR = qr;
    this.Rdiag = rdiag;
  }

  solve(value) {
    value = Matrix.checkMatrix(value);

    let qr = this.QR;
    let m = qr.rows;

    if (value.rows !== m) {
      throw new Error('Matrix row dimensions must agree');
    }
    if (!this.isFullRank()) {
      throw new Error('Matrix is rank deficient');
    }

    let count = value.columns;
    let X = value.clone();
    let n = qr.columns;
    let i, j, k, s;

    for (k = 0; k < n; k++) {
      for (j = 0; j < count; j++) {
        s = 0;
        for (i = k; i < m; i++) {
          s += qr.get(i, k) * X.get(i, j);
        }
        s = -s / qr.get(k, k);
        for (i = k; i < m; i++) {
          X.set(i, j, X.get(i, j) + s * qr.get(i, k));
        }
      }
    }
    for (k = n - 1; k >= 0; k--) {
      for (j = 0; j < count; j++) {
        X.set(k, j, X.get(k, j) / this.Rdiag[k]);
      }
      for (i = 0; i < k; i++) {
        for (j = 0; j < count; j++) {
          X.set(i, j, X.get(i, j) - X.get(k, j) * qr.get(i, k));
        }
      }
    }

    return X.subMatrix(0, n - 1, 0, count - 1);
  }

  isFullRank() {
    let columns = this.QR.columns;
    for (let i = 0; i < columns; i++) {
      if (this.Rdiag[i] === 0) {
        return false;
      }
    }
    return true;
  }

  get upperTriangularMatrix() {
    let qr = this.QR;
    let n = qr.columns;
    let X = new Matrix(n, n);
    let i, j;
    for (i = 0; i < n; i++) {
      for (j = 0; j < n; j++) {
        if (i < j) {
          X.set(i, j, qr.get(i, j));
        } else if (i === j) {
          X.set(i, j, this.Rdiag[i]);
        } else {
          X.set(i, j, 0);
        }
      }
    }
    return X;
  }

  get orthogonalMatrix() {
    let qr = this.QR;
    let rows = qr.rows;
    let columns = qr.columns;
    let X = new Matrix(rows, columns);
    let i, j, k, s;

    for (k = columns - 1; k >= 0; k--) {
      for (i = 0; i < rows; i++) {
        X.set(i, k, 0);
      }
      X.set(k, k, 1);
      for (j = k; j < columns; j++) {
        if (qr.get(k, k) !== 0) {
          s = 0;
          for (i = k; i < rows; i++) {
            s += qr.get(i, k) * X.get(i, j);
          }

          s = -s / qr.get(k, k);

          for (i = k; i < rows; i++) {
            X.set(i, j, X.get(i, j) + s * qr.get(i, k));
          }
        }
      }
    }
    return X;
  }
}

class SingularValueDecomposition {
  constructor(value, options = {}) {
    value = WrapperMatrix2D.checkMatrix(value);

    if (value.isEmpty()) {
      throw new Error('Matrix must be non-empty');
    }

    let m = value.rows;
    let n = value.columns;

    const {
      computeLeftSingularVectors = true,
      computeRightSingularVectors = true,
      autoTranspose = false,
    } = options;

    let wantu = Boolean(computeLeftSingularVectors);
    let wantv = Boolean(computeRightSingularVectors);

    let swapped = false;
    let a;
    if (m < n) {
      if (!autoTranspose) {
        a = value.clone();
        // eslint-disable-next-line no-console
        console.warn(
          'Computing SVD on a matrix with more columns than rows. Consider enabling autoTranspose',
        );
      } else {
        a = value.transpose();
        m = a.rows;
        n = a.columns;
        swapped = true;
        let aux = wantu;
        wantu = wantv;
        wantv = aux;
      }
    } else {
      a = value.clone();
    }

    let nu = Math.min(m, n);
    let ni = Math.min(m + 1, n);
    let s = new Float64Array(ni);
    let U = new Matrix(m, nu);
    let V = new Matrix(n, n);

    let e = new Float64Array(n);
    let work = new Float64Array(m);

    let si = new Float64Array(ni);
    for (let i = 0; i < ni; i++) si[i] = i;

    let nct = Math.min(m - 1, n);
    let nrt = Math.max(0, Math.min(n - 2, m));
    let mrc = Math.max(nct, nrt);

    for (let k = 0; k < mrc; k++) {
      if (k < nct) {
        s[k] = 0;
        for (let i = k; i < m; i++) {
          s[k] = hypotenuse(s[k], a.get(i, k));
        }
        if (s[k] !== 0) {
          if (a.get(k, k) < 0) {
            s[k] = -s[k];
          }
          for (let i = k; i < m; i++) {
            a.set(i, k, a.get(i, k) / s[k]);
          }
          a.set(k, k, a.get(k, k) + 1);
        }
        s[k] = -s[k];
      }

      for (let j = k + 1; j < n; j++) {
        if (k < nct && s[k] !== 0) {
          let t = 0;
          for (let i = k; i < m; i++) {
            t += a.get(i, k) * a.get(i, j);
          }
          t = -t / a.get(k, k);
          for (let i = k; i < m; i++) {
            a.set(i, j, a.get(i, j) + t * a.get(i, k));
          }
        }
        e[j] = a.get(k, j);
      }

      if (wantu && k < nct) {
        for (let i = k; i < m; i++) {
          U.set(i, k, a.get(i, k));
        }
      }

      if (k < nrt) {
        e[k] = 0;
        for (let i = k + 1; i < n; i++) {
          e[k] = hypotenuse(e[k], e[i]);
        }
        if (e[k] !== 0) {
          if (e[k + 1] < 0) {
            e[k] = 0 - e[k];
          }
          for (let i = k + 1; i < n; i++) {
            e[i] /= e[k];
          }
          e[k + 1] += 1;
        }
        e[k] = -e[k];
        if (k + 1 < m && e[k] !== 0) {
          for (let i = k + 1; i < m; i++) {
            work[i] = 0;
          }
          for (let i = k + 1; i < m; i++) {
            for (let j = k + 1; j < n; j++) {
              work[i] += e[j] * a.get(i, j);
            }
          }
          for (let j = k + 1; j < n; j++) {
            let t = -e[j] / e[k + 1];
            for (let i = k + 1; i < m; i++) {
              a.set(i, j, a.get(i, j) + t * work[i]);
            }
          }
        }
        if (wantv) {
          for (let i = k + 1; i < n; i++) {
            V.set(i, k, e[i]);
          }
        }
      }
    }

    let p = Math.min(n, m + 1);
    if (nct < n) {
      s[nct] = a.get(nct, nct);
    }
    if (m < p) {
      s[p - 1] = 0;
    }
    if (nrt + 1 < p) {
      e[nrt] = a.get(nrt, p - 1);
    }
    e[p - 1] = 0;

    if (wantu) {
      for (let j = nct; j < nu; j++) {
        for (let i = 0; i < m; i++) {
          U.set(i, j, 0);
        }
        U.set(j, j, 1);
      }
      for (let k = nct - 1; k >= 0; k--) {
        if (s[k] !== 0) {
          for (let j = k + 1; j < nu; j++) {
            let t = 0;
            for (let i = k; i < m; i++) {
              t += U.get(i, k) * U.get(i, j);
            }
            t = -t / U.get(k, k);
            for (let i = k; i < m; i++) {
              U.set(i, j, U.get(i, j) + t * U.get(i, k));
            }
          }
          for (let i = k; i < m; i++) {
            U.set(i, k, -U.get(i, k));
          }
          U.set(k, k, 1 + U.get(k, k));
          for (let i = 0; i < k - 1; i++) {
            U.set(i, k, 0);
          }
        } else {
          for (let i = 0; i < m; i++) {
            U.set(i, k, 0);
          }
          U.set(k, k, 1);
        }
      }
    }

    if (wantv) {
      for (let k = n - 1; k >= 0; k--) {
        if (k < nrt && e[k] !== 0) {
          for (let j = k + 1; j < n; j++) {
            let t = 0;
            for (let i = k + 1; i < n; i++) {
              t += V.get(i, k) * V.get(i, j);
            }
            t = -t / V.get(k + 1, k);
            for (let i = k + 1; i < n; i++) {
              V.set(i, j, V.get(i, j) + t * V.get(i, k));
            }
          }
        }
        for (let i = 0; i < n; i++) {
          V.set(i, k, 0);
        }
        V.set(k, k, 1);
      }
    }

    let pp = p - 1;
    let eps = Number.EPSILON;
    while (p > 0) {
      let k, kase;
      for (k = p - 2; k >= -1; k--) {
        if (k === -1) {
          break;
        }
        const alpha =
          Number.MIN_VALUE + eps * Math.abs(s[k] + Math.abs(s[k + 1]));
        if (Math.abs(e[k]) <= alpha || Number.isNaN(e[k])) {
          e[k] = 0;
          break;
        }
      }
      if (k === p - 2) {
        kase = 4;
      } else {
        let ks;
        for (ks = p - 1; ks >= k; ks--) {
          if (ks === k) {
            break;
          }
          let t =
            (ks !== p ? Math.abs(e[ks]) : 0) +
            (ks !== k + 1 ? Math.abs(e[ks - 1]) : 0);
          if (Math.abs(s[ks]) <= eps * t) {
            s[ks] = 0;
            break;
          }
        }
        if (ks === k) {
          kase = 3;
        } else if (ks === p - 1) {
          kase = 1;
        } else {
          kase = 2;
          k = ks;
        }
      }

      k++;

      switch (kase) {
        case 1: {
          let f = e[p - 2];
          e[p - 2] = 0;
          for (let j = p - 2; j >= k; j--) {
            let t = hypotenuse(s[j], f);
            let cs = s[j] / t;
            let sn = f / t;
            s[j] = t;
            if (j !== k) {
              f = -sn * e[j - 1];
              e[j - 1] = cs * e[j - 1];
            }
            if (wantv) {
              for (let i = 0; i < n; i++) {
                t = cs * V.get(i, j) + sn * V.get(i, p - 1);
                V.set(i, p - 1, -sn * V.get(i, j) + cs * V.get(i, p - 1));
                V.set(i, j, t);
              }
            }
          }
          break;
        }
        case 2: {
          let f = e[k - 1];
          e[k - 1] = 0;
          for (let j = k; j < p; j++) {
            let t = hypotenuse(s[j], f);
            let cs = s[j] / t;
            let sn = f / t;
            s[j] = t;
            f = -sn * e[j];
            e[j] = cs * e[j];
            if (wantu) {
              for (let i = 0; i < m; i++) {
                t = cs * U.get(i, j) + sn * U.get(i, k - 1);
                U.set(i, k - 1, -sn * U.get(i, j) + cs * U.get(i, k - 1));
                U.set(i, j, t);
              }
            }
          }
          break;
        }
        case 3: {
          const scale = Math.max(
            Math.abs(s[p - 1]),
            Math.abs(s[p - 2]),
            Math.abs(e[p - 2]),
            Math.abs(s[k]),
            Math.abs(e[k]),
          );
          const sp = s[p - 1] / scale;
          const spm1 = s[p - 2] / scale;
          const epm1 = e[p - 2] / scale;
          const sk = s[k] / scale;
          const ek = e[k] / scale;
          const b = ((spm1 + sp) * (spm1 - sp) + epm1 * epm1) / 2;
          const c = sp * epm1 * (sp * epm1);
          let shift = 0;
          if (b !== 0 || c !== 0) {
            if (b < 0) {
              shift = 0 - Math.sqrt(b * b + c);
            } else {
              shift = Math.sqrt(b * b + c);
            }
            shift = c / (b + shift);
          }
          let f = (sk + sp) * (sk - sp) + shift;
          let g = sk * ek;
          for (let j = k; j < p - 1; j++) {
            let t = hypotenuse(f, g);
            if (t === 0) t = Number.MIN_VALUE;
            let cs = f / t;
            let sn = g / t;
            if (j !== k) {
              e[j - 1] = t;
            }
            f = cs * s[j] + sn * e[j];
            e[j] = cs * e[j] - sn * s[j];
            g = sn * s[j + 1];
            s[j + 1] = cs * s[j + 1];
            if (wantv) {
              for (let i = 0; i < n; i++) {
                t = cs * V.get(i, j) + sn * V.get(i, j + 1);
                V.set(i, j + 1, -sn * V.get(i, j) + cs * V.get(i, j + 1));
                V.set(i, j, t);
              }
            }
            t = hypotenuse(f, g);
            if (t === 0) t = Number.MIN_VALUE;
            cs = f / t;
            sn = g / t;
            s[j] = t;
            f = cs * e[j] + sn * s[j + 1];
            s[j + 1] = -sn * e[j] + cs * s[j + 1];
            g = sn * e[j + 1];
            e[j + 1] = cs * e[j + 1];
            if (wantu && j < m - 1) {
              for (let i = 0; i < m; i++) {
                t = cs * U.get(i, j) + sn * U.get(i, j + 1);
                U.set(i, j + 1, -sn * U.get(i, j) + cs * U.get(i, j + 1));
                U.set(i, j, t);
              }
            }
          }
          e[p - 2] = f;
          break;
        }
        case 4: {
          if (s[k] <= 0) {
            s[k] = s[k] < 0 ? -s[k] : 0;
            if (wantv) {
              for (let i = 0; i <= pp; i++) {
                V.set(i, k, -V.get(i, k));
              }
            }
          }
          while (k < pp) {
            if (s[k] >= s[k + 1]) {
              break;
            }
            let t = s[k];
            s[k] = s[k + 1];
            s[k + 1] = t;
            if (wantv && k < n - 1) {
              for (let i = 0; i < n; i++) {
                t = V.get(i, k + 1);
                V.set(i, k + 1, V.get(i, k));
                V.set(i, k, t);
              }
            }
            if (wantu && k < m - 1) {
              for (let i = 0; i < m; i++) {
                t = U.get(i, k + 1);
                U.set(i, k + 1, U.get(i, k));
                U.set(i, k, t);
              }
            }
            k++;
          }
          p--;
          break;
        }
        // no default
      }
    }

    if (swapped) {
      let tmp = V;
      V = U;
      U = tmp;
    }

    this.m = m;
    this.n = n;
    this.s = s;
    this.U = U;
    this.V = V;
  }

  solve(value) {
    let Y = value;
    let e = this.threshold;
    let scols = this.s.length;
    let Ls = Matrix.zeros(scols, scols);

    for (let i = 0; i < scols; i++) {
      if (Math.abs(this.s[i]) <= e) {
        Ls.set(i, i, 0);
      } else {
        Ls.set(i, i, 1 / this.s[i]);
      }
    }

    let U = this.U;
    let V = this.rightSingularVectors;

    let VL = V.mmul(Ls);
    let vrows = V.rows;
    let urows = U.rows;
    let VLU = Matrix.zeros(vrows, urows);

    for (let i = 0; i < vrows; i++) {
      for (let j = 0; j < urows; j++) {
        let sum = 0;
        for (let k = 0; k < scols; k++) {
          sum += VL.get(i, k) * U.get(j, k);
        }
        VLU.set(i, j, sum);
      }
    }

    return VLU.mmul(Y);
  }

  solveForDiagonal(value) {
    return this.solve(Matrix.diag(value));
  }

  inverse() {
    let V = this.V;
    let e = this.threshold;
    let vrows = V.rows;
    let vcols = V.columns;
    let X = new Matrix(vrows, this.s.length);

    for (let i = 0; i < vrows; i++) {
      for (let j = 0; j < vcols; j++) {
        if (Math.abs(this.s[j]) > e) {
          X.set(i, j, V.get(i, j) / this.s[j]);
        }
      }
    }

    let U = this.U;

    let urows = U.rows;
    let ucols = U.columns;
    let Y = new Matrix(vrows, urows);

    for (let i = 0; i < vrows; i++) {
      for (let j = 0; j < urows; j++) {
        let sum = 0;
        for (let k = 0; k < ucols; k++) {
          sum += X.get(i, k) * U.get(j, k);
        }
        Y.set(i, j, sum);
      }
    }

    return Y;
  }

  get condition() {
    return this.s[0] / this.s[Math.min(this.m, this.n) - 1];
  }

  get norm2() {
    return this.s[0];
  }

  get rank() {
    let tol = Math.max(this.m, this.n) * this.s[0] * Number.EPSILON;
    let r = 0;
    let s = this.s;
    for (let i = 0, ii = s.length; i < ii; i++) {
      if (s[i] > tol) {
        r++;
      }
    }
    return r;
  }

  get diagonal() {
    return Array.from(this.s);
  }

  get threshold() {
    return (Number.EPSILON / 2) * Math.max(this.m, this.n) * this.s[0];
  }

  get leftSingularVectors() {
    return this.U;
  }

  get rightSingularVectors() {
    return this.V;
  }

  get diagonalMatrix() {
    return Matrix.diag(this.s);
  }
}

function inverse(matrix, useSVD = false) {
  matrix = WrapperMatrix2D.checkMatrix(matrix);
  if (useSVD) {
    return new SingularValueDecomposition(matrix).inverse();
  } else {
    return solve(matrix, Matrix.eye(matrix.rows));
  }
}

function solve(leftHandSide, rightHandSide, useSVD = false) {
  leftHandSide = WrapperMatrix2D.checkMatrix(leftHandSide);
  rightHandSide = WrapperMatrix2D.checkMatrix(rightHandSide);
  if (useSVD) {
    return new SingularValueDecomposition(leftHandSide).solve(rightHandSide);
  } else {
    return leftHandSide.isSquare()
      ? new LuDecomposition(leftHandSide).solve(rightHandSide)
      : new QrDecomposition(leftHandSide).solve(rightHandSide);
  }
}

function determinant(matrix) {
  matrix = Matrix.checkMatrix(matrix);
  if (matrix.isSquare()) {
    if (matrix.columns === 0) {
      return 1;
    }

    let a, b, c, d;
    if (matrix.columns === 2) {
      // 2 x 2 matrix
      a = matrix.get(0, 0);
      b = matrix.get(0, 1);
      c = matrix.get(1, 0);
      d = matrix.get(1, 1);

      return a * d - b * c;
    } else if (matrix.columns === 3) {
      // 3 x 3 matrix
      let subMatrix0, subMatrix1, subMatrix2;
      subMatrix0 = new MatrixSelectionView(matrix, [1, 2], [1, 2]);
      subMatrix1 = new MatrixSelectionView(matrix, [1, 2], [0, 2]);
      subMatrix2 = new MatrixSelectionView(matrix, [1, 2], [0, 1]);
      a = matrix.get(0, 0);
      b = matrix.get(0, 1);
      c = matrix.get(0, 2);

      return (
        a * determinant(subMatrix0) -
        b * determinant(subMatrix1) +
        c * determinant(subMatrix2)
      );
    } else {
      // general purpose determinant using the LU decomposition
      return new LuDecomposition(matrix).determinant;
    }
  } else {
    throw Error('determinant can only be calculated for a square matrix');
  }
}

function xrange(n, exception) {
  let range = [];
  for (let i = 0; i < n; i++) {
    if (i !== exception) {
      range.push(i);
    }
  }
  return range;
}

function dependenciesOneRow(
  error,
  matrix,
  index,
  thresholdValue = 10e-10,
  thresholdError = 10e-10,
) {
  if (error > thresholdError) {
    return new Array(matrix.rows + 1).fill(0);
  } else {
    let returnArray = matrix.addRow(index, [0]);
    for (let i = 0; i < returnArray.rows; i++) {
      if (Math.abs(returnArray.get(i, 0)) < thresholdValue) {
        returnArray.set(i, 0, 0);
      }
    }
    return returnArray.to1DArray();
  }
}

function linearDependencies(matrix, options = {}) {
  const { thresholdValue = 10e-10, thresholdError = 10e-10 } = options;
  matrix = Matrix.checkMatrix(matrix);

  let n = matrix.rows;
  let results = new Matrix(n, n);

  for (let i = 0; i < n; i++) {
    let b = Matrix.columnVector(matrix.getRow(i));
    let Abis = matrix.subMatrixRow(xrange(n, i)).transpose();
    let svd = new SingularValueDecomposition(Abis);
    let x = svd.solve(b);
    let error = Matrix.sub(b, Abis.mmul(x)).abs().max();
    results.setRow(
      i,
      dependenciesOneRow(error, x, i, thresholdValue, thresholdError),
    );
  }
  return results;
}

function pseudoInverse(matrix, threshold = Number.EPSILON) {
  matrix = Matrix.checkMatrix(matrix);
  if (matrix.isEmpty()) {
    // with a zero dimension, the pseudo-inverse is the transpose, since all 0xn and nx0 matrices are singular
    // (0xn)*(nx0)*(0xn) = 0xn
    // (nx0)*(0xn)*(nx0) = nx0
    return matrix.transpose();
  }
  let svdSolution = new SingularValueDecomposition(matrix, { autoTranspose: true });

  let U = svdSolution.leftSingularVectors;
  let V = svdSolution.rightSingularVectors;
  let s = svdSolution.diagonal;

  for (let i = 0; i < s.length; i++) {
    if (Math.abs(s[i]) > threshold) {
      s[i] = 1.0 / s[i];
    } else {
      s[i] = 0.0;
    }
  }

  return V.mmul(Matrix.diag(s).mmul(U.transpose()));
}

function covariance(xMatrix, yMatrix = xMatrix, options = {}) {
  xMatrix = new Matrix(xMatrix);
  let yIsSame = false;
  if (
    typeof yMatrix === 'object' &&
    !Matrix.isMatrix(yMatrix) &&
    !isAnyArray.isAnyArray(yMatrix)
  ) {
    options = yMatrix;
    yMatrix = xMatrix;
    yIsSame = true;
  } else {
    yMatrix = new Matrix(yMatrix);
  }
  if (xMatrix.rows !== yMatrix.rows) {
    throw new TypeError('Both matrices must have the same number of rows');
  }
  const { center = true } = options;
  if (center) {
    xMatrix = xMatrix.center('column');
    if (!yIsSame) {
      yMatrix = yMatrix.center('column');
    }
  }
  const cov = xMatrix.transpose().mmul(yMatrix);
  for (let i = 0; i < cov.rows; i++) {
    for (let j = 0; j < cov.columns; j++) {
      cov.set(i, j, cov.get(i, j) * (1 / (xMatrix.rows - 1)));
    }
  }
  return cov;
}

function correlation(xMatrix, yMatrix = xMatrix, options = {}) {
  xMatrix = new Matrix(xMatrix);
  let yIsSame = false;
  if (
    typeof yMatrix === 'object' &&
    !Matrix.isMatrix(yMatrix) &&
    !isAnyArray.isAnyArray(yMatrix)
  ) {
    options = yMatrix;
    yMatrix = xMatrix;
    yIsSame = true;
  } else {
    yMatrix = new Matrix(yMatrix);
  }
  if (xMatrix.rows !== yMatrix.rows) {
    throw new TypeError('Both matrices must have the same number of rows');
  }

  const { center = true, scale = true } = options;
  if (center) {
    xMatrix.center('column');
    if (!yIsSame) {
      yMatrix.center('column');
    }
  }
  if (scale) {
    xMatrix.scale('column');
    if (!yIsSame) {
      yMatrix.scale('column');
    }
  }

  const sdx = xMatrix.standardDeviation('column', { unbiased: true });
  const sdy = yIsSame
    ? sdx
    : yMatrix.standardDeviation('column', { unbiased: true });

  const corr = xMatrix.transpose().mmul(yMatrix);
  for (let i = 0; i < corr.rows; i++) {
    for (let j = 0; j < corr.columns; j++) {
      corr.set(
        i,
        j,
        corr.get(i, j) * (1 / (sdx[i] * sdy[j])) * (1 / (xMatrix.rows - 1)),
      );
    }
  }
  return corr;
}

class EigenvalueDecomposition {
  constructor(matrix, options = {}) {
    const { assumeSymmetric = false } = options;

    matrix = WrapperMatrix2D.checkMatrix(matrix);
    if (!matrix.isSquare()) {
      throw new Error('Matrix is not a square matrix');
    }

    if (matrix.isEmpty()) {
      throw new Error('Matrix must be non-empty');
    }

    let n = matrix.columns;
    let V = new Matrix(n, n);
    let d = new Float64Array(n);
    let e = new Float64Array(n);
    let value = matrix;
    let i, j;

    let isSymmetric = false;
    if (assumeSymmetric) {
      isSymmetric = true;
    } else {
      isSymmetric = matrix.isSymmetric();
    }

    if (isSymmetric) {
      for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
          V.set(i, j, value.get(i, j));
        }
      }
      tred2(n, e, d, V);
      tql2(n, e, d, V);
    } else {
      let H = new Matrix(n, n);
      let ort = new Float64Array(n);
      for (j = 0; j < n; j++) {
        for (i = 0; i < n; i++) {
          H.set(i, j, value.get(i, j));
        }
      }
      orthes(n, H, ort, V);
      hqr2(n, e, d, V, H);
    }

    this.n = n;
    this.e = e;
    this.d = d;
    this.V = V;
  }

  get realEigenvalues() {
    return Array.from(this.d);
  }

  get imaginaryEigenvalues() {
    return Array.from(this.e);
  }

  get eigenvectorMatrix() {
    return this.V;
  }

  get diagonalMatrix() {
    let n = this.n;
    let e = this.e;
    let d = this.d;
    let X = new Matrix(n, n);
    let i, j;
    for (i = 0; i < n; i++) {
      for (j = 0; j < n; j++) {
        X.set(i, j, 0);
      }
      X.set(i, i, d[i]);
      if (e[i] > 0) {
        X.set(i, i + 1, e[i]);
      } else if (e[i] < 0) {
        X.set(i, i - 1, e[i]);
      }
    }
    return X;
  }
}

function tred2(n, e, d, V) {
  let f, g, h, i, j, k, hh, scale;

  for (j = 0; j < n; j++) {
    d[j] = V.get(n - 1, j);
  }

  for (i = n - 1; i > 0; i--) {
    scale = 0;
    h = 0;
    for (k = 0; k < i; k++) {
      scale = scale + Math.abs(d[k]);
    }

    if (scale === 0) {
      e[i] = d[i - 1];
      for (j = 0; j < i; j++) {
        d[j] = V.get(i - 1, j);
        V.set(i, j, 0);
        V.set(j, i, 0);
      }
    } else {
      for (k = 0; k < i; k++) {
        d[k] /= scale;
        h += d[k] * d[k];
      }

      f = d[i - 1];
      g = Math.sqrt(h);
      if (f > 0) {
        g = -g;
      }

      e[i] = scale * g;
      h = h - f * g;
      d[i - 1] = f - g;
      for (j = 0; j < i; j++) {
        e[j] = 0;
      }

      for (j = 0; j < i; j++) {
        f = d[j];
        V.set(j, i, f);
        g = e[j] + V.get(j, j) * f;
        for (k = j + 1; k <= i - 1; k++) {
          g += V.get(k, j) * d[k];
          e[k] += V.get(k, j) * f;
        }
        e[j] = g;
      }

      f = 0;
      for (j = 0; j < i; j++) {
        e[j] /= h;
        f += e[j] * d[j];
      }

      hh = f / (h + h);
      for (j = 0; j < i; j++) {
        e[j] -= hh * d[j];
      }

      for (j = 0; j < i; j++) {
        f = d[j];
        g = e[j];
        for (k = j; k <= i - 1; k++) {
          V.set(k, j, V.get(k, j) - (f * e[k] + g * d[k]));
        }
        d[j] = V.get(i - 1, j);
        V.set(i, j, 0);
      }
    }
    d[i] = h;
  }

  for (i = 0; i < n - 1; i++) {
    V.set(n - 1, i, V.get(i, i));
    V.set(i, i, 1);
    h = d[i + 1];
    if (h !== 0) {
      for (k = 0; k <= i; k++) {
        d[k] = V.get(k, i + 1) / h;
      }

      for (j = 0; j <= i; j++) {
        g = 0;
        for (k = 0; k <= i; k++) {
          g += V.get(k, i + 1) * V.get(k, j);
        }
        for (k = 0; k <= i; k++) {
          V.set(k, j, V.get(k, j) - g * d[k]);
        }
      }
    }

    for (k = 0; k <= i; k++) {
      V.set(k, i + 1, 0);
    }
  }

  for (j = 0; j < n; j++) {
    d[j] = V.get(n - 1, j);
    V.set(n - 1, j, 0);
  }

  V.set(n - 1, n - 1, 1);
  e[0] = 0;
}

function tql2(n, e, d, V) {
  let g, h, i, j, k, l, m, p, r, dl1, c, c2, c3, el1, s, s2;

  for (i = 1; i < n; i++) {
    e[i - 1] = e[i];
  }

  e[n - 1] = 0;

  let f = 0;
  let tst1 = 0;
  let eps = Number.EPSILON;

  for (l = 0; l < n; l++) {
    tst1 = Math.max(tst1, Math.abs(d[l]) + Math.abs(e[l]));
    m = l;
    while (m < n) {
      if (Math.abs(e[m]) <= eps * tst1) {
        break;
      }
      m++;
    }

    if (m > l) {
      do {

        g = d[l];
        p = (d[l + 1] - g) / (2 * e[l]);
        r = hypotenuse(p, 1);
        if (p < 0) {
          r = -r;
        }

        d[l] = e[l] / (p + r);
        d[l + 1] = e[l] * (p + r);
        dl1 = d[l + 1];
        h = g - d[l];
        for (i = l + 2; i < n; i++) {
          d[i] -= h;
        }

        f = f + h;

        p = d[m];
        c = 1;
        c2 = c;
        c3 = c;
        el1 = e[l + 1];
        s = 0;
        s2 = 0;
        for (i = m - 1; i >= l; i--) {
          c3 = c2;
          c2 = c;
          s2 = s;
          g = c * e[i];
          h = c * p;
          r = hypotenuse(p, e[i]);
          e[i + 1] = s * r;
          s = e[i] / r;
          c = p / r;
          p = c * d[i] - s * g;
          d[i + 1] = h + s * (c * g + s * d[i]);

          for (k = 0; k < n; k++) {
            h = V.get(k, i + 1);
            V.set(k, i + 1, s * V.get(k, i) + c * h);
            V.set(k, i, c * V.get(k, i) - s * h);
          }
        }

        p = (-s * s2 * c3 * el1 * e[l]) / dl1;
        e[l] = s * p;
        d[l] = c * p;
      } while (Math.abs(e[l]) > eps * tst1);
    }
    d[l] = d[l] + f;
    e[l] = 0;
  }

  for (i = 0; i < n - 1; i++) {
    k = i;
    p = d[i];
    for (j = i + 1; j < n; j++) {
      if (d[j] < p) {
        k = j;
        p = d[j];
      }
    }

    if (k !== i) {
      d[k] = d[i];
      d[i] = p;
      for (j = 0; j < n; j++) {
        p = V.get(j, i);
        V.set(j, i, V.get(j, k));
        V.set(j, k, p);
      }
    }
  }
}

function orthes(n, H, ort, V) {
  let low = 0;
  let high = n - 1;
  let f, g, h, i, j, m;
  let scale;

  for (m = low + 1; m <= high - 1; m++) {
    scale = 0;
    for (i = m; i <= high; i++) {
      scale = scale + Math.abs(H.get(i, m - 1));
    }

    if (scale !== 0) {
      h = 0;
      for (i = high; i >= m; i--) {
        ort[i] = H.get(i, m - 1) / scale;
        h += ort[i] * ort[i];
      }

      g = Math.sqrt(h);
      if (ort[m] > 0) {
        g = -g;
      }

      h = h - ort[m] * g;
      ort[m] = ort[m] - g;

      for (j = m; j < n; j++) {
        f = 0;
        for (i = high; i >= m; i--) {
          f += ort[i] * H.get(i, j);
        }

        f = f / h;
        for (i = m; i <= high; i++) {
          H.set(i, j, H.get(i, j) - f * ort[i]);
        }
      }

      for (i = 0; i <= high; i++) {
        f = 0;
        for (j = high; j >= m; j--) {
          f += ort[j] * H.get(i, j);
        }

        f = f / h;
        for (j = m; j <= high; j++) {
          H.set(i, j, H.get(i, j) - f * ort[j]);
        }
      }

      ort[m] = scale * ort[m];
      H.set(m, m - 1, scale * g);
    }
  }

  for (i = 0; i < n; i++) {
    for (j = 0; j < n; j++) {
      V.set(i, j, i === j ? 1 : 0);
    }
  }

  for (m = high - 1; m >= low + 1; m--) {
    if (H.get(m, m - 1) !== 0) {
      for (i = m + 1; i <= high; i++) {
        ort[i] = H.get(i, m - 1);
      }

      for (j = m; j <= high; j++) {
        g = 0;
        for (i = m; i <= high; i++) {
          g += ort[i] * V.get(i, j);
        }

        g = g / ort[m] / H.get(m, m - 1);
        for (i = m; i <= high; i++) {
          V.set(i, j, V.get(i, j) + g * ort[i]);
        }
      }
    }
  }
}

function hqr2(nn, e, d, V, H) {
  let n = nn - 1;
  let low = 0;
  let high = nn - 1;
  let eps = Number.EPSILON;
  let exshift = 0;
  let norm = 0;
  let p = 0;
  let q = 0;
  let r = 0;
  let s = 0;
  let z = 0;
  let iter = 0;
  let i, j, k, l, m, t, w, x, y;
  let ra, sa, vr, vi;
  let notlast, cdivres;

  for (i = 0; i < nn; i++) {
    if (i < low || i > high) {
      d[i] = H.get(i, i);
      e[i] = 0;
    }

    for (j = Math.max(i - 1, 0); j < nn; j++) {
      norm = norm + Math.abs(H.get(i, j));
    }
  }

  while (n >= low) {
    l = n;
    while (l > low) {
      s = Math.abs(H.get(l - 1, l - 1)) + Math.abs(H.get(l, l));
      if (s === 0) {
        s = norm;
      }
      if (Math.abs(H.get(l, l - 1)) < eps * s) {
        break;
      }
      l--;
    }

    if (l === n) {
      H.set(n, n, H.get(n, n) + exshift);
      d[n] = H.get(n, n);
      e[n] = 0;
      n--;
      iter = 0;
    } else if (l === n - 1) {
      w = H.get(n, n - 1) * H.get(n - 1, n);
      p = (H.get(n - 1, n - 1) - H.get(n, n)) / 2;
      q = p * p + w;
      z = Math.sqrt(Math.abs(q));
      H.set(n, n, H.get(n, n) + exshift);
      H.set(n - 1, n - 1, H.get(n - 1, n - 1) + exshift);
      x = H.get(n, n);

      if (q >= 0) {
        z = p >= 0 ? p + z : p - z;
        d[n - 1] = x + z;
        d[n] = d[n - 1];
        if (z !== 0) {
          d[n] = x - w / z;
        }
        e[n - 1] = 0;
        e[n] = 0;
        x = H.get(n, n - 1);
        s = Math.abs(x) + Math.abs(z);
        p = x / s;
        q = z / s;
        r = Math.sqrt(p * p + q * q);
        p = p / r;
        q = q / r;

        for (j = n - 1; j < nn; j++) {
          z = H.get(n - 1, j);
          H.set(n - 1, j, q * z + p * H.get(n, j));
          H.set(n, j, q * H.get(n, j) - p * z);
        }

        for (i = 0; i <= n; i++) {
          z = H.get(i, n - 1);
          H.set(i, n - 1, q * z + p * H.get(i, n));
          H.set(i, n, q * H.get(i, n) - p * z);
        }

        for (i = low; i <= high; i++) {
          z = V.get(i, n - 1);
          V.set(i, n - 1, q * z + p * V.get(i, n));
          V.set(i, n, q * V.get(i, n) - p * z);
        }
      } else {
        d[n - 1] = x + p;
        d[n] = x + p;
        e[n - 1] = z;
        e[n] = -z;
      }

      n = n - 2;
      iter = 0;
    } else {
      x = H.get(n, n);
      y = 0;
      w = 0;
      if (l < n) {
        y = H.get(n - 1, n - 1);
        w = H.get(n, n - 1) * H.get(n - 1, n);
      }

      if (iter === 10) {
        exshift += x;
        for (i = low; i <= n; i++) {
          H.set(i, i, H.get(i, i) - x);
        }
        s = Math.abs(H.get(n, n - 1)) + Math.abs(H.get(n - 1, n - 2));
        x = y = 0.75 * s;
        w = -0.4375 * s * s;
      }

      if (iter === 30) {
        s = (y - x) / 2;
        s = s * s + w;
        if (s > 0) {
          s = Math.sqrt(s);
          if (y < x) {
            s = -s;
          }
          s = x - w / ((y - x) / 2 + s);
          for (i = low; i <= n; i++) {
            H.set(i, i, H.get(i, i) - s);
          }
          exshift += s;
          x = y = w = 0.964;
        }
      }

      iter = iter + 1;

      m = n - 2;
      while (m >= l) {
        z = H.get(m, m);
        r = x - z;
        s = y - z;
        p = (r * s - w) / H.get(m + 1, m) + H.get(m, m + 1);
        q = H.get(m + 1, m + 1) - z - r - s;
        r = H.get(m + 2, m + 1);
        s = Math.abs(p) + Math.abs(q) + Math.abs(r);
        p = p / s;
        q = q / s;
        r = r / s;
        if (m === l) {
          break;
        }
        if (
          Math.abs(H.get(m, m - 1)) * (Math.abs(q) + Math.abs(r)) <
          eps *
            (Math.abs(p) *
              (Math.abs(H.get(m - 1, m - 1)) +
                Math.abs(z) +
                Math.abs(H.get(m + 1, m + 1))))
        ) {
          break;
        }
        m--;
      }

      for (i = m + 2; i <= n; i++) {
        H.set(i, i - 2, 0);
        if (i > m + 2) {
          H.set(i, i - 3, 0);
        }
      }

      for (k = m; k <= n - 1; k++) {
        notlast = k !== n - 1;
        if (k !== m) {
          p = H.get(k, k - 1);
          q = H.get(k + 1, k - 1);
          r = notlast ? H.get(k + 2, k - 1) : 0;
          x = Math.abs(p) + Math.abs(q) + Math.abs(r);
          if (x !== 0) {
            p = p / x;
            q = q / x;
            r = r / x;
          }
        }

        if (x === 0) {
          break;
        }

        s = Math.sqrt(p * p + q * q + r * r);
        if (p < 0) {
          s = -s;
        }

        if (s !== 0) {
          if (k !== m) {
            H.set(k, k - 1, -s * x);
          } else if (l !== m) {
            H.set(k, k - 1, -H.get(k, k - 1));
          }

          p = p + s;
          x = p / s;
          y = q / s;
          z = r / s;
          q = q / p;
          r = r / p;

          for (j = k; j < nn; j++) {
            p = H.get(k, j) + q * H.get(k + 1, j);
            if (notlast) {
              p = p + r * H.get(k + 2, j);
              H.set(k + 2, j, H.get(k + 2, j) - p * z);
            }

            H.set(k, j, H.get(k, j) - p * x);
            H.set(k + 1, j, H.get(k + 1, j) - p * y);
          }

          for (i = 0; i <= Math.min(n, k + 3); i++) {
            p = x * H.get(i, k) + y * H.get(i, k + 1);
            if (notlast) {
              p = p + z * H.get(i, k + 2);
              H.set(i, k + 2, H.get(i, k + 2) - p * r);
            }

            H.set(i, k, H.get(i, k) - p);
            H.set(i, k + 1, H.get(i, k + 1) - p * q);
          }

          for (i = low; i <= high; i++) {
            p = x * V.get(i, k) + y * V.get(i, k + 1);
            if (notlast) {
              p = p + z * V.get(i, k + 2);
              V.set(i, k + 2, V.get(i, k + 2) - p * r);
            }

            V.set(i, k, V.get(i, k) - p);
            V.set(i, k + 1, V.get(i, k + 1) - p * q);
          }
        }
      }
    }
  }

  if (norm === 0) {
    return;
  }

  for (n = nn - 1; n >= 0; n--) {
    p = d[n];
    q = e[n];

    if (q === 0) {
      l = n;
      H.set(n, n, 1);
      for (i = n - 1; i >= 0; i--) {
        w = H.get(i, i) - p;
        r = 0;
        for (j = l; j <= n; j++) {
          r = r + H.get(i, j) * H.get(j, n);
        }

        if (e[i] < 0) {
          z = w;
          s = r;
        } else {
          l = i;
          if (e[i] === 0) {
            H.set(i, n, w !== 0 ? -r / w : -r / (eps * norm));
          } else {
            x = H.get(i, i + 1);
            y = H.get(i + 1, i);
            q = (d[i] - p) * (d[i] - p) + e[i] * e[i];
            t = (x * s - z * r) / q;
            H.set(i, n, t);
            H.set(
              i + 1,
              n,
              Math.abs(x) > Math.abs(z) ? (-r - w * t) / x : (-s - y * t) / z,
            );
          }

          t = Math.abs(H.get(i, n));
          if (eps * t * t > 1) {
            for (j = i; j <= n; j++) {
              H.set(j, n, H.get(j, n) / t);
            }
          }
        }
      }
    } else if (q < 0) {
      l = n - 1;

      if (Math.abs(H.get(n, n - 1)) > Math.abs(H.get(n - 1, n))) {
        H.set(n - 1, n - 1, q / H.get(n, n - 1));
        H.set(n - 1, n, -(H.get(n, n) - p) / H.get(n, n - 1));
      } else {
        cdivres = cdiv(0, -H.get(n - 1, n), H.get(n - 1, n - 1) - p, q);
        H.set(n - 1, n - 1, cdivres[0]);
        H.set(n - 1, n, cdivres[1]);
      }

      H.set(n, n - 1, 0);
      H.set(n, n, 1);
      for (i = n - 2; i >= 0; i--) {
        ra = 0;
        sa = 0;
        for (j = l; j <= n; j++) {
          ra = ra + H.get(i, j) * H.get(j, n - 1);
          sa = sa + H.get(i, j) * H.get(j, n);
        }

        w = H.get(i, i) - p;

        if (e[i] < 0) {
          z = w;
          r = ra;
          s = sa;
        } else {
          l = i;
          if (e[i] === 0) {
            cdivres = cdiv(-ra, -sa, w, q);
            H.set(i, n - 1, cdivres[0]);
            H.set(i, n, cdivres[1]);
          } else {
            x = H.get(i, i + 1);
            y = H.get(i + 1, i);
            vr = (d[i] - p) * (d[i] - p) + e[i] * e[i] - q * q;
            vi = (d[i] - p) * 2 * q;
            if (vr === 0 && vi === 0) {
              vr =
                eps *
                norm *
                (Math.abs(w) +
                  Math.abs(q) +
                  Math.abs(x) +
                  Math.abs(y) +
                  Math.abs(z));
            }
            cdivres = cdiv(
              x * r - z * ra + q * sa,
              x * s - z * sa - q * ra,
              vr,
              vi,
            );
            H.set(i, n - 1, cdivres[0]);
            H.set(i, n, cdivres[1]);
            if (Math.abs(x) > Math.abs(z) + Math.abs(q)) {
              H.set(
                i + 1,
                n - 1,
                (-ra - w * H.get(i, n - 1) + q * H.get(i, n)) / x,
              );
              H.set(
                i + 1,
                n,
                (-sa - w * H.get(i, n) - q * H.get(i, n - 1)) / x,
              );
            } else {
              cdivres = cdiv(
                -r - y * H.get(i, n - 1),
                -s - y * H.get(i, n),
                z,
                q,
              );
              H.set(i + 1, n - 1, cdivres[0]);
              H.set(i + 1, n, cdivres[1]);
            }
          }

          t = Math.max(Math.abs(H.get(i, n - 1)), Math.abs(H.get(i, n)));
          if (eps * t * t > 1) {
            for (j = i; j <= n; j++) {
              H.set(j, n - 1, H.get(j, n - 1) / t);
              H.set(j, n, H.get(j, n) / t);
            }
          }
        }
      }
    }
  }

  for (i = 0; i < nn; i++) {
    if (i < low || i > high) {
      for (j = i; j < nn; j++) {
        V.set(i, j, H.get(i, j));
      }
    }
  }

  for (j = nn - 1; j >= low; j--) {
    for (i = low; i <= high; i++) {
      z = 0;
      for (k = low; k <= Math.min(j, high); k++) {
        z = z + V.get(i, k) * H.get(k, j);
      }
      V.set(i, j, z);
    }
  }
}

function cdiv(xr, xi, yr, yi) {
  let r, d;
  if (Math.abs(yr) > Math.abs(yi)) {
    r = yi / yr;
    d = yr + r * yi;
    return [(xr + r * xi) / d, (xi - r * xr) / d];
  } else {
    r = yr / yi;
    d = yi + r * yr;
    return [(r * xr + xi) / d, (r * xi - xr) / d];
  }
}

class CholeskyDecomposition {
  constructor(value) {
    value = WrapperMatrix2D.checkMatrix(value);
    if (!value.isSymmetric()) {
      throw new Error('Matrix is not symmetric');
    }

    let a = value;
    let dimension = a.rows;
    let l = new Matrix(dimension, dimension);
    let positiveDefinite = true;
    let i, j, k;

    for (j = 0; j < dimension; j++) {
      let d = 0;
      for (k = 0; k < j; k++) {
        let s = 0;
        for (i = 0; i < k; i++) {
          s += l.get(k, i) * l.get(j, i);
        }
        s = (a.get(j, k) - s) / l.get(k, k);
        l.set(j, k, s);
        d = d + s * s;
      }

      d = a.get(j, j) - d;

      positiveDefinite &= d > 0;
      l.set(j, j, Math.sqrt(Math.max(d, 0)));
      for (k = j + 1; k < dimension; k++) {
        l.set(j, k, 0);
      }
    }

    this.L = l;
    this.positiveDefinite = Boolean(positiveDefinite);
  }

  isPositiveDefinite() {
    return this.positiveDefinite;
  }

  solve(value) {
    value = WrapperMatrix2D.checkMatrix(value);

    let l = this.L;
    let dimension = l.rows;

    if (value.rows !== dimension) {
      throw new Error('Matrix dimensions do not match');
    }
    if (this.isPositiveDefinite() === false) {
      throw new Error('Matrix is not positive definite');
    }

    let count = value.columns;
    let B = value.clone();
    let i, j, k;

    for (k = 0; k < dimension; k++) {
      for (j = 0; j < count; j++) {
        for (i = 0; i < k; i++) {
          B.set(k, j, B.get(k, j) - B.get(i, j) * l.get(k, i));
        }
        B.set(k, j, B.get(k, j) / l.get(k, k));
      }
    }

    for (k = dimension - 1; k >= 0; k--) {
      for (j = 0; j < count; j++) {
        for (i = k + 1; i < dimension; i++) {
          B.set(k, j, B.get(k, j) - B.get(i, j) * l.get(i, k));
        }
        B.set(k, j, B.get(k, j) / l.get(k, k));
      }
    }

    return B;
  }

  get lowerTriangularMatrix() {
    return this.L;
  }
}

class nipals {
  constructor(X, options = {}) {
    X = WrapperMatrix2D.checkMatrix(X);
    let { Y } = options;
    const {
      scaleScores = false,
      maxIterations = 1000,
      terminationCriteria = 1e-10,
    } = options;

    let u;
    if (Y) {
      if (isAnyArray.isAnyArray(Y) && typeof Y[0] === 'number') {
        Y = Matrix.columnVector(Y);
      } else {
        Y = WrapperMatrix2D.checkMatrix(Y);
      }
      if (Y.rows !== X.rows) {
        throw new Error('Y should have the same number of rows as X');
      }
      u = Y.getColumnVector(0);
    } else {
      u = X.getColumnVector(0);
    }

    let diff = 1;
    let t, q, w, tOld;

    for (
      let counter = 0;
      counter < maxIterations && diff > terminationCriteria;
      counter++
    ) {
      w = X.transpose().mmul(u).div(u.transpose().mmul(u).get(0, 0));
      w = w.div(w.norm());

      t = X.mmul(w).div(w.transpose().mmul(w).get(0, 0));

      if (counter > 0) {
        diff = t.clone().sub(tOld).pow(2).sum();
      }
      tOld = t.clone();

      if (Y) {
        q = Y.transpose().mmul(t).div(t.transpose().mmul(t).get(0, 0));
        q = q.div(q.norm());

        u = Y.mmul(q).div(q.transpose().mmul(q).get(0, 0));
      } else {
        u = t;
      }
    }

    if (Y) {
      let p = X.transpose().mmul(t).div(t.transpose().mmul(t).get(0, 0));
      p = p.div(p.norm());
      let xResidual = X.clone().sub(t.clone().mmul(p.transpose()));
      let residual = u.transpose().mmul(t).div(t.transpose().mmul(t).get(0, 0));
      let yResidual = Y.clone().sub(
        t.clone().mulS(residual.get(0, 0)).mmul(q.transpose()),
      );

      this.t = t;
      this.p = p.transpose();
      this.w = w.transpose();
      this.q = q;
      this.u = u;
      this.s = t.transpose().mmul(t);
      this.xResidual = xResidual;
      this.yResidual = yResidual;
      this.betas = residual;
    } else {
      this.w = w.transpose();
      this.s = t.transpose().mmul(t).sqrt();
      if (scaleScores) {
        this.t = t.clone().div(this.s.get(0, 0));
      } else {
        this.t = t;
      }
      this.xResidual = X.sub(t.mmul(w.transpose()));
    }
  }
}

exports.AbstractMatrix = AbstractMatrix;
exports.CHO = CholeskyDecomposition;
exports.CholeskyDecomposition = CholeskyDecomposition;
exports.EVD = EigenvalueDecomposition;
exports.EigenvalueDecomposition = EigenvalueDecomposition;
exports.LU = LuDecomposition;
exports.LuDecomposition = LuDecomposition;
exports.Matrix = Matrix;
exports.MatrixColumnSelectionView = MatrixColumnSelectionView;
exports.MatrixColumnView = MatrixColumnView;
exports.MatrixFlipColumnView = MatrixFlipColumnView;
exports.MatrixFlipRowView = MatrixFlipRowView;
exports.MatrixRowSelectionView = MatrixRowSelectionView;
exports.MatrixRowView = MatrixRowView;
exports.MatrixSelectionView = MatrixSelectionView;
exports.MatrixSubView = MatrixSubView;
exports.MatrixTransposeView = MatrixTransposeView;
exports.NIPALS = nipals;
exports.Nipals = nipals;
exports.QR = QrDecomposition;
exports.QrDecomposition = QrDecomposition;
exports.SVD = SingularValueDecomposition;
exports.SingularValueDecomposition = SingularValueDecomposition;
exports.WrapperMatrix1D = WrapperMatrix1D;
exports.WrapperMatrix2D = WrapperMatrix2D;
exports.correlation = correlation;
exports.covariance = covariance;
exports["default"] = Matrix;
exports.determinant = determinant;
exports.inverse = inverse;
exports.linearDependencies = linearDependencies;
exports.pseudoInverse = pseudoInverse;
exports.solve = solve;
exports.wrap = wrap;

},{"is-any-array":39,"ml-array-rescale":42}],44:[function(_dereq_,module,exports){
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

},{}],45:[function(_dereq_,module,exports){
// A library of seedable RNGs implemented in Javascript.
//
// Usage:
//
// var seedrandom = require('seedrandom');
// var random = seedrandom(1); // or any seed.
// var x = random();       // 0 <= x < 1.  Every bit is random.
// var x = random.quick(); // 0 <= x < 1.  32 bits of randomness.

// alea, a 53-bit multiply-with-carry generator by Johannes Baagøe.
// Period: ~2^116
// Reported to pass all BigCrush tests.
var alea = _dereq_('./lib/alea');

// xor128, a pure xor-shift generator by George Marsaglia.
// Period: 2^128-1.
// Reported to fail: MatrixRank and LinearComp.
var xor128 = _dereq_('./lib/xor128');

// xorwow, George Marsaglia's 160-bit xor-shift combined plus weyl.
// Period: 2^192-2^32
// Reported to fail: CollisionOver, SimpPoker, and LinearComp.
var xorwow = _dereq_('./lib/xorwow');

// xorshift7, by François Panneton and Pierre L'ecuyer, takes
// a different approach: it adds robustness by allowing more shifts
// than Marsaglia's original three.  It is a 7-shift generator
// with 256 bits, that passes BigCrush with no systmatic failures.
// Period 2^256-1.
// No systematic BigCrush failures reported.
var xorshift7 = _dereq_('./lib/xorshift7');

// xor4096, by Richard Brent, is a 4096-bit xor-shift with a
// very long period that also adds a Weyl generator. It also passes
// BigCrush with no systematic failures.  Its long period may
// be useful if you have many generators and need to avoid
// collisions.
// Period: 2^4128-2^32.
// No systematic BigCrush failures reported.
var xor4096 = _dereq_('./lib/xor4096');

// Tyche-i, by Samuel Neves and Filipe Araujo, is a bit-shifting random
// number generator derived from ChaCha, a modern stream cipher.
// https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf
// Period: ~2^127
// No systematic BigCrush failures reported.
var tychei = _dereq_('./lib/tychei');

// The original ARC4-based prng included in this library.
// Period: ~2^1600
var sr = _dereq_('./seedrandom');

sr.alea = alea;
sr.xor128 = xor128;
sr.xorwow = xorwow;
sr.xorshift7 = xorshift7;
sr.xor4096 = xor4096;
sr.tychei = tychei;

module.exports = sr;

},{"./lib/alea":46,"./lib/tychei":47,"./lib/xor128":48,"./lib/xor4096":49,"./lib/xorshift7":50,"./lib/xorwow":51,"./seedrandom":52}],46:[function(_dereq_,module,exports){
// A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
// http://baagoe.com/en/RandomMusings/javascript/
// https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
// Original work is under MIT license -

// Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.



(function(global, module, define) {

function Alea(seed) {
  var me = this, mash = Mash();

  me.next = function() {
    var t = 2091639 * me.s0 + me.c * 2.3283064365386963e-10; // 2^-32
    me.s0 = me.s1;
    me.s1 = me.s2;
    return me.s2 = t - (me.c = t | 0);
  };

  // Apply the seeding algorithm from Baagoe.
  me.c = 1;
  me.s0 = mash(' ');
  me.s1 = mash(' ');
  me.s2 = mash(' ');
  me.s0 -= mash(seed);
  if (me.s0 < 0) { me.s0 += 1; }
  me.s1 -= mash(seed);
  if (me.s1 < 0) { me.s1 += 1; }
  me.s2 -= mash(seed);
  if (me.s2 < 0) { me.s2 += 1; }
  mash = null;
}

function copy(f, t) {
  t.c = f.c;
  t.s0 = f.s0;
  t.s1 = f.s1;
  t.s2 = f.s2;
  return t;
}

function impl(seed, opts) {
  var xg = new Alea(seed),
      state = opts && opts.state,
      prng = xg.next;
  prng.int32 = function() { return (xg.next() * 0x100000000) | 0; }
  prng.double = function() {
    return prng() + (prng() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
  };
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

function Mash() {
  var n = 0xefc8249d;

  var mash = function(data) {
    data = String(data);
    for (var i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      var h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000; // 2^32
    }
    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
  };

  return mash;
}


if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.alea = impl;
}

})(
  this,
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);



},{}],47:[function(_dereq_,module,exports){
// A Javascript implementaion of the "Tyche-i" prng algorithm by
// Samuel Neves and Filipe Araujo.
// See https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf

(function(global, module, define) {

function XorGen(seed) {
  var me = this, strseed = '';

  // Set up generator function.
  me.next = function() {
    var b = me.b, c = me.c, d = me.d, a = me.a;
    b = (b << 25) ^ (b >>> 7) ^ c;
    c = (c - d) | 0;
    d = (d << 24) ^ (d >>> 8) ^ a;
    a = (a - b) | 0;
    me.b = b = (b << 20) ^ (b >>> 12) ^ c;
    me.c = c = (c - d) | 0;
    me.d = (d << 16) ^ (c >>> 16) ^ a;
    return me.a = (a - b) | 0;
  };

  /* The following is non-inverted tyche, which has better internal
   * bit diffusion, but which is about 25% slower than tyche-i in JS.
  me.next = function() {
    var a = me.a, b = me.b, c = me.c, d = me.d;
    a = (me.a + me.b | 0) >>> 0;
    d = me.d ^ a; d = d << 16 ^ d >>> 16;
    c = me.c + d | 0;
    b = me.b ^ c; b = b << 12 ^ d >>> 20;
    me.a = a = a + b | 0;
    d = d ^ a; me.d = d = d << 8 ^ d >>> 24;
    me.c = c = c + d | 0;
    b = b ^ c;
    return me.b = (b << 7 ^ b >>> 25);
  }
  */

  me.a = 0;
  me.b = 0;
  me.c = 2654435769 | 0;
  me.d = 1367130551;

  if (seed === Math.floor(seed)) {
    // Integer seed.
    me.a = (seed / 0x100000000) | 0;
    me.b = seed | 0;
  } else {
    // String seed.
    strseed += seed;
  }

  // Mix in string seed, then discard an initial batch of 64 values.
  for (var k = 0; k < strseed.length + 20; k++) {
    me.b ^= strseed.charCodeAt(k) | 0;
    me.next();
  }
}

function copy(f, t) {
  t.a = f.a;
  t.b = f.b;
  t.c = f.c;
  t.d = f.d;
  return t;
};

function impl(seed, opts) {
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.tychei = impl;
}

})(
  this,
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);



},{}],48:[function(_dereq_,module,exports){
// A Javascript implementaion of the "xor128" prng algorithm by
// George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

(function(global, module, define) {

function XorGen(seed) {
  var me = this, strseed = '';

  me.x = 0;
  me.y = 0;
  me.z = 0;
  me.w = 0;

  // Set up generator function.
  me.next = function() {
    var t = me.x ^ (me.x << 11);
    me.x = me.y;
    me.y = me.z;
    me.z = me.w;
    return me.w ^= (me.w >>> 19) ^ t ^ (t >>> 8);
  };

  if (seed === (seed | 0)) {
    // Integer seed.
    me.x = seed;
  } else {
    // String seed.
    strseed += seed;
  }

  // Mix in string seed, then discard an initial batch of 64 values.
  for (var k = 0; k < strseed.length + 64; k++) {
    me.x ^= strseed.charCodeAt(k) | 0;
    me.next();
  }
}

function copy(f, t) {
  t.x = f.x;
  t.y = f.y;
  t.z = f.z;
  t.w = f.w;
  return t;
}

function impl(seed, opts) {
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xor128 = impl;
}

})(
  this,
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);



},{}],49:[function(_dereq_,module,exports){
// A Javascript implementaion of Richard Brent's Xorgens xor4096 algorithm.
//
// This fast non-cryptographic random number generator is designed for
// use in Monte-Carlo algorithms. It combines a long-period xorshift
// generator with a Weyl generator, and it passes all common batteries
// of stasticial tests for randomness while consuming only a few nanoseconds
// for each prng generated.  For background on the generator, see Brent's
// paper: "Some long-period random number generators using shifts and xors."
// http://arxiv.org/pdf/1004.3115v1.pdf
//
// Usage:
//
// var xor4096 = require('xor4096');
// random = xor4096(1);                        // Seed with int32 or string.
// assert.equal(random(), 0.1520436450538547); // (0, 1) range, 53 bits.
// assert.equal(random.int32(), 1806534897);   // signed int32, 32 bits.
//
// For nonzero numeric keys, this impelementation provides a sequence
// identical to that by Brent's xorgens 3 implementaion in C.  This
// implementation also provides for initalizing the generator with
// string seeds, or for saving and restoring the state of the generator.
//
// On Chrome, this prng benchmarks about 2.1 times slower than
// Javascript's built-in Math.random().

(function(global, module, define) {

function XorGen(seed) {
  var me = this;

  // Set up generator function.
  me.next = function() {
    var w = me.w,
        X = me.X, i = me.i, t, v;
    // Update Weyl generator.
    me.w = w = (w + 0x61c88647) | 0;
    // Update xor generator.
    v = X[(i + 34) & 127];
    t = X[i = ((i + 1) & 127)];
    v ^= v << 13;
    t ^= t << 17;
    v ^= v >>> 15;
    t ^= t >>> 12;
    // Update Xor generator array state.
    v = X[i] = v ^ t;
    me.i = i;
    // Result is the combination.
    return (v + (w ^ (w >>> 16))) | 0;
  };

  function init(me, seed) {
    var t, v, i, j, w, X = [], limit = 128;
    if (seed === (seed | 0)) {
      // Numeric seeds initialize v, which is used to generates X.
      v = seed;
      seed = null;
    } else {
      // String seeds are mixed into v and X one character at a time.
      seed = seed + '\0';
      v = 0;
      limit = Math.max(limit, seed.length);
    }
    // Initialize circular array and weyl value.
    for (i = 0, j = -32; j < limit; ++j) {
      // Put the unicode characters into the array, and shuffle them.
      if (seed) v ^= seed.charCodeAt((j + 32) % seed.length);
      // After 32 shuffles, take v as the starting w value.
      if (j === 0) w = v;
      v ^= v << 10;
      v ^= v >>> 15;
      v ^= v << 4;
      v ^= v >>> 13;
      if (j >= 0) {
        w = (w + 0x61c88647) | 0;     // Weyl.
        t = (X[j & 127] ^= (v + w));  // Combine xor and weyl to init array.
        i = (0 == t) ? i + 1 : 0;     // Count zeroes.
      }
    }
    // We have detected all zeroes; make the key nonzero.
    if (i >= 128) {
      X[(seed && seed.length || 0) & 127] = -1;
    }
    // Run the generator 512 times to further mix the state before using it.
    // Factoring this as a function slows the main generator, so it is just
    // unrolled here.  The weyl generator is not advanced while warming up.
    i = 127;
    for (j = 4 * 128; j > 0; --j) {
      v = X[(i + 34) & 127];
      t = X[i = ((i + 1) & 127)];
      v ^= v << 13;
      t ^= t << 17;
      v ^= v >>> 15;
      t ^= t >>> 12;
      X[i] = v ^ t;
    }
    // Storing state as object members is faster than using closure variables.
    me.w = w;
    me.X = X;
    me.i = i;
  }

  init(me, seed);
}

function copy(f, t) {
  t.i = f.i;
  t.w = f.w;
  t.X = f.X.slice();
  return t;
};

function impl(seed, opts) {
  if (seed == null) seed = +(new Date);
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (state.X) copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xor4096 = impl;
}

})(
  this,                                     // window object or global
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);

},{}],50:[function(_dereq_,module,exports){
// A Javascript implementaion of the "xorshift7" algorithm by
// François Panneton and Pierre L'ecuyer:
// "On the Xorgshift Random Number Generators"
// http://saluc.engr.uconn.edu/refs/crypto/rng/panneton05onthexorshift.pdf

(function(global, module, define) {

function XorGen(seed) {
  var me = this;

  // Set up generator function.
  me.next = function() {
    // Update xor generator.
    var X = me.x, i = me.i, t, v, w;
    t = X[i]; t ^= (t >>> 7); v = t ^ (t << 24);
    t = X[(i + 1) & 7]; v ^= t ^ (t >>> 10);
    t = X[(i + 3) & 7]; v ^= t ^ (t >>> 3);
    t = X[(i + 4) & 7]; v ^= t ^ (t << 7);
    t = X[(i + 7) & 7]; t = t ^ (t << 13); v ^= t ^ (t << 9);
    X[i] = v;
    me.i = (i + 1) & 7;
    return v;
  };

  function init(me, seed) {
    var j, w, X = [];

    if (seed === (seed | 0)) {
      // Seed state array using a 32-bit integer.
      w = X[0] = seed;
    } else {
      // Seed state using a string.
      seed = '' + seed;
      for (j = 0; j < seed.length; ++j) {
        X[j & 7] = (X[j & 7] << 15) ^
            (seed.charCodeAt(j) + X[(j + 1) & 7] << 13);
      }
    }
    // Enforce an array length of 8, not all zeroes.
    while (X.length < 8) X.push(0);
    for (j = 0; j < 8 && X[j] === 0; ++j);
    if (j == 8) w = X[7] = -1; else w = X[j];

    me.x = X;
    me.i = 0;

    // Discard an initial 256 values.
    for (j = 256; j > 0; --j) {
      me.next();
    }
  }

  init(me, seed);
}

function copy(f, t) {
  t.x = f.x.slice();
  t.i = f.i;
  return t;
}

function impl(seed, opts) {
  if (seed == null) seed = +(new Date);
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (state.x) copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xorshift7 = impl;
}

})(
  this,
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);


},{}],51:[function(_dereq_,module,exports){
// A Javascript implementaion of the "xorwow" prng algorithm by
// George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

(function(global, module, define) {

function XorGen(seed) {
  var me = this, strseed = '';

  // Set up generator function.
  me.next = function() {
    var t = (me.x ^ (me.x >>> 2));
    me.x = me.y; me.y = me.z; me.z = me.w; me.w = me.v;
    return (me.d = (me.d + 362437 | 0)) +
       (me.v = (me.v ^ (me.v << 4)) ^ (t ^ (t << 1))) | 0;
  };

  me.x = 0;
  me.y = 0;
  me.z = 0;
  me.w = 0;
  me.v = 0;

  if (seed === (seed | 0)) {
    // Integer seed.
    me.x = seed;
  } else {
    // String seed.
    strseed += seed;
  }

  // Mix in string seed, then discard an initial batch of 64 values.
  for (var k = 0; k < strseed.length + 64; k++) {
    me.x ^= strseed.charCodeAt(k) | 0;
    if (k == strseed.length) {
      me.d = me.x << 10 ^ me.x >>> 4;
    }
    me.next();
  }
}

function copy(f, t) {
  t.x = f.x;
  t.y = f.y;
  t.z = f.z;
  t.w = f.w;
  t.v = f.v;
  t.d = f.d;
  return t;
}

function impl(seed, opts) {
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xorwow = impl;
}

})(
  this,
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);



},{}],52:[function(_dereq_,module,exports){
/*
Copyright 2019 David Bau.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

(function (global, pool, math) {
//
// The following constants are related to IEEE 754 limits.
//

var width = 256,        // each RC4 output is 0 <= x < 256
    chunks = 6,         // at least six RC4 outputs for each double
    digits = 52,        // there are 52 significant digits in a double
    rngname = 'random', // rngname: name for Math.random and Math.seedrandom
    startdenom = math.pow(width, chunks),
    significance = math.pow(2, digits),
    overflow = significance * 2,
    mask = width - 1,
    nodecrypto;         // node.js crypto module, initialized at the bottom.

//
// seedrandom()
// This is the seedrandom function described above.
//
function seedrandom(seed, options, callback) {
  var key = [];
  options = (options == true) ? { entropy: true } : (options || {});

  // Flatten the seed string or build one from local entropy if needed.
  var shortseed = mixkey(flatten(
    options.entropy ? [seed, tostring(pool)] :
    (seed == null) ? autoseed() : seed, 3), key);

  // Use the seed to initialize an ARC4 generator.
  var arc4 = new ARC4(key);

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.
  var prng = function() {
    var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
        d = startdenom,                 //   and denominator d = 2 ^ 48.
        x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  };

  prng.int32 = function() { return arc4.g(4) | 0; }
  prng.quick = function() { return arc4.g(4) / 0x100000000; }
  prng.double = prng;

  // Mix the randomness into accumulated entropy.
  mixkey(tostring(arc4.S), pool);

  // Calling convention: what to return as a function of prng, seed, is_math.
  return (options.pass || callback ||
      function(prng, seed, is_math_call, state) {
        if (state) {
          // Load the arc4 state from the given state if it has an S array.
          if (state.S) { copy(state, arc4); }
          // Only provide the .state method if requested via options.state.
          prng.state = function() { return copy(arc4, {}); }
        }

        // If called as a method of Math (Math.seedrandom()), mutate
        // Math.random because that is how seedrandom.js has worked since v1.0.
        if (is_math_call) { math[rngname] = prng; return seed; }

        // Otherwise, it is a newer calling convention, so return the
        // prng directly.
        else return prng;
      })(
  prng,
  shortseed,
  'global' in options ? options.global : (this == math),
  options.state);
}

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
function ARC4(key) {
  var t, keylen = key.length,
      me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) {
    s[i] = i++;
  }
  for (i = 0; i < width; i++) {
    s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
    s[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  (me.g = function(count) {
    // Using instance members instead of closure state nearly doubles speed.
    var t, r = 0,
        i = me.i, j = me.j, s = me.S;
    while (count--) {
      t = s[i = mask & (i + 1)];
      r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
    }
    me.i = i; me.j = j;
    return r;
    // For robust unpredictability, the function call below automatically
    // discards an initial batch of values.  This is called RC4-drop[256].
    // See http://google.com/search?q=rsa+fluhrer+response&btnI
  })(width);
}

//
// copy()
// Copies internal state of ARC4 to or from a plain object.
//
function copy(f, t) {
  t.i = f.i;
  t.j = f.j;
  t.S = f.S.slice();
  return t;
};

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
function flatten(obj, depth) {
  var result = [], typ = (typeof obj), prop;
  if (depth && typ == 'object') {
    for (prop in obj) {
      try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
    }
  }
  return (result.length ? result : typ == 'string' ? obj : obj + '\0');
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
function mixkey(seed, key) {
  var stringseed = seed + '', smear, j = 0;
  while (j < stringseed.length) {
    key[mask & j] =
      mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
  }
  return tostring(key);
}

//
// autoseed()
// Returns an object for autoseeding, using window.crypto and Node crypto
// module if available.
//
function autoseed() {
  try {
    var out;
    if (nodecrypto && (out = nodecrypto.randomBytes)) {
      // The use of 'out' to remember randomBytes makes tight minified code.
      out = out(width);
    } else {
      out = new Uint8Array(width);
      (global.crypto || global.msCrypto).getRandomValues(out);
    }
    return tostring(out);
  } catch (e) {
    var browser = global.navigator,
        plugins = browser && browser.plugins;
    return [+new Date, global, plugins, global.screen, tostring(pool)];
  }
}

//
// tostring()
// Converts an array of charcodes to a string
//
function tostring(a) {
  return String.fromCharCode.apply(0, a);
}

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to interfere with deterministic PRNG state later,
// seedrandom will not call math.random on its own again after
// initialization.
//
mixkey(math.random(), pool);

//
// Nodejs and AMD support: export the implementation as a module using
// either convention.
//
if ((typeof module) == 'object' && module.exports) {
  module.exports = seedrandom;
  // When in node.js, try using crypto package for autoseeding.
  try {
    nodecrypto = _dereq_('crypto');
  } catch (ex) {}
} else if ((typeof define) == 'function' && define.amd) {
  define(function() { return seedrandom; });
} else {
  // When included as a plain script, set up Math.seedrandom global.
  math['seed' + rngname] = seedrandom;
}


// End anonymous scope, and pass initial values.
})(
  // global: `self` in browsers (including strict mode and web workers),
  // otherwise `this` in Node and other environments
  (typeof self !== 'undefined') ? self : this,
  [],     // pool: entropy pool starts empty
  Math    // math: package containing random, pow, and seedrandom
);

},{"crypto":38}]},{},[4])(4)
});
