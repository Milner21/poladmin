// src/pages/private/dashboard/components/diad/ResumenOrganicos.tsx

import { Copy, Users } from "lucide-react";
import type { FC } from "react";
import type { RespuestaDiaD } from "@dto/estadisticas.types";

interface PropsResumenOrganicos {
  data: RespuestaDiaD;
  puedeVerOrganicos: boolean;
}

export const ResumenOrganicos: FC<PropsResumenOrganicos> = ({
  data,
  puedeVerOrganicos,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* CARD ORGANICOS */}
      {puedeVerOrganicos ? (
        <div className="bg-bg-content border border-border rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-text-tertiary">
                Registros Organicos (Dia D)
              </p>
              <h4 className="text-xl font-bold text-text-primary mt-0.5">
                {data.total_organicos.toLocaleString("es-PY")}
              </h4>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-primary bg-primary/5 border border-primary/10 px-2. py-1 rounded-full">
              {data.porcentaje_organicos_sobre_impresos}% del flujo
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-bg-content border border-border rounded-xl p-5 flex items-center justify-center text-center">
          <p className="text-xs text-text-tertiary">
            No tenes permiso para ver el detalle de simpatizantes organicos.
          </p>
        </div>
      )}

      {/* CARD REIMPRESIONES */}
      <div className="bg-bg-content border border-border rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center text-warning">
            <Copy size={20} />
          </div>
          <div>
            <p className="text-xs text-text-tertiary">Tickets Reimpresos</p>
            <h4 className="text-xl font-bold text-text-primary mt-0.5">
              {data.total_reimpresiones.toLocaleString("es-PY")}
            </h4>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-warning bg-warning/5 border border-warning/10 px-2. py-1 rounded-full">
            Duplicados en mesa
          </span>
        </div>
      </div>
    </div>
  );
};
