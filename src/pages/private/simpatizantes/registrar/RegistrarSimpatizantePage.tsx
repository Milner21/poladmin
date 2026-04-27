import { PageHeader } from "@components";
import type { ColumnDef } from "@components/CTable/CTable.types";
import { CTable } from "@components/CTable/CTable";
import type { Simpatizante } from "@dto/simpatizante.types";
import { usePermisos } from "@hooks/usePermisos";
import { Pencil, Trash2, Loader2, Phone, MapPin } from "lucide-react";
import { useState, useMemo, useCallback, type FC } from "react";
import { useSimpatizantes } from "../hooks/useSimpatizantes";
import { useEliminarSimpatizante } from "../hooks/useEliminarSimpatizante";
import { ModalEditarSimpatizante } from "../lista/components/ModalEditarSimpatizante";
import CrearSimpatizante from "../crear/CrearSimpatizante";

const RegistrarSimpatizantePage: FC = () => {
  const { tienePermiso } = usePermisos();
  const { data: simpatizantes, isLoading } = useSimpatizantes(true);
  const eliminarMutation = useEliminarSimpatizante();
  const [searchTerm, setSearchTerm] = useState("");
  const [simpatizanteAEditar, setSimpatizanteAEditar] =
    useState<Simpatizante | null>(null);
  const [confirmandoEliminarId, setConfirmandoEliminarId] = useState<
    string | null
  >(null);

  const puedeEditar = tienePermiso("editar_simpatizante");
  const puedeEliminar = tienePermiso("eliminar_simpatizante");

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

  const handleEliminar = useCallback((id: string) => {
    if (confirmandoEliminarId === id) {
      eliminarMutation.mutate(id, {
        onSuccess: () => setConfirmandoEliminarId(null),
      });
    } else {
      setConfirmandoEliminarId(id);
    }
  }, [confirmandoEliminarId, eliminarMutation]);

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
                  {record.barrio || "-"}
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

  return (
    <div className="py-4 px-6">
      <PageHeader
        title="Registrar Simpatizante"
        subtitle="Buscá por cedula y registra simpatizantes. Tus registros aparecen abajo."
        showDivider
      />

      <div className="max-w-2xl mb-8">
        <CrearSimpatizante/>
      </div>

      <div className="mt-4">
        <h3 className="text-base font-semibold text-text-primary mb-3">
          Mis simpatizantes registrados
          {simpatizantes && (
            <span className="ml-2 text-sm font-normal text-text-tertiary">
              ({simpatizantes.length})
            </span>
          )}
        </h3>

        <CTable<Simpatizante>
          data={simpatizantes ?? []}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          searchable
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          pagination={true}
          defaultPageSize={10}
        />
      </div>

      <ModalEditarSimpatizante
        isOpen={!!simpatizanteAEditar}
        simpatizante={simpatizanteAEditar}
        onClose={() => setSimpatizanteAEditar(null)}
      />
    </div>
  );
};

export default RegistrarSimpatizantePage;