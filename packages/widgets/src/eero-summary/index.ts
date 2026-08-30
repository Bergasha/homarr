import { IconRouter, IconServerOff } from "@tabler/icons-react";

import { createWidgetDefinition } from "../definition";
import { optionsBuilder } from "../options";

export const { definition, componentLoader } = createWidgetDefinition("eeroSummary", {
  icon: IconRouter,
  supportsAdvancedFocus: true,
  queryKey: [["widget", "eero"]],
  refetchInterval: null,
  createOptions() {
    return optionsBuilder.from(() => ({}));
  },
  supportedIntegrations: ["eero"],
  errors: {
    INTERNAL_SERVER_ERROR: { icon: IconServerOff, message: (t) => t("widget.eeroSummary.error.internalServerError") },
  },
}).withDynamicImport(() => import("./component"));
