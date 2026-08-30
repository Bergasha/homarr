import type { EeroNetworkDetails, EeroNetworkSummary } from "../../eero/eero-types";

export interface EeroSummaryIntegration {
  getEeroSummaryAsync(): Promise<EeroNetworkSummary>;
  getEeroDetailsAsync(): Promise<EeroNetworkDetails>;
}
