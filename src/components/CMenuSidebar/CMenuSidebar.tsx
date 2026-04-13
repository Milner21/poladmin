import type { MenuItem } from "@dto/layout.types";
import { type FC } from "react";
import CMenu from "./CMenu";
import type { CMenuItem } from "./CMenu.types";

type CMenuSidebarProps = {
  selectedKey: string;
  menuItems: MenuItem[];
  onMenuClick: (item: MenuItem) => void;
};

const CMenuSidebar: FC<CMenuSidebarProps> = ({
  selectedKey,
  menuItems,
  onMenuClick,
}) => {
  const menuItemsFormatted: CMenuItem[] = menuItems.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
    onClick: () => onMenuClick(item),
  }));

  return (
    <CMenu
      mode="inline"
      selectedKeys={[selectedKey]}
      items={menuItemsFormatted}
      style={{
        background: "transparent",
        border: "none",
      }}
    />
  );
};

export default CMenuSidebar;
