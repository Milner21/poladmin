import { type FC } from "react";
import type { TopUsuario } from "@dto/dashboard.types";

interface Props {
  data: TopUsuario[];
  isLoading: boolean;
}

export const TopRegistradoresChart: FC<Props> = ({ data, isLoading }) => {
  const maximo = data[0]?.total_simpatizantes_registrados ?? 1;

  if (isLoading) {
    return (
      <div className="bg-bg-content border border-border rounded-xl p-6 flex items-center justify-center h-64">
        <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-bg-content border border-border rounded-xl p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-text-primary m-0">
          Top Registradores
        </h3>
        <p className="text-xs text-text-tertiary mt-0.5">
          Usuarios con mas simpatizantes registrados
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <p className="text-text-tertiary text-sm">Sin datos disponibles</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item, index) => {
            const porcentaje = maximo > 0
              ? ((item.total_simpatizantes_registrados / maximo) * 100).toFixed(0)
              : "0";

            const colorBadge =
              index === 0 ? "bg-warning text-white" :
              index === 1 ? "bg-text-tertiary/20 text-text-primary" :
              index === 2 ? "bg-warning/30 text-warning" :
              "bg-primary/10 text-primary";

            return (
              <div key={item.id} className="flex items-center gap-3">
                {/* Posicion */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${colorBadge}`}>
                  {index + 1}
                </div>

                {/* Info y barra */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate m-0">
                        {item.nombre} {item.apellido}
                      </p>
                      <p className="text-xs text-text-tertiary m-0">
                        {item.perfil}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-primary ml-3 shrink-0">
                      {item.total_simpatizantes_registrados}
                    </span>
                  </div>
                  <div className="w-full bg-bg-base rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};