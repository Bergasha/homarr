/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CSSProperties, ReactNode } from "react";
import type { AreaChartSeries } from "@mantine/charts";
import { AreaChart, LineChart } from "@mantine/charts";
import { Card, Center, Group, Stack, Text, useComputedColorScheme, useMantineTheme } from "@mantine/core";
import { useElementSize, useHover, useMergedRef } from "@mantine/hooks";
import type { TooltipProps, YAxisProps } from "recharts";

import { useRequiredBoard } from "@homarr/boards/context";
import { zoomCompensatedSize } from "@homarr/ui";
import type { TablerIcon } from "@homarr/ui";

let tooltipPortalRoot: HTMLDivElement | undefined;

// A single, shared position:fixed container to portal chart tooltips into. Portaling
// straight into document.body puts the (always-mounted, just hidden-until-hover) tooltip
// wrapper inside normal document flow, which can inflate the page's scroll height. A
// zero-size fixed container is excluded from document flow entirely, so it can't do that.
function getTooltipPortalRoot(): HTMLDivElement | undefined {
  if (typeof document === "undefined") return undefined;
  if (tooltipPortalRoot?.isConnected) return tooltipPortalRoot;

  // Recharts clamps the tooltip position to stay within its portal container's bounds,
  // so the container needs real viewport dimensions (not 0x0) or the tooltip collapses
  // to the container's origin. position:fixed still keeps it out of document flow, so
  // this can't inflate the page's scroll height the way document.body did.
  const root = document.createElement("div");
  root.style.position = "fixed";
  root.style.top = "0";
  root.style.left = "0";
  root.style.width = "100vw";
  root.style.height = "100vh";
  root.style.overflow = "visible";
  root.style.pointerEvents = "none";
  root.style.zIndex = "9999";
  document.body.appendChild(root);
  tooltipPortalRoot = root;
  return root;
}

import type { LabelDisplayModeOption } from "..";

export const CommonChart = ({
  data,
  dataKey,
  series,
  title,
  icon: Icon,
  labelDisplayMode,
  tooltipProps,
  yAxisProps,
  lastValue,
  chartType = "line",
  advanced = false,
}: {
  data: Record<string, any>[];
  dataKey: string;
  series: AreaChartSeries[];
  title: ReactNode;
  icon: TablerIcon;
  labelDisplayMode: LabelDisplayModeOption;
  tooltipProps?: TooltipProps<number, any>;
  yAxisProps?: Omit<YAxisProps, "ref">;
  lastValue?: string;
  chartType?: "line" | "area";
  advanced?: boolean;
}) => {
  const { ref: elementSizeRef, height } = useElementSize();
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme("light");
  const board = useRequiredBoard();
  const { hovered, ref: hoverRef } = useHover();
  const ref = useMergedRef(elementSizeRef, hoverRef);

  // Cap the compact card's alpha so it stays a translucent overlay instead of a flat
  // opaque box at higher board opacity settings, matching the rest of the board's theme.
  const opacity = Math.min(board.opacity / 100, 0.5);
  let backgroundColor = colorScheme === "dark" ? `rgba(57, 57, 57, ${opacity})` : `rgba(246, 247, 248, ${opacity})`;
  const cardStyle: CSSProperties = { overflow: "hidden" };
  const chartRootStyle: CSSProperties = { padding: 5, borderRadius: theme.radius[board.itemRadius] };
  if (advanced) {
    backgroundColor = "rgb(from var(--mantine-color-primaryColor-filled) r g b / calc(var(--opacity, 1) * 0.12))";
    cardStyle.border =
      "1px solid rgb(from var(--mantine-color-secondaryColor-filled) r g b / calc(var(--opacity, 1) * 0.45))";
    chartRootStyle.backgroundColor = backgroundColor;
  }

  const ChartComponent = chartType === "line" ? LineChart : AreaChart;
  const showIcon = labelDisplayMode === "icon" || labelDisplayMode === "textWithIcon";
  const showText = labelDisplayMode === "text" || labelDisplayMode === "textWithIcon";

  return (
    <Card ref={ref} h={"100%"} pos={"relative"} style={cardStyle} p={0} bg={backgroundColor} radius={board.itemRadius}>
      {data.length > 1 && height > 40 && !hovered && (
        <Group
          pos={"absolute"}
          top={0}
          left={0}
          p={8}
          pt={6}
          gap={5}
          wrap={"nowrap"}
          style={{ zIndex: 2, pointerEvents: "none" }}
          align="center"
        >
          {showIcon && (
            <Icon
              color="var(--mantine-color-dimmed)"
              style={zoomCompensatedSize(height > 100 ? 20 : 14)}
              stroke={1.5}
            />
          )}
          {showText && (
            <Text c={"dimmed"} size={height > 100 ? "md" : "xs"} fw={"bold"}>
              {title}
            </Text>
          )}
          {lastValue && (
            <Text c={"dimmed"} size={height > 100 ? "md" : "xs"} lineClamp={1}>
              {lastValue}
            </Text>
          )}
        </Group>
      )}
      {advanced && data.length > 1 && height > 0 && height <= 40 && lastValue && !hovered && (
        <Center pos="absolute" w="100%" h="100%" style={{ zIndex: 2, pointerEvents: "none" }}>
          <Text size="xs" fw={600}>
            {lastValue}
          </Text>
        </Center>
      )}
      {data.length <= 1 ? (
        <Center pos="absolute" w="100%" h="100%">
          <Stack px={"xs"} align={"center"} gap={4}>
            {showIcon && (
              <Icon
                color="var(--mantine-color-dimmed)"
                style={zoomCompensatedSize(height > 100 ? 20 : 14)}
                stroke={1.5}
              />
            )}
            {showText && (
              <Text c={"dimmed"} size={height > 100 ? "md" : "xs"} fw={"bold"} ta="center">
                {title}
              </Text>
            )}
            {advanced && lastValue && (
              <Text size={height > 100 ? "md" : "xs"} fw={600} ta="center">
                {lastValue}
              </Text>
            )}
          </Stack>
        </Center>
      ) : (
        <ChartComponent
          data={data}
          dataKey={dataKey}
          h={"100%"}
          series={series}
          curveType="monotone"
          tickLine="none"
          gridAxis="none"
          withXAxis={false}
          withYAxis={false}
          withDots={false}
          bg={backgroundColor}
          styles={{ root: chartRootStyle }}
          tooltipAnimationDuration={200}
          tooltipProps={{
            // Render via portal so the tooltip isn't clipped by the card's overflow:hidden
            // (needed to stop the chart line itself bleeding past its rounded corners).
            portal: getTooltipPortalRoot(),
            ...tooltipProps,
          }}
          withTooltip={height >= 64}
          yAxisProps={yAxisProps}
          fillOpacity={chartType === "area" ? 0.3 : undefined}
        />
      )}
    </Card>
  );
};
