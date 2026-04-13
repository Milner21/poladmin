import type { FC } from "react";
import type { CMenuItem, CMenuProps } from "./CMenu.types";
import styles from "./CMenuSidebar.module.css";

const CMenu: FC<CMenuProps> = ({
  mode = "inline",
  selectedKeys = [],
  items,
  style,
  className,
  onSelect,
}) => {
  const handleItemClick = (item: CMenuItem) => {
    if (item.disabled) return;

    if (item.onClick) {
      item.onClick();
    }

    if (onSelect) {
      onSelect(item.key);
    }
  };

  const renderMenuItem = (item: CMenuItem) => {
    const isSelected = selectedKeys.includes(item.key);

    const itemClassName = [
      styles.menuItem,
      isSelected && styles.selected,
      item.disabled && styles.disabled,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <li
        key={item.key}
        className={itemClassName}
        onClick={() => handleItemClick(item)}
      >
        {item.icon && (
          <span className={styles.menuItemIcon}>
            {item.icon}
          </span>
        )}
        <span className={styles.menuItemLabel}>
          {item.label}
        </span>
      </li>
    );
  };

  const menuClassName = [
    styles.menu,
    styles[`menu${mode.charAt(0).toUpperCase() + mode.slice(1)}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ul className={menuClassName} style={style}>
      {items.map(renderMenuItem)}
    </ul>
  );
};

export default CMenu;