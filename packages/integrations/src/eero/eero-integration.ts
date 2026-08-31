import { HandleIntegrationErrors } from "../base/errors/decorator";
import type { IntegrationTestingInput } from "../base/integration";
import { Integration } from "../base/integration";
import { createSessionStore } from "../base/session-store";
import { TestConnectionError } from "../base/test-connection/test-connection-error";
import type { TestingResult } from "../base/test-connection/test-connection-service";
import type { EeroSummaryIntegration } from "../interfaces/eero-summary/eero-summary-integration";
import { EERO_BASE_URL, EeroClient, EeroUnauthorizedError } from "./eero-client";
import { toEeroStatus } from "./eero-status";
import type { EeroNetworkDetails, EeroNetworkSummary, EeroSpeedtestResult } from "./eero-types";

const NETWORK_ID_TTL_SECONDS = 60 * 60;
const SPEEDTEST_CACHE_TTL_SECONDS = 60 * 60 * 6;
const SPEEDTEST_PENDING_TTL_SECONDS = 60;

@HandleIntegrationErrors([])
export class EeroIntegration extends Integration implements EeroSummaryIntegration {
  private readonly client = new EeroClient(EERO_BASE_URL);
  private readonly networkIdStore = createSessionStore<{ networkId: string }>(this.integration);
  private readonly speedtestStore = createSessionStore<EeroSpeedtestResult>({ id: `${this.integration.id}:speedtest` });
  private readonly speedtestPendingStore = createSessionStore<{ startedAt: string }>({
    id: `${this.integration.id}:speedtest-pending`,
  });

  protected async testingAsync(_input: IntegrationTestingInput): Promise<TestingResult> {
    try {
      await this.client.getFirstNetworkIdAsync(this.getSecretValue("eeroSessionToken"));
      return { success: true };
    } catch (error) {
      if (error instanceof EeroUnauthorizedError) {
        return TestConnectionError.UnauthorizedResult(401);
      }
      throw error;
    }
  }

  public async getEeroSummaryAsync(): Promise<EeroNetworkSummary> {
    const userToken = this.getSecretValue("eeroSessionToken");
    const networkId = await this.resolveNetworkIdAsync(userToken);

    if (!networkId) {
      return {
        meshStatus: "unknown",
        wanStatus: "unknown",
        guestNetworkEnabled: null,
        connectedDeviceCount: null,
      };
    }

    const [statusResult, guestNetworkResult, deviceCountResult] = await Promise.allSettled([
      this.client.getNetworkStatusAsync(userToken, networkId),
      this.client.getGuestNetworkEnabledAsync(userToken, networkId),
      this.client.getConnectedDeviceCountAsync(userToken, networkId),
    ]);

    const status = statusResult.status === "fulfilled" ? statusResult.value : undefined;

    return {
      meshStatus: toEeroStatus(status?.status),
      wanStatus: toEeroStatus(status?.wan?.status),
      guestNetworkEnabled: guestNetworkResult.status === "fulfilled" ? (guestNetworkResult.value ?? null) : null,
      connectedDeviceCount: deviceCountResult.status === "fulfilled" ? (deviceCountResult.value ?? null) : null,
    };
  }

  public async getEeroDetailsAsync(): Promise<EeroNetworkDetails> {
    const userToken = this.getSecretValue("eeroSessionToken");
    const networkId = await this.resolveNetworkIdAsync(userToken);

    if (!networkId) {
      return { devices: [], nodes: [], latestSpeedtest: null };
    }

    const [devicesResult, nodesResult, speedtestResult] = await Promise.allSettled([
      this.client.getDevicesAsync(userToken, networkId),
      this.client.getNodesAsync(userToken, networkId),
      this.resolveLatestSpeedtestAsync(userToken, networkId),
    ]);

    return {
      devices: devicesResult.status === "fulfilled" ? devicesResult.value : [],
      nodes: nodesResult.status === "fulfilled" ? nodesResult.value : [],
      latestSpeedtest: speedtestResult.status === "fulfilled" ? speedtestResult.value : null,
    };
  }

  private async resolveNetworkIdAsync(userToken: string): Promise<string | null> {
    const stored = await this.networkIdStore.getAsync();
    if (stored) return stored.networkId;

    const networkId = await this.client.getFirstNetworkIdAsync(userToken);
    if (networkId) {
      await this.networkIdStore.setAsync({ networkId }, { ttlSeconds: NETWORK_ID_TTL_SECONDS });
    }
    return networkId;
  }

  private async resolveLatestSpeedtestAsync(userToken: string, networkId: string): Promise<EeroSpeedtestResult | null> {
    const cached = await this.speedtestStore.getAsync();
    if (cached) return cached;

    const pending = await this.speedtestPendingStore.getAsync();
    if (!pending) {
      await this.speedtestPendingStore.setAsync(
        { startedAt: new Date().toISOString() },
        { ttlSeconds: SPEEDTEST_PENDING_TTL_SECONDS },
      );
      void this.runSpeedtestInBackgroundAsync(userToken, networkId);
    }
    return null;
  }

  private async runSpeedtestInBackgroundAsync(userToken: string, networkId: string): Promise<void> {
    try {
      const result = await this.client.runSpeedtestAsync(userToken, networkId);
      if (result) {
        await this.speedtestStore.setAsync(result, { ttlSeconds: SPEEDTEST_CACHE_TTL_SECONDS });
      }
    } catch {
      /* empty */
    }
  }
}
