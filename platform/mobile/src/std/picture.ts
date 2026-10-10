export type Rung = {
    uri: string;
    width: number;
};

export type Picture = {
    uri: string;
    rungs: readonly Rung[];
};
