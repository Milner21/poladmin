import type { Perfil } from "@dto/perfil.types";
import type { Permiso } from "@dto/permiso.types";
import type { FC } from "react";
import { PermisosOperativoPanel } from "./PermisosOperativoPanel";

interface FormValues {
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
  password: string;
  confirmarPassword: string;
  perfil_id: string;
  username: string;
}

interface FormErrors {
  nombre?: string;
  apellido?: string;
  documento?: string;
  telefono?: string;
  password?: string;
  confirmarPassword?: string;
  perfil_id?: string;
  username?: string;
}

interface UsuarioFormProps {
  values: FormValues;
  errors: FormErrors;
  isPending: boolean;
  isEditing?: boolean;
  puedeEditarUsername?: boolean;
  perfiles: Perfil[];
  tipoUsuario: "politico" | "operativo";
  onChangeTipoUsuario?: (tipo: "politico" | "operativo") => void;
  permisosDisponibles?: Permiso[];
  permisosSeleccionados?: string[];
  onTogglePermiso?: (permisoId: string) => void;
  perfilesConInfo?: Array<Perfil & { disponible: boolean; razon: string }>;
  onChange: (field: keyof FormValues, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const UsuarioForm: FC<UsuarioFormProps> = ({
  values,
  errors,
  isPending,
  isEditing = false,
  puedeEditarUsername,
  perfiles,
  tipoUsuario,
  onChangeTipoUsuario,
  permisosDisponibles = [],
  permisosSeleccionados = [],
  perfilesConInfo,
  onTogglePermiso,
  onChange,
  onSubmit,
  onCancel,
}) => {
  const todosLosPerfiles = perfilesConInfo ?? perfiles;
  const perfilSeleccionado = todosLosPerfiles.find(
    (p) => p.id === values.perfil_id,
  );
  const usernameEsManual = perfilSeleccionado?.username_manual === true;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {/* Selector de Tipo de Usuario (Solo al crear) */}
      {!isEditing && onChangeTipoUsuario && (
        <div className="flex gap-4 p-1 bg-bg-base rounded-lg w-fit">
          <button
            type="button"
            onClick={() => onChangeTipoUsuario("politico")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tipoUsuario === "politico"
                ? "bg-primary text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Usuario Político
          </button>
          <button
            type="button"
            onClick={() => onChangeTipoUsuario("operativo")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tipoUsuario === "operativo"
                ? "bg-primary text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Usuario Operativo
          </button>
        </div>
      )}

      {/* Datos Personales */}
      <div className="flex flex-col gap-4">
        <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider border-b border-border pb-2">
          Datos Personales
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Nombre <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={values.nombre}
              onChange={(e) => onChange("nombre", e.target.value)}
              placeholder="ej: Juan"
              className={`
                w-full px-4 py-2 rounded-lg border bg-bg-content
                text-text-primary placeholder:text-text-tertiary
                focus:outline-none focus:ring-2 focus:ring-primary
                transition-all
                ${errors.nombre ? "border-danger ring-2 ring-danger/20" : "border-border"}
              `}
            />
            {errors.nombre && (
              <p className="text-danger text-xs mt-1">{errors.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Apellido <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={values.apellido}
              onChange={(e) => onChange("apellido", e.target.value)}
              placeholder="ej: Pérez"
              className={`
                w-full px-4 py-2 rounded-lg border bg-bg-content
                text-text-primary placeholder:text-text-tertiary
                focus:outline-none focus:ring-2 focus:ring-primary
                transition-all
                ${errors.apellido ? "border-danger ring-2 ring-danger/20" : "border-border"}
              `}
            />
            {errors.apellido && (
              <p className="text-danger text-xs mt-1">{errors.apellido}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Documento <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={values.documento}
              onChange={(e) => onChange("documento", e.target.value)}
              placeholder="ej: 1234567"
              disabled={isEditing}
              className={`
                w-full px-4 py-2 rounded-lg border bg-bg-content
                text-text-primary placeholder:text-text-tertiary
                focus:outline-none focus:ring-2 focus:ring-primary
                transition-all
                ${isEditing ? "opacity-50 cursor-not-allowed" : ""}
                ${errors.documento ? "border-danger ring-2 ring-danger/20" : "border-border"}
              `}
            />
            {isEditing && (
              <p className="text-text-tertiary text-xs mt-1">
                El documento no puede modificarse
              </p>
            )}
            {errors.documento && (
              <p className="text-danger text-xs mt-1">{errors.documento}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Teléfono{" "}
              <span className="text-text-tertiary text-xs ml-1">
                (opcional)
              </span>
            </label>
            <input
              type="tel"
              value={values.telefono}
              onChange={(e) => onChange("telefono", e.target.value)}
              placeholder="ej: 0981123456"
              className="w-full px-4 py-2 rounded-lg border border-border bg-bg-content text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>
      </div>

      {/* Cuenta y Perfil */}
      <div className="flex flex-col gap-4">
        <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider border-b border-border pb-2">
          Cuenta y Accesos
        </h4>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Perfil {tipoUsuario === "operativo" && "(Operativo)"}{" "}
            <span className="text-danger">*</span>
          </label>

          <select
            value={values.perfil_id}
            onChange={(e) => onChange("perfil_id", e.target.value)}
            className={`
              w-full px-4 py-2 rounded-lg border bg-bg-content
              text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all
              ${errors.perfil_id ? "border-danger ring-2 ring-danger/20" : "border-border"}
            `}
          >
            <option value="">Seleccionar perfil...</option>

            {!perfilesConInfo &&
              perfiles.map((perfil) => (
                <option key={perfil.id} value={perfil.id}>
                  {perfil.nombre}
                  {perfil.es_operativo
                    ? " (Operativo)"
                    : perfil.nivel
                      ? ` - Nivel ${perfil.nivel.orden}: ${perfil.nivel.nombre}`
                      : ""}
                </option>
              ))}

            {perfilesConInfo &&
              perfilesConInfo.map((perfil) => (
                <option
                  key={perfil.id}
                  value={perfil.id}
                  disabled={!perfil.disponible}
                  className={!perfil.disponible ? "text-text-tertiary" : ""}
                >
                  {perfil.disponible ? "✓ " : "✗ "}
                  {perfil.nombre}
                  {perfil.es_operativo
                    ? " (Operativo)"
                    : perfil.nivel
                      ? ` - Nivel ${perfil.nivel.orden}: ${perfil.nivel.nombre}`
                      : ""}
                  {!perfil.disponible && ` — ${perfil.razon}`}
                </option>
              ))}
          </select>

          {errors.perfil_id && (
            <p className="text-danger text-xs mt-1">{errors.perfil_id}</p>
          )}

          {perfilesConInfo &&
            values.perfil_id &&
            (() => {
              const info = perfilesConInfo.find(
                (p) => p.id === values.perfil_id,
              );
              if (info && !info.disponible) {
                return (
                  <div className="mt-2 p-2 bg-warning/10 border border-warning/30 rounded text-xs text-warning">
                    {info.razon}
                  </div>
                );
              }
              return null;
            })()}

          {/* Indicador de modo username segun perfil */}
          {values.perfil_id && perfilSeleccionado && (
            <p className="text-xs text-text-tertiary mt-1">
              {usernameEsManual
                ? "Este perfil requiere usuario manual"
                : "Este perfil genera el usuario automáticamente"}
            </p>
          )}
        </div>

        {/* Username manual - solo si el perfil lo requiere y es creacion */}
        {!isEditing && usernameEsManual && (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Usuario <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={values.username}
              onChange={(e) => onChange("username", e.target.value)}
              className={`
                w-full px-4 py-2 rounded-lg border bg-bg-content
                text-text-primary placeholder:text-text-tertiary
                focus:outline-none focus:ring-2 focus:ring-primary
                transition-all
                ${errors.username ? "border-danger ring-2 ring-danger/20" : "border-border"}
              `}
            />
            {errors.username && (
              <p className="text-danger text-xs mt-1">{errors.username}</p>
            )}
          </div>
        )}

        {/* Password - solo en crear */}
        {!isEditing && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Contraseña <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                value={values.password}
                onChange={(e) => onChange("password", e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className={`w-full px-4 py-2 rounded-lg border bg-bg-content text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary transition-all ${errors.password ? "border-danger ring-2 ring-danger/20" : "border-border"}`}
              />
              {errors.password && (
                <p className="text-danger text-xs mt-1">{errors.password}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Confirmar Contraseña <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                value={values.confirmarPassword}
                onChange={(e) => onChange("confirmarPassword", e.target.value)}
                placeholder="Repetir contraseña"
                className={`w-full px-4 py-2 rounded-lg border bg-bg-content text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary transition-all ${errors.confirmarPassword ? "border-danger ring-2 ring-danger/20" : "border-border"}`}
              />
              {errors.confirmarPassword && (
                <p className="text-danger text-xs mt-1">
                  {errors.confirmarPassword}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Username manual - solo si el perfil lo requiere y es creacion */}
      {!isEditing && usernameEsManual && (
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Usuario <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={values.username}
            onChange={(e) => onChange("username", e.target.value)}
            className={`
                w-full px-4 py-2 rounded-lg border bg-bg-content
                text-text-primary placeholder:text-text-tertiary
                focus:outline-none focus:ring-2 focus:ring-primary
                transition-all
                ${errors.username ? "border-danger ring-2 ring-danger/20" : "border-border"}
              `}
          />
          {errors.username && (
            <p className="text-danger text-xs mt-1">{errors.username}</p>
          )}
        </div>
      )}

      {/* Username en edición - solo si tiene permiso */}
      {isEditing && (
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Usuario
            {!puedeEditarUsername && (
              <span className="text-text-tertiary text-xs ml-1">
                (solo lectura)
              </span>
            )}
          </label>
          <input
            type="text"
            value={values.username}
            onChange={(e) => onChange("username", e.target.value)}
            disabled={!puedeEditarUsername}
            className={`
                w-full px-4 py-2 rounded-lg border bg-bg-content
                text-text-primary placeholder:text-text-tertiary
                focus:outline-none focus:ring-2 focus:ring-primary
                transition-all
                ${!puedeEditarUsername ? "opacity-50 cursor-not-allowed" : ""}
                ${errors.username ? "border-danger ring-2 ring-danger/20" : "border-border"}
              `}
          />
          {!puedeEditarUsername && (
            <p className="text-text-tertiary text-xs mt-1">
              No tenés permiso para editar el username
            </p>
          )}
          {puedeEditarUsername && (
            <p className="text-text-tertiary text-xs mt-1">
              Se aplicará normalización automática (sin acentos, minúsculas)
            </p>
          )}
          {errors.username && (
            <p className="text-danger text-xs mt-1">{errors.username}</p>
          )}
        </div>
      )}

      {/* Permisos Dinamicos (SOLO SI ES OPERATIVO) */}
      {tipoUsuario === "operativo" && onTogglePermiso && (
        <PermisosOperativoPanel
          permisosDisponibles={permisosDisponibles}
          permisosSeleccionados={permisosSeleccionados}
          onTogglePermiso={onTogglePermiso}
        />
      )}

      {/* Footer / Botones */}
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 text-sm font-medium rounded-lg border border-border text-text-primary hover:bg-bg-base transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 text-sm font-medium rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isPending && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {isEditing ? "Guardar Cambios" : "Crear Usuario"}
        </button>
      </div>
    </form>
  );
};
