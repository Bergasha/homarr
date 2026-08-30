import type { EeroSummaryIntegration } from "../../interfaces/eero-summary/eero-summary-integration";
import type { EeroNetworkDetails, EeroNetworkSummary } from "../../types";

export class EeroMockService implements EeroSummaryIntegration {
  public async getEeroSummaryAsync(): Promise<EeroNetworkSummary> {
    return await Promise.resolve({
      meshStatus: "online",
      wanStatus: "online",
      guestNetworkEnabled: true,
      connectedDeviceCount: 24,
    });
  }

  public async getEeroDetailsAsync(): Promise<EeroNetworkDetails> {
    return await Promise.resolve({
      devices: [
        {
          id: "mock-device-1",
          name: "Living Room TV",
          ip: "192.168.1.12",
          connectionType: "wireless",
          connected: true,
          nodeId: "mock-node-1",
          manufacturer: "Samsung",
          lastActiveAt: new Date().toISOString(),
        },
        {
          id: "mock-device-2",
          name: "Office Desktop",
          ip: "192.168.1.24",
          connectionType: "wired",
          connected: true,
          nodeId: "mock-node-1",
          manufacturer: "Dell",
          lastActiveAt: new Date().toISOString(),
        },
        {
          id: "mock-device-3",
          name: "Kitchen Speaker",
          ip: "192.168.1.31",
          connectionType: "wireless",
          connected: true,
          nodeId: "mock-node-2",
          manufacturer: "Sonos",
          lastActiveAt: new Date().toISOString(),
        },
        {
          id: "mock-device-4",
          name: "Guest Phone",
          ip: "192.168.1.45",
          connectionType: "wireless",
          connected: false,
          nodeId: "mock-node-2",
          manufacturer: "Apple",
          lastActiveAt: new Date(Date.now() - 86_400_000).toISOString(),
        },
        {
          id: "mock-device-5",
          name: "Garage Camera",
          ip: "192.168.1.52",
          connectionType: "wireless",
          connected: true,
          nodeId: "mock-node-3",
          manufacturer: "Ring",
          lastActiveAt: new Date().toISOString(),
        },
      ],
      nodes: [
        {
          id: "mock-node-1",
          name: "Living Room",
          status: "online",
          isGateway: true,
          connectedClientCount: 8,
          model: "eero Pro 6E",
        },
        {
          id: "mock-node-2",
          name: "Bedroom",
          status: "online",
          isGateway: false,
          connectedClientCount: 6,
          model: "eero 6",
        },
        {
          id: "mock-node-3",
          name: "Garage",
          status: "offline",
          isGateway: false,
          connectedClientCount: 0,
          model: "eero 6",
        },
      ],
      latestSpeedtest: {
        downloadMbps: 480,
        uploadMbps: 45,
        pingMs: 8,
        ranAt: new Date().toISOString(),
      },
    });
  }
}
