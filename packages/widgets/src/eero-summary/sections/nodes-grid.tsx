"use client";

import { useState } from "react";
import { Badge, Card, Group, Modal, SimpleGrid, Stack, Text, UnstyledButton } from "@mantine/core";
import { IconPlugConnected, IconRouter, IconWifi } from "@tabler/icons-react";

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
      <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="xs">
        {sortEeroNodes(nodes).map((node) => (
          <UnstyledButton key={node.id} onClick={() => setOpenNodeId(node.id)}>
            <Card withBorder p="xs" radius="md" bg="transparent">
              <Stack gap={4}>
                <Group gap={4} wrap="nowrap" justify="space-between">
                  <Group gap={4} wrap="nowrap" miw={0}>
                    <IconRouter size={14} aria-hidden />
                    <Text size="sm" fw={600} truncate>
                      {node.name}
                    </Text>
                  </Group>
                  <span
                    aria-hidden
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: `var(--mantine-color-${statusColor[node.status]}-6)`,
                      flexShrink: 0,
                    }}
                  />
                </Group>
                <Group gap={4} wrap="wrap">
                  {node.isGateway && (
                    <Badge size="xs" variant="light">
                      {t("node.gateway")}
                    </Badge>
                  )}
                  {node.connectedClientCount !== null && (
                    <Badge size="xs" variant="outline" color="gray">
                      {t("node.clients", { count: node.connectedClientCount })}
                    </Badge>
                  )}
                </Group>
                {!node.isGateway && node.backhaulType !== "unknown" && (
                  <Group gap={4} wrap="nowrap">
                    {node.backhaulType === "wired" ? (
                      <IconPlugConnected size={12} aria-hidden style={{ flexShrink: 0 }} />
                    ) : (
                      <IconWifi size={12} aria-hidden style={{ flexShrink: 0 }} />
                    )}
                    <Text size="xs" c="dimmed">
                      {t(`node.backhaul.${node.backhaulType}`)}
                    </Text>
                  </Group>
                )}
              </Stack>
            </Card>
          </UnstyledButton>
        ))}
      </SimpleGrid>
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
