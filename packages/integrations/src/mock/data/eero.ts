import type { EeroSummaryIntegration } from "../../interfaces/eero-summary/eero-summary-integration";
import type { EeroNetworkSummary } from "../../types";

export class EeroMockService implements EeroSummaryIntegration {
  public async getEeroSummaryAsync(): Promise<EeroNetworkSummary> {
    return await Promise.resolve({
      meshStatus: "online",
      wanStatus: "online",
      guestNetworkEnabled: true,
      connectedDeviceCount: 24,
    });
  }
}
