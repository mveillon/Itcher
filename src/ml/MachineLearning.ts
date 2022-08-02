export abstract class MachineLearning {
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

    static read(path: string): MachineLearning {
        throw new Error('Calling method of abstract class');
    }

    static write(path: string) {
        throw new Error('Calling method of abstract class');
    }
}