import { createContext, useContext } from "react";

type LabelSet = {
    back?: string | undefined;
    close?: string | undefined;
    clear?: string | undefined;
    increase?: string | undefined;
    decrease?: string | undefined;
};

export const Labels = createContext<LabelSet>({});

export const useLabels = (): LabelSet => useContext(Labels);
