import type { EeroDevice, EeroNode } from "@homarr/integrations/types";

export const sortEeroDevices = (devices: EeroDevice[], showOffline: boolean, limit: number): EeroDevice[] =>
  devices
    .filter((device) => showOffline || device.connected)
    .toSorted((a, b) => Number(b.connected) - Number(a.connected))
    .slice(0, limit);

export const sortEeroNodes = (nodes: EeroNode[]): EeroNode[] =>
  nodes.toSorted((a, b) => Number(b.isGateway) - Number(a.isGateway));

export const getDevicesForNode = (devices: EeroDevice[], nodeId: string): EeroDevice[] =>
  devices.filter((device) => device.nodeId === nodeId);

export const getOfflineNodeCount = (nodes: EeroNode[]): number =>
  nodes.filter((node) => node.status !== "online").length;
