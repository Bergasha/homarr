"use client";

import { Card, Flex, Text, Tooltip } from "@mantine/core";

import { useRequiredBoard } from "@homarr/boards/context";
import type { TablerIcon } from "@homarr/ui";
import { zoomCompensatedSize } from "@homarr/ui";

export interface EeroSpeedStatCardProps {
  icon: TablerIcon;
  color: "blue" | "teal" | "orange";
  value: string;
  label: string;
}

export function EeroSpeedStatCard({ icon: Icon, color, value, label }: EeroSpeedStatCardProps) {
  const board = useRequiredBoard();
  const surfaceColor = `var(--mantine-color-${color}-filled)`;
  const accentColor = `var(--mantine-color-${color}-5)`;
  const surfaceBackground = `rgb(from ${surfaceColor} r g b / calc(var(--opacity, 1) * 0.12))`;
  const surfaceBorder = "rgb(from var(--mantine-color-default-border) r g b / calc(var(--opacity, 1) * 0.45))";

  return (
    <Tooltip label={`${label}: ${value}`} withArrow>
      <Card
        p="xs"
        radius={board.itemRadius}
        withBorder
        bg={surfaceBackground}
        h="100%"
        style={{ flex: 1, minWidth: 0, borderColor: surfaceBorder }}
      >
        <Flex h="100%" w="100%" align="center" justify="center" direction="column" gap={4}>
          <Icon color={accentColor} style={zoomCompensatedSize(18)} />
          <Text size="sm" fw={700} ta="center" lh={1.1} truncate w="100%">
            {value}
          </Text>
          <Text size="xs" c="dimmed" ta="center" lh={1.3} truncate w="100%">
            {label}
          </Text>
        </Flex>
      </Card>
    </Tooltip>
  );
}
