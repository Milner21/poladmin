import type { ModoEleccion, NivelCampana, TipoCampana } from '@dto/campana.types';
import { usePartidos } from '@pages/private/partidos/hooks/usePartidos';
import type { FC } from 'react';

interface FormValues {
  nombre: string;
  nivel_campana: NivelCampana;
  departamento: string;
  distrito: string;
  tipo_campana: TipoCampana;
  partido_id: string;
  modo_eleccion: ModoEleccion;
}

interface FormErrors {
  nombre?: string;
  nivel_campana?: string;
  departamento?: string;
  distrito?: string;
  tipo_campana?: string;
  partido_id?: string;
  modo_eleccion?: string;
}

interface Props {
  values: FormValues;
  errors: FormErrors;
  isPending: boolean;
  isEditing?: boolean;
  onChange: (field: keyof FormValues, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const NIVELES_CAMPANA = [
  { value: 'PAIS', label: '🇵🇾 Nacional', desc: 'Elección presidencial' },
  { value: 'DEPARTAMENTO', label: '🏛️ Departamental', desc: 'Gobernador' },
  { value: 'DISTRITO', label: '🏙️ Municipal', desc: 'Intendente' },
];

export const CampanaForm: FC<Props> = ({
  values,
  errors,
  isPending,
  isEditing = false,
  onChange,
  onSubmit,
  onCancel,
}) => {
  const { data: partidos } = usePartidos();

  const mostrarDepartamento = values.nivel_campana === 'DEPARTAMENTO' || values.nivel_campana === 'DISTRITO';
  const mostrarDistrito = values.nivel_campana === 'DISTRITO';
  const mostrarPartido = values.tipo_campana === 'PARTIDO';
  const permitirInternas = values.tipo_campana === 'PARTIDO';

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {/* Datos de la campaña */}
      <div className="flex flex-col gap-4">
        <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider border-b border-border pb-2">
          Datos de la Campaña
        </h4>

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Nombre <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={values.nombre}
            onChange={(e) => onChange('nombre', e.target.value)}
            placeholder="Ej: Proyecto Luque 2026"
            className={`
              w-full px-4 py-2 rounded-lg border bg-bg-content
              text-text-primary placeholder:text-text-tertiary
              focus:outline-none focus:ring-2 focus:ring-primary
              transition-all
              ${errors.nombre ? 'border-danger ring-2 ring-danger/20' : 'border-border'}
            `}
          />
          {errors.nombre && (
            <p className="text-danger text-xs mt-1">{errors.nombre}</p>
          )}
        </div>

        {/* Nivel de Campaña */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            Nivel de Campaña <span className="text-danger">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {NIVELES_CAMPANA.map((nivel) => (
              <label key={nivel.value} className="cursor-pointer">
                <div
                  className={`border-2 rounded-lg p-3 transition-all ${
                    values.nivel_campana === nivel.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="nivel_campana"
                    value={nivel.value}
                    checked={values.nivel_campana === nivel.value}
                    onChange={(e) => onChange('nivel_campana', e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        values.nivel_campana === nivel.value
                          ? 'border-primary'
                          : 'border-border'
                      }`}
                    >
                      {values.nivel_campana === nivel.value && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="font-medium text-text-primary text-sm">{nivel.label}</p>
                  </div>
                  <p className="text-xs text-text-secondary ml-6">{nivel.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Tipo de Campaña */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            Tipo de Estructura <span className="text-danger">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="cursor-pointer">
              <div
                className={`border-2 rounded-lg p-4 transition-all ${
                  values.tipo_campana === 'PARTIDO'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input
                  type="radio"
                  name="tipo_campana"
                  value="PARTIDO"
                  checked={values.tipo_campana === 'PARTIDO'}
                  onChange={(e) => onChange('tipo_campana', e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      values.tipo_campana === 'PARTIDO'
                        ? 'border-primary'
                        : 'border-border'
                    }`}
                  >
                    {values.tipo_campana === 'PARTIDO' && (
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Partido Politico</p>
                    <p className="text-xs text-text-secondary">Tiene padron interno y elecciones internas</p>
                  </div>
                </div>
              </div>
            </label>

            <label className="cursor-pointer">
              <div
                className={`border-2 rounded-lg p-4 transition-all ${
                  values.tipo_campana === 'MOVIMIENTO'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input
                  type="radio"
                  name="tipo_campana"
                  value="MOVIMIENTO"
                  checked={values.tipo_campana === 'MOVIMIENTO'}
                  onChange={(e) => onChange('tipo_campana', e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      values.tipo_campana === 'MOVIMIENTO'
                        ? 'border-primary'
                        : 'border-border'
                    }`}
                  >
                    {values.tipo_campana === 'MOVIMIENTO' && (
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Movimiento Politico</p>
                    <p className="text-xs text-text-secondary">Solo elecciones generales</p>
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Selector de Partido */}
        {mostrarPartido && (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Partido <span className="text-danger">*</span>
            </label>
            <select
              value={values.partido_id}
              onChange={(e) => onChange('partido_id', e.target.value)}
              className={`
                w-full px-4 py-2 rounded-lg border bg-bg-content
                text-text-primary
                focus:outline-none focus:ring-2 focus:ring-primary
                transition-all
                ${errors.partido_id ? 'border-danger ring-2 ring-danger/20' : 'border-border'}
              `}
            >
              <option value="">Seleccionar partido</option>
              {partidos?.map((partido) => (
                <option key={partido.id} value={partido.id}>
                  {partido.sigla} - {partido.nombre}
                </option>
              ))}
            </select>
            {errors.partido_id && (
              <p className="text-danger text-xs mt-1">{errors.partido_id}</p>
            )}
          </div>
        )}

        {/* Ubicación geográfica */}
        {(mostrarDepartamento || mostrarDistrito) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mostrarDepartamento && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Departamento <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={values.departamento}
                  onChange={(e) => onChange('departamento', e.target.value.toUpperCase())}
                  placeholder="Ej: CENTRAL"
                  className={`
                    w-full px-4 py-2 rounded-lg border bg-bg-content uppercase
                    text-text-primary placeholder:text-text-tertiary
                    focus:outline-none focus:ring-2 focus:ring-primary
                    transition-all
                    ${errors.departamento ? 'border-danger ring-2 ring-danger/20' : 'border-border'}
                  `}
                />
                {errors.departamento && (
                  <p className="text-danger text-xs mt-1">{errors.departamento}</p>
                )}
              </div>
            )}

            {mostrarDistrito && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Distrito / Ciudad <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={values.distrito}
                  onChange={(e) => onChange('distrito', e.target.value.toUpperCase())}
                  placeholder="Ej: LUQUE"
                  className={`
                    w-full px-4 py-2 rounded-lg border bg-bg-content uppercase
                    text-text-primary placeholder:text-text-tertiary
                    focus:outline-none focus:ring-2 focus:ring-primary
                    transition-all
                    ${errors.distrito ? 'border-danger ring-2 ring-danger/20' : 'border-border'}
                  `}
                />
                {errors.distrito && (
                  <p className="text-danger text-xs mt-1">{errors.distrito}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Configuración Electoral */}
      <div className="flex flex-col gap-4">
        <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider border-b border-border pb-2">
          Configuración Electoral
        </h4>

        {/* Modo Elección */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            Tipo de Elección <span className="text-danger">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className={`cursor-pointer ${!permitirInternas ? 'opacity-50' : ''}`}>
              <div
                className={`border-2 rounded-lg p-4 transition-all ${
                  values.modo_eleccion === 'INTERNAS'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                } ${!permitirInternas ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="modo_eleccion"
                  value="INTERNAS"
                  checked={values.modo_eleccion === 'INTERNAS'}
                  onChange={(e) => permitirInternas && onChange('modo_eleccion', e.target.value)}
                  disabled={!permitirInternas}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      values.modo_eleccion === 'INTERNAS'
                        ? 'border-primary'
                        : 'border-border'
                    }`}
                  >
                    {values.modo_eleccion === 'INTERNAS' && (
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Internas</p>
                    <p className="text-xs text-text-secondary">Solo afiliados al partido</p>
                  </div>
                </div>
              </div>
            </label>

            <label className="cursor-pointer">
              <div
                className={`border-2 rounded-lg p-4 transition-all ${
                  values.modo_eleccion === 'GENERALES'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input
                  type="radio"
                  name="modo_eleccion"
                  value="GENERALES"
                  checked={values.modo_eleccion === 'GENERALES'}
                  onChange={(e) => onChange('modo_eleccion', e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      values.modo_eleccion === 'GENERALES'
                        ? 'border-primary'
                        : 'border-border'
                    }`}
                  >
                    {values.modo_eleccion === 'GENERALES' && (
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Generales</p>
                    <p className="text-xs text-text-secondary">Todos los votantes (TSJE)</p>
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Botones */}
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
          {isEditing ? 'Guardar Cambios' : 'Crear Campaña'}
        </button>
      </div>
    </form>
  );
};