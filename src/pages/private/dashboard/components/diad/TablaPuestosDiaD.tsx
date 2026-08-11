// src/pages/private/dashboard/components/diad/TablaPuestosDiaD.tsx

import { MapPin, Printer, Copy, Users } from "lucide-react";
import type { FC } from "react";
import type { RespuestaDiaD } from "@dto/estadisticas.types";

interface PropsTablaPuestosDiaD {
  data: RespuestaDiaD;
}

export const TablaPuestosDiaD: FC<PropsTablaPuestosDiaD> = ({ data }) => {
  const hayPuestos = data.por_puesto.length > 0;

  const mostrarActivaciones = data.usar_activador_ticket;
  const mostrarVerificaciones = data.usar_verificador_asistencia;
  const mostrarSolidaridades = data.usar_solidaridad;

  return (
    <div className="bg-bg-content border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <MapPin size={18} className="text-primary" />
        <h3 className="text-sm font-semibold text-text-primary">
          Actividad por Puesto de Control
        </h3>
      </div>

      {!hayPuestos ? (
        <div className="text-center py-8">
          <MapPin size={32} className="text-text-tertiary mx-auto mb-2" />
          <p className="text-sm text-text-tertiary">
            No hay puestos de control registrados para este modo de eleccion.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-xs font-semibold text-text-tertiary">
                  Puesto
                </th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-primary">
                  <div className="flex items-center justify-center gap-1">
                    <Printer size={12} />
                    Tickets Impresos
                  </div>
                </th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-warning">
                  <div className="flex items-center justify-center gap-1">
                    <Copy size={12} />
                    Reimpresiones
                  </div>
                </th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-info">
                  <div className="flex items-center justify-center gap-1">
                    <Users size={12} />
                    Organicos
                  </div>
                </th>
                {mostrarActivaciones && (
                  <th className="text-center py-2 px-3 text-xs font-semibold text-info">
                    Activaciones
                  </th>
                )}
                {mostrarVerificaciones && (
                  <th className="text-center py-2 px-3 text-xs font-semibold text-success">
                    Verificaciones
                  </th>
                )}
                {mostrarSolidaridades && (
                  <th className="text-center py-2 px-3 text-xs font-semibold text-accent">
                    Solidaridad
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.por_puesto.map((puesto) => (
                <tr
                  key={puesto.puesto_codigo}
                  className="border-b border-border/50 hover:bg-bg-base transition-colors"
                >
                  <td className="py-2.5 px-3">
                    <p className="font-medium text-text-primary">
                      {puesto.puesto_codigo}
                    </p>
                    {puesto.puesto_descripcion && (
                      <p className="text-xs text-text-tertiary">
                        {puesto.puesto_descripcion}
                      </p>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="font-semibold text-primary">
                      {puesto.tickets_impresos.toLocaleString("es-PY")}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="font-semibold text-warning">
                      {puesto.reimpresiones.toLocaleString("es-PY")}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="font-semibold text-info">
                      {puesto.organicos.toLocaleString("es-PY")}
                    </span>
                  </td>
                  {mostrarActivaciones && (
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-semibold text-info">
                        {puesto.activaciones.toLocaleString("es-PY")}
                      </span>
                    </td>
                  )}
                  {mostrarVerificaciones && (
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-semibold text-success">
                        {puesto.verificaciones.toLocaleString("es-PY")}
                      </span>
                    </td>
                  )}
                  {mostrarSolidaridades && (
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-semibold text-accent">
                        {puesto.solidaridades.toLocaleString("es-PY")}
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};