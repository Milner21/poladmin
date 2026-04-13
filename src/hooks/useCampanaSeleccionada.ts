import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { useCampanas } from "@pages/private/campanas/hooks/useCampanas";

export const useCampanaSeleccionada = () => {
  const { usuario } = useAuth();
  const { data: campanas } = useCampanas();
  const [campanaSeleccionada, setCampanaSeleccionada] = useState<string>("");

  const esRoot = usuario?.perfil?.nombre === "ROOT";

  useEffect(() => {
    if (!esRoot) {
      // Para usuarios no ROOT usar su campana_id directamente
      const campanaUsuario = usuario?.campana_id ?? "";
      setCampanaSeleccionada(campanaUsuario);
      return;
    }

    // Para ROOT usar localStorage
    const campanaGuardada = localStorage.getItem("campana_seleccionada_root");
    if (campanaGuardada && campanas?.some((c) => c.id === campanaGuardada)) {
      setCampanaSeleccionada(campanaGuardada);
    } else if (campanas && campanas.length > 0) {
      setCampanaSeleccionada(campanas[0].id);
      localStorage.setItem("campana_seleccionada_root", campanas[0].id);
    }
  }, [campanas, esRoot, usuario?.campana_id]);

  useEffect(() => {
    const handleCampanaChange = () => {
      const nuevaCampana = localStorage.getItem("campana_seleccionada_root");
      if (nuevaCampana) {
        setCampanaSeleccionada(nuevaCampana);
      }
    };

    window.addEventListener("campana-changed", handleCampanaChange);

    return () => {
      window.removeEventListener("campana-changed", handleCampanaChange);
    };
  }, []);

  const campanaActual = campanas?.find((c) => c.id === campanaSeleccionada);

  return {
    campanaSeleccionada,
    campanaActual,
    esRoot,
  };
};