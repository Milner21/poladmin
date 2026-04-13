import { PageHeader } from "@components";
import { CTable } from "@components/CTable/CTable";
import type { ColumnDef } from "@components/CTable/CTable.types";
import type { DuplicadoSimpatizante } from "@dto/simpatizante.types";
import { useAuth } from "@hooks/useAuth";
import { usePermisos } from "@hooks/usePermisos";
import {
  CheckCircle,
  Copy,
  Loader2,
  RotateCcw,
  Trash2,
  User,
} from "lucide-react";
import { useMemo, useState, type FC } from "react";
import { useDuplicadosSimpatizantes } from "../hooks/useDuplicadosSimpatizantes";
import { useEliminarDuplicado } from "../hooks/useEliminarDuplicado";
import { useRevertirResolucion } from "../hooks/useRevertirResolucion";
import { ModalGestionDuplicados } from "../lista/components/ModalGestionDuplicados";

const DuplicadosSimpatizantesPage: FC = () => {
  const { usuario } = useAuth();
  const { tienePermiso } = usePermisos();

  const { data: duplicados, isLoading } = useDuplicadosSimpatizantes();
  const eliminarDuplicadoMutation = useEliminarDuplicado();
  const revertirResolucionMutation = useRevertirResolucion();

  const [searchTerm, setSearchTerm] = useState("");
  const [simpatizanteDuplicadosId, setSimpatizanteDuplicadosId] = useState<
    string | null
  >(null);

  const puedeGestionarDuplicados = tienePermiso(
    "gestionar_duplicados_simpatizantes",
  );
  const usuarioId = usuario?.id ?? "";
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth < 1024;

  const getColorIntencion = (intencion: string): string => {
    switch (intencion) {
      case "SEGURO":
        return "bg-success text-white";
      case "PROBABLE":
        return "bg-info text-white";
      case "INDECISO":
        return "bg-warning text-white";
      case "CONTRARIO":
        return "bg-danger text-white";
      default:
        return "bg-text-tertiary text-white";
    }
  };

  const columns: ColumnDef<DuplicadoSimpatizante>[] = useMemo(() => {
    const esDueno = (record: DuplicadoSimpatizante): boolean =>
      record.simpatizante.registrado_por_id === usuarioId;

    return [
      {
        key: "nro",
        title: "#",
        render: (_record: DuplicadoSimpatizante, index?: number) => (
          <span className="text-text-tertiary text-xs">{(index ?? 0) + 1}</span>
        ),
        width: "40px",
      },
      ...(!isMobile
        ? [
            {
              key: "documento",
              title: "CI",
              render: (record: DuplicadoSimpatizante) => (
                <span className="text-sm text-text-primary">
                  {record.simpatizante.documento}
                </span>
              ),
            },
          ]
        : []),
      {
        key: "nombre_completo",
        title: "Nombre",
        render: (record: DuplicadoSimpatizante) => (
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {record.simpatizante.nombre} {record.simpatizante.apellido}
            </p>
            {isMobile && (
              <p className="text-xs text-text-tertiary">
                CI: {record.simpatizante.documento}
              </p>
            )}
          </div>
        ),
      },
      {
        key: "estado_duplicado",
        title: "Estado",
        render: (record: DuplicadoSimpatizante) =>
          esDueno(record) ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              <CheckCircle size={10} />
              Tuyo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-danger/10 text-danger border border-danger/20">
              <Copy size={10} />
              Duplicado
            </span>
          ),
      },
      ...(puedeGestionarDuplicados && !isMobile
        ? [
            {
              key: "registrador_original",
              title: "Registrado por",
              render: (record: DuplicadoSimpatizante) => (
                <span className="text-sm text-text-secondary">
                  {record.registrador_original.nombre}{" "}
                  {record.registrador_original.apellido}
                </span>
              ),
            },
          ]
        : []),
      ...(!isTablet
        ? [
            {
              key: "fecha_intento",
              title: "Fecha",
              render: (record: DuplicadoSimpatizante) => (
                <span className="text-sm text-text-tertiary">
                  {new Date(record.fecha_intento).toLocaleDateString("es-PY", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              ),
            },
            {
              key: "intencion",
              title: "Intencion",
              render: (record: DuplicadoSimpatizante) => (
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getColorIntencion(record.simpatizante.intencion_voto)}`}
                >
                  {record.simpatizante.intencion_voto}
                </span>
              ),
            },
          ]
        : []),
      {
        key: "acciones",
        title: "Acciones",
        width: "120px",
        render: (record: DuplicadoSimpatizante) => {
          const esDuenoActual = esDueno(record);
          const yaResuelto = record.es_dueno_confirmado;
          const puedeEliminar =
            !esDuenoActual || (esDuenoActual && !yaResuelto);

          return (
            <div className="flex items-center gap-1">
              {puedeEliminar && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    eliminarDuplicadoMutation.mutate(record.id);
                  }}
                  disabled={eliminarDuplicadoMutation.isPending}
                  className="p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
                  title="Eliminar de mi lista"
                >
                  {eliminarDuplicadoMutation.variables === record.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              )}

              {puedeGestionarDuplicados && !esDuenoActual && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSimpatizanteDuplicadosId(record.simpatizante.id);
                  }}
                  className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                  title="Gestionar duplicados"
                >
                  <User size={14} />
                </button>
              )}

              {puedeGestionarDuplicados && yaResuelto && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    revertirResolucionMutation.mutate(record.id);
                  }}
                  disabled={revertirResolucionMutation.isPending}
                  className="p-1.5 rounded-lg text-warning hover:bg-warning/10 transition-colors disabled:opacity-50"
                  title="Revertir resolucion"
                >
                  {revertirResolucionMutation.variables === record.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <RotateCcw size={14} />
                  )}
                </button>
              )}
            </div>
          );
        },
      },
    ];
  }, [
    usuarioId,
    puedeGestionarDuplicados,
    eliminarDuplicadoMutation,
    revertirResolucionMutation,
    isMobile,
    isTablet,
  ]);

  const totalDuplicados = duplicados?.length ?? 0;
  const propios =
    duplicados?.filter((d) => d.simpatizante.registrado_por_id === usuarioId)
      .length ?? 0;
  const ajenos = totalDuplicados - propios;

  return (
    <div className="py-4 px-6">
      <PageHeader
        title="Duplicados de Simpatizantes"
        subtitle="Gestion de intentos de registro duplicado en tu red"
        showDivider
      />

      <div className="grid grid-cols-3 gap-3 mb-6 max-w-lg">
        <div className="bg-bg-content border border-border rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Copy size={14} className="text-warning" />
            <p className="text-xs text-text-tertiary">Total</p>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {totalDuplicados}
          </p>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={14} className="text-primary" />
            <p className="text-xs text-text-tertiary">Tuyos</p>
          </div>
          <p className="text-2xl font-bold text-primary">{propios}</p>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Copy size={14} className="text-danger" />
            <p className="text-xs text-text-tertiary">Duplicados</p>
          </div>
          <p className="text-2xl font-bold text-danger">{ajenos}</p>
        </div>
      </div>

      {totalDuplicados === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-tertiary">
          <CheckCircle size={48} className="mb-4 opacity-30 text-success" />
          <p className="text-sm font-medium">Sin duplicados pendientes</p>
          <p className="text-xs mt-1">
            No hay intentos de registro duplicado en tu red
          </p>
        </div>
      ) : (
        <div className="bg-warning/5 border border-warning/20 rounded-xl overflow-hidden">
          <div className="bg-warning/10 px-4 py-3 border-b border-warning/20">
            <p className="text-sm text-text-secondary">
              El badge{" "}
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                Tuyo
              </span>{" "}
              indica que el simpatizante te pertenece. El badge{" "}
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-danger/10 text-danger border border-danger/20">
                Duplicado
              </span>{" "}
              indica que ya fue registrado por otro usuario.
            </p>
          </div>

          <CTable<DuplicadoSimpatizante>
            data={duplicados ?? []}
            columns={columns}
            rowKey="id"
            loading={isLoading}
            searchable
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            pagination={true}
            defaultPageSize={25}
          />
        </div>
      )}

      <ModalGestionDuplicados
        isOpen={!!simpatizanteDuplicadosId}
        simpatizanteId={simpatizanteDuplicadosId}
        onClose={() => setSimpatizanteDuplicadosId(null)}
      />
    </div>
  );
};

export default DuplicadosSimpatizantesPage;