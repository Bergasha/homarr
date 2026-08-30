import { ResponseError } from "@homarr/common/server";
import { fetchWithTrustedCertificatesAsync } from "@homarr/core/infrastructure/http";
import { createLogger } from "@homarr/core/infrastructure/logs";

import { toEeroStatus } from "./eero-status";

import {
  eeroDeviceItemSchema,
  eeroDeviceListItemSchema,
  eeroGuestNetworkResponseSchema,
  eeroLoginResponseSchema,
  eeroNetworkListItemSchema,
  eeroNetworkStatusResponseSchema,
  eeroNodeItemSchema,
  eeroSpeedtestResponseSchema,
} from "./eero-types";
import type { EeroDevice, EeroNode, EeroSpeedtestResult } from "./eero-types";

const logger = createLogger({ module: "eeroClient" });

export const EERO_BASE_URL = "https://api-user.e2ro.com/2.2";

const REQUEST_TIMEOUT_MS = 10_000;
const SPEEDTEST_TIMEOUT_MS = 45_000;

export class EeroUnauthorizedError extends Error {
  constructor() {
    super("eero session is no longer valid");
    this.name = EeroUnauthorizedError.name;
  }
}

export class EeroClient {
  constructor(private readonly baseUrl: string) {}

  public async requestLoginCodeAsync(login: string): Promise<{ userToken: string }> {
    const response = await this.requestAsync("/login", { method: "POST", body: { login } });
    const payload = eeroLoginResponseSchema.parse(await response.json());
    const userToken = payload.data?.user_token;
    if (!userToken) {
      throw new ResponseError({ status: 502, url: `${this.baseUrl}/login` });
    }
    return { userToken };
  }

  public async verifyLoginCodeAsync(userToken: string, code: string): Promise<void> {
    await this.requestAsync("/login/verify", { method: "POST", body: { code }, userToken });
  }

  public async getFirstNetworkIdAsync(userToken: string): Promise<string | null> {
    const response = await this.requestAsync("/account", { userToken });
    const body: unknown = await response.json();
    const networkUrl = extractFirstNetworkUrl(body);
    if (!networkUrl) {
      logger.warn("Could not find a network url in eero's /account response", { body });
      return null;
    }
    return networkUrl.split("/").filter(Boolean).pop() ?? null;
  }

  public async getNetworkStatusAsync(userToken: string, networkId: string) {
    const response = await this.requestAsync(`/networks/${networkId}`, { userToken });
    const payload = eeroNetworkStatusResponseSchema.parse(await response.json());
    return payload.data;
  }

  public async getGuestNetworkEnabledAsync(userToken: string, networkId: string): Promise<boolean | undefined> {
    try {
      const response = await this.requestAsync(`/networks/${networkId}/guestnetwork`, { userToken });
      const payload = eeroGuestNetworkResponseSchema.parse(await response.json());
      return payload.data?.enabled;
    } catch (error) {
      logger.debug("Guest network status unavailable", { error });
      return undefined;
    }
  }

  public async getConnectedDeviceCountAsync(userToken: string, networkId: string): Promise<number | undefined> {
    try {
      const response = await this.requestAsync(`/networks/${networkId}/devices`, { userToken });
      const body: unknown = await response.json();
      const rawDevices = extractFirstArray(body);
      if (!rawDevices) {
        logger.warn("Could not find a devices array in eero's devices response", { body });
        return undefined;
      }
      const devices = rawDevices.map((device) => eeroDeviceItemSchema.parse(device));
      return devices.filter((device) => device.connected !== false).length;
    } catch (error) {
      logger.debug("Connected devices unavailable", { error });
      return undefined;
    }
  }

  public async getDevicesAsync(userToken: string, networkId: string): Promise<EeroDevice[]> {
    try {
      const response = await this.requestAsync(`/networks/${networkId}/devices`, { userToken });
      const body: unknown = await response.json();
      const rawDevices = extractFirstArray(body);
      if (!rawDevices) {
        logger.warn("Could not find a devices array in eero's devices response", { body });
        return [];
      }
      return rawDevices.map((device) => {
        const parsed = eeroDeviceListItemSchema.parse(device);
        return {
          id: parsed.mac ?? parsed.hostname ?? parsed.nickname ?? crypto.randomUUID(),
          name: parsed.nickname ?? parsed.hostname ?? parsed.mac ?? "Unknown device",
          ip: parsed.ip ?? null,
          connectionType: toConnectionType(parsed.connection_type),
          connected: parsed.connected ?? false,
          nodeId: extractNodeId(parsed.source),
          manufacturer: parsed.manufacturer ?? null,
          lastActiveAt: parsed.last_active ?? null,
        };
      });
    } catch (error) {
      logger.debug("Devices list unavailable", { error });
      return [];
    }
  }

