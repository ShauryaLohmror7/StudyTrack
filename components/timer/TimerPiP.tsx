"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { createPortal } from "react-dom";
import { useAura } from "@/lib/store";
import { useAuraMood, resolveAurora } from "@/lib/aura-mood";
import { AURORAS } from "@/lib/aura-palettes";
import { PillButton } from "@/components/ui/PillButton";

/**
 * A floating, always-on-top Aura Timer widget via the Document
 * Picture-in-Picture API (Chrome/Edge). Renders the same digits, bloom
 * and paper background into a separate top-level window you can keep in
 * a screen corner while working. The on-page timer keeps running as
 * usual; this is just a synced mirror driven by the same store.
 */

// Minimal typing for the not-yet-standard API.
interface DocumentPiP {
  requestWindow(options?: { width?: number; height?: number }): Promise<Window>;
}
function getPiP(): DocumentPiP | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { documentPictureInPicture?: DocumentPiP }).documentPictureInPicture ?? null;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/** Copy every stylesheet (incl. adopted + next/font) into the PiP document. */
function cloneStyles(target: Window) {
  for (const node of Array.from(
    document.querySelectorAll('style, link[rel="stylesheet"]')
  )) {
    target.document.head.appendChild(node.cloneNode(true));
  }
  try {
    const dumped = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules).map((r) => r.cssText).join("\n");
        } catch {
          return "";
        }
      })
      .join("\n");
    const adopted = (document.adoptedStyleSheets ?? [])
      .map((s) => Array.from(s.cssRules).map((r) => r.cssText).join("\n"))
      .join("\n");
    const style = target.document.createElement("style");
    style.textContent = `${dumped}\n${adopted}`;
    target.document.head.appendChild(style);
  } catch {
    /* best-effort */
  }
}

export type TimerPiPHandle = {
  open: () => Promise<void>;
  close: () => void;
};

type TimerPiPProps = {
  showButton?: boolean;
};

export const TimerPiP = forwardRef<TimerPiPHandle, TimerPiPProps>(function TimerPiP(
  { showButton = true },
  ref
) {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => setSupported(getPiP() !== null), []);

  const open = useCallback(async () => {
    const pip = getPiP();
    if (!pip) return;
    if (pipWindow && !pipWindow.closed) {
      pipWindow.focus();
      return;
    }
    const w = await pip.requestWindow({ width: 260, height: 260 });
    cloneStyles(w);
    w.document.documentElement.setAttribute(
      "data-theme",
      document.documentElement.getAttribute("data-theme") ?? "day"
    );
    w.document.body.className = document.body.className;
    w.document.body.style.margin = "0";
    w.document.body.style.overflow = "hidden";
    w.document.title = "Aura Timer";
    w.addEventListener("pagehide", () => setPipWindow(null));
    setPipWindow(w);
  }, [pipWindow]);

  const close = useCallback(() => {
    try {
      pipWindow?.close();
    } finally {
      setPipWindow(null);
    }
  }, [pipWindow]);

  useImperativeHandle(ref, () => ({ open, close }), [open, close]);

  useEffect(() => {
    return () => {
      try {
        pipWindow?.close();
      } catch {
        /* already gone */
      }
    };
  }, [pipWindow]);

  if (!supported) return null;

  return (
    <>
      {showButton && (
        <PillButton
          size="sm"
          tone="ghost"
          aria-label={pipWindow ? "Close floating timer widget" : "Open floating timer widget"}
          onClick={() => (pipWindow ? close() : void open())}
        >
          {pipWindow ? "Close widget" : "Pop out"}
        </PillButton>
      )}
      {pipWindow && createPortal(<PiPContent />, pipWindow.document.body)}
    </>
  );
});

function PiPContent() {
  const timer = useAura((s) => s.timer);
  const mood = useAuraMood((s) => s.mood);
  const scene = useAuraMood((s) => s.scene);
  const [now, setNow] = useState(() => Date.now());

  const running = timer.endsAt != null;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [running]);

  const remaining =
    timer.phase === "idle"
      ? timer.focusMinutes * 60_000
      : timer.pausedRemainingMs != null
        ? timer.pausedRemainingMs
        : timer.endsAt
          ? Math.max(0, new Date(timer.endsAt).getTime() - now)
          : 0;
  const secs = Math.ceil(remaining / 1000);
  const digits = `${pad(Math.floor(secs / 60))}:${pad(secs % 60)}`;
  const colors = AURORAS[resolveAurora(mood, scene)];

  return (
    <div
      aria-label={`Aura timer ${digits}`}
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--paper)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        overflow: "hidden",
      }}
    >
      <style>{`@keyframes auraBreathe{0%,100%{transform:scale(1)}50%{transform:scale(1.09)}}`}</style>
      {/* bloom */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "-20%",
          background: `radial-gradient(circle at 50% 46%, ${colors[0]} 0%, ${colors[1]} 26%, ${colors[2]} 46%, transparent 70%)`,
          filter: "blur(34px) saturate(1.2)",
          opacity: "var(--aura-opacity)",
          animation: mood === "focus" ? "auraBreathe 4.4s ease-in-out infinite" : undefined,
        }}
      />
      {/* digits */}
      <div
        className="font-display text-outline"
        style={{
          position: "relative",
          fontSize: "3.7rem",
          lineHeight: 1,
          fontVariationSettings: "'opsz' 144, 'SOFT' 40",
        }}
      >
        {digits}
      </div>
    </div>
  );
}
