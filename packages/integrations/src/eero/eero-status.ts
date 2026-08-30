export const toEeroStatus = (status: string | undefined): "online" | "offline" | "unknown" => {
  if (status === undefined) return "unknown";
  return status.toLowerCase() === "connected" || status.toLowerCase() === "online" ? "online" : "offline";
};
