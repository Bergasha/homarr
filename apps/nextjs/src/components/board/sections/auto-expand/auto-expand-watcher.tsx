"use client";

import { useEffect } from "react";

import type { WidgetKind } from "@homarr/definitions";

import { useWidgetActivitySignal } from "./use-widget-activity-signal";

interface Props {
  boardId: string | undefined;
  itemId: string;
  kind: WidgetKind;
  options: Record<string, unknown>;
  integrationIds: string[];
  onActiveChange: (active: boolean) => void;
}

/**
 * Headless: mounted once per container with auto-expand enabled, watches the configured target
 * widget's activity signal, and reports changes up so the collapse provider can react. Renders
 * nothing itself.
 */
export const AutoExpandWatcher = ({ boardId, itemId, kind, options, integrationIds, onActiveChange }: Props) => {
  const isActive = useWidgetActivitySignal({ boardId, itemId, kind, options, integrationIds });

  useEffect(() => {
    onActiveChange(isActive === true);
  }, [isActive, onActiveChange]);

  return null;
};
