"use client";
import { create } from "zustand";

type AuthState = {
  email: string | null;
  setEmail: (e: string | null) => void;
};

export const useAuth = create<AuthState>((set) => ({
  email: null,
  setEmail: (e) => set({ email: e }),
}));
