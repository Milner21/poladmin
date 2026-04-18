import { CThemeButton } from "@components";
import { CDropdown, type DropdownItem } from "@components/ui";
import { useAuth } from "@hooks/useAuth";
import RoutesConfig from "@routes/RoutesConfig";
import { Bell, Lock, LogOut, Menu as MenuIcon, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SelectorCampanaHeader } from "./SelectorCampanaHeader";
import { CambiarPasswordPersonalModal } from "./CambiarPasswordPersonalModal";

interface HeaderProps {
  isMobile: boolean;
  onMenuClick: () => void;
}

export const Header = ({ isMobile, onMenuClick }: HeaderProps) => {
  const { cerrarSesion, usuario } = useAuth();
  const navigate = useNavigate();
  const [modalPasswordVisible, setModalPasswordVisible] = useState(false);

  const handleLogout = () => {
    cerrarSesion();
    navigate(RoutesConfig.login);
  };

  const menuItems: DropdownItem[] = [
    {
      key: "profile",
      icon: <User size={16} />,
      label: "Mi Perfil",
      onClick: () => navigate("/admin/perfil"),
    },
    {
      key: "change-password",
      icon: <Lock size={16} />,
      label: "Cambiar Contraseña",
      onClick: () => setModalPasswordVisible(true),
    },
    {
      key: "divider",
      type: "divider",
      label: "",
    },
    {
      key: "logout",
      icon: <LogOut size={16} />,
      label: "Cerrar Sesión",
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <>
      <header className="h-16 bg-bg-header border-b border-border sticky top-0 z-50 flex items-center justify-between px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {isMobile && (
            <button
              onClick={onMenuClick}
              className="p-1 text-text-primary hover:bg-bg-base rounded-lg transition-colors"
            >
              <MenuIcon size={24} />
            </button>
          )}

          {!isMobile && <SelectorCampanaHeader />}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-5">
          {/* Theme Button */}
          <CThemeButton />

          {/* Notifications Badge */}
          <button className="relative p-2 hover:bg-bg-base rounded-lg transition-colors">
            <Bell size={20} className="text-text-secondary" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-xs font-semibold rounded-full flex items-center justify-center">
              5
            </span>
          </button>

          {/* User Dropdown */}
          <CDropdown
            placement="bottom-right"
            items={menuItems}
            trigger={
              <div className="flex items-center gap-3 cursor-pointer hover:bg-bg-base px-3 py-2 rounded-lg transition-colors">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                  <User size={18} />
                </div>

                {/* User Name */}
                <span className="text-sm font-medium text-text-primary">
                  {usuario?.nombre || "Usuario"} {usuario?.apellido || ""}
                </span>
              </div>
            }
          />
        </div>
      </header>

      {/* Modal Cambiar Contraseña */}
      <CambiarPasswordPersonalModal
        visible={modalPasswordVisible}
        onClose={() => setModalPasswordVisible(false)}
      />
    </>
  );
};