import { useState, type FC } from "react";
import { PageHeader } from "@components";
import { useMiTransportista } from "../hooks/useMiTransportista";
import { usePasajeros } from "../hooks/usePasajeros";
import { AlertCircle, Loader2, Search, Truck } from "lucide-react";
import { RegistrarPasajeroForm } from "./components/RegistrarPasajeroForm";
import { TablaPasajeros } from "./components/TablaPasajeros";
import { ModalConfirmarViaje } from "./components/ModalConfirmarViaje";

const TransportistaOperativaPage: FC = () => {
  const { data: miTransportista, isLoading: isLoadingTransportista, error: errorTransportista } = useMiTransportista();
  const { data: pasajeros, isLoading: isLoadingPasajeros, refetch: refetchPasajeros } = usePasajeros(miTransportista?.id);

  const [modalConfirmarOpen, setModalConfirmarOpen] = useState(false);

  // Pantalla de carga
  if (isLoadingTransportista) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-text-tertiary">Cargando tu información...</p>
        </div>
      </div>
    );
  }

  // Error crítico
  if (errorTransportista || !miTransportista) {
    return (
      <div className="flex items-center justify-center h-screen p-6">
        <div className="bg-bg-content border border-danger/30 rounded-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-danger" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Error de Acceso</h2>
          <p className="text-text-tertiary mb-4">
            No se encontró un registro de transportista asociado a tu usuario.
          </p>
          <p className="text-sm text-text-tertiary">
            Contactá al administrador de la campaña para que configure tu cuenta correctamente.
          </p>
        </div>
      </div>
    );
  }

  const pasajerosNoConfirmados = pasajeros?.filter((p) => !p.confirmado) || [];
  const pasajerosConfirmados = pasajeros?.filter((p) => p.confirmado) || [];

  return (
    <div className="min-h-screen bg-bg-base pb-6">
      {/* Header Fixed */}
      <div className="sticky top-0 z-10 bg-bg-content border-b border-border px-4 py-3">
        <PageHeader
          title={`${miTransportista.nombre} ${miTransportista.apellido}`}
          subtitle={`${miTransportista.tipo_vehiculo} · ${miTransportista.chapa_vehiculo} · Capacidad: ${miTransportista.capacidad_pasajeros}`}
          showDivider={false}
        />
      </div>

      <div className="px-4 mt-4 max-w-4xl mx-auto space-y-6">
        
        {/* Formulario de Registro */}
        <div className="bg-bg-content border border-border rounded-xl p-4">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Search size={20} className="text-primary" />
            Registrar Pasajero
          </h3>
          <RegistrarPasajeroForm
            transportistaId={miTransportista.id}
            onSuccess={() => refetchPasajeros()}
          />
        </div>

        {/* Viaje Actual */}
        {pasajerosNoConfirmados.length > 0 && (
          <div className="bg-bg-content border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Truck size={20} className="text-warning" />
                Viaje Actual ({pasajerosNoConfirmados.length})
              </h3>
              <button
                onClick={() => setModalConfirmarOpen(true)}
                className="btn btn-primary px-6 py-2 text-sm"
              >
                Confirmar Viaje
              </button>
            </div>
            <TablaPasajeros pasajeros={pasajerosNoConfirmados} confirmados={false} />
          </div>
        )}

        {/* Viajes Anteriores */}
        {pasajerosConfirmados.length > 0 && (
          <div className="bg-bg-content border border-border rounded-xl p-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Truck size={20} className="text-success" />
              Viajes Anteriores ({pasajerosConfirmados.length})
            </h3>
            <TablaPasajeros pasajeros={pasajerosConfirmados} confirmados={true} />
          </div>
        )}

        {/* Estado Vacío */}
        {!isLoadingPasajeros && pasajeros?.length === 0 && (
          <div className="bg-bg-content border border-border rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck size={32} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Sin pasajeros registrados</h3>
            <p className="text-text-tertiary">
              Usa el formulario de arriba para comenzar a registrar pasajeros.
            </p>
          </div>
        )}
      </div>

      {/* Modal Confirmar Viaje */}
      <ModalConfirmarViaje
        isOpen={modalConfirmarOpen}
        onClose={() => setModalConfirmarOpen(false)}
        transportistaId={miTransportista.id}
        onSuccess={() => {
          refetchPasajeros();
          setModalConfirmarOpen(false);
        }}
      />
    </div>
  );
};

export default TransportistaOperativaPage;