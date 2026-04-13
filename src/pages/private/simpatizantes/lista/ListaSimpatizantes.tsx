import { CTable, PageHeader } from "@components";
import type { ColumnDef } from "@components/CTable/CTable.types";
import type {
  DuplicadoSimpatizante,
  Simpatizante,
} from "@dto/simpatizante.types";
import { useAuth } from "@hooks/useAuth";
import { useCampanaSeleccionada } from "@hooks/useCampanaSeleccionada";
import { usePermisos } from "@hooks/usePermisos";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  RotateCcw,
  Trash2,
  TrendingUp,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import { useCallback, useMemo, useState, type FC } from "react";
import { useActualizarIntencionVoto } from "../hooks/useActualizarIntencionVoto";
import { useDuplicadosSimpatizantes } from "../hooks/useDuplicadosSimpatizantes";
import { useEliminarDuplicado } from "../hooks/useEliminarDuplicado";
import { useRevertirResolucion } from "../hooks/useRevertirResolucion";
import { useSimpatizantes } from "../hooks/useSimpatizantes";
import { ModalEditarSimpatizante } from "./components";
import {
  HistorialContactos,
  ModalContacto,
  ModalGestionDuplicados,
} from "./components";

const ListaSimpatizantes: FC = () => {
  const { usuario } = useAuth();
  const { campanaActual } = useCampanaSeleccionada();
  const { tienePermiso } = usePermisos();
  const { data: duplicados, isLoading: isLoadingDuplicados } =
    useDuplicadosSimpatizantes();
  const actualizarIntencionMutation = useActualizarIntencionVoto();
  const eliminarDuplicadoMutation = useEliminarDuplicado();
  const revertirResolucionMutation = useRevertirResolucion();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermDuplicados, setSearchTermDuplicados] = useState("");
  const [duplicadosExpandidos, setDuplicadosExpandidos] = useState(true);
  const [simpatizanteSeleccionado, setSimpatizanteSeleccionado] =
    useState<Simpatizante | null>(null);
  const [modalContactoOpen, setModalContactoOpen] = useState(false);
  const [historialOpen, setHistorialOpen] = useState(false);
  const [simpatizanteDuplicadosId, setSimpatizanteDuplicadosId] = useState<
    string | null
  >(null);
  const [simpatizanteAEditar, setSimpatizanteAEditar] =
    useState<Simpatizante | null>(null);
  const puedeEditarIntencion = tienePermiso("actualizar_intencion_voto");
  const puedeGestionarDuplicados = tienePermiso(
    "gestionar_duplicados_simpatizantes",
  );
  const puedeEditar = tienePermiso("editar_simpatizante");
  const usuarioId = usuario?.id ?? "";
  const [pestanaActiva, setPestanaActiva] = useState<"propios" | "red">(
    "red",
  );
  const puedeVerRed = tienePermiso("ver_lista_simpatizantes");
  const { data: simpatizantes, isLoading } = useSimpatizantes(
    pestanaActiva === "propios",
  );

  const handleAbrirContacto = (simpatizante: Simpatizante) => {
    setSimpatizanteSeleccionado(simpatizante);
    setModalContactoOpen(true);
  };

  const handleAbrirHistorial = (simpatizante: Simpatizante) => {
    setSimpatizanteSeleccionado(simpatizante);
    setHistorialOpen(true);
  };

  const handleNuevoDesdeHistorial = () => {
    setHistorialOpen(false);
    setModalContactoOpen(true);
  };

  const handleIntencionChange = useCallback(
    (id: string, nuevaIntencion: string) => {
      actualizarIntencionMutation.mutate({
        id,
        intencion_voto: nuevaIntencion,
      });
    },
    [actualizarIntencionMutation],
  );

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

  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth < 1024;

  const columns: ColumnDef<Simpatizante>[] = useMemo(() => {
    const cols: ColumnDef<Simpatizante>[] = [
      {
        key: "nro",
        title: "#",
        render: (_record: Simpatizante, index?: number) => (
          <span className="text-text-tertiary text-xs">{(index ?? 0) + 1}</span>
        ),
        width: "40px",
      },
      ...(!isMobile
        ? [
            {
              key: "documento",
              title: "CI",
              dataIndex: "documento" as keyof Simpatizante,
              sortable: true,
            },
          ]
        : []),
      {
        key: "nombre_completo",
        title: "Nombre",
        sortable: true,
        render: (record: Simpatizante) => (
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {record.nombre} {record.apellido}
            </p>
            {isMobile && (
              <div>
                <p className="text-xs text-text-tertiary">
                  CI: {record.documento}
                </p>
                {record.barrio && (
                  <p className="text-xs text-text-tertiary flex items-center gap-1">
                    <MapPin size={10} />
                    {record.barrio}
                  </p>
                )}
              </div>
            )}
          </div>
        ),
      },
      ...(!isMobile
        ? [
            {
              key: "telefono",
              title: "Teléfono",
              render: (record: Simpatizante) =>
                record.telefono ? (
                  <a
                    href={`tel:${record.telefono}`}
                    className="text-primary hover:underline flex items-center gap-1 text-sm"
                  >
                    <Phone size={12} />
                    {record.telefono}
                  </a>
                ) : (
                  <span className="text-text-tertiary text-sm">-</span>
                ),
            },
          ]
        : []),
      ...(!isTablet
        ? [
            {
              key: "barrio",
              title: "Barrio",
              render: (record: Simpatizante) => (
                <span className="text-sm text-text-primary truncate max-w-32 block">
                  {record.barrio || "-"}
                </span>
              ),
            },
          ]
        : []),
      ...(!isTablet
        ? [
            {
              key: "afiliado",
              title: "Afiliado",
              render: (record: Simpatizante) => (
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${record.es_afiliado ? "bg-success/10 text-success" : "bg-bg-base text-text-tertiary"}`}
                >
                  {record.es_afiliado ? "Sí" : "No"}
                </span>
              ),
            },
          ]
        : []),
      {
        key: "intencion_voto",
        title: "Intención",
        render: (record: Simpatizante) =>
          puedeEditarIntencion ? (
            <select
              value={record.intencion_voto}
              onChange={(e) => handleIntencionChange(record.id, e.target.value)}
              disabled={actualizarIntencionMutation.isPending}
              className={`text-xs px-2 py-1 rounded font-medium cursor-pointer border-0 focus:ring-2 focus:ring-primary ${getColorIntencion(record.intencion_voto)} disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto`}
            >
              <option value="SEGURO">SEGURO</option>
              <option value="PROBABLE">PROBABLE</option>
              <option value="INDECISO">INDECISO</option>
              <option value="CONTRARIO">CONTRARIO</option>
            </select>
          ) : (
            <span
              className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getColorIntencion(record.intencion_voto)}`}
            >
              {record.intencion_voto}
            </span>
          ),
      },
      {
        key: "acciones",
        title: "Acciones",
        width: "120px",
        render: (record: Simpatizante) => (
          <div className="flex items-center gap-1">
            {puedeEditar && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSimpatizanteAEditar(record);
                }}
                className="p-1.5 rounded-lg text-warning hover:bg-warning/10 transition-colors"
                title="Editar simpatizante"
              >
                <Pencil size={14} />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAbrirContacto(record);
              }}
              className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
              title="Registrar contacto"
            >
              <Phone size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAbrirHistorial(record);
              }}
              className="p-1.5 rounded-lg text-text-secondary hover:bg-bg-hover transition-colors"
              title="Ver historial"
            >
              <TrendingUp size={14} />
            </button>
          </div>
        ),
      },
      ...(!isMobile
        ? [
            {
              key: "gps",
              title: "GPS",
              width: "50px",
              render: (record: Simpatizante) =>
                record.latitud && record.longitud ? (
                  <span
                    className="text-success"
                    title={`${record.latitud.toFixed(4)}, ${record.longitud.toFixed(4)}`}
                  >
                    <MapPin size={16} />
                  </span>
                ) : (
                  <span className="text-text-tertiary">-</span>
                ),
            },
          ]
        : []),
    ];

    return cols;
  }, [
    puedeEditarIntencion,
    puedeEditar,
    actualizarIntencionMutation.isPending,
    handleIntencionChange,
    isMobile,
    isTablet,
  ]);

  const columnsDuplicados: ColumnDef<DuplicadoSimpatizante>[] = useMemo(() => {
    const esDueno = (record: DuplicadoSimpatizante): boolean =>
      record.simpatizante.registrado_por_id === usuarioId;

    const cols: ColumnDef<DuplicadoSimpatizante>[] = [
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
          ]
        : []),
      ...(!isTablet
        ? [
            {
              key: "intencion",
              title: "Intención",
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
                  title="Revertir resolución"
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

    return cols;
  }, [
    usuarioId,
    puedeGestionarDuplicados,
    eliminarDuplicadoMutation,
    revertirResolucionMutation,
    isMobile,
    isTablet,
  ]);

  const stats = useMemo(
    () => ({
      total: simpatizantes?.length || 0,
      seguros:
        simpatizantes?.filter((s) => s.intencion_voto === "SEGURO").length || 0,
      probables:
        simpatizantes?.filter((s) => s.intencion_voto === "PROBABLE").length ||
        0,
      indecisos:
        simpatizantes?.filter((s) => s.intencion_voto === "INDECISO").length ||
        0,
      contrarios:
        simpatizantes?.filter((s) => s.intencion_voto === "CONTRARIO").length ||
        0,
    }),
    [simpatizantes],
  );

  const getPorcentaje = (valor: number): string => {
    if (stats.total === 0) return "0";
    return ((valor / stats.total) * 100).toFixed(1);
  };

  const tieneDuplicados = (duplicados?.length ?? 0) > 0;

  return (
    <div className="py-4 px-6">
      <PageHeader
        title={
          campanaActual
            ? `Simpatizantes — ${campanaActual.nombre}`
            : "Simpatizantes"
        }
        subtitle="Gestiona y actualiza la intención de voto"
        showDivider
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
        <div className="bg-bg-content border border-border rounded-xl p-3 md:p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-primary" />
            <p className="text-xs text-text-tertiary">Total</p>
          </div>
          <p className="text-xl md:text-2xl font-bold text-text-primary">
            {stats.total}
          </p>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-3 md:p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <UserCheck size={14} className="text-success" />
              <p className="text-xs text-text-tertiary">Seguros</p>
            </div>
            <span className="text-xs text-success font-medium">
              {getPorcentaje(stats.seguros)}%
            </span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-success">
            {stats.seguros}
          </p>
          <div className="w-full bg-bg-base rounded-full h-1.5 mt-2">
            <div
              className="bg-success h-1.5 rounded-full transition-all"
              style={{ width: `${getPorcentaje(stats.seguros)}%` }}
            />
          </div>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-3 md:p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-info" />
              <p className="text-xs text-text-tertiary">Probables</p>
            </div>
            <span className="text-xs text-info font-medium">
              {getPorcentaje(stats.probables)}%
            </span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-info">
            {stats.probables}
          </p>
          <div className="w-full bg-bg-base rounded-full h-1.5 mt-2">
            <div
              className="bg-info h-1.5 rounded-full transition-all"
              style={{ width: `${getPorcentaje(stats.probables)}%` }}
            />
          </div>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-3 md:p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-warning" />
              <p className="text-xs text-text-tertiary">Indecisos</p>
            </div>
            <span className="text-xs text-warning font-medium">
              {getPorcentaje(stats.indecisos)}%
            </span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-warning">
            {stats.indecisos}
          </p>
          <div className="w-full bg-bg-base rounded-full h-1.5 mt-2">
            <div
              className="bg-warning h-1.5 rounded-full transition-all"
              style={{ width: `${getPorcentaje(stats.indecisos)}%` }}
            />
          </div>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-3 md:p-4 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-danger" />
              <p className="text-xs text-text-tertiary">Contrarios</p>
            </div>
            <span className="text-xs text-danger font-medium">
              {getPorcentaje(stats.contrarios)}%
            </span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-danger">
            {stats.contrarios}
          </p>
          <div className="w-full bg-bg-base rounded-full h-1.5 mt-2">
            <div
              className="bg-danger h-1.5 rounded-full transition-all"
              style={{ width: `${getPorcentaje(stats.contrarios)}%` }}
            />
          </div>
        </div>
      </div>

      {puedeVerRed && (
        <div className="flex gap-1 p-1 bg-bg-base rounded-lg w-fit mb-4">
          <button
            type="button"
            onClick={() => setPestanaActiva("propios")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              pestanaActiva === "propios"
                ? "bg-primary text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Mis registros
          </button>
          <button
            type="button"
            onClick={() => setPestanaActiva("red")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              pestanaActiva === "red"
                ? "bg-primary text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Red
          </button>
        </div>
      )}

      <CTable<Simpatizante>
        data={simpatizantes || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        searchable={true}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        pagination={true}
        defaultPageSize={25}
      />

      {tieneDuplicados && (
        <div className="mt-8">
          <button
            onClick={() => setDuplicadosExpandidos(!duplicadosExpandidos)}
            className="w-full flex items-center justify-between px-4 py-3 bg-warning/10 border border-warning/30 rounded-xl hover:bg-warning/20 transition-colors mb-2"
          >
            <div className="flex items-center gap-2">
              <Copy size={18} className="text-warning" />
              <span className="font-semibold text-text-primary">
                Intentos de registro duplicado
              </span>
              <span className="px-2 py-0.5 bg-warning text-white text-xs font-bold rounded-full">
                {duplicados?.length ?? 0}
              </span>
            </div>
            {duplicadosExpandidos ? (
              <ChevronUp size={18} className="text-text-tertiary" />
            ) : (
              <ChevronDown size={18} className="text-text-tertiary" />
            )}
          </button>

          {duplicadosExpandidos && (
            <div className="border border-warning/20 rounded-xl overflow-hidden">
              <div className="bg-warning/5 px-4 py-3 border-b border-warning/20">
                <p className="text-sm text-text-secondary">
                  Estas personas ya estaban registradas en la campaña. El badge{" "}
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
                data={duplicados || []}
                columns={columnsDuplicados}
                rowKey="id"
                loading={isLoadingDuplicados}
                searchable={true}
                searchValue={searchTermDuplicados}
                onSearchChange={setSearchTermDuplicados}
                pagination={true}
                defaultPageSize={10}
              />
            </div>
          )}
        </div>
      )}

      {simpatizanteSeleccionado && (
        <ModalContacto
          isOpen={modalContactoOpen}
          onClose={() => {
            setModalContactoOpen(false);
            setSimpatizanteSeleccionado(null);
          }}
          simpatizante={simpatizanteSeleccionado}
        />
      )}

      {simpatizanteSeleccionado && (
        <HistorialContactos
          isOpen={historialOpen}
          onClose={() => {
            setHistorialOpen(false);
            setSimpatizanteSeleccionado(null);
          }}
          simpatizante={simpatizanteSeleccionado}
          onNuevoContacto={handleNuevoDesdeHistorial}
        />
      )}
      <ModalGestionDuplicados
        isOpen={!!simpatizanteDuplicadosId}
        simpatizanteId={simpatizanteDuplicadosId}
        onClose={() => setSimpatizanteDuplicadosId(null)}
      />
      <ModalEditarSimpatizante
        isOpen={!!simpatizanteAEditar}
        simpatizante={simpatizanteAEditar}
        onClose={() => setSimpatizanteAEditar(null)}
      />
    </div>
  );
};

export default ListaSimpatizantes;
