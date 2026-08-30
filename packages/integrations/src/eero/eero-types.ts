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

export interface EeroNetworkSummary {
  meshStatus: "online" | "offline" | "unknown";
  wanStatus: "online" | "offline" | "unknown";
  guestNetworkEnabled: boolean | null;
  connectedDeviceCount: number | null;
}
