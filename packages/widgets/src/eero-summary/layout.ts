import type { WidgetComponentProps } from "../definition";

type EeroSummaryOptions = WidgetComponentProps<"eeroSummary">["options"];
type EeroSummaryDisplayMode = WidgetComponentProps<"eeroSummary">["displayMode"];

interface EeroSummaryLayoutInput {
  width: number;
  height: number;
  displayMode: EeroSummaryDisplayMode;
  options: EeroSummaryOptions;
}

export type EeroSummarySection = "summary" | "nodes";

export interface EeroSummaryLayout {
  isAdvanced: boolean;
  isCompact: boolean;
  visibleSections: EeroSummarySection[];
  deviceRowLimit: number;
}

export const getEeroSummaryLayout = ({
  width,
  height,
  displayMode,
  options,
}: EeroSummaryLayoutInput): EeroSummaryLayout => {
  const isAdvanced = displayMode === "advanced";
  const isCompact = !isAdvanced && (width < 260 || height < 220);

  const wantedSections: EeroSummarySection[] = [
    ...(options.showSummaryCard ? (["summary"] as const) : []),
    ...(options.showNodes ? (["nodes"] as const) : []),
  ];

  const visibleSections = isCompact ? wantedSections.filter((section) => section === "summary") : wantedSections;

  return {
    isAdvanced,
    isCompact,
    visibleSections,
    // Only ever consumed by the click-to-open node devices modal, which is a full popup with
    // its own scrollable area regardless of the widget tile's own display mode - so it should
    // always respect the user's configured limit, not the tile's compact/advanced state.
    deviceRowLimit: options.deviceLimit,
  };
};
