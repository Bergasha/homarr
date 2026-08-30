import type { EeroDevice, EeroNetworkSummary, EeroNode, EeroSpeedtestResult } from "@homarr/integrations/types";

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

export const sortEeroDevices = (devices: EeroDevice[], showOffline: boolean, limit: number): EeroDevice[] =>
  devices
    .filter((device) => showOffline || device.connected)
    .toSorted((a, b) => Number(b.connected) - Number(a.connected))
    .slice(0, limit);

export const sortEeroNodes = (nodes: EeroNode[]): EeroNode[] =>
  nodes.toSorted((a, b) => Number(b.isGateway) - Number(a.isGateway));

export const formatEeroSpeedValue = (mbps: number | null): string => (mbps === null ? "—" : `${Math.round(mbps)} Mbps`);

export const formatEeroPing = (ms: number | null): string => (ms === null ? "—" : `${Math.round(ms)} ms`);

export const hasEeroSpeedtestResult = (result: EeroSpeedtestResult | null): result is EeroSpeedtestResult =>
  result !== null && (result.downloadMbps !== null || result.uploadMbps !== null || result.pingMs !== null);
