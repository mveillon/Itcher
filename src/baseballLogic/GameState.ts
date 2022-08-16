import { Pitcher } from "./Pitcher.js";
import { List } from "../utils/LinkedList.js";

export class GameState {
    private _outs: number;
    private _strikes: number;
    private _balls: number;
    private _lineSpot: number;
    pitcher: Pitcher;
    lineup: string[];
    lastStates: List<GameState>;
    bases: boolean[];
    static maxBackups = 20;

    /**
     * Keeps track of the current state of a baseball game
     */
    constructor() {
        this._outs = 0;
        this._strikes = 0;
        this._balls = 0;
        this._lineSpot = 0;
        this.pitcher = new Pitcher('Unknown (change me!)', '');
        this.lineup = ['Unknown (change me!)'];
        this.lastStates = new List<GameState>();
        this.bases = [false, false, false];
    }

    get strikes() {
        return this._strikes;
    }

    get balls() {
        return this._balls;
    }

    set strikes(s: number) {
        if (s < 0) return;
        if (s >= 3) {
            this.strikeout();
        } else {
            this._strikes = s;
        }
    }

    set balls(b: number) {
        if (b < 0) return;
        if (b >= 4) {
            this.walk();
        } else {
            this._balls = b;
        }
    }

    get outs() {
        return this._outs;
    }

    set outs(o: number) {
        if (o >= 3) {
            this._outs = 0;
        } else {
            this._outs = o;
        }
    }

    get lineSpot() {
        return this._lineSpot;
    }

    set lineSpot(l: number) {
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
    private restore() {
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
    private newBatter() {
        this._balls = 0;
        this._strikes = 0;
        this.lineSpot += 1;
    }

    /**
     * Moves every batter ahead by the same number of bases
     * @param numBases how many bases the runners should move
     */
    private nBaseHit(numBases: number) {
        if (numBases === 0) return;
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
    pitcherPlatoon(): boolean {
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

    groundout = this.out;
    flyout = this.out;
    lineout = this.out;
    undo = this.restore;
}

const stateContext = {
    state: new GameState()
};

/**
 * Resets the global state variable, keeping only a few fields
 * @param keepPitcher whether to retain the old pitcher. Default is true
 * @param keepLineup whether to retain the old lineup. Default is true
 * @param keepStates whether to retain the old backups. Default is true
 */
export const resetState = (
    keepPitcher: boolean = true, 
    keepLineup: boolean = true, 
    keepStates: boolean = true
    ) => {
    let oldState = getState();
    const oldPitch = oldState.pitcher;
    const oldLine = oldState.lineup;
    oldState.backup();
    const oldStates = oldState.lastStates;

    oldState = new GameState();
    if (keepPitcher) oldState.pitcher = oldPitch;
    if (keepLineup) oldState.lineup = oldLine;
    if (keepStates) oldState.lastStates = oldStates;
    setState(oldState);
}

/**
 * Gets the global state to use
 * @returns the global state
 */
export const getState = (): GameState => {
    return stateContext.state;
}

/**
 * Updates the global state to the passed state
 * @param newState the new state
 */
export const setState = (newState: GameState) => {
    stateContext.state = newState;
}
