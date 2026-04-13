import logo from "@assets/AppLogo60px.svg";
import { CDropdown, type DropdownItem } from "@components/ui";
import useTheme from "@hooks/useTheme";
import { Ellipsis } from "lucide-react";
import type { FC, ReactNode } from "react";

interface Filtro {
  label: string;
  value: string;
  onClick: () => void;
  tooltip: string;
  subtitulo?: string;
}

interface OpcionDropdown {
  key: string;
  label: string;
  onClick: () => void;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  filtroActivo?: string;
  filtros?: Filtro[];
  subtitulo?: string;
  mostrarDropdown?: boolean;
  opcionesDropdown?: OpcionDropdown[];
}

export const StatCard: FC<StatCardProps> = ({
  title,
  value,
  icon,
  filtroActivo,
  filtros = [],
  subtitulo,
  mostrarDropdown = false,
  opcionesDropdown = [],
}) => {
  const { darkMode } = useTheme();

  // Color primario según tema
  const primaryColor = darkMode ? "#24b876" : "#2bd98e";

  // Subtítulo del filtro activo
  const subtituloFiltro = filtros.find(
    (f) => f.value === filtroActivo
  )?.subtitulo;

  const dropdownItems: DropdownItem[] = opcionesDropdown.map((opcion) => ({
    key: opcion.key,
    label: opcion.label,
    onClick: opcion.onClick,
  }));

  return (
    <div
      className="relative min-h-35 rounded-xl shadow-md overflow-hidden text-white"
      style={{
        background: `linear-gradient(135deg, #1e9a63 0%, ${primaryColor} 100%)`,
      }}
    >
      {/* Logo decorativo de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={logo}
          alt="logo"
          className="absolute -top-4 -right-5 w-27.5 h-27.5 opacity-35"
        />
      </div>

      {/* Contenido */}
      <div className="absolute inset-0 p-5 z-10">
        {/* Header */}
        <div className="flex justify-between items-start">
          {/* Icono */}
          <div className="bg-black/40 p-1.5 w-9 h-9 flex items-center justify-center rounded-lg text-white mt-1.5 mb-0.5">
            {icon}
          </div>

          {/* Filtros y Dropdown */}
          <div className="flex items-center gap-1">
            {/* Filtros */}
            {filtros.length > 0 && (
              <div className="flex gap-1">
                {filtros.map((filtro) => {
                  const isActive = filtroActivo === filtro.value;
                  return (
                    <button
                      key={filtro.value}
                      onClick={filtro.onClick}
                      title={filtro.tooltip}
                      className={`
                        w-8 h-8 rounded-lg text-white text-sm
                        border-none transition-colors
                        ${isActive
                          ? "bg-black/40"
                          : "bg-transparent hover:bg-black/60"
                        }
                      `}
                    >
                      {filtro.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Dropdown opciones */}
            {mostrarDropdown && opcionesDropdown.length > 0 && (
              <CDropdown
                placement="bottom-right"
                items={dropdownItems}
                trigger={
                  <button className="
                    w-8 h-8 rounded-lg
                    bg-white/20 hover:bg-white/30
                    text-white border-none
                    flex items-center justify-center
                    transition-colors
                  ">
                    <Ellipsis size={18} />
                  </button>
                }
              />
            )}
          </div>
        </div>

        {/* Data */}
        <div className="mt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{value}</span>
            {(subtitulo || subtituloFiltro) && (
              <span className="text-sm text-white/80">
                {subtituloFiltro || subtitulo}
              </span>
            )}
          </div>
          <span className="text-sm text-white/50 block">{title}</span>
        </div>
      </div>
    </div>
  );
};