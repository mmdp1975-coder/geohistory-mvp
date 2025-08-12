"use client";
import { create } from "zustand";

type Selected = { title: string; year?: number; lat: number; lng: number } | null;

type SelState = {
  selected: Selected;
  setSelected: (v: Selected) => void;
};

export const useSelection = create<SelState>((set) => ({
  selected: null,
  setSelected: (v) => set({ selected: v }),
}));
