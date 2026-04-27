import { type FC, type ReactNode } from 'react';
import { FileText, Download } from 'lucide-react';

interface ReporteCardProps {
  icon: ReactNode;
  titulo: string;
  descripcion: string;
  filtros: string[];
  onGenerar: () => void;
  proximamente?: boolean;
}

export const ReporteCard: FC<ReporteCardProps> = ({
  icon,
  titulo,
  descripcion,
  filtros,
  onGenerar,
  proximamente = false,
}) => {
  return (
    <div className={`
      bg-bg-content border border-border rounded-xl p-6 shadow-sm
      ${proximamente ? 'opacity-60' : 'hover:shadow-md'}
      transition-all duration-200
    `}>
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`
          w-12 h-12 rounded-lg flex items-center justify-center
          ${proximamente ? 'bg-bg-base text-text-tertiary' : 'bg-primary/10 text-primary'}
        `}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text-primary m-0 flex items-center gap-2">
            {titulo}
            {proximamente && (
              <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded">
                Próximamente
              </span>
            )}
          </h3>
          <p className="text-sm text-text-tertiary mt-1 m-0">
            {descripcion}
          </p>
        </div>
      </div>

      {/* Filtros disponibles */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-text-secondary mb-2">
          📌 Filtros disponibles:
        </h4>
        <ul className="space-y-1">
          {filtros.map((filtro, index) => (
            <li key={index} className="text-xs text-text-tertiary flex items-center gap-2">
              <span className="w-1 h-1 bg-text-tertiary rounded-full" />
              {filtro}
            </li>
          ))}
        </ul>
      </div>

      {/* Botones */}
      <div className="border-t border-border pt-4">
        <button
          onClick={onGenerar}
          disabled={proximamente}
          className={`
            w-full flex items-center justify-center gap-2 px-4 py-2.5
            text-sm font-medium rounded-lg transition-colors
            ${proximamente
              ? 'bg-bg-base text-text-tertiary cursor-not-allowed'
              : 'bg-primary hover:bg-primary-hover text-white'
            }
          `}
        >
          {proximamente ? (
            <>
              <FileText size={16} />
              Próximamente
            </>
          ) : (
            <>
              <Download size={16} />
              Generar Reporte
            </>
          )}
        </button>
      </div>
    </div>
  );
};