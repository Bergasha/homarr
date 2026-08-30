"use client";

import { Badge, Group, ScrollArea, Stack, Text } from "@mantine/core";
import { IconDeviceDesktop, IconWifi } from "@tabler/icons-react";

import type { EeroDevice } from "@homarr/integrations/types";
import { useI18n } from "@homarr/translation/client";

import { sortEeroDevices } from "../display";
import { SectionLabel } from "../section-label";

export function DevicesListSection({
  devices,
  showOffline,
  limit,
}: {
  devices: EeroDevice[];
  showOffline: boolean;
  limit: number;
}) {
  const t = useI18n("widget.eeroSummary");
  const visibleDevices = sortEeroDevices(devices, showOffline, limit);

  if (visibleDevices.length === 0) {
    return (
      <Stack gap={4}>
        <SectionLabel>{t("section.devices")}</SectionLabel>
        <Text size="xs" c="dimmed">
          {t("device.empty")}
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap={4}>
      <SectionLabel>{t("section.devices")}</SectionLabel>
      <ScrollArea.Autosize mah={220}>
        <Stack gap={2}>
          {visibleDevices.map((device) => (
            <Group key={device.id} justify="space-between" wrap="nowrap" gap="xs" p={4}>
              <Group gap={6} wrap="nowrap" miw={0}>
                {device.connectionType === "wired" ? (
                  <IconDeviceDesktop size={14} aria-hidden style={{ flexShrink: 0 }} />
                ) : (
                  <IconWifi size={14} aria-hidden style={{ flexShrink: 0 }} />
                )}
                <Stack gap={0} miw={0}>
                  <Text size="sm" fw={500} truncate>
                    {device.name}
                  </Text>
                  {device.ip && (
                    <Text size="xs" c="dimmed" truncate>
                      {device.ip}
                    </Text>
                  )}
                </Stack>
              </Group>
              <Badge size="xs" variant="light" color={device.connected ? "green" : "gray"}>
                {device.connected ? t(`device.connectionType.${device.connectionType}`) : t("device.offlineLabel")}
              </Badge>
            </Group>
          ))}
        </Stack>
      </ScrollArea.Autosize>
    </Stack>
  );
}
