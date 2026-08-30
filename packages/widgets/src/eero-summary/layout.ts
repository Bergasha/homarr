import type { WidgetComponentProps } from "../definition";

type EeroSummaryOptions = WidgetComponentProps<"eeroSummary">["options"];
type EeroSummaryDisplayMode = WidgetComponentProps<"eeroSummary">["displayMode"];

interface EeroSummaryLayoutInput {
  width: number;
  height: number;
  displayMode: EeroSummaryDisplayMode;
  options: EeroSummaryOptions;
}

export type EeroSummarySection = "summary" | "speedtest" | "nodes";

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
    ...(options.showSpeedtest ? (["speedtest"] as const) : []),
    ...(options.showNodes ? (["nodes"] as const) : []),
  ];

  const visibleSections = isCompact
    ? wantedSections.filter((section) => section === "summary" || section === "speedtest")
    : wantedSections;

  return {
    isAdvanced,
    isCompact,
    visibleSections,
    deviceRowLimit: isAdvanced ? options.deviceLimit : Math.min(options.deviceLimit, 4),
  };
};
