import { type FC } from "react";
import type { PasajeroTransporte } from "@dto/transporte.types";
import { CheckCircle, User, Trash2, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transportesService } from "@services/transportes.service";
import toast from "react-hot-toast";

interface TablaPasajerosProps {
  pasajeros: PasajeroTransporte[];
  confirmados: boolean;
}

export const TablaPasajeros: FC<TablaPasajerosProps> = ({ pasajeros, confirmados }) => {
  const queryClient = useQueryClient();

  const eliminarMutation = useMutation({
    mutationFn: transportesService.eliminarPasajero,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pasajeros"] });
      toast.success("Pasajero eliminado correctamente");
    },
    onError: () => {
      toast.error("Error al eliminar el pasajero");
    },
  });

  const handleEliminar = (pasajeroId: string) => {
    eliminarMutation.mutate(pasajeroId);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-bg-surface border-b border-border">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
              #
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
              Pasajero
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider hidden md:table-cell">
              CI
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider hidden lg:table-cell">
              Local de Votación
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider hidden lg:table-cell">
              Mesa
            </th>
            {!confirmados && (
              <th className="px-4 py-3 text-center text-xs font-medium text-text-tertiary uppercase tracking-wider">
                Acciones
              </th>
            )}
            {confirmados && (
              <th className="px-4 py-3 text-center text-xs font-medium text-text-tertiary uppercase tracking-wider">
                Estado
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {pasajeros.map((pasajero, index) => (
            <tr
              key={pasajero.id}
              className={`${confirmados ? "bg-success/5" : "hover:bg-bg-hover"} transition-colors`}
            >
              <td className="px-4 py-3 text-sm text-text-tertiary">
                {index + 1}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${confirmados ? "bg-success/20" : "bg-primary/20"}`}>
                    <User size={16} className={confirmados ? "text-success" : "text-primary"} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {pasajero.simpatizante?.nombre} {pasajero.simpatizante?.apellido}
                    </p>
                    <p className="text-xs text-text-tertiary md:hidden">
                      CI: {pasajero.simpatizante?.documento}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-text-primary hidden md:table-cell">
                {pasajero.simpatizante?.documento}
              </td>
              <td className="px-4 py-3 text-sm text-text-tertiary hidden lg:table-cell">
                {pasajero.simpatizante?.local_votacion_interna ?? pasajero.simpatizante?.local_votacion_general ?? "-"}
              </td>
              <td className="px-4 py-3 text-sm text-text-tertiary hidden lg:table-cell">
                {pasajero.simpatizante?.mesa_votacion_interna ?? pasajero.simpatizante?.mesa_votacion_general ?? "-"}
              </td>
              {!confirmados && (
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleEliminar(pasajero.id)}
                    disabled={eliminarMutation.isPending}
                    className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors disabled:opacity-50"
                    title="Eliminar pasajero"
                  >
                    {eliminarMutation.variables === pasajero.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </td>
              )}
              {confirmados && (
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                    <CheckCircle size={14} />
                    Confirmado
                  </span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {pasajeros.length === 0 && (
        <div className="text-center py-8 text-text-tertiary text-sm">
          No hay pasajeros {confirmados ? "confirmados" : "en este viaje"}
        </div>
      )}
    </div>
  );
};