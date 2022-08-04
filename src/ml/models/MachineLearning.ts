import { writeJSON } from "../../utils/files.js";

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
        throw new Error('Calling method of abstract class');
    }

    /**
     * Saves the pre-trained model to the given path
     * @param path the location to save to
     */
    write(path: string) {
        writeJSON(this, path);
    }
}

