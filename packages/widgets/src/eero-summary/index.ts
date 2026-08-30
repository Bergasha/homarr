import { IconRouter, IconServerOff } from "@tabler/icons-react";
import { z } from "zod";

import { createWidgetDefinition } from "../definition";
import { optionsBuilder } from "../options";

export const { definition, componentLoader } = createWidgetDefinition("eeroSummary", {
  icon: IconRouter,
  supportsAdvancedFocus: true,
  queryKey: [["widget", "eero"]],
  refetchInterval: null,
  createOptions() {
    return optionsBuilder.from(
      (factory) => ({
        showSummaryCard: factory.switch({ defaultValue: true }),
        showDevices: factory.switch({ defaultValue: true }),
        showOfflineDevices: factory.switch({ defaultValue: false }),
        deviceLimit: factory.number({ defaultValue: 8, validate: z.number().int().min(1).max(50) }),
        showNodes: factory.switch({ defaultValue: true }),
        showSpeedtest: factory.switch({ defaultValue: true }),
      }),
      {
        showOfflineDevices: { shouldHide: (options) => !options.showDevices },
        deviceLimit: { shouldHide: (options) => !options.showDevices },
      },
    );
  },
  supportedIntegrations: ["eero"],
  errors: {
    INTERNAL_SERVER_ERROR: { icon: IconServerOff, message: (t) => t("widget.eeroSummary.error.internalServerError") },
  },
}).withDynamicImport(() => import("./component"));
