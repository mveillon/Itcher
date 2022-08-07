import pandas as pd
import numpy as np
from typing import Tuple, List

ROOT_DIR = 'src/ml/data/'

"""
pitches.ignore.csv shape is (2_867_154, 40)
pitches_reduced.csv is a scaled down version for testing
  shape is only (300_000, 40)
pitches reduced generated with the following Unix command
`> head -300001 src/allData/pitches.ignore.csv > src/ml/data/pitches_reduced.ignore.csv`
"""

def get_csv(path: str) -> np.ndarray:
    """Reads the csv at path and returns it."""
    return pd.read_csv(path).to_numpy(dtype = 'U64')

def get_header(path: str) -> str:
    """Returns the header of the csv file at path"""
    with open(path, 'r') as sheet:
        return next(iter(sheet)).replace('\n', '')

def split(path: str, splits: List[float]) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Splits the csv at path into train set, validation set, and testing set."""
    assert np.isclose(sum(splits), 1), 'Splits must add up to 1!'
    all_data = get_csv(path)
    print(f'Shape of all data: {all_data.shape}')

    np.random.shuffle(all_data)
    train_end = round(all_data.shape[0] * splits[0])
    valid_end = round(all_data.shape[0] * (splits[0] + splits[1]))

    train_set = all_data[:train_end]
    valid_set = all_data[train_end:valid_end]
    test_set = all_data[valid_end:]
    return train_set, valid_set, test_set

def main(splits: List[float] = [0.5, 0.3, 0.2]):
    """Splits pitches.ignore.csv and saves the output files"""
    pth = ROOT_DIR + 'pitches_reduced.ignore.csv'
    train, valid, test = split(pth, splits)
    head = get_header(pth)
    print('Split complete')
    sets = {
        'train.csv': train,
        'valid.csv': valid,
        'test.csv': test
    }
    for path in sets:
        # why are literally all of the default arguments wrong for np.savetxt
        np.savetxt(
            ROOT_DIR + path,
            sets[path],
            fmt = '%s',
            delimiter = ',',
            header = head,
            comments = ''
        )
        print(path + f' writing complete: {sets[path].shape}')

if __name__ == '__main__':
    main()
