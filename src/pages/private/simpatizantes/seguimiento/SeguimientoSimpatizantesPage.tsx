import { PageHeader } from "@components";
import { CTable } from "@components/CTable/CTable";
import type { ColumnDef } from "@components/CTable/CTable.types";
import type { Simpatizante } from "@dto/simpatizante.types";
import { usePermisos } from "@hooks/usePermisos";
import { Phone, TrendingUp, Users, UserCheck } from "lucide-react";
import { useCallback, useMemo, useState, type FC } from "react";
import { useActualizarIntencionVoto } from "../hooks/useActualizarIntencionVoto";
import { useSimpatizantes } from "../hooks/useSimpatizantes";
import {
  HistorialContactos,
  ModalContacto,
} from "../lista/components";

const SeguimientoSimpatizantesPage: FC = () => {
  const { tienePermiso } = usePermisos();

  const { data: simpatizantes, isLoading } = useSimpatizantes(false);
  const actualizarIntencionMutation = useActualizarIntencionVoto();

  const [searchTerm, setSearchTerm] = useState("");
  const [simpatizanteSeleccionado, setSimpatizanteSeleccionado] =
    useState<Simpatizante | null>(null);
  const [modalContactoOpen, setModalContactoOpen] = useState(false);
  const [historialOpen, setHistorialOpen] = useState(false);

  const puedeEditarIntencion = tienePermiso("actualizar_intencion_voto");
  const puedeSeguimiento = tienePermiso("registrar_seguimiento_simpatizante");

  const isMobile = window.innerWidth < 768;

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

  const handleIntencionChange = useCallback(
    (id: string, nuevaIntencion: string) => {
      actualizarIntencionMutation.mutate({ id, intencion_voto: nuevaIntencion });
    },
    [actualizarIntencionMutation],
  );

  const handleAbrirContacto = useCallback((simpatizante: Simpatizante) => {
    setSimpatizanteSeleccionado(simpatizante);
    setModalContactoOpen(true);
  }, []);

  const handleAbrirHistorial = useCallback((simpatizante: Simpatizante) => {
    setSimpatizanteSeleccionado(simpatizante);
    setHistorialOpen(true);
  }, []);

  const handleNuevoDesdeHistorial = useCallback(() => {
    setHistorialOpen(false);
    setModalContactoOpen(true);
  }, []);

  const stats = useMemo(
    () => ({
      total: simpatizantes?.length ?? 0,
      seguros:
        simpatizantes?.filter((s) => s.intencion_voto === "SEGURO").length ?? 0,
      probables:
        simpatizantes?.filter((s) => s.intencion_voto === "PROBABLE").length ??
        0,
      indecisos:
        simpatizantes?.filter((s) => s.intencion_voto === "INDECISO").length ??
        0,
      contrarios:
        simpatizantes?.filter((s) => s.intencion_voto === "CONTRARIO").length ??
        0,
    }),
    [simpatizantes],
  );

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
          ]
        : []),
      {
        key: "intencion_voto",
        title: "Intencion",
        render: (record: Simpatizante) =>
          puedeEditarIntencion ? (
            <select
              value={record.intencion_voto}
              onChange={(e) =>
                handleIntencionChange(record.id, e.target.value)
              }
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
        width: "100px",
        render: (record: Simpatizante) => (
          <div className="flex items-center gap-1">
            {puedeSeguimiento && (
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
            )}
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
    ],
    [
      puedeEditarIntencion,
      puedeSeguimiento,
      actualizarIntencionMutation.isPending,
      handleIntencionChange,
      handleAbrirContacto,
      handleAbrirHistorial,
      isMobile,
    ],
  );

  const getPorcentaje = (valor: number): string => {
    if (stats.total === 0) return "0";
    return ((valor / stats.total) * 100).toFixed(1);
  };

  return (
    <div className="py-4 px-6">
      <PageHeader
        title="Seguimiento de Simpatizantes"
        subtitle="Registra contactos y actualiza la intencion de voto de tu red"
        showDivider
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-bg-content border border-border rounded-xl p-3 md:p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-primary" />
            <p className="text-xs text-text-tertiary">Total</p>
          </div>
          <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
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
          <p className="text-2xl font-bold text-success">{stats.seguros}</p>
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
              <TrendingUp size={14} className="text-warning" />
              <p className="text-xs text-text-tertiary">Indecisos</p>
            </div>
            <span className="text-xs text-warning font-medium">
              {getPorcentaje(stats.indecisos)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-warning">{stats.indecisos}</p>
          <div className="w-full bg-bg-base rounded-full h-1.5 mt-2">
            <div
              className="bg-warning h-1.5 rounded-full transition-all"
              style={{ width: `${getPorcentaje(stats.indecisos)}%` }}
            />
          </div>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-3 md:p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-danger" />
              <p className="text-xs text-text-tertiary">Contrarios</p>
            </div>
            <span className="text-xs text-danger font-medium">
              {getPorcentaje(stats.contrarios)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-danger">{stats.contrarios}</p>
          <div className="w-full bg-bg-base rounded-full h-1.5 mt-2">
            <div
              className="bg-danger h-1.5 rounded-full transition-all"
              style={{ width: `${getPorcentaje(stats.contrarios)}%` }}
            />
          </div>
        </div>
      </div>

      <CTable<Simpatizante>
        data={simpatizantes ?? []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        searchable
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        pagination={true}
        defaultPageSize={25}
      />

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
    </div>
  );
};

export default SeguimientoSimpatizantesPage;