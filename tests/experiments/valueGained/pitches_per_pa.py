from typing import Dict

def find_pitches_per_pa() -> float:
    ab_to_ps: Dict[str, int] = {}
    ab_ind = 32
    with open('src/allData/pitches.ignore.csv', 'r') as f:
        for line in f:
            abid = line.split(',')[ab_ind]
            if abid:
                if abid in ab_to_ps:
                    ab_to_ps[abid] += 1
                else:
                    ab_to_ps[abid] = 1

    return sum(ab_to_ps.values()) / len(ab_to_ps)

if __name__ == '__main__':
    print(find_pitches_per_pa())