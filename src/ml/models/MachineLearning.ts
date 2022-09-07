export abstract class MachineLearning {
    /**
     * The abstract base class for all machine learning models
     */
    
    /**
     * Fits the model based on the given features and targets
     * @param features the dependent variables to train on
     * @param targets the response variables
     */
    async fit(features: number[][], targets: number[]): Promise<void> {
        await this.fitAsync(features, targets);
    }

    /**
     * Allows for expensive fit operations to return immediately when called
     * in the wrapper fit function. This is the method child classes should use
     * to implement their fit functions
     * @param features the dependent variables to train on
     * @param targets the response variables
     */
    protected abstract fitAsync(features: number[][], targets: number[]): Promise<void>;

    /**
     * Given a new set of features, makes predictions based on
     * results from training (fit function)
     * @param features the new features to predict on
     */
    abstract predict(features: number[][]): number[];
}

