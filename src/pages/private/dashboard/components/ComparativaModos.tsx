// src/pages/private/dashboard/components/ComparativaModos.tsx

import type { ComparativaModos as ComparativaModosType } from "@dto/dashboard.types";
import {
    ArrowLeftRight,
    Loader2,
    TrendingDown,
    TrendingUp,
    UserCheck,
    UserMinus,
    UserPlus,
    Users,
    Vote,
} from "lucide-react";
import { type FC } from "react";

interface ComparativaModosProps {
  data: ComparativaModosType | undefined;
  isLoading: boolean;
}

const ComparativaModos: FC<ComparativaModosProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-tertiary">
        <ArrowLeftRight size={48} className="mb-4 opacity-30" />
        <p className="text-sm">No hay datos de comparativa disponibles</p>
      </div>
    );
  }

  const { internas, generales, cruce } = data;

  const BarraComparativa = ({
    label,
    valorInternas,
    valorGenerales,
  }: {
    label: string;
    valorInternas: number;
    valorGenerales: number;
  }) => {
    const max = Math.max(valorInternas, valorGenerales, 1);
    return (
      <div className="space-y-1">
        <p className="text-xs text-text-secondary font-medium">{label}</p>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-0.5">
              <span className="text-info font-medium">INT</span>
              <span className="text-text-primary font-semibold">
                {valorInternas}
              </span>
            </div>
            <div className="w-full bg-bg-base rounded-full h-2">
              <div
                className="h-2 rounded-full bg-info transition-all duration-500"
                style={{ width: `${(valorInternas / max) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-0.5">
              <span className="text-success font-medium">GEN</span>
              <span className="text-text-primary font-semibold">
                {valorGenerales}
              </span>
            </div>
            <div className="w-full bg-bg-base rounded-full h-2">
              <div
                className="h-2 rounded-full bg-success transition-all duration-500"
                style={{ width: `${(valorGenerales / max) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Fila 1 - Resumen general */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total por modo */}
        <div className="bg-bg-content border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-info/10 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-info" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Internas</p>
              <p className="text-xl font-bold text-info">{internas.total}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-success" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Generales</p>
              <p className="text-xl font-bold text-success">
                {generales.total}
              </p>
            </div>
          </div>
        </div>

        {/* Retencion */}
        <div className="bg-bg-content border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck size={16} className="text-primary" />
            <p className="text-xs text-text-tertiary">Retencion</p>
          </div>
          <p className="text-2xl font-bold text-primary">
            {cruce.retencion_porcentaje}%
          </p>
          <p className="text-xs text-text-tertiary mt-1">
            {cruce.en_ambas} simpatizantes en ambas etapas
          </p>
        </div>

        {/* Solo internas (perdidos) */}
        <div className="bg-bg-content border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <UserMinus size={16} className="text-danger" />
            <p className="text-xs text-text-tertiary">Solo en Internas</p>
          </div>
          <p className="text-2xl font-bold text-danger">
            {cruce.solo_internas}
          </p>
          <p className="text-xs text-text-tertiary mt-1">
            No continuaron en generales
          </p>
        </div>

        {/* Solo generales (nuevos) */}
        <div className="bg-bg-content border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus size={16} className="text-success" />
            <p className="text-xs text-text-tertiary">Nuevos en Generales</p>
          </div>
          <p className="text-2xl font-bold text-success">
            {cruce.solo_generales}
          </p>
          <p className="text-xs text-text-tertiary mt-1">
            Entraron solo en generales
          </p>
        </div>
      </div>

      {/* Fila 2 - Votacion comparada */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-bg-content border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Vote size={18} className="text-primary" />
            <h3 className="text-sm font-semibold text-text-primary">
              Participacion Electoral
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-xs text-text-tertiary mb-1">Internas</p>
              <p className="text-2xl font-bold text-info">
                {internas.porcentaje_participacion}%
              </p>
              <p className="text-xs text-text-tertiary">
                {internas.votantes} de {internas.total}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-text-tertiary mb-1">Generales</p>
              <p className="text-2xl font-bold text-success">
                {generales.porcentaje_participacion}%
              </p>
              <p className="text-xs text-text-tertiary">
                {generales.votantes} de {generales.total}
              </p>
            </div>
          </div>
          {generales.porcentaje_participacion > 0 && (
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-center gap-2">
              {generales.porcentaje_participacion >=
              internas.porcentaje_participacion ? (
                <TrendingUp size={14} className="text-success" />
              ) : (
                <TrendingDown size={14} className="text-danger" />
              )}
              <span className="text-xs text-text-secondary">
                {generales.porcentaje_participacion >=
                internas.porcentaje_participacion
                  ? "Mejoro"
                  : "Bajo"}{" "}
                la participacion respecto a internas
              </span>
            </div>
          )}
        </div>

        {/* Organicos comparados */}
        <div className="bg-bg-content border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ArrowLeftRight size={18} className="text-warning" />
            <h3 className="text-sm font-semibold text-text-primary">
              Organicos y Transporte
            </h3>
          </div>
          <div className="space-y-4">
            <BarraComparativa
              label="Organicos"
              valorInternas={internas.organicos}
              valorGenerales={generales.organicos}
            />
            <BarraComparativa
              label="Necesitan transporte"
              valorInternas={internas.necesitan_transporte}
              valorGenerales={generales.necesitan_transporte}
            />
          </div>
        </div>
      </div>

      {/* Fila 3 - Intencion de voto comparada */}
      <div className="bg-bg-content border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-accent" />
          <h3 className="text-sm font-semibold text-text-primary">
            Intencion de Voto Comparada
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <BarraComparativa
            label="Seguro"
            valorInternas={internas.intencion_voto.seguro}
            valorGenerales={generales.intencion_voto.seguro}
          />
          <BarraComparativa
            label="Probable"
            valorInternas={internas.intencion_voto.probable}
            valorGenerales={generales.intencion_voto.probable}
          />
          <BarraComparativa
            label="Indeciso"
            valorInternas={internas.intencion_voto.indeciso}
            valorGenerales={generales.intencion_voto.indeciso}
          />
          <BarraComparativa
            label="Contrario"
            valorInternas={internas.intencion_voto.contrario}
            valorGenerales={generales.intencion_voto.contrario}
          />
        </div>
      </div>

      {/* Fila 4 - Origen de registro comparado */}
      <div className="bg-bg-content border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users size={18} className="text-primary" />
          <h3 className="text-sm font-semibold text-text-primary">
            Origen de Registro Comparado
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BarraComparativa
            label="Padron Interno"
            valorInternas={internas.por_origen.padron_interno}
            valorGenerales={generales.por_origen.padron_interno}
          />
          <BarraComparativa
            label="Padron General"
            valorInternas={internas.por_origen.padron_general}
            valorGenerales={generales.por_origen.padron_general}
          />
          <BarraComparativa
            label="Manual"
            valorInternas={internas.por_origen.manual}
            valorGenerales={generales.por_origen.manual}
          />
        </div>
      </div>
    </div>
  );
};

export default ComparativaModos;
