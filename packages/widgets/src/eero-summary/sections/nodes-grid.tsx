"use client";

import { useState } from "react";
import { Badge, Group, Modal, SimpleGrid, Stack, Text, UnstyledButton } from "@mantine/core";
import { IconChevronRight, IconDevices2, IconPlugConnected, IconWifi } from "@tabler/icons-react";

import type { EeroDevice, EeroNode } from "@homarr/integrations/types";
import { useI18n } from "@homarr/translation/client";

import { getDevicesForNode, sortEeroNodes } from "../display";
import { NodeDevicesList } from "./devices-list";
import { NodeDeviceGlyph } from "./node-device-glyph";

const statusColor: Record<EeroNode["status"], string> = {
  online: "green",
  offline: "red",
  unknown: "gray",
};

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
  const [showAllDevices, setShowAllDevices] = useState(false);
  const openNode = nodes.find((node) => node.id === openNodeId) ?? null;
  const connectedDeviceCount = devices.filter((device) => device.connected).length;

  if (nodes.length === 0) {
    return (
      <Text size="xs" c="dimmed">
        {t("node.empty")}
      </Text>
    );
  }

  return (
    <Stack gap="sm">
      <SimpleGrid cols={{ base: 2, xs: 3 }} spacing="sm">
        {sortEeroNodes(nodes).map((node) => (
          <UnstyledButton
            key={node.id}
            onClick={() => setOpenNodeId(node.id)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              minWidth: 0,
              padding: "var(--mantine-spacing-sm)",
              borderRadius: "var(--mantine-radius-lg)",
              border: "1px solid var(--mantine-color-default-border)",
              textAlign: "center",
            }}
          >
            <Text fw={700} size="sm" truncate w="100%">
              {node.name}
            </Text>
            <NodeDeviceGlyph status={node.status} />
            <Badge
              size="sm"
              radius="xl"
              variant="light"
              color={statusColor[node.status]}
              leftSection={
                <span
                  aria-hidden
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: `var(--mantine-color-${statusColor[node.status]}-6)`,
                  }}
                />
              }
            >
              {t("node.deviceCount", { count: getDevicesForNode(devices, node.id).length })}
            </Badge>
            {!node.isGateway && node.backhaulType !== "unknown" && (
              <Group gap={4} c="dimmed" wrap="nowrap">
                {node.backhaulType === "wired" ? (
                  <IconPlugConnected size={14} aria-hidden style={{ flexShrink: 0 }} />
                ) : (
                  <IconWifi size={14} aria-hidden style={{ flexShrink: 0 }} />
                )}
                <Text size="xs" c="dimmed" truncate>
                  {t(`node.backhaul.${node.backhaulType}`)}
                </Text>
              </Group>
            )}
          </UnstyledButton>
        ))}
      </SimpleGrid>
      <UnstyledButton
        onClick={() => setShowAllDevices(true)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          paddingTop: "var(--mantine-spacing-xs)",
          borderTop: "1px solid var(--mantine-color-default-border)",
        }}
      >
        <Group gap={8} c="dimmed" wrap="nowrap">
          <IconDevices2 size={16} aria-hidden style={{ flexShrink: 0 }} />
          <Text size="sm">{t("node.devicesConnected", { count: connectedDeviceCount })}</Text>
        </Group>
        <IconChevronRight size={16} aria-hidden style={{ flexShrink: 0 }} />
      </UnstyledButton>
      <Modal opened={openNode !== null} onClose={() => setOpenNodeId(null)} title={openNode?.name} centered>
        {openNode && (
          <NodeDevicesList
            devices={getDevicesForNode(devices, openNode.id)}
            showOffline={showOfflineDevices}
            limit={deviceLimit}
          />
        )}
      </Modal>
      <Modal opened={showAllDevices} onClose={() => setShowAllDevices(false)} title={t("title")} centered>
        {/* deviceLimit is documented/scoped as "per node" - the aggregate view shows everything. */}
        <NodeDevicesList devices={devices} showOffline={showOfflineDevices} limit={devices.length} />
      </Modal>
    </Stack>
  );
}
