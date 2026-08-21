import { describe, expect, test } from "vitest";

import { getDockerColumnVisibility, getDockerFooterVisibility } from "./layout";

const columns = ["name", "state", "host", "cpuUsage", "memoryUsage", "actions"] as const;

describe("getDockerColumnVisibility", () => {
  test("shows exactly the configured columns, regardless of widget width", () => {
    // Column visibility used to also depend on the widget's width, which meant columns could
    // appear/disappear mid-drag while resizing the widget - fighting with the column-width
    // persistence and glitching the layout. It's purely the user's configured selection now.
    expect(getDockerColumnVisibility(columns, false)).toEqual({
      name: true,
      state: true,
      host: true,
      cpuUsage: true,
      memoryUsage: true,
      actions: true,
    });
    expect(getDockerColumnVisibility(["state"], false)).toEqual({
      name: false,
      state: true,
      host: false,
      cpuUsage: false,
      memoryUsage: false,
      actions: false,
    });
  });

  test("uses every expert column in advanced mode", () => {
    expect(getDockerColumnVisibility([], true)).toEqual({
      name: true,
      state: true,
      host: true,
      cpuUsage: true,
      memoryUsage: true,
      actions: true,
    });
  });
});

describe("getDockerFooterVisibility", () => {
  test("reveals totals only when they fit", () => {
    expect(getDockerFooterVisibility(300, false)).toEqual({ footer: true, cpu: false, memory: false });
    expect(getDockerFooterVisibility(400, false)).toEqual({ footer: true, cpu: true, memory: false });
  });

  test("keeps every total in advanced mode", () => {
    expect(getDockerFooterVisibility(240, true)).toEqual({ footer: true, cpu: true, memory: true });
  });
});
