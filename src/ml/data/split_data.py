import numpy as np
from typing import Tuple, List
from os import remove
from os.path import exists
from argparse import ArgumentParser
from math import ceil

ROOT_DIR = 'src/'
EXTENSION = '.ignore.csv'
NUM_ATTRS = 40

"""
pitches.ignore.csv shape is (2_867_154, 40)
"""

def lines_to_arr(lines: List[str]) -> np.ndarray:
    """Converts the list of lines to a 2D array."""
    arr = [ line.split(',') for line in lines ]
    for i in range(len(arr)):
        if len(arr[i]) != NUM_ATTRS:
            arr[i][-1] = arr[i][-1][:-1]
            arr[i] += [''] * (NUM_ATTRS - len(arr[i]))
            arr[i][-1] += '\n'
    return np.array(arr, dtype='U32')
    
def split(data: List[str], splits: List[float]) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Splits the data into train set, validation set, and testing set."""
    all_data = lines_to_arr(data)
    rand = np.random.default_rng(2022)
    rand.shuffle(all_data)
    train_end = round(all_data.shape[0] * splits[0])
    valid_end = round(all_data.shape[0] * (splits[0] + splits[1]))

    train_set = all_data[:train_end]
    valid_set = all_data[train_end:valid_end]
    test_set = all_data[valid_end:]
    return train_set, valid_set, test_set

def get_sheet_path(direc: str) -> str:
    """Returns the path to the raw spreadsheet at the given direc name."""
    return f'{ROOT_DIR}ml/data/{direc}/raw{EXTENSION}'

def save_splits(train: np.ndarray, valid: np.ndarray, test: np.ndarray):
    """Appends the datasets to the pre-existing spreadsheets."""
    paths = {
        'train': train,
        'valid': valid,
        'test': test
    }
    for direc in paths:
        with open(get_sheet_path(direc), 'a') as f:
            lines = [ ','.join(line) for line in paths[direc] ]
            f.write(''.join(lines))

def clear_splits(header: str):
    """Deletes the old split spreadsheets."""
    paths = (
        'train',
        'valid',
        'test'
    )
    for direc in paths:
        sheet_path = get_sheet_path(direc)
        if exists(sheet_path): remove(sheet_path)
        with open(sheet_path, 'w') as f:
            f.write(header)

def batch_manager(
        splits: List[float], 
        batch_size: int, 
        num_batches: int
    ):
    """Splits pitches.ignore.csv and saves the output files.
    
    Args:
        splits: fractional size of training, validation, and testing sets, respectively
        batch_size: how many lines of the main file to process in each batch
        num_batches: how many batches to do. If None, will just process the whole file

    Returns:
        None
    """
    data = np.empty((batch_size,), dtype='U256')
    i = 0
    batch_ind = 0
    pth = ROOT_DIR + 'allData/pitches.ignore.csv'

    with open(pth, 'r') as f:
        clear_splits(f.readline())
        print('Files cleared')

        for line in f:
            data[i % batch_size] = line
            i += 1
            if i % batch_size == 0:
                print(
                    f'\rProgress: [{"." * batch_ind}{" " * (num_batches - batch_ind)}]',
                    end=''
                )
                save_splits(*split(data, splits))
                batch_ind += 1
                if batch_ind == num_batches:
                    print(f'\rProgress: [{"." * num_batches}]\nDone!')
                    return
        
        print('End of file reached')

def main():
    parser = ArgumentParser(
        description = 'Splits data into train, validation, and testing sets'
    )
    parser.add_argument(
        '-s', 
        '--splits',
        type=int,
        nargs=3,
        help='Fractional size of training, validation, and testing sets, respectively',
        default=[0.5, 0.3, 0.2]
    )
    parser.add_argument(
        '-b',
        '--batchsize',
        type=int,
        help='How large each batch should be',
    )
    parser.add_argument(
        '-c',
        '--countbatches',
        type=int,
        help='How many batches to process. If zero, will process the whole file',
    )
    parser.add_argument(
        '-r',
        '--numrows',
        type=int,
        help="How many rows to include",
    )
    args = parser.parse_args()
    if args.batchsize and args.countbatches and args.numrows:
        raise ValueError('All of batchsize, countbatches, and numrows cannot be provided')
    
    batch_size = 100_000
    num_batches = 5
    if args.numrows:
        if args.batchsize:
            batch_size = args.batchsize
        elif args.countbatches:
            num_batches = args.countbatches
            batch_size = min(batch_size, args.numrows)
        else:
            batch_size = min(batch_size, args.numrows)
            num_batches = ceil(args.numrows / batch_size)
    else:
        if args.batchsize: batch_size = args.batchsize
        if args.countbatches: num_batches = args.countbatches
    
    batch_manager(args.splits, batch_size, num_batches)

if __name__ == '__main__':
    main()
