import { z } from "zod";

export const eeroLoginResponseSchema = z.object({
  data: z
    .object({
      user_token: z.string(),
    })
    .partial()
    .optional(),
});

export const eeroNetworkListItemSchema = z
  .object({
    url: z.string(),
    name: z.string().optional(),
  })
  .partial({ name: true });

export const eeroNetworkStatusResponseSchema = z.object({
  data: z
    .object({
      status: z.string().optional(),
      wan: z
        .object({
          status: z.string().optional(),
        })
        .partial()
        .optional()
        .catch(undefined),
    })
    .partial()
    .optional(),
});

export const eeroGuestNetworkResponseSchema = z.object({
  data: z
    .object({
      enabled: z.boolean().optional(),
    })
    .partial()
    .optional()
    .catch(undefined),
});

export const eeroDeviceItemSchema = z
  .object({
    connected: z.boolean().optional(),
  })
  .partial()
  .catch({});

export const eeroDeviceListItemSchema = z
  .object({
    mac: z.string().optional(),
    nickname: z.string().optional(),
    hostname: z.string().optional(),
    ip: z.string().optional(),
    connection_type: z.string().optional(),
    connected: z.boolean().optional(),
    source: z
      .object({
        url: z.string().optional(),
        location: z.string().optional(),
      })
      .partial()
      .optional()
      .catch(undefined),
    manufacturer: z.string().optional(),
    last_active: z.string().optional(),
  })
  .partial()
  .catch({});

export const eeroNodeItemSchema = z
  .object({
    url: z.string().optional(),
    serial_number: z.string().optional(),
    location: z.string().optional(),
    nickname: z.string().optional(),
    status: z.string().optional(),
    is_gateway: z.boolean().optional(),
    connected_clients_count: z.number().optional(),
    model_number: z.string().optional(),
    wired: z.boolean().optional(),
    backhaul: z
      .object({
        type: z.string().optional(),
      })
      .partial()
      .optional()
      .catch(undefined),
  })
  .partial()
  .catch({});

export const eeroSpeedtestResponseSchema = z
  .object({
    data: z
      .object({
        down: z
          .object({
            value: z.number().optional(),
            units: z.string().optional(),
          })
          .partial()
          .optional()
          .catch(undefined),
        up: z
          .object({
            value: z.number().optional(),
            units: z.string().optional(),
          })
          .partial()
          .optional()
          .catch(undefined),
        ping: z
          .union([z.number(), z.object({ value: z.number().optional() }).partial()])
          .optional()
          .catch(undefined),
        date: z.string().optional(),
      })
      .partial()
      .optional()
      .catch(undefined),
  })
  .catch({ data: undefined });

export interface EeroNetworkSummary {
  meshStatus: "online" | "offline" | "unknown";
  wanStatus: "online" | "offline" | "unknown";
  guestNetworkEnabled: boolean | null;
  connectedDeviceCount: number | null;
}

export interface EeroDevice {
  id: string;
  name: string;
  ip: string | null;
  connectionType: "wired" | "wireless" | "unknown";
  connected: boolean;
  nodeId: string | null;
  manufacturer: string | null;
  lastActiveAt: string | null;
}

export interface EeroNode {
  id: string;
  name: string;
  status: "online" | "offline" | "unknown";
  isGateway: boolean;
  connectedClientCount: number | null;
  model: string | null;
  backhaulType: "wired" | "wireless" | "unknown";
}

export interface EeroSpeedtestResult {
  downloadMbps: number | null;
  uploadMbps: number | null;
  pingMs: number | null;
  ranAt: string | null;
}

export interface EeroNetworkDetails {
  devices: EeroDevice[];
  nodes: EeroNode[];
  latestSpeedtest: EeroSpeedtestResult | null;
}
