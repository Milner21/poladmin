import { useState, type FC } from "react";
import { Plus, Pencil, Trash2, Users, Shield } from "lucide-react";
import { PageHeader } from "@components";
import type { Nivel, CreateNivelDto } from "@dto/nivel.types";
import { useNiveles } from "./hooks/useNiveles";
import { useCrearNivel } from "./hooks/useCrearNivel";
import { useActualizarNivel } from "./hooks/useActualizarNivel";
import { useEliminarNivel } from "./hooks/useEliminarNivel";
import { NivelFormModal } from "./components/NivelFormModal";

const Niveles: FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [nivelEditar, setNivelEditar] = useState<Nivel | null>(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState<Nivel | null>(
    null,
  );

  const { data: niveles, isLoading, refetch } = useNiveles();
  const crearMutation = useCrearNivel();
  const actualizarMutation = useActualizarNivel();
  const eliminarMutation = useEliminarNivel();

  const handleAbrir = () => {
    setNivelEditar(null);
    setModalOpen(true);
  };

  const handleEditar = (nivel: Nivel) => {
    setNivelEditar(nivel);
    setModalOpen(true);
  };

  const handleCerrar = () => {
    setModalOpen(false);
    setNivelEditar(null);
  };

  const handleSubmit = (data: CreateNivelDto) => {
    if (nivelEditar) {
      actualizarMutation.mutate(
        { id: nivelEditar.id, data },
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
        title="Niveles Jerárquicos"
        subtitle="Gestiona los niveles políticos del sistema"
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
            Nuevo Nivel
          </button>
        }
      />

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-10">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Grid de niveles */}
      {!isLoading && niveles && (
        <div className="flex flex-col gap-3">
          {niveles
            .sort((a, b) => a.orden - b.orden)
            .map((nivel) => (
              <div
                key={nivel.id}
                className="
                  bg-bg-content border border-border rounded-xl p-5
                  flex items-center justify-between
                  hover:border-primary/50 transition-colors
                "
              >
                <div className="flex items-center gap-4">
                  {/* Orden badge */}
                  <div
                    className="
                    w-10 h-10 rounded-full bg-primary/10
                    flex items-center justify-center
                    text-primary font-bold text-lg
                  "
                  >
                    {nivel.orden}
                  </div>

                  <div>
                    <h4 className="text-base font-semibold text-text-primary m-0">
                      {nivel.nombre}
                    </h4>
                    {nivel.descripcion && (
                      <p className="text-xs text-text-tertiary mt-0.5">
                        {nivel.descripcion}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {nivel.permite_operadores && (
                        <span
                          className="
      flex items-center gap-1
      text-xs px-2 py-0.5
      bg-success/10 text-success rounded-full
    "
                        >
                          <Users size={10} />
                          Permite operativos
                        </span>
                      )}
                      {nivel.exclusivo_root && (
                        <span
                          className="
      flex items-center gap-1
      text-xs px-2 py-0.5
      bg-warning/10 text-warning rounded-full
      font-medium
    "
                        >
                          <Shield size={10} />
                          Exclusivo ROOT
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditar(nivel)}
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
                    onClick={() => setConfirmarEliminar(nivel)}
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

      {/* Sin niveles */}
      {!isLoading && (!niveles || niveles.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
          <p className="text-base">No hay niveles registrados</p>
          <p className="text-sm">Creá el primer nivel con el botón de arriba</p>
        </div>
      )}

      {/* Modal crear/editar */}
      <NivelFormModal
        open={modalOpen}
        onClose={handleCerrar}
        onSubmit={handleSubmit}
        isPending={isPending}
        nivelEditar={nivelEditar}
      />

      {/* Modal confirmar eliminar */}
      {confirmarEliminar && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setConfirmarEliminar(null)}
          />
          <div
            className="
            fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            bg-bg-content border border-border rounded-xl shadow-xl
            w-full max-w-sm z-50 p-6
          "
          >
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              ¿Eliminar nivel?
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              ¿Estás seguro que querés eliminar{" "}
              <span className="font-semibold text-text-primary">
                {confirmarEliminar.nombre}
              </span>
              ? Esta acción no se puede deshacer.
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

export default Niveles;
