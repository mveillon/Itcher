import { MachineLearning } from "./MachineLearning.js";

export class NeuralNet extends MachineLearning {
    private net: any;

    constructor(...layerSizes: number[]) {
        super();
        if (layerSizes.length < 2) {
            throw new Error(
                `Layer sizes need to have at least 2 numbers: ${layerSizes}`
            );
        }
        
    }

    fit(features: number[][], targets: number[]): void {
    }

    predict(features: number[][]): number[] {
        return [];
    }

    static read(path: string): MachineLearning {
        return new NeuralNet();
    }

    write(path: string): void {
        
    }
}
