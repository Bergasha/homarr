export const toEeroStatus = (status: string | undefined): "online" | "offline" | "unknown" => {
  if (status === undefined) return "unknown";
  const normalized = status.toLowerCase();
  return normalized === "connected" || normalized === "online" || normalized === "green" ? "online" : "offline";
};

/** Falls back to a plain connected/disconnected boolean when no status string is available at all. */
export const toEeroStatusWithFallback = (
  status: string | undefined,
  connected: boolean | undefined,
): "online" | "offline" | "unknown" => {
  if (status !== undefined) return toEeroStatus(status);
  if (connected !== undefined) return connected ? "online" : "offline";
  return "unknown";
};
