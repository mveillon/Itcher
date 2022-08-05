import { readJSON, writeJSON } from "../../utils/files";

export abstract class MachineLearning {
    /**
     * The abstract base class for all machine learning models
     */
    
    /**
     * Fits the model based on the given features and targets
     * @param features the dependent variables to train on
     * @param targets the response variables
     */
    abstract fit(features: number[][], targets: number[]): void;

    /**
     * Given a new set of features, makes predictions based on
     * results from training (fit function)
     * @param features the new features to predict on
     */
    abstract predict(features: number[][]): number[];

    /**
     * Reads the machine learning model from the given path
     * Allows for more efficient creation than training
     * @param path the location of the saved model
     * @returns the pre-trained model
     */
    static read(path: string): MachineLearning {
        return this.fromObj(readJSON(path));
    }

    /**
     * Converts an object from a JSON file into an instance of this class
     * The object is assumed to have been saved by the toObj method of this class
     * @param obj the JSON object
     * @returns the machine learning model
     */
    static fromObj(obj: { [key: string]: any }): MachineLearning {
        throw new Error('Calling method of abstract class');
    }

    /**
     * Converts an instance of this class to a object that can be saved to a JSON
     * @returns a JSON object
     */
    abstract toObj(): { [key: string]: any };

    /**
     * Writes the machine learning model to the given path
     * Allows for more efficient creation later on than training
     * @param path the location to save to
     */
    write(path: string) {
        writeJSON(path, this.toObj());
    }
}

