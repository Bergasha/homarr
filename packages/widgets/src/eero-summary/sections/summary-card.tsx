"use client";

import type { CSSProperties } from "react";
import { List, Text, useMantineTheme } from "@mantine/core";
import { IconCircleCheckFilled, IconCircleXFilled, IconDeviceMobile } from "@tabler/icons-react";

import type { EeroNetworkSummary } from "@homarr/integrations/types";
import { useI18n } from "@homarr/translation/client";
import { iconSizes } from "@homarr/ui";

import { formatEeroDeviceCount, getEeroStats } from "../display";

export function SummaryCardSection({ summary }: { summary: EeroNetworkSummary }) {
  const t = useI18n("widget.eeroSummary");

  return (
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
