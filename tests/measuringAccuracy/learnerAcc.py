import numpy as np
import matplotlib.pyplot as plt

root = "./tests/measuringAccuracy/"

def txt_to_np(path: str) -> np.ndarray:
    with open(path, 'r') as f:
        line = next(iter(f)).split(',')
        return np.fromiter(map(float, line), dtype = float, count = len(line))

def plot_accuracy(learner_name: str):
    targs = txt_to_np(root + 'targs.txt')
    preds = txt_to_np(root + 'preds.txt')

    plt.clf()
    plt.title('Predicted run value vs actual')
    plt.xlabel('Actual run value')
    plt.ylabel('Predicted run value')
    plt.scatter(targs, preds)
    plt.savefig(''.join((root, 'plots/', learner_name, '.png')))

if __name__ == '__main__':
    name = 'combined_ensemble'
    plot_accuracy(name)
