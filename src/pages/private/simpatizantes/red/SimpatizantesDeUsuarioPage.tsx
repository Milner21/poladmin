import { PageHeader } from "@components";
import { CTable } from "@components/CTable/CTable";
import type { ColumnDef } from "@components/CTable/CTable.types";
import type { Simpatizante } from "@dto/simpatizante.types";
import { usePermisos } from "@hooks/usePermisos";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  UserPlus,
  UserX,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FC,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEliminarSimpatizante } from "../hooks/useEliminarSimpatizante";
import { useSimpatizantesPorUsuario } from "../hooks/useSimpatizantesPorUsuario";
import { ModalEditarSimpatizante } from "../lista/components/ModalEditarSimpatizante";
import CrearSimpatizante from "../crear/CrearSimpatizante";
import RoutesConfig from "@routes/RoutesConfig";

const SimpatizantesDeUsuarioPage: FC = () => {
  const { usuarioId } = useParams<{ usuarioId: string }>();
  const navigate = useNavigate();
  const { tienePermiso } = usePermisos();

  const { data, isLoading, refetch } = useSimpatizantesPorUsuario(usuarioId ?? null);
  const eliminarMutation = useEliminarSimpatizante();

  const [searchTerm, setSearchTerm] = useState("");
  const [simpatizanteAEditar, setSimpatizanteAEditar] =
    useState<Simpatizante | null>(null);
  const [confirmandoEliminarId, setConfirmandoEliminarId] = useState<
    string | null
  >(null);
  const [panelRegistroAbierto, setPanelRegistroAbierto] = useState(false);

  const puedeEditar = tienePermiso("editar_simpatizante");
  const puedeEliminar = tienePermiso("eliminar_simpatizante");
  const puedeRegistrarEnRed = tienePermiso("registrar_simpatizante_en_red");

  const isMobile = window.innerWidth < 768;

  // Bloquear scroll del body cuando el panel esta abierto
  useEffect(() => {
    if (panelRegistroAbierto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [panelRegistroAbierto]);

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

  const handleEliminar = useCallback(
    (id: string) => {
      if (confirmandoEliminarId === id) {
        eliminarMutation.mutate(id, {
          onSuccess: () => setConfirmandoEliminarId(null),
        });
      } else {
        setConfirmandoEliminarId(id);
      }
    },
    [confirmandoEliminarId, eliminarMutation],
  );

  const handlePanelCerrar = useCallback(() => {
    setPanelRegistroAbierto(false);
    void refetch();
  }, [refetch]);

  const columns: ColumnDef<Simpatizante>[] = useMemo(
    () => [
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
              <p className="text-xs text-text-tertiary">
                CI: {record.documento}
              </p>
            )}
          </div>
        ),
      },
      ...(!isMobile
        ? [
            {
              key: "telefono",
              title: "Telefono",
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
            {
              key: "barrio",
              title: "Barrio",
              render: (record: Simpatizante) => (
                <span className="text-sm text-text-primary truncate max-w-32 block">
                  {record.barrio ?? "-"}
                </span>
              ),
            },
          ]
        : []),
      {
        key: "intencion_voto",
        title: "Intencion",
        render: (record: Simpatizante) => (
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getColorIntencion(record.intencion_voto)}`}
          >
            {record.intencion_voto}
          </span>
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
                  <span className="text-success">
                    <MapPin size={16} />
                  </span>
                ) : (
                  <span className="text-text-tertiary">-</span>
                ),
            },
          ]
        : []),
      {
        key: "acciones",
        title: "Acciones",
        width: "100px",
        render: (record: Simpatizante) => (
          <div className="flex items-center gap-1">
            {puedeEditar && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSimpatizanteAEditar(record);
                }}
                className="p-1.5 rounded-lg text-warning hover:bg-warning/10 transition-colors"
                title="Editar"
              >
                <Pencil size={14} />
              </button>
            )}
            {puedeEliminar && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEliminar(record.id);
                }}
                disabled={eliminarMutation.isPending}
                className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                  confirmandoEliminarId === record.id
                    ? "text-white bg-danger hover:bg-danger/90"
                    : "text-danger hover:bg-danger/10"
                }`}
                title={
                  confirmandoEliminarId === record.id
                    ? "Confirmar eliminacion"
                    : "Eliminar"
                }
              >
                {eliminarMutation.isPending &&
                eliminarMutation.variables === record.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            )}
          </div>
        ),
      },
    ],
    [
      puedeEditar,
      puedeEliminar,
      eliminarMutation.isPending,
      eliminarMutation.variables,
      confirmandoEliminarId,
      isMobile,
      handleEliminar,
    ],
  );

  const usuario = data?.usuario;
  const simpatizantes = data?.simpatizantes ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="py-4 px-6">
        <div className="flex flex-col items-center justify-center py-20 text-text-tertiary">
          <UserX size={48} className="mb-4 opacity-30" />
          <p className="text-sm">Usuario no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="py-4 px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(RoutesConfig.simpatizantesRed)}
            className="p-2 rounded-lg border border-border hover:bg-bg-hover transition-colors"
            title="Volver a la red"
          >
            <ArrowLeft size={18} className="text-text-primary" />
          </button>
          <PageHeader
            title={`Simpatizantes de ${usuario.nombre} ${usuario.apellido}`}
            subtitle={`@${usuario.username} — ${usuario.perfil.es_operativo ? "Operativo" : (usuario.nivel?.nombre ?? "Sin nivel")}`}
            showDivider={false}
          />
        </div>

        <div className="border-b border-border mb-6" />

        {/* Stats y boton */}
        <div className="flex items-center justify-between mb-6">
          <div className="bg-bg-content border border-border rounded-xl p-3 min-w-32">
            <p className="text-xs text-text-tertiary mb-1">
              Total simpatizantes
            </p>
            <p className="text-2xl font-bold text-primary">{data?.total ?? 0}</p>
          </div>

          {puedeRegistrarEnRed && (
            <button
              onClick={() => setPanelRegistroAbierto(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-sm font-medium text-sm"
            >
              <UserPlus size={16} />
              Registrar simpatizante
            </button>
          )}
        </div>

        <CTable<Simpatizante>
          data={simpatizantes}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          searchable
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          pagination={true}
          defaultPageSize={25}
        />

        <ModalEditarSimpatizante
          isOpen={!!simpatizanteAEditar}
          simpatizante={simpatizanteAEditar}
          onClose={() => setSimpatizanteAEditar(null)}
        />
      </div>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          panelRegistroAbierto
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={handlePanelCerrar}
      />

      {/* Panel deslizable */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-lg bg-bg-content shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          panelRegistroAbierto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header del panel */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-bg-base shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
              <UserPlus size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Registrar simpatizante
              </p>
              <p className="text-xs text-text-tertiary">
                Para {usuario.nombre} {usuario.apellido}
              </p>
            </div>
          </div>
          <button
            onClick={handlePanelCerrar}
            className="p-2 rounded-lg hover:bg-bg-hover transition-colors text-text-tertiary hover:text-text-primary"
          >
            <X size={18} />
          </button>
        </div>

        {/* Indicador del usuario destino */}
        <div className="px-6 py-3 bg-primary/5 border-b border-primary/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-xs text-text-secondary">
              El simpatizante quedara asignado a{" "}
              <span className="font-semibold text-primary">
                @{usuario.username}
              </span>
            </p>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <CrearSimpatizante
              embebido
              candidatoId={usuarioId}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default SimpatizantesDeUsuarioPage;