"use client";

import { useEffect, useRef, useState } from "react";
import { atom, useSetAtom } from "jotai";

const HOVER_ENTER_DELAY_MS = 150;
const HOVER_LEAVE_GRACE_MS = 300;
const HOT_ZONE_HEIGHT = 18;

export const hiddenHeaderRevealedAtom = atom(false);

export const useHiddenHeaderReveal = (enabled: boolean) => {
  const headerRef = useRef<HTMLElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const isHoveringRef = useRef(false);
  const isPinnedRef = useRef(false);
  const enterTimeoutRef = useRef<number | null>(null);
  const leaveTimeoutRef = useRef<number | null>(null);
  const setRevealedAtom = useSetAtom(hiddenHeaderRevealedAtom);

  isHoveringRef.current = isHovering;
  isPinnedRef.current = isPinned;

  const clearEnterTimeout = () => {
    if (enterTimeoutRef.current === null) return;
    window.clearTimeout(enterTimeoutRef.current);
    enterTimeoutRef.current = null;
  };

  const clearLeaveTimeout = () => {
    if (leaveTimeoutRef.current === null) return;
    window.clearTimeout(leaveTimeoutRef.current);
    leaveTimeoutRef.current = null;
  };

  useEffect(() => {
    if (!enabled) {
      clearEnterTimeout();
      clearLeaveTimeout();
      setIsHovering(false);
      setIsPinned(false);
      return;
    }

    // Tracking pointer position against the header's own geometry (rather than relying on
    // pointerenter/pointerleave on the header element) avoids false "leave" events fired when
    // the cursor sits over a portaled Tooltip/Menu that visually overlaps the header but isn't
    // one of its DOM descendants.
    const handlePointerMove = (event: PointerEvent) => {
      if (isPinnedRef.current) return;
      const headerBottom = headerRef.current?.getBoundingClientRect().bottom ?? 0;
      const threshold = Math.max(HOT_ZONE_HEIGHT, headerBottom);
      if (event.clientY <= threshold) {
        clearLeaveTimeout();
        if (!isHoveringRef.current) {
          // Reschedule on every move so the header only reveals once the cursor comes to rest
          // in the zone, not just after it has spent the delay passing through.
          clearEnterTimeout();
          enterTimeoutRef.current = window.setTimeout(() => {
            enterTimeoutRef.current = null;
            setIsHovering(true);
          }, HOVER_ENTER_DELAY_MS);
        }
        return;
      }
      clearEnterTimeout();
      if (isHoveringRef.current && leaveTimeoutRef.current === null) {
        leaveTimeoutRef.current = window.setTimeout(() => setIsHovering(false), HOVER_LEAVE_GRACE_MS);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && headerRef.current?.contains(event.target)) {
        setIsPinned(true);
        return;
      }
      const headerBottom = headerRef.current?.getBoundingClientRect().bottom ?? 0;
      const threshold = Math.max(HOT_ZONE_HEIGHT, headerBottom);
      if (event.clientY <= threshold) {
        clearEnterTimeout();
        clearLeaveTimeout();
        setIsHovering(true);
        return;
      }
      setIsPinned(false);
      clearEnterTimeout();
      clearLeaveTimeout();
      setIsHovering(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerdown", handlePointerDown);
      clearEnterTimeout();
      clearLeaveTimeout();
    };
  }, [enabled]);

  const isRevealed = enabled && (isHovering || isPinned);

  useEffect(() => {
    setRevealedAtom(isRevealed);
  }, [isRevealed, setRevealedAtom]);

  useEffect(() => {
    return () => setRevealedAtom(false);
  }, [setRevealedAtom]);

  return { headerRef, isRevealed };
};
