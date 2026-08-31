"use client";

import { useState } from "react";
import { Group, Image, Modal, Stack, Text, UnstyledButton } from "@mantine/core";

import type { EeroDevice, EeroNode } from "@homarr/integrations/types";
import { useI18n } from "@homarr/translation/client";

import { getDevicesForNode, sortEeroNodes } from "../display";
import { SectionLabel } from "../section-label";
import { NodeDevicesList } from "./devices-list";

const statusColor: Record<EeroNode["status"], string> = {
  online: "green",
  offline: "red",
  unknown: "gray",
};

// Same icon already used for the eero integration itself (packages/definitions/src/integration.ts)
// - no dedicated eero-brand icon is available on the dashboard-icons CDN, so this generic router
// glyph is the closest "looks like a physical node" option without introducing a new asset source.
const NODE_ICON_URL = "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/router.svg";

export function NodesGridSection({
  nodes,
  devices,
  showOfflineDevices,
  deviceLimit,
}: {
  nodes: EeroNode[];
  devices: EeroDevice[];
  showOfflineDevices: boolean;
  deviceLimit: number;
}) {
  const t = useI18n("widget.eeroSummary");
  const [openNodeId, setOpenNodeId] = useState<string | null>(null);
  const openNode = nodes.find((node) => node.id === openNodeId) ?? null;

  if (nodes.length === 0) {
    return (
      <Stack gap={4}>
        <SectionLabel>{t("section.nodes")}</SectionLabel>
        <Text size="xs" c="dimmed">
          {t("node.empty")}
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap={4}>
      <SectionLabel>{t("section.nodes")}</SectionLabel>
      <Group gap={6}>
        {sortEeroNodes(nodes).map((node) => (
          <UnstyledButton
            key={node.id}
            onClick={() => setOpenNodeId(node.id)}
            title={node.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              maxWidth: "100%",
              padding: "3px 10px 3px 4px",
              borderRadius: 999,
              border: `1px solid var(--mantine-color-${node.isGateway ? "blue-light-color" : "default-border"})`,
              backgroundColor: `var(--mantine-color-${node.isGateway ? "blue-light" : "default"})`,
            }}
          >
            <Image src={NODE_ICON_URL} alt="" w={14} h={14} fit="contain" style={{ flexShrink: 0 }} />
            <Text size="xs" fw={600} truncate w={90}>
              {node.name}
            </Text>
            <span
              aria-hidden
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: `var(--mantine-color-${statusColor[node.status]}-6)`,
                flexShrink: 0,
              }}
            />
          </UnstyledButton>
        ))}
      </Group>
      <Modal opened={openNode !== null} onClose={() => setOpenNodeId(null)} title={openNode?.name} centered>
        {openNode && (
          <NodeDevicesList
            devices={getDevicesForNode(devices, openNode.id)}
            showOffline={showOfflineDevices}
            limit={deviceLimit}
          />
        )}
      </Modal>
    </Stack>
  );
}
