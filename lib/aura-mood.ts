import { create } from "zustand";

/**
 * The aura bloom's "mood" — a tiny, non-persisted UI store.
 * The timer (or anything else) can set it; the background bloom reads it.
 * Decoupled from the main data store so atmosphere never blocks on hydration.
 */
export type AuraMood = "idle" | "focus" | "break";

interface AuraMoodState {
  mood: AuraMood;
  setMood: (mood: AuraMood) => void;
}

export const useAuraMood = create<AuraMoodState>((set) => ({
  mood: "idle",
  setMood: (mood) => set({ mood }),
}));
