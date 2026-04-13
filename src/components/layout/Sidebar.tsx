import logo from "@assets/AppLogo60px.svg";
import CMenuSidebar from "@components/CMenuSidebar";
import { CDrawer } from "@components/ui";
import { useLocation, useNavigate } from "react-router-dom";
import type { MenuItem } from "../../types/layout.types";
import { usePermisos } from "@hooks/usePermisos";
import { menuConfig, type MenuItemConfig } from "../../config/menuConfig";
import { useVersion } from "@hooks/useVersion";

const SIDEBAR_WIDTH = 250;

export const Sidebar = ({
  isMobile,
  mobileOpen,
  onClose,
}: {
  isMobile: boolean;
  mobileOpen: boolean;
  onClose: () => void;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { puedeVer, tienePermiso } = usePermisos();
  const version = useVersion();

  // Filtrar items según permisos
  const menuItems: MenuItem[] = menuConfig.filter((item) => {
    const itemConfig = item as MenuItemConfig;

    // 1. Validar permiso de módulo general
    if (
      itemConfig.modulo &&
      !puedeVer(itemConfig.modulo as Parameters<typeof puedeVer>[0])
    ) {
      return false;
    }

    // 2. Validar permiso específico (si existe)
    if (
      itemConfig.permisoEspecifico &&
      !tienePermiso(itemConfig.permisoEspecifico)
    ) {
      return false;
    }

    return true;
  });

  const handleMenuClick = (item: MenuItem) => {
    if (item.path) {
      navigate(item.path);
      if (isMobile) onClose();
    }
  };

  const selectedKey =
    menuConfig.find((item) => item.path === location.pathname)?.key ||
    "dashboard";

  const menuContent = (
    <div className="flex flex-col h-full">
      {/* Logo Header */}
      <div className="border-b border-border text-center shrink-0 bg-bg-sidebar">
        <div className="pt-4 h-12 flex items-center justify-center gap-2">
          <div
            className="bg-white flex items-center p-1.5"
            style={{ clipPath: "polygon(0 50%, 50% 0, 100% 50%, 50% 100%)" }}
          >
            <img src={logo} alt="Poladmin" width={25} />
          </div>
          <h2 className="text-white text-xl font-semibold m-0">Poladmin</h2>
        </div>
        {version && (
          <span className="text-xs text-text-tertiary pb-2 block">
            v{version}
          </span>
        )}
      </div>

      {/* Menu scrolleable */}
      <div className="flex-1 overflow-y-auto">
        <CMenuSidebar
          selectedKey={selectedKey}
          menuItems={menuItems}
          onMenuClick={handleMenuClick}
        />
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <CDrawer
        open={mobileOpen}
        onClose={onClose}
        width={SIDEBAR_WIDTH}
        placement="left"
      >
        {menuContent}
      </CDrawer>
    );
  }

  return (
    <div className="w-62.5 h-screen bg-bg-sidebar sticky top-0 overflow-auto border-r border-border shrink-0">
      {menuContent}
    </div>
  );
};