  public async getNodesAsync(userToken: string, networkId: string): Promise<EeroNode[]> {
    try {
      const response = await this.requestAsync(`/networks/${networkId}/eeros`, { userToken });
      const body: unknown = await response.json();
      const rawNodes = extractFirstArray(body);
      if (!rawNodes) {
        logger.warn("Could not find a nodes array in eero's eeros response", { body });
        return [];
      }
      return rawNodes.map((node) => {
        const parsed = eeroNodeItemSchema.parse(node);
        return {
          id: parsed.serial_number ?? parsed.url ?? parsed.nickname ?? crypto.randomUUID(),
          name: parsed.nickname ?? parsed.location ?? "Unknown node",
          status: toEeroStatus(parsed.status),
          isGateway: parsed.is_gateway ?? false,
          connectedClientCount: parsed.connected_clients_count ?? null,
          model: parsed.model_number ?? null,
          backhaulType: toBackhaulType(parsed.wired, parsed.backhaul?.type),
        };
      });
    } catch (error) {
      logger.debug("Nodes list unavailable", { error });
      return [];
    }
  }

  public async runSpeedtestAsync(userToken: string, networkId: string): Promise<EeroSpeedtestResult | null> {
    try {
      const response = await this.requestAsync(`/networks/${networkId}/speedtest`, {
        method: "POST",
        body: {},
        userToken,
        timeoutMs: SPEEDTEST_TIMEOUT_MS,
      });
      const payload = eeroSpeedtestResponseSchema.parse(await response.json());
      const data = payload.data;
      if (!data) return null;
      return {
        downloadMbps: data.down?.value ?? null,
        uploadMbps: data.up?.value ?? null,
        pingMs: typeof data.ping === "number" ? data.ping : (data.ping?.value ?? null),
        ranAt: data.date ?? new Date().toISOString(),
      };
    } catch (error) {
      logger.debug("Speedtest result unavailable", { error });
      return null;
    }
  }

  private async requestAsync(
    path: string,
    options: { method?: "GET" | "POST"; body?: Record<string, unknown>; userToken?: string; timeoutMs?: number },
  ) {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "eero-ios/3.47.0",
    };
    if (options.userToken) {
      headers.Cookie = `s=${options.userToken}`;
    }

    const response = await fetchWithTrustedCertificatesAsync(url, {
      method: options.method ?? "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      timeout: options.timeoutMs ?? REQUEST_TIMEOUT_MS,
    });

    if (response.status === 401 || response.status === 403) {
      throw new EeroUnauthorizedError();
    }
    if (!response.ok) {
      throw new ResponseError({ status: response.status, url });
    }

    return response;
  }
}

const getProperty = (value: unknown, key: string): unknown =>
  value !== null && typeof value === "object" && key in value ? (value as Record<string, unknown>)[key] : undefined;

const extractFirstArray = (body: unknown): unknown[] | null => {
  const candidates = [getProperty(getProperty(body, "data"), "data"), getProperty(body, "data"), body];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  return null;
};

const toConnectionType = (connectionType: string | undefined): "wired" | "wireless" | "unknown" => {
  if (connectionType === undefined) return "unknown";
  return connectionType.toLowerCase() === "wired" ? "wired" : "wireless";
};

const toBackhaulType = (
  wired: boolean | undefined,
  backhaulType: string | undefined,
): "wired" | "wireless" | "unknown" => {
  if (typeof wired === "boolean") return wired ? "wired" : "wireless";
  if (backhaulType === undefined) return "unknown";
  return backhaulType.toLowerCase() === "wired" ? "wired" : "wireless";
};

const extractNodeId = (source: { url?: string; location?: string } | undefined): string | null => {
  if (!source) return null;
  const url = source.url;
  if (url) return url.split("/").filter(Boolean).pop() ?? null;
  return source.location ?? null;
};

const extractFirstNetworkUrl = (body: unknown): string | null => {
  const singleNetworkUrl = getProperty(getProperty(body, "data"), "url");
  if (typeof singleNetworkUrl === "string") return singleNetworkUrl;

  const arrayCandidates = [
    getProperty(getProperty(getProperty(body, "data"), "networks"), "data"),
    getProperty(getProperty(body, "data"), "networks"),
    getProperty(getProperty(body, "networks"), "data"),
    getProperty(body, "data"),
  ];
  for (const candidate of arrayCandidates) {
    if (!Array.isArray(candidate)) continue;
    const parsed = eeroNetworkListItemSchema.safeParse(candidate[0]);
    if (parsed.success) return parsed.data.url;
  }
  return null;
};
