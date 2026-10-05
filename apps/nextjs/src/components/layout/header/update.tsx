"use client";

import { Menu, Text } from "@mantine/core";
import { IconBellRinging } from "@tabler/icons-react";

import type { RouterOutputs } from "@homarr/api";
import { useI18n } from "@homarr/translation/client";

interface AvailableUpdatesMenuItemProps {
  availableUpdates: RouterOutputs["updateChecker"]["getAvailableUpdates"] | undefined;
}

export const AvailableUpdatesMenuItem = ({ availableUpdates }: AvailableUpdatesMenuItemProps) => {
  const t = useI18n("common.userAvatar.menu");
  if (availableUpdates === undefined || availableUpdates.length === 0) {
    return null;
  }

  const latestUpdate = availableUpdates.at(0);
  if (!latestUpdate) return null;

  return (
    <>
      <Menu.Item component={"a"} href={latestUpdate.url} target="_blank" leftSection={<IconBellRinging size="1rem" />}>
        <Text fw="bold" size="sm">
          {t("updateAvailable", {
            countUpdates: String(availableUpdates.length),
            tag: latestUpdate.tagName,
          })}
        </Text>
      </Menu.Item>
      <Menu.Divider />
    </>
  );
};
