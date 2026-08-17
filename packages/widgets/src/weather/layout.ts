export const getWeatherHeroIconSize = (width: number, height: number): number => {
  const minimumAxis = Math.min(width, height);
  if (minimumAxis < 150) return 20;
  if (minimumAxis < 250) return 30;
  if (minimumAxis < 400) return 42;
  if (minimumAxis < 600) return 56;
  return 72;
};
