import type { EeroNetworkSummary } from "@homarr/integrations/types";

export type EeroStatKey = "mesh" | "wan" | "guestNetwork" | "devices";

export interface EeroStat {
  key: EeroStatKey;
  status: "online" | "offline" | "unknown";
}

export const getEeroStats = (summary: EeroNetworkSummary): EeroStat[] => [
  { key: "mesh", status: summary.meshStatus },
  { key: "wan", status: summary.wanStatus },
  {
    key: "guestNetwork",
    status: summary.guestNetworkEnabled === null ? "unknown" : summary.guestNetworkEnabled ? "online" : "offline",
  },
];

export const formatEeroDeviceCount = (count: number | null) => (count === null ? "—" : count.toString());
