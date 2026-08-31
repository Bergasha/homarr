import type { EeroDevice, EeroNetworkSummary, EeroNode } from "@homarr/integrations/types";

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

export const getDevicesForNode = (devices: EeroDevice[], nodeId: string): EeroDevice[] =>
  devices.filter((device) => device.nodeId === nodeId);
