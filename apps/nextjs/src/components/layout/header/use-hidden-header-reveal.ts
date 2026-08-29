"use client";

import { useEffect, useRef, useState } from "react";
import { atom, useSetAtom } from "jotai";

const HOVER_LEAVE_GRACE_MS = 150;

export const hiddenHeaderRevealedAtom = atom(false);

export const useHiddenHeaderReveal = (enabled: boolean) => {
  const headerRef = useRef<HTMLElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const leaveTimeoutRef = useRef<number | null>(null);
  const setRevealedAtom = useSetAtom(hiddenHeaderRevealedAtom);

  const clearLeaveTimeout = () => {
    if (leaveTimeoutRef.current === null) return;
    window.clearTimeout(leaveTimeoutRef.current);
    leaveTimeoutRef.current = null;
  };

  useEffect(() => {
    if (!enabled) {
      clearLeaveTimeout();
      setIsHovering(false);
      setIsPinned(false);
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && headerRef.current?.contains(event.target)) {
        setIsPinned(true);
        return;
      }
      setIsPinned(false);
      clearLeaveTimeout();
      setIsHovering(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
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

  return {
    headerRef,
    isRevealed,
    reveal: () => {
      clearLeaveTimeout();
      setIsHovering(true);
    },
    unhover: () => {
      clearLeaveTimeout();
      leaveTimeoutRef.current = window.setTimeout(() => setIsHovering(false), HOVER_LEAVE_GRACE_MS);
    },
  };
};
