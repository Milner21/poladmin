import { type FC } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { IntencionVotoDashboard } from "@dto/dashboard.types";

interface Props {
  data: IntencionVotoDashboard;
  isLoading: boolean;
}

interface EntradaGrafico {
  nombre: string;
  valor: number;
  color: string;
  colorClase: string;
  [key: string]: unknown;
}

export const IntencionVotoChart: FC<Props> = ({ data, isLoading }) => {
  const entradas: EntradaGrafico[] = [
    { nombre: "Seguro", valor: data.seguro, color: "#22c55e", colorClase: "bg-success" },
    { nombre: "Probable", valor: data.probable, color: "#3b82f6", colorClase: "bg-info" },
    { nombre: "Indeciso", valor: data.indeciso, color: "#f59e0b", colorClase: "bg-warning" },
    { nombre: "Contrario", valor: data.contrario, color: "#ef4444", colorClase: "bg-danger" },
  ];

  const getPorcentaje = (valor: number): string => {
    if (data.total === 0) return "0";
    return ((valor / data.total) * 100).toFixed(1);
  };

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
          Intencion de Voto
        </h3>
        <p className="text-xs text-text-tertiary mt-0.5">
          {data.total} simpatizantes registrados
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Grafico dona */}
        <div className="w-full lg:w-48 h-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={entradas}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                dataKey="valor"
                paddingAngle={3}
              >
                {entradas.map((entrada) => (
                  <Cell key={entrada.nombre} fill={entrada.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-bg-content)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  color: "var(--color-text-primary)",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [value, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Detalle por intencion */}
        <div className="flex-1 w-full space-y-3">
          {entradas.map((entrada) => (
            <div key={entrada.nombre} className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${entrada.colorClase}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-text-primary">
                    {entrada.nombre}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-text-primary">
                      {entrada.valor}
                    </span>
                    <span className="text-xs text-text-tertiary w-10 text-right">
                      {getPorcentaje(entrada.valor)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-bg-base rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${entrada.colorClase}`}
                    style={{ width: `${getPorcentaje(entrada.valor)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};