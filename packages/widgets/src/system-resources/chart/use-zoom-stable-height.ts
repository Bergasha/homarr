import type { CSSProperties } from "react";
import { useLayoutEffect, useRef, useState } from "react";

/**
 * Recharts' ResponsiveContainer measures its container with a mix of getBoundingClientRect()
 * on mount (correctly reports the zoomed/visual size) and ResizeObserver's contentRect on every
 * update after that (per the CSS Working Group's resolution, this deliberately reports the
 * UNZOOMED "page-global" size, not the visual one - see
 * https://lists.w3.org/Archives/Public/public-css-archive/2023Nov/0860.html and
 * https://bugzilla.mozilla.org/show_bug.cgi?id=1967762). Under this board's CSS `zoom` canvas
 * scaling, that mismatch makes a chart balloon to roughly 1/zoomFactor times its intended size
 * shortly after mounting. This is intentional platform behavior, not a bug that will be fixed
 * upstream - any ResizeObserver consumer under CSS zoom has to work around it itself.
 *
 * Fix: render at the caller's intended (pre-zoom, logical) targetHeight with no local zoom
 * override, measure the element's real on-screen size once via getBoundingClientRect() (the
 * same API recharts' own *first* measurement correctly uses). The ratio between that measured
 * size and targetHeight *is* the ambient zoom factor (Z) compounded from every zoomed ancestor.
 *
 * CSS zoom compounds multiplicatively with ancestors, the same as transform: scale() - setting
 * zoom: 1 on this element would do nothing (Z * 1 = Z, the ambient scaling is still fully
 * present). To actually cancel it out, this element's own zoom needs to be 1/Z, so the net
 * effective zoom for it (and everything inside it, including recharts' own measurement chain)
 * becomes Z * (1/Z) = 1 - genuinely zero local scaling left, not just an unset property that's
 * indistinguishable from the default. With CSS height then set to the already-measured pixel
 * value, the on-screen size is unchanged (height * (1/Z) * Z = height), so there's no visible
 * jump - only the local zoom differential recharts was tripping over is gone.
 *
 * Re-measures whenever targetHeight changes, or the window resizes (the board's own canvas zoom
 * recalculates on window resize independent of any single widget's logical height ever
 * changing). Deliberately does NOT use this element's own ResizeObserver-based size as a
 * re-measurement trigger - that value is exactly what's under question here, and reacting to it
 * would create a feedback loop (lock a value -> that DOM change is itself observed -> unlock ->
 * remeasure -> lock -> ...) that never settles.
 */
export const useZoomStableHeight = (targetHeight: number) => {
  const ref = useRef<HTMLDivElement>(null);
  const [locked, setLocked] = useState<{ forTargetHeight: number; pixels: number; inverseZoom: number } | null>(null);

  useLayoutEffect(() => {
    setLocked(null);
    const handleResize = () => setLocked(null);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [targetHeight]);

  useLayoutEffect(() => {
    if (locked !== null) return;
    const element = ref.current;
    if (!element || targetHeight <= 0) return;
    const rect = element.getBoundingClientRect();
    if (rect.height <= 0) return;
    const ambientZoom = rect.height / targetHeight;
    setLocked({ forTargetHeight: targetHeight, pixels: rect.height, inverseZoom: 1 / ambientZoom });
  }, [locked, targetHeight]);

  const isLocked = locked !== null && locked.forTargetHeight === targetHeight;

  return {
    ref,
    height: isLocked ? locked.pixels : targetHeight,
    style: (isLocked ? { zoom: locked.inverseZoom } : undefined) as CSSProperties | undefined,
  } as const;
};
