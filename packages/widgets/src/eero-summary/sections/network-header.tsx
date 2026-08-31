"use client";

import { Badge, Group, Stack, Text } from "@mantine/core";

import type { EeroNode } from "@homarr/integrations/types";
import { useI18n } from "@homarr/translation/client";

import { getOfflineNodeCount } from "../display";

// nodes is empty in compact display mode (details aren't fetched there) - the badge simply
// doesn't render rather than showing a misleading "all online" with no data behind it.
export function NetworkOverviewHeader({ nodes }: { nodes: EeroNode[] }) {
  const t = useI18n("widget.eeroSummary");
  const offlineCount = getOfflineNodeCount(nodes);
  const isOnline = nodes.length > 0 && offlineCount === 0;

  return (
    <Group justify="space-between" align="flex-start" wrap="nowrap" gap="xs">
      <Stack gap={0} miw={0}>
        <Text fw={700} size="xl" truncate>
          {t("title")}
        </Text>
        <Text size="sm" c="dimmed" truncate>
          {t("subtitle")}
        </Text>
      </Stack>
      {nodes.length > 0 && (
        <Badge
          size="lg"
          radius="xl"
          variant="light"
          color={isOnline ? "green" : "red"}
          style={{ flexShrink: 0 }}
          leftSection={
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: `var(--mantine-color-${isOnline ? "green" : "red"}-6)`,
              }}
            />
          }
        >
          {isOnline ? t("status.allOnline") : t("status.nOffline", { count: offlineCount })}
        </Badge>
      )}
    </Group>
  );
}
