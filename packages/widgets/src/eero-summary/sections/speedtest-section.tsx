"use client";

import { SimpleGrid, Stack, Text } from "@mantine/core";
import { IconArrowDown, IconArrowUp, IconWaveSine } from "@tabler/icons-react";

import type { EeroSpeedtestResult } from "@homarr/integrations/types";
import { useCurrentIntlLocale, useI18n } from "@homarr/translation/client";

import { formatEeroPing, formatEeroSpeedValue, hasEeroSpeedtestResult } from "../display";
import { SectionLabel } from "../section-label";
import { EeroSpeedStatCard } from "./eero-speed-stat-card";

export function SpeedtestSection({ result }: { result: EeroSpeedtestResult | null }) {
  const t = useI18n("widget.eeroSummary");
  const locale = useCurrentIntlLocale();

  if (!hasEeroSpeedtestResult(result)) {
    return (
      <Stack gap={4}>
        <SectionLabel>{t("section.speedtest")}</SectionLabel>
        <Text size="xs" c="dimmed">
          {t("speedtest.never")}
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap={4}>
      <SectionLabel>{t("section.speedtest")}</SectionLabel>
      <SimpleGrid cols={3} spacing="xs">
        <EeroSpeedStatCard
          icon={IconArrowDown}
          color="blue"
          value={formatEeroSpeedValue(result.downloadMbps)}
          label={t("speedtest.download")}
        />
        <EeroSpeedStatCard
          icon={IconArrowUp}
          color="teal"
          value={formatEeroSpeedValue(result.uploadMbps)}
          label={t("speedtest.upload")}
        />
        <EeroSpeedStatCard
          icon={IconWaveSine}
          color="orange"
          value={formatEeroPing(result.pingMs)}
          label={t("speedtest.ping")}
        />
      </SimpleGrid>
      {result.ranAt && (
        <Text size="xs" c="dimmed">
          {t("speedtest.lastRun", { timestamp: new Date(result.ranAt).toLocaleString(locale) })}
        </Text>
      )}
    </Stack>
  );
}
