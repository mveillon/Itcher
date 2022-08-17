import numpy as np
import matplotlib.pyplot as plt
from typing import List
from os import listdir

ROOT = "./tests/experiments/measuringAccuracy/"

def mse(x: np.ndarray, y: np.ndarray) -> float:
    """Returns the mean squared error of x and y."""
    total = 0
    smaller = min(x.shape[0], y.shape[0])
    for i in range(smaller):
        total += (x[i] - y[i]) ** 2
    return total / smaller

def txt_to_np(path: str) -> np.ndarray:
    """Reads the text file and converts it to a numpy array."""
    with open(path, 'r') as f:
        line = f.readline().split(',')
        return np.fromiter(map(float, line), dtype = float, count = len(line))

def plot_accuracy(learner_name: str) -> str:
    """Plots the accuracy and saves it to a path whose filename includes learner_name."""
    targs = txt_to_np(ROOT + 'targs.txt')
    preds = txt_to_np(f'{ROOT}preds/{learner_name}.txt')

    err = mse(targs, preds)

    f = plt.figure()
    ax = f.add_subplot(111)

    plt.clf()
    plt.title('Predicted run value vs actual')
    plt.xlabel('Actual run value')
    plt.ylabel('Predicted run value')
    plt.scatter(targs, preds)

    _, ymax = plt.ylim()
    plt.ylim(top = ymax * 1.3)
    plt.text(
        0.2, 
        0.9, 
        'mse = {:.6f}'.format(err), 
        ha = 'center', 
        va = 'center',
        transform = ax.transAxes
    )

    plt.savefig(f'{ROOT}plots/{learner_name}.png')

    return f'{learner_name}:\n\tmse = {err}'

def plot_all():
    """Plots every learner's predictions and saves their accuracies."""
    files = listdir(ROOT + 'preds/')
    names = []
    for f in files:
        names.append(f.rsplit('.', maxsplit = 1)[0])

    err_strs: List[str] = []
    for name in names:
        print(f'Plotting {name}...')
        err_strs.append(plot_accuracy(name))

    with open(ROOT + 'accuracy.txt', 'w') as acc:
        acc.write('\n\n'.join(err_strs))

if __name__ == '__main__':
    plot_all()