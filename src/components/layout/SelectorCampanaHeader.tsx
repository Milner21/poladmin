import { useState, useEffect } from "react";
import { useAuth } from "@hooks/useAuth";
import { useCampanas } from "@pages/private/campanas/hooks/useCampanas";
import { Building2, ChevronDown } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export const SelectorCampanaHeader = () => {
  const { usuario } = useAuth();
  const { data: campanas } = useCampanas();
  const [campanaSeleccionada, setCampanaSeleccionada] = useState<string>("");
  const queryClient = useQueryClient();
  // Solo mostrar para ROOT
  const esRoot = usuario?.perfil?.nombre === "ROOT";

  // Cargar campaña guardada del localStorage
  useEffect(() => {
    const campanaGuardada = localStorage.getItem("campana_seleccionada_root");
    if (campanaGuardada && campanas?.some((c) => c.id === campanaGuardada)) {
      setCampanaSeleccionada(campanaGuardada);
    } else if (campanas && campanas.length > 0) {
      // Si no hay guardada, seleccionar la primera
      setCampanaSeleccionada(campanas[0].id);
      localStorage.setItem("campana_seleccionada_root", campanas[0].id);
    }
  }, [campanas]);

  const handleCampanaChange = (campanaId: string) => {
    setCampanaSeleccionada(campanaId);
    localStorage.setItem("campana_seleccionada_root", campanaId);

    // Disparar evento personalizado para que otros componentes se enteren
    window.dispatchEvent(new Event("campana-changed"));

    // Invalidar queries
    queryClient.invalidateQueries({
      queryKey: ["usuarios"],
      refetchType: "all",
    });
  };

  if (!esRoot || !campanas || campanas.length === 0) {
    return null;
  }

  const campanaActual = campanas.find((c) => c.id === campanaSeleccionada);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-3 py-2 bg-bg-content border border-border rounded-lg min-w-64">
        <Building2 className="text-primary" size={18} />
        <select
          value={campanaSeleccionada}
          onChange={(e) => handleCampanaChange(e.target.value)}
          className="flex-1 bg-transparent text-text-primary text-sm font-medium focus:outline-none cursor-pointer"
        >
          {campanas.map((campana) => (
            <option key={campana.id} value={campana.id}>
              {campana.nombre}
              {campana.distrito && ` (${campana.distrito})`}
            </option>
          ))}
        </select>
        <ChevronDown className="text-text-tertiary" size={16} />
      </div>

      {/* Indicador visual de campaña activa */}
      {campanaActual && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
        </div>
      )}
    </div>
  );
};
