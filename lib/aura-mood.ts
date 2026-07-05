import { create } from "zustand";
import type { AuroraName } from "./aura-palettes";

/**
 * The aura bloom's state — a tiny, non-persisted UI store.
 * `mood` follows the timer (idle / focus / break) and controls motion energy.
 * `scene` is a palette override set by the current page: subject pages set
 * their own cool aurora; everything else leaves the warm reference palette.
 * Decoupled from the main data store so atmosphere never blocks on hydration.
 */
export type AuraMood = "idle" | "focus" | "break";

interface AuraMoodState {
  mood: AuraMood;
  scene: AuroraName | null;
  setMood: (mood: AuraMood) => void;
  setScene: (scene: AuroraName | null) => void;
}

export const useAuraMood = create<AuraMoodState>((set) => ({
  mood: "idle",
  scene: null,
  setMood: (mood) => set({ mood }),
  setScene: (scene) => set({ scene }),
}));

/** Resolve which palette the bloom should render right now. */
export function resolveAurora(mood: AuraMood, scene: AuroraName | null): AuroraName {
  if (mood === "break") return "sage-break";
  return scene ?? "warm";
}
