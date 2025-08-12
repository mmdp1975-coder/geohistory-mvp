"use client";
import { create } from "zustand";

type FiltersState = {
  from?: number;
  to?: number;
  setFrom: (v?: number) => void;
  setTo: (v?: number) => void;
};

export const useFilters = create<FiltersState>((set) => ({
  from: undefined,
  to: undefined,
  setFrom: (v) => set({ from: v }),
  setTo: (v) => set({ to: v }),
}));
