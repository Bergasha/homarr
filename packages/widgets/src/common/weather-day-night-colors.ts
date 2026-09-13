export const weatherDayNightColorOptions: string[] = [
  "red",
  "pink",
  "grape",
  "violet",
  "indigo",
  "blue",
  "cyan",
  "teal",
  "green",
  "lime",
  "yellow",
  "orange",
  "gray",
];

export const resolveWeatherDayNightColor = (
  enabled: boolean,
  isDay: boolean,
  dayColor: string,
  nightColor: string,
): string | undefined => (enabled ? `var(--mantine-color-${isDay ? dayColor : nightColor}-5)` : undefined);
