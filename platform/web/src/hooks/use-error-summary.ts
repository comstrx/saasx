"use client";

import { useCallback } from "react";

export function useErrorSummary () {

    return useCallback(( id: string ) => document.getElementById(id)?.focus(), []);

}
