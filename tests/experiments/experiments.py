import numpy as np
import matplotlib.pyplot as plt

ROOT = './tests/experiments/'

def read_txt(path: str) -> np.ndarray:
    """Reads the text file and turns it into a numpy array."""
    with open(path, 'r') as f:
        line = f.readline().split(',')
        return np.fromiter(line, dtype = float, count = len(line))

def plot_ws(): 
    """Plots the hidden layer weights of the neural net."""
    ws = np.abs(read_txt(ROOT + 'weights.txt'))
    avgs = np.abs(read_txt(ROOT + 'averages.txt'))
    y = np.array([ ws[i] * avgs[i] for i in range(ws.shape[0]) ])
    plt.clf()
    plt.subplots(constrained_layout = True)
    plt.title('Importance of each weight')
    plt.xlabel('Weight index')
    plt.ylabel('Value of weight')
    plt.plot(range(y.shape[0]), y)
    plt.savefig(ROOT + 'ws_plot.png')

if __name__ == '__main__':
    plot_ws()
