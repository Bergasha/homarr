export type DockerColumn = "name" | "state" | "host" | "cpuUsage" | "memoryUsage" | "actions";

export const getDockerColumnVisibility = (
  configuredColumns: readonly DockerColumn[],
  width: number,
  isAdvanced: boolean,
): Record<DockerColumn, boolean> => {
  const configured = new Set(configuredColumns);
  const isVisible = (column: DockerColumn) => isAdvanced || configured.has(column);

  return {
    name: isVisible("name"),
    state: isVisible("state") && (isAdvanced || width >= 340 || !configured.has("name")),
    host: isVisible("host") && (isAdvanced || width >= 640),
    cpuUsage: isVisible("cpuUsage") && (isAdvanced || width >= 420),
    memoryUsage: isVisible("memoryUsage") && (isAdvanced || width >= 520),
    actions: isVisible("actions"),
  };
};

export const getDockerFooterVisibility = (width: number, isAdvanced: boolean) => ({
  footer: isAdvanced || width > 256,
  cpu: isAdvanced || width >= 360,
  memory: isAdvanced || width >= 480,
});

export const getDockerActionIconSize = (width: number): number => {
  // This drives the per-row "..." actions button, so it directly sets a floor on row
  // height (row height = tallest cell). Capped well below the old 40px ceiling - a wide
  // widget shouldn't force every row to grow just because there's horizontal room to spare.
  if (width < 300) return 16;
  if (width < 500) return 18;
  if (width < 800) return 20;
  return 22;
};
