export type ndArray<T> = T | ndArray<T>[];

export type numArray = ndArray<number>;
export type boolArray = ndArray<boolean>;