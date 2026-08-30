import { ResponseError } from "@homarr/common/server";
import { fetchWithTrustedCertificatesAsync } from "@homarr/core/infrastructure/http";
import { createLogger } from "@homarr/core/infrastructure/logs";

import {
  eeroDeviceItemSchema,
  eeroGuestNetworkResponseSchema,
  eeroLoginResponseSchema,
  eeroNetworkListItemSchema,
  eeroNetworkStatusResponseSchema,
} from "./eero-types";

const logger = createLogger({ module: "eeroClient" });

export const EERO_BASE_URL = "https://api-user.e2ro.com/2.2";

const REQUEST_TIMEOUT_MS = 10_000;

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

  private async requestAsync(
    path: string,
    options: { method?: "GET" | "POST"; body?: Record<string, unknown>; userToken?: string },
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
      timeout: REQUEST_TIMEOUT_MS,
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
