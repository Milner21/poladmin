import type { Nivel } from "@dto/nivel.types";
import type { FC } from "react";

interface FormValues {
  nombre: string;
  nivel_id: string;
  es_operativo: boolean;
  username_manual: boolean;
}

interface FormErrors {
  nombre?: string;
  nivel_id?: string;
}

interface PerfilFormProps {
  values: FormValues;
  errors: FormErrors;
  isPending: boolean;
  isEditing?: boolean;
  niveles: Nivel[];
  onChange: (field: "nombre" | "nivel_id", value: string) => void;
  onChangeBoolean: (
    field: "es_operativo" | "username_manual",
    value: boolean,
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const PerfilForm: FC<PerfilFormProps> = ({
  values,
  errors,
  isPending,
  isEditing = false,
  niveles,
  onChange,
  onChangeBoolean,
  onSubmit,
  onCancel,
}) => {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">
          Nombre <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          value={values.nombre}
          onChange={(e) => onChange("nombre", e.target.value)}
          placeholder="ej: GESTOR"
          className={`
            w-full px-4 py-2 rounded-lg border bg-bg-content
            text-text-primary placeholder:text-text-tertiary
            focus:outline-none focus:ring-2 focus:ring-primary
            transition-all uppercase
            ${errors.nombre ? "border-danger ring-2 ring-danger/20" : "border-border"}
          `}
        />
        {errors.nombre && (
          <p className="text-danger text-xs mt-1">{errors.nombre}</p>
        )}
      </div>

      {/* Es operativo */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={values.es_operativo}
          onChange={(e) => onChangeBoolean("es_operativo", e.target.checked)}
          className="w-4 h-4 accent-primary cursor-pointer"
        />
        <div>
          <span className="text-sm font-medium text-text-primary">
            Perfil operativo
          </span>
          <p className="text-xs text-text-tertiary">
            Los perfiles operativos no tienen jerarquía política (ej: GESTOR,
            ADMINISTRATIVO)
          </p>
        </div>
      </label>

      {/* Username manual */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={values.username_manual}
          onChange={(e) =>
            onChangeBoolean("username_manual", e.target.checked)
          }
          className="w-4 h-4 accent-primary cursor-pointer"
        />
        <div>
          <span className="text-sm font-medium text-text-primary">
            Usuario manual
          </span>
          <p className="text-xs text-text-tertiary">
            Al crear un usuario con este perfil, el usuario debe ingresar
            manualmente el nombre de usuario en lugar de generarse
            automáticamente
          </p>
        </div>
      </label>

      {/* Nivel - solo si NO es operativo */}
      {!values.es_operativo && (
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Nivel jerárquico <span className="text-danger">*</span>
          </label>
          <select
            value={values.nivel_id}
            onChange={(e) => onChange("nivel_id", e.target.value)}
            className={`
              w-full px-4 py-2 rounded-lg border bg-bg-content
              text-text-primary
              focus:outline-none focus:ring-2 focus:ring-primary
              transition-all
              ${errors.nivel_id ? "border-danger ring-2 ring-danger/20" : "border-border"}
            `}
          >
            <option value="">Seleccionar nivel...</option>
            {niveles
              .sort((a, b) => a.orden - b.orden)
              .map((nivel) => (
                <option key={nivel.id} value={nivel.id}>
                  {nivel.orden}. {nivel.nombre}
                </option>
              ))}
          </select>
          {errors.nivel_id && (
            <p className="text-danger text-xs mt-1">{errors.nivel_id}</p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-2 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="
            px-4 py-2 text-sm rounded-lg
            border border-border text-text-primary
            hover:bg-bg-base transition-colors
          "
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="
            px-4 py-2 text-sm rounded-lg
            bg-primary hover:bg-primary-hover
            text-white font-medium transition-colors
            disabled:opacity-60 disabled:cursor-not-allowed
            flex items-center gap-2
          "
        >
          {isPending && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {isEditing ? "Guardar Cambios" : "Crear Perfil"}
        </button>
      </div>
    </form>
  );
};