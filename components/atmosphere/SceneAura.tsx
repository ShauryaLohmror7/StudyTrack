"use client";

import { useEffect } from "react";
import { useAuraMood } from "@/lib/aura-mood";
import type { AuroraName } from "@/lib/aura-palettes";

/**
 * Mount this on a page to give it its own aurora palette
 * (subject pages use their cool per-subject aurora).
 * Restores the default warm palette on unmount.
 */
export function SceneAura({ palette }: { palette: AuroraName }) {
  const setScene = useAuraMood((s) => s.setScene);

  useEffect(() => {
    setScene(palette);
    return () => setScene(null);
  }, [palette, setScene]);

  return null;
}
