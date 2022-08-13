import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

def mat_plot(path: str):
    """Generates a matrix plot from path."""
    csv = pd.read_csv(path, delimiter = ',')
    plt.clf()
    sns.pairplot(
        csv,
        vars = [
            'start_speed',
            'spin_rate',
            'spin_dir',
            'b_count',
            's_count',
            'reward'
        ]
    )
    plt.savefig('./src/ml/data/plots/matrix_plot.png')

if __name__ == '__main__':
    mat_plot('./src/ml/data/with_rewards.ignore.csv')