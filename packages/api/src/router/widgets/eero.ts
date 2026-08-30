import type { EeroNetworkSummary } from "@homarr/integrations/types";
import { eeroRequestHandler } from "@homarr/request-handler/eero";

import { createManyIntegrationMiddleware } from "../../middlewares/integration";
import { PUBLIC_INTEGRATION_ERROR, settleIntegrationQueries } from "../../settle-integrations";
import { createTRPCRouter, publicProcedure } from "../../trpc";

interface EeroQueryResult {
  integrationId: string;
  integrationName: string;
  integration: { id: string; name: string; kind: "eero" | "mock" };
  summary: EeroNetworkSummary | null;
  updatedAt?: Date;
  error?: string;
}

export const eeroRouter = createTRPCRouter({
  summary: publicProcedure.concat(createManyIntegrationMiddleware("query", "eero", "mock")).query(async ({ ctx }) => {
    return await settleIntegrationQueries<(typeof ctx.integrations)[number], EeroQueryResult>(
      ctx.integrations,
      async (integration) => {
        const innerHandler = eeroRequestHandler.handler(integration, {});
        const { data, timestamp } = await innerHandler.getDataAsync();

        return {
          integrationId: integration.id,
          integrationName: integration.name,
          integration: { id: integration.id, name: integration.name, kind: integration.kind },
          summary: data,
          updatedAt: timestamp,
        };
      },
      {
        fallback: (integration) => ({
          integrationId: integration.id,
          integrationName: integration.name,
          integration: { id: integration.id, name: integration.name, kind: integration.kind },
          summary: null,
          error: PUBLIC_INTEGRATION_ERROR,
        }),
        throwOnAllFailures: true,
      },
    );
  }),
});
