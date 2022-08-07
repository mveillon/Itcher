import numpy as np
import matplotlib.pyplot as plt

root = "./tests/measuringAccuracy/"

def txt_to_np(path: str) -> np.ndarray:
    """Reads the text file and converts it to a numpy array."""
    with open(path, 'r') as f:
        line = next(iter(f)).split(',')
        return np.fromiter(map(float, line), dtype = float, count = len(line))

def plot_accuracy(learner_name: str):
    """Plots the accuracy and saves it to a path whose filename includes learner_name."""
    targs = txt_to_np(root + 'targs.txt')
    preds = txt_to_np(root + 'preds.txt')

    plt.clf()
    plt.title('Predicted run value vs actual')
    plt.xlabel('Actual run value')
    plt.ylabel('Predicted run value')
    plt.scatter(targs, preds)
    plt.savefig(''.join((root, 'plots/', learner_name, '.png')))

if __name__ == '__main__':
    name = 'neuralNet'
    plot_accuracy(name)
