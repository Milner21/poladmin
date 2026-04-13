import { useState, type FC } from 'react';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { PageHeader } from '@components';
import type { Partido } from '@dto/partido.types';
import type { CreatePartidoDto } from '@dto/partido.types';
import { usePartidos } from './hooks/usePartidos';
import { useCrearPartido } from './hooks/useCrearPartido';
import { useActualizarPartido } from './hooks/useActualizarPartido';
import { useEliminarPartido } from './hooks/useEliminarPartido';
import { PartidoFormModal } from './components/PartidoFormModal';

const PartidosPage: FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [partidoEditar, setPartidoEditar] = useState<Partido | null>(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState<Partido | null>(null);

  const { data: partidos, isLoading, refetch } = usePartidos();
  const crearMutation = useCrearPartido();
  const actualizarMutation = useActualizarPartido();
  const eliminarMutation = useEliminarPartido();

  const handleAbrir = () => {
    setPartidoEditar(null);
    setModalOpen(true);
  };

  const handleEditar = (partido: Partido) => {
    setPartidoEditar(partido);
    setModalOpen(true);
  };

  const handleCerrar = () => {
    setModalOpen(false);
    setPartidoEditar(null);
  };

  const handleSubmit = (data: CreatePartidoDto) => {
    if (partidoEditar) {
      actualizarMutation.mutate(
        { id: partidoEditar.id, data },
        { onSuccess: handleCerrar },
      );
    } else {
      crearMutation.mutate(data, { onSuccess: handleCerrar });
    }
  };

  const handleEliminar = () => {
    if (!confirmarEliminar) return;
    eliminarMutation.mutate(confirmarEliminar.id, {
      onSuccess: () => setConfirmarEliminar(null),
    });
  };

  const isPending = crearMutation.isPending || actualizarMutation.isPending;

  return (
    <div className="py-4 px-6">
      <PageHeader
        title="Partidos Politicos"
        subtitle="Gestion de partidos politicos del sistema"
        showRefresh
        onRefresh={refetch}
        isRefreshing={isLoading}
        extraContent={
          <button
            onClick={handleAbrir}
            className="
              flex items-center gap-2 px-4 py-2
              bg-primary hover:bg-primary-hover
              text-white text-sm font-medium rounded-lg
              transition-colors
            "
          >
            <Plus size={16} />
            Nuevo Partido
          </button>
        }
      />

      {isLoading && (
        <div className="flex justify-center py-10">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && partidos && partidos.length > 0 && (
        <div className="flex flex-col gap-3">
          {partidos.map((partido) => (
            <div
              key={partido.id}
              className="
                bg-bg-content border border-border rounded-xl p-5
                flex items-center justify-between
                hover:border-primary/50 transition-colors
              "
            >
              <div className="flex items-center gap-4">
                <div className="
                  w-12 h-12 rounded-full bg-primary/10
                  flex items-center justify-center
                  text-primary font-bold text-sm
                ">
                  {partido.sigla.slice(0, 3)}
                </div>

                <div>
                  <h4 className="text-base font-semibold text-text-primary m-0">
                    {partido.nombre}
                  </h4>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    Sigla: <span className="font-medium text-text-secondary">{partido.sigla}</span>
                  </p>
                  {partido.descripcion && (
                    <p className="text-xs text-text-tertiary mt-0.5">
                      {partido.descripcion}
                    </p>
                  )}
                  {partido._count && (
                    <div className="flex items-center gap-3 mt-1">
                      <span className="
                        flex items-center gap-1
                        text-xs px-2 py-0.5
                        bg-primary/10 text-primary rounded-full
                      ">
                        <Building2 size={10} />
                        {partido._count.campanas} {partido._count.campanas === 1 ? 'campana' : 'campanas'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditar(partido)}
                  className="
                    p-2 rounded-lg text-text-secondary
                    hover:bg-bg-base hover:text-primary
                    transition-colors
                  "
                  title="Editar"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setConfirmarEliminar(partido)}
                  className="
                    p-2 rounded-lg text-text-secondary
                    hover:bg-danger/10 hover:text-danger
                    transition-colors
                  "
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!partidos || partidos.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
          <p className="text-base">No hay partidos registrados</p>
          <p className="text-sm">Crea el primer partido con el boton de arriba</p>
        </div>
      )}

      <PartidoFormModal
        open={modalOpen}
        onClose={handleCerrar}
        onSubmit={handleSubmit}
        isPending={isPending}
        partidoEditar={partidoEditar}
      />

      {confirmarEliminar && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setConfirmarEliminar(null)}
          />
          <div className="
            fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            bg-bg-content border border-border rounded-xl shadow-xl
            w-full max-w-sm z-50 p-6
          ">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Eliminar partido
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              Estas seguro que queres eliminar{' '}
              <span className="font-semibold text-text-primary">
                {confirmarEliminar.nombre}
              </span>
              ? Esta accion no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmarEliminar(null)}
                className="
                  px-4 py-2 text-sm rounded-lg
                  border border-border text-text-primary
                  hover:bg-bg-base transition-colors
                "
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                disabled={eliminarMutation.isPending}
                className="
                  px-4 py-2 text-sm rounded-lg
                  bg-danger hover:bg-danger/80
                  text-white font-medium transition-colors
                  disabled:opacity-60 disabled:cursor-not-allowed
                  flex items-center gap-2
                "
              >
                {eliminarMutation.isPending && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Eliminar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PartidosPage;