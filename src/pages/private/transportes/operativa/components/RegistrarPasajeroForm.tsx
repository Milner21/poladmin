import type { ResultadoBusquedaInteligente } from "@dto/padron.types";
import { transportesService } from "@services/transportes.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Loader2, Search } from "lucide-react";
import { useState, type FC } from "react";
import toast from "react-hot-toast";
import { BusquedaEnProgreso } from "../../../simpatizantes/crear/components/BusquedaEnProgreso";
import { ModalConfirmarPadron } from "../../../simpatizantes/crear/components/ModalConfirmarPadron";
import { useBuscarPadron } from "../../../simpatizantes/hooks/useBuscarPadron";

interface RegistrarPasajeroFormProps {
  transportistaId: string;
  onSuccess: () => void;
}

interface ErrorResponse {
  message: string;
}

export const RegistrarPasajeroForm: FC<RegistrarPasajeroFormProps> = ({
  transportistaId,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [ci, setCi] = useState("");
  const [resultadoBusqueda, setResultadoBusqueda] =
    useState<ResultadoBusquedaInteligente | null>(null);
  const [modalConfirmarOpen, setModalConfirmarOpen] = useState(false);

  const { buscar, buscando, pasos, resetear } = useBuscarPadron();

  const registrarMutation = useMutation({
    mutationFn: transportesService.registrarPasajero,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pasajeros"] });
      toast.success("Pasajero registrado correctamente");
      setCi("");
      setResultadoBusqueda(null);
      resetear();
      onSuccess();
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const mensaje =
        error?.response?.data?.message ?? "Error al registrar pasajero";
      toast.error(mensaje);
    },
  });

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ci.trim()) {
      toast.error("Ingresá un número de cédula");
      return;
    }

    const resultado = await buscar(ci.trim());
    if (!resultado) return;

    if (resultado.encontrado_en === "NO_ENCONTRADO") {
      toast.error("Documento no encontrado en padrón. Contactá con un gestor.");
      setCi("");
      resetear();
      return;
    }

    setResultadoBusqueda(resultado);
    setModalConfirmarOpen(true);
  };

  const handleConfirmar = () => {
    setModalConfirmarOpen(false);
    registrarMutation.mutate({
      transportista_id: transportistaId,
      documento: ci,
    });
  };

  const handleCancelar = () => {
    setModalConfirmarOpen(false);
    setResultadoBusqueda(null);
    setCi("");
    resetear();
  };

  const isPending = buscando || registrarMutation.isPending;
  const mostrarBusqueda = !buscando && pasos.length === 0;

  return (
    <>
      <form onSubmit={handleBuscar} className="space-y-4">
        {mostrarBusqueda && (
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={ci}
                onChange={(e) => setCi(e.target.value)}
                placeholder="Ingresá el número de cédula..."
                disabled={isPending}
                className="w-full px-4 py-3 bg-bg-base border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Buscar
                </>
              )}
            </button>
          </div>
        )}

        {(buscando || pasos.length > 0) && (
          <BusquedaEnProgreso pasos={pasos} buscando={buscando} />
        )}
      </form>

      <ModalConfirmarPadron
        isOpen={modalConfirmarOpen}
        encontradoEn={resultadoBusqueda?.encontrado_en ?? "PADRON_GENERAL"}
        datos={
          resultadoBusqueda?.datos ?? {
            ci: "",
            nombre: "",
            apellido: "",
            fecha_nacimiento: null,
            departamento: null,
            distrito: null,
            seccional: null,
            local_votacion: null,
            mesa: null,
            orden: null,
          }
        }
        onConfirmar={handleConfirmar}
        onCancelar={handleCancelar}
      />
    </>
  );
};
