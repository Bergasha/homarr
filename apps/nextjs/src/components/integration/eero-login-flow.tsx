"use client";

import { useState } from "react";
import { Alert, Button, Group, PinInput, Stack, Text, TextInput } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { getIntegrationDefaultUrl } from "@homarr/definitions";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { useI18n } from "@homarr/translation/client";

export type CreatedEeroIntegrationResult = Extract<RouterOutputs["integration"]["create"], { integration: unknown }>;

interface EeroLoginFlowProps {
  onSuccess: (result?: CreatedEeroIntegrationResult) => void;
  onCancel?: () => void;
}

type Step = { name: "identifier" } | { name: "code"; pendingUserToken: string };

export const EeroLoginFlow = ({ onSuccess, onCancel }: EeroLoginFlowProps) => {
  const tCommon = useI18n("common");
  const tIntegration = useI18n("integration");
  const tEero = useI18n("integration.eero");
  const [step, setStep] = useState<Step>({ name: "identifier" });
  const [login, setLogin] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const utils = clientApi.useUtils();
  const { mutateAsync: requestCodeAsync, isPending: isRequestingCode } =
    clientApi.integration.eero.requestCode.useMutation();
  const { mutateAsync: verifyCodeAsync, isPending: isVerifying } = clientApi.integration.eero.verifyCode.useMutation();
  const { mutateAsync: createIntegrationAsync, isPending: isCreating } = clientApi.integration.create.useMutation({
    async onSuccess() {
      await revalidatePathActionAsync("/manage/integrations");
      await utils.integration.invalidate();
    },
  });

  const handleRequestCodeAsync = async () => {
    setError(null);
    try {
      const result = await requestCodeAsync({ login });
      setStep({ name: "code", pendingUserToken: result.pendingUserToken });
    } catch {
      setError(tEero("error.requestCode"));
    }
  };

  const handleVerifyAsync = async () => {
    if (step.name !== "code") return;
    setError(null);
    try {
      await verifyCodeAsync({ pendingUserToken: step.pendingUserToken, code });
    } catch {
      setError(tEero("error.verifyCode"));
      return;
    }

    const data = await createIntegrationAsync({
      kind: "eero",
      name: "eero",
      url: getIntegrationDefaultUrl("eero") ?? "https://api-user.e2ro.com/2.2",
      secrets: [{ kind: "eeroSessionToken", value: step.pendingUserToken }],
      attemptSearchEngineCreation: false,
      app: undefined,
    });

    if ("error" in data && data.error) {
      showErrorNotification({
        title: tCommon("notification.create.error"),
        message: tIntegration("page.create.notification.error.message"),
      });
      return;
    }

    showSuccessNotification({
      title: tCommon("notification.create.success"),
      message: tIntegration("page.create.notification.success.message"),
    });
    onSuccess("integration" in data ? data : undefined);
  };

  if (step.name === "identifier") {
    return (
      <Stack>
        <Text size="sm" c="dimmed">
          {tEero("login.description")}
        </Text>
        <TextInput
          withAsterisk
          autoFocus
          label={tEero("login.field.login.label")}
          placeholder={tEero("login.field.login.placeholder")}
          value={login}
          onChange={(event) => setLogin(event.currentTarget.value)}
        />
        {error && (
          <Alert icon={<IconAlertCircle size="1rem" />} color="red">
            {error}
          </Alert>
        )}
        <Group justify="end">
          {onCancel && (
            <Button variant="default" onClick={onCancel}>
              {tCommon("action.backToOverview")}
            </Button>
          )}
          <Button
            onClick={() => void handleRequestCodeAsync()}
            loading={isRequestingCode}
            disabled={login.trim().length === 0}
          >
            {tEero("login.action.sendCode")}
          </Button>
        </Group>
      </Stack>
    );
  }

  return (
    <Stack>
      <Text size="sm" c="dimmed">
        {tEero("verify.description")}
      </Text>
      <PinInput length={6} value={code} onChange={setCode} aria-label={tEero("verify.field.code.label")} />
      {error && (
        <Alert icon={<IconAlertCircle size="1rem" />} color="red">
          {error}
        </Alert>
      )}
      <Group justify="end">
        <Button variant="default" onClick={() => setStep({ name: "identifier" })}>
          {tEero("verify.action.resendCode")}
        </Button>
        <Button onClick={() => void handleVerifyAsync()} loading={isVerifying || isCreating} disabled={code.length < 6}>
          {tEero("verify.action.verify")}
        </Button>
      </Group>
    </Stack>
  );
};
