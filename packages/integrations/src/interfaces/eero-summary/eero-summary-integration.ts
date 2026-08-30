import type { EeroNetworkSummary } from "../../eero/eero-types";

export interface EeroSummaryIntegration {
  getEeroSummaryAsync(): Promise<EeroNetworkSummary>;
}
