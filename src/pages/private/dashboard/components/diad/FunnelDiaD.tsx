// src/pages/private/dashboard/components/diad/FunnelDiaD.tsx

import { Activity, Heart, Printer, Ticket, UserCheck } from "lucide-react";
import type { FC } from "react";
import type { RespuestaDiaD } from "@dto/estadisticas.types";

interface PropsFunnelDiaD {
  data: RespuestaDiaD;
}

interface PropsEtapaFunnel {
  icono: React.ReactNode;
  etiqueta: string;
  valor: number;
  porcentaje: number | null;
  color: string;
  colorFondo: string;
  activo: boolean;
}

const EtapaFunnel: FC<PropsEtapaFunnel> = ({
  icono,
  etiqueta,
  valor,
  porcentaje,
  color,
  colorFondo,
  activo,
}) => {
  if (!activo) return null;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-full rounded-xl border p-4 flex items-center justify-between ${colorFondo}`}
      >
        <div className="flex items-center gap-3">
          <div className={`${color}`}>{icono}</div>
          <div>
            <p className="text-xs text-text-secondary">{etiqueta}</p>
            <p className={`text-2xl font-bold ${color}`}>
              {valor.toLocaleString("es-PY")}
            </p>
          </div>
        </div>
        {porcentaje !== null && (
          <div className="text-right">
            <p className="text-xs text-text-tertiary">conversion</p>
            <p className={`text-lg font-semibold ${color}`}>{porcentaje}%</p>
          </div>
        )}
      </div>
      <div className="w-0.5 h-4 bg-border" />
    </div>
  );
};

export const FunnelDiaD: FC<PropsFunnelDiaD> = ({ data }) => {
  return (
    <div className="bg-bg-content border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <Activity size={18} className="text-primary" />
        <h3 className="text-sm font-semibold text-text-primary">
          Flujo del Dia D
        </h3>
        <span className="ml-auto text-xs text-text-tertiary bg-bg-base px-2 py-0.5 rounded-full">
          {data.modo_eleccion}
        </span>
      </div>

      <div className="flex flex-col">
        <EtapaFunnel
          icono={<Printer size={20} />}
          etiqueta="Tickets Impresos"
          valor={data.total_tickets_impresos}
          porcentaje={null}
          color="text-primary"
          colorFondo="bg-primary/5 border-primary/20"
          activo={true}
        />

        <EtapaFunnel
          icono={<Ticket size={20} />}
          etiqueta="Activados"
          valor={data.total_activados}
          porcentaje={data.porcentaje_activados}
          color="text-info"
          colorFondo="bg-info/5 border-info/20"
          activo={data.usar_activador_ticket}
        />

        <EtapaFunnel
          icono={<UserCheck size={20} />}
          etiqueta="Verificados"
          valor={data.total_verificados}
          porcentaje={data.porcentaje_verificados}
          color="text-success"
          colorFondo="bg-success/5 border-success/20"
          activo={data.usar_verificador_asistencia}
        />

        <EtapaFunnel
          icono={<Heart size={20} />}
          etiqueta="Solidaridad"
          valor={data.total_solidaridad}
          porcentaje={data.porcentaje_solidaridad}
          color="text-accent"
          colorFondo="bg-accent/5 border-accent/20"
          activo={data.usar_solidaridad}
        />
      </div>
    </div>
  );
};
