import { createIntegrationAsync } from "@homarr/integrations";
import type { EeroNetworkDetails, EeroNetworkSummary } from "@homarr/integrations/types";

import { createIntegrationRequestHandler } from "./lib/integration-request-handler";

export const eeroRequestHandler = createIntegrationRequestHandler<
  EeroNetworkSummary,
  "eero" | "mock",
  Record<string, never>
>({
  async requestAsync(integration) {
    const integrationInstance = await createIntegrationAsync(integration);
    return await integrationInstance.getEeroSummaryAsync();
  },
  cacheTtlMs: 30_000,
  fallbackToStaleOnError: true,
});

export const eeroDetailsRequestHandler = createIntegrationRequestHandler<
  EeroNetworkDetails,
  "eero" | "mock",
  Record<string, never>
>({
  async requestAsync(integration) {
    const integrationInstance = await createIntegrationAsync(integration);
    return await integrationInstance.getEeroDetailsAsync();
  },
  cacheTtlMs: 30_000,
  fallbackToStaleOnError: true,
});
