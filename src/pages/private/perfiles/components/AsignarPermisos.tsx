import { type FC, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Permiso } from "@dto/permiso.types";

interface AsignarPermisosProps {
  permisos: Permiso[];
  permisosSeleccionados: string[];
  isPending: boolean;
  onChange: (permisoId: string) => void;
  onGuardar: () => void;
}

export const AsignarPermisos: FC<AsignarPermisosProps> = ({
  permisos,
  permisosSeleccionados,
  isPending,
  onChange,
  onGuardar,
}) => {
  const permisosPorModulo = permisos.reduce<Record<string, Permiso[]>>(
    (acc, permiso) => {
      if (!acc[permiso.modulo]) acc[permiso.modulo] = [];
      acc[permiso.modulo].push(permiso);
      return acc;
    },
    {},
  );

  const modulos = Object.keys(permisosPorModulo);

  const [modulosAbiertos, setModulosAbiertos] = useState<Record<string, boolean>>(
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
      if (todosSeleccionados && estaSeleccionado) onChange(p.id);
      if (!todosSeleccionados && !estaSeleccionado) onChange(p.id);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-base font-semibold text-text-primary m-0">
            Permisos del Perfil
          </h4>
          <p className="text-xs text-text-tertiary mt-0.5">
            {permisosSeleccionados.length} permisos seleccionados
          </p>
        </div>
        <button
          onClick={onGuardar}
          disabled={isPending}
          className="px-4 py-2 text-sm rounded-lg bg-primary hover:bg-primary-hover text-white font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isPending && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          Guardar Permisos
        </button>
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
              {/* Header del modulo */}
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

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTodosModulo(items);
                  }}
                  className="text-xs text-primary hover:text-primary-hover transition-colors shrink-0 ml-4"
                >
                  {todosSeleccionados ? "Deseleccionar todos" : "Seleccionar todos"}
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
                        onChange={() => onChange(permiso.id)}
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