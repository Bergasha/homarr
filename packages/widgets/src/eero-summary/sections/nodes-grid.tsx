"use client";

import { Badge, Card, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconRouter } from "@tabler/icons-react";

import type { EeroNode } from "@homarr/integrations/types";
import { useI18n } from "@homarr/translation/client";

import { sortEeroNodes } from "../display";
import { SectionLabel } from "../section-label";

const statusColor: Record<EeroNode["status"], string> = {
  online: "green",
  offline: "red",
  unknown: "gray",
};

export function NodesGridSection({ nodes }: { nodes: EeroNode[] }) {
  const t = useI18n("widget.eeroSummary");

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
          <Card key={node.id} withBorder p="xs" radius="md" bg="transparent">
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
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
