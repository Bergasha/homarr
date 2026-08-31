"use client";

import type { ReactNode } from "react";
import { Box, Center, Group, ScrollArea, Stack, Text } from "@mantine/core";

import { clientApi } from "@homarr/api/client";
import { useI18n } from "@homarr/translation/client";

import { IntegrationErrorIndicator } from "../common/integration-error-indicator";
import { getUsableWidgetQueryData } from "../common/query-state";
import type { WidgetComponentProps } from "../definition";
import { getEeroSummaryLayout } from "./layout";
import { NodesGridSection } from "./sections/nodes-grid";
import { SummaryCardSection } from "./sections/summary-card";

export default function EeroSummaryWidget({
  integrationIds,
  displayMode,
  options,
  width,
  height,
}: WidgetComponentProps<"eeroSummary">) {
  const summaryQuery = clientApi.widget.eero.summary.useQuery({ integrationIds });
  const isAdvanced = displayMode === "advanced";
  const summaryResults = isAdvanced ? (getUsableWidgetQueryData(summaryQuery) ?? []) : (summaryQuery.data ?? []);
  const summaries = summaryResults.filter(
    (result): result is typeof result & { summary: NonNullable<typeof result.summary> } => result.summary !== null,
  );

  const layout = getEeroSummaryLayout({ width, height, displayMode, options });
  const needsDetails = layout.visibleSections.some((section) => section === "nodes");
  const detailsQuery = clientApi.widget.eero.details.useQuery({ integrationIds }, { enabled: needsDetails });
  const detailsResults = needsDetails
    ? isAdvanced
      ? (getUsableWidgetQueryData(detailsQuery) ?? [])
      : (detailsQuery.data ?? [])
    : [];
  const details = detailsResults.find((result) => result.details !== null)?.details ?? null;

  const t = useI18n("widget.eeroSummary");
  const tCommon = useI18n("common");
  const tWidgetCommon = useI18n("widget.common");

  const indicatorResults =
    summaryResults.length > 0 || !summaryQuery.error
      ? summaryResults
      : integrationIds.map((integrationId) => ({ integrationId, error: "query" }));
  const queryIndicators = (
    <Group gap={0} justify="flex-end">
      <IntegrationErrorIndicator results={indicatorResults} />
    </Group>
  );
  const firstSummary = summaries[0];

  if (summaryQuery.isPending || !firstSummary) {
    return (
      <Stack h="100%" gap={0}>
        {queryIndicators}
        <Center p="sm" style={{ flex: 1 }}>
          <Text c="dimmed" size="sm" ta="center">
            {summaryQuery.isPending ? tCommon("action.loading") : tWidgetCommon("integrationDisconnected")}
          </Text>
        </Center>
      </Stack>
    );
  }

  const summary = firstSummary.summary;

  if (layout.visibleSections.length === 0) {
    return (
      <Stack h="100%" gap={0}>
        {queryIndicators}
        <Center p="sm" style={{ flex: 1 }}>
          <Text c="dimmed" size="sm" ta="center">
            {t("empty.noSectionsEnabled")}
          </Text>
        </Center>
      </Stack>
    );
  }

  const sectionContent: Record<(typeof layout.visibleSections)[number], ReactNode> = {
    summary: <SummaryCardSection summary={summary} />,
    nodes: (
      <NodesGridSection
        nodes={details?.nodes ?? []}
        devices={details?.devices ?? []}
        showOfflineDevices={options.showOfflineDevices}
        deviceLimit={layout.deviceRowLimit}
      />
    ),
  };

  if (!isAdvanced) {
    return (
      <Box h="100%" p="sm" pos="relative">
        <Box pos="absolute" top={4} right={8} style={{ zIndex: 2 }}>
          {queryIndicators}
        </Box>
        <Center h="100%">
          <Stack gap="sm" w="100%">
            {layout.visibleSections.map((section) => (
              <Box key={section}>{sectionContent[section]}</Box>
            ))}
          </Stack>
        </Center>
      </Box>
    );
  }

  return (
    <ScrollArea h="100%" p="sm">
      {queryIndicators}
      <Stack gap="md">
        {layout.visibleSections.map((section) => (
          <Box key={section}>{sectionContent[section]}</Box>
        ))}
      </Stack>
    </ScrollArea>
  );
}
