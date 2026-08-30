"use client";

import type { CSSProperties } from "react";
import { Box, Center, Group, List, Stack, Text, useMantineTheme } from "@mantine/core";
import { IconCircleCheckFilled, IconCircleXFilled, IconDeviceMobile } from "@tabler/icons-react";

import { clientApi } from "@homarr/api/client";
import { useI18n } from "@homarr/translation/client";
import { iconSizes } from "@homarr/ui";

import { IntegrationErrorIndicator } from "../common/integration-error-indicator";
import { getUsableWidgetQueryData } from "../common/query-state";
import type { WidgetComponentProps } from "../definition";
import { formatEeroDeviceCount, getEeroStats } from "./display";

export default function EeroSummaryWidget({ integrationIds, displayMode }: WidgetComponentProps<"eeroSummary">) {
  const summaryQuery = clientApi.widget.eero.summary.useQuery({ integrationIds });
  const isAdvanced = displayMode === "advanced";
  const results = isAdvanced ? (getUsableWidgetQueryData(summaryQuery) ?? []) : (summaryQuery.data ?? []);
  const summaries = results.filter(
    (result): result is typeof result & { summary: NonNullable<typeof result.summary> } => result.summary !== null,
  );
  const { isPending } = summaryQuery;

  const t = useI18n("widget.eeroSummary");
  const tCommon = useI18n("common");
  const tWidgetCommon = useI18n("widget.common");

  const indicatorResults =
    results.length > 0 || !summaryQuery.error
      ? results
      : integrationIds.map((integrationId) => ({ integrationId, error: "query" }));
  const queryIndicators = (
    <Group gap={0} justify="flex-end">
      <IntegrationErrorIndicator results={indicatorResults} />
    </Group>
  );
  const firstSummary = summaries[0];

  if (isPending || !firstSummary) {
    return (
      <Stack h="100%" gap={0}>
        {queryIndicators}
        <Center p="sm" style={{ flex: 1 }}>
          <Text c="dimmed" size="sm" ta="center">
            {isPending ? tCommon("action.loading") : tWidgetCommon("integrationDisconnected")}
          </Text>
        </Center>
      </Stack>
    );
  }

  const summary = firstSummary.summary;

  return (
    <Box h="100%" p="sm" pos="relative">
      <Box pos="absolute" top={4} right={8} style={{ zIndex: 2 }}>
        {queryIndicators}
      </Box>
      <Center h="100%">
        <List spacing="xs" center>
          {getEeroStats(summary).map((stat) => (
            <List.Item
              key={stat.key}
              icon={<StatusIcon status={stat.status} label={t(`card.${stat.key}` as never)} style={iconSizes.xl} />}
            >
              {t(`card.${stat.key}` as never)}
            </List.Item>
          ))}
          <List.Item icon={<IconDeviceMobile aria-hidden style={iconSizes.xl} />}>
            <Text>
              {t("card.devices")}
              <Text c="dimmed" size="md" ms="xs" span>
                {formatEeroDeviceCount(summary.connectedDeviceCount)}
              </Text>
            </Text>
          </List.Item>
        </List>
      </Center>
    </Box>
  );
}

const StatusIcon = ({
  status,
  label,
  style,
}: {
  status: "online" | "offline" | "unknown";
  label: string;
  style?: CSSProperties;
}) => {
  const mantineTheme = useMantineTheme();
  if (status === "online") {
    return <IconCircleCheckFilled aria-label={label} style={style} color={mantineTheme.colors.green[6]} />;
  }
  if (status === "offline") {
    return <IconCircleXFilled aria-label={label} style={style} color={mantineTheme.colors.red[6]} />;
  }
  return <IconCircleXFilled aria-label={label} style={style} color={mantineTheme.colors.gray[6]} />;
};
