import { z } from "zod/v4";

import { EERO_BASE_URL, EeroClient } from "@homarr/integrations";

import { createTRPCRouter, permissionRequiredProcedure } from "../../trpc";

const eeroClient = new EeroClient(EERO_BASE_URL);

export const eeroLoginRouter = createTRPCRouter({
  requestCode: permissionRequiredProcedure
    .requiresPermission("integration-create")
    .input(z.object({ login: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const { userToken } = await eeroClient.requestLoginCodeAsync(input.login);
      return { pendingUserToken: userToken };
    }),
  verifyCode: permissionRequiredProcedure
    .requiresPermission("integration-create")
    .input(z.object({ pendingUserToken: z.string().min(1), code: z.string().min(1) }))
    .mutation(async ({ input }) => {
      await eeroClient.verifyLoginCodeAsync(input.pendingUserToken, input.code);
      return { verified: true };
    }),
});
