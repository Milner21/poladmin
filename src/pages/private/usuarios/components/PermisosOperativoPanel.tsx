import { type FC, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Permiso } from "@dto/permiso.types";

interface PermisosOperativoPanelProps {
  permisosDisponibles: Permiso[];
  permisosSeleccionados: string[];
  onTogglePermiso: (permisoId: string) => void;
}

export const PermisosOperativoPanel: FC<PermisosOperativoPanelProps> = ({
  permisosDisponibles,
  permisosSeleccionados,
  onTogglePermiso,
}) => {
  const permisosPorModulo = permisosDisponibles.reduce<
    Record<string, Permiso[]>
  >((acc, permiso) => {
    if (!acc[permiso.modulo]) acc[permiso.modulo] = [];
    acc[permiso.modulo].push(permiso);
    return acc;
  }, {});

  const modulos = Object.keys(permisosPorModulo);

  const [modulosAbiertos, setModulosAbiertos] = useState<
    Record<string, boolean>
  >(
    modulos.reduce<Record<string, boolean>>((acc, modulo) => {
      acc[modulo] = false;
      return acc;
    }, {}),
  );

  const toggleModulo = (modulo: string) => {
    setModulosAbiertos((prev) => ({ ...prev, [modulo]: !prev[modulo] }));
  };

  const toggleTodosModulo = (items: Permiso[]) => {
    const todosSeleccionados = items.every((p) =>
      permisosSeleccionados.includes(p.id),
    );
    items.forEach((p) => {
      const estaSeleccionado = permisosSeleccionados.includes(p.id);
      if (todosSeleccionados && estaSeleccionado) onTogglePermiso(p.id);
      if (!todosSeleccionados && !estaSeleccionado) onTogglePermiso(p.id);
    });
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div>
          <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Asignar Permisos al Operativo
          </h4>
          <p className="text-xs text-text-tertiary mt-0.5">
            Solo podés asignar los permisos que vos mismo tenés habilitados.
          </p>
        </div>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-medium">
          {permisosSeleccionados.length} seleccionados
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {modulos.map((modulo) => {
          const items = permisosPorModulo[modulo];
          const estaAbierto = modulosAbiertos[modulo] ?? false;
          const todosSeleccionados = items.every((p) =>
            permisosSeleccionados.includes(p.id),
          );
          const algunoSeleccionado = items.some((p) =>
            permisosSeleccionados.includes(p.id),
          );
          const cantidadSeleccionada = items.filter((p) =>
            permisosSeleccionados.includes(p.id),
          ).length;

          return (
            <div
              key={modulo}
              className="bg-bg-content border border-border rounded-xl overflow-hidden"
            >
              {/* Header del modulo - clickeable para colapsar */}
              <div className="px-4 py-3 bg-bg-title flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleModulo(modulo)}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  {estaAbierto ? (
                    <ChevronDown className="w-4 h-4 text-text-tertiary shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-text-tertiary shrink-0" />
                  )}
                  <span className="text-sm font-semibold text-text-primary capitalize">
                    {modulo}
                  </span>
                  {algunoSeleccionado && (
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full ml-1">
                      {cantidadSeleccionada}/{items.length}
                    </span>
                  )}
                </button>

                {/* Boton seleccionar todos - no colapsa el modulo */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTodosModulo(items);
                  }}
                  className="text-xs text-primary hover:text-primary-hover transition-colors shrink-0 ml-4"
                >
                  {todosSeleccionados
                    ? "Deseleccionar todos"
                    : "Seleccionar todos"}
                </button>
              </div>

              {/* Lista de permisos colapsable */}
              {estaAbierto && (
                <div className="divide-y divide-border">
                  {items.map((permiso) => (
                    <label
                      key={permiso.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-bg-base cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={permisosSeleccionados.includes(permiso.id)}
                        onChange={() => onTogglePermiso(permiso.id)}
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-text-primary">
                          {permiso.nombre}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                            {permiso.accion}
                          </span>
                          {permiso.descripcion && (
                            <span className="text-xs text-text-tertiary">
                              {permiso.descripcion}
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
