import { Text } from "@mantine/core";

import type { EeroNode } from "@homarr/integrations/types";

// A stylized stand-in for a physical eero device (not a reproduction of eero's own product
// photography, which isn't something to embed in open-source code) - a simple rounded shape
// with a status-colored glow beneath it, always rendered light regardless of board theme since
// the real hardware is white.
export function NodeDeviceGlyph({ status }: { status: EeroNode["status"] }) {
  const glowColor = status === "online" ? "green" : status === "offline" ? "red" : "gray";

  return (
    <div style={{ position: "relative", width: 64, height: 48, margin: "4px auto" }}>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "0 6px 4px 6px",
          borderRadius: "16px 16px 8px 8px",
          background: "linear-gradient(180deg, #f8f9fa, #ced4da)",
          border: "1px solid rgba(0, 0, 0, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 10px 12px -6px var(--mantine-color-${glowColor}-6)`,
        }}
      >
        <Text size="9px" fw={600} c="#495057">
          eero
        </Text>
      </div>
    </div>
  );
}
