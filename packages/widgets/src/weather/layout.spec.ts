import { describe, expect, it } from "vitest";

import { getWeatherHeroIconSize } from "./layout";

describe("getWeatherHeroIconSize", () => {
  it("shrinks the hero icon on a small compact widget", () => {
    expect(getWeatherHeroIconSize(120, 120)).toBe(20);
  });

  it("grows the hero icon as the widget has more room", () => {
    expect(getWeatherHeroIconSize(220, 220)).toBe(30);
    expect(getWeatherHeroIconSize(350, 350)).toBe(42);
    expect(getWeatherHeroIconSize(500, 500)).toBe(56);
    expect(getWeatherHeroIconSize(800, 800)).toBe(72);
  });

  it("sizes the hero icon off the smaller of the two axes", () => {
    expect(getWeatherHeroIconSize(1000, 120)).toBe(20);
  });
});
