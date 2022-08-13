import numpy as np
import matplotlib.pyplot as plt

ROOT = './src/ml/models/overfittingTest/'

def read_txt(path: str) -> np.ndarray:
    """Convers the text file to a numpy array."""
    with open(path, 'r') as f:
        cells = f.readline().split(',')
        return np.fromiter(cells, dtype = float, count = len(cells))

def plot_accs():
    """Plots the training accuracy over validation accuracy."""
    train_acc = read_txt(ROOT + 'netTrainAcc.txt')
    valid_acc = read_txt(ROOT + 'netValidAcc.txt')

    x = range(train_acc.shape[0])
    plt.clf()
    plt.title('Training accuracy vs validation accuracy')
    plt.xlabel('Epoch')
    plt.ylabel('Mean squared error')
    plt.plot(x, train_acc, label = 'Training accuracy')
    plt.plot(x, valid_acc, label = 'Validation accuracy')
    plt.legend()
    plt.savefig(ROOT + 'netPlot.png')

if __name__ == '__main__':
    plot_accs()
