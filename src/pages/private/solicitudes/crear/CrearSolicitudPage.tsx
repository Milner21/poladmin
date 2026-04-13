import { useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@components";
import { useCrearSolicitud } from "../hooks/useCrearSolicitud";
import { useQuery } from "@tanstack/react-query";
import { simpatizantesService } from "@services/simpatizantes.service";
import { ArrowLeft, Save } from "lucide-react";
import RoutesConfig from "@routes/RoutesConfig";
import type { PrioridadSolicitud } from "@dto/solicitud.types";

const CrearSolicitudPage: FC = () => {
  const navigate = useNavigate();
  const crearMutation = useCrearSolicitud();

  const { data: simpatizantes, isLoading: loadingSimpatizantes } = useQuery({
    queryKey: ["simpatizantes"],
    queryFn: () => simpatizantesService.getAll(),
  });

  const [formData, setFormData] = useState({
    simpatizante_id: "",
    titulo: "",
    descripcion: "",
    prioridad: "MEDIA" as PrioridadSolicitud,
    fecha_limite: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    crearMutation.mutate(
      {
        ...formData,
        fecha_limite: formData.fecha_limite || undefined,
      },
      {
        onSuccess: () => {
          navigate(RoutesConfig.solicitudes);
        },
      }
    );
  };

  return (
    <div className="py-4 px-6">
      <PageHeader
        title="Nueva Solicitud"
        subtitle="Registra una nueva solicitud de simpatizante"
        showDivider
      />

      <button
        onClick={() => navigate(RoutesConfig.solicitudes)}
        className="btn btn-outline mb-4 flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Volver
      </button>

      <div className="max-w-2xl bg-bg-content border border-border rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Simpatizante */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Simpatizante <span className="text-danger">*</span>
            </label>
            <select
              value={formData.simpatizante_id}
              onChange={(e) => setFormData({ ...formData, simpatizante_id: e.target.value })}
              required
              disabled={loadingSimpatizantes}
              className="w-full px-3 py-2 bg-bg-base border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Seleccionar simpatizante...</option>
              {simpatizantes?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} {s.apellido} - CI: {s.documento}
                </option>
              ))}
            </select>
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Título <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
              minLength={3}
              placeholder="Ej: Solicita arreglo de calle"
              className="w-full px-3 py-2 bg-bg-base border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Descripción <span className="text-danger">*</span>
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              required
              minLength={10}
              rows={4}
              placeholder="Describe la solicitud en detalle..."
              className="w-full px-3 py-2 bg-bg-base border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Prioridad
            </label>
            <select
              value={formData.prioridad}
              onChange={(e) => setFormData({ ...formData, prioridad: e.target.value as PrioridadSolicitud })}
              className="w-full px-3 py-2 bg-bg-base border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="BAJA">Baja</option>
              <option value="MEDIA">Media</option>
              <option value="ALTA">Alta</option>
            </select>
          </div>

          {/* Fecha Límite */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Fecha Límite (Opcional)
            </label>
            <input
              type="date"
              value={formData.fecha_limite}
              onChange={(e) => setFormData({ ...formData, fecha_limite: e.target.value })}
              className="w-full px-3 py-2 bg-bg-base border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={crearMutation.isPending}
              className="btn btn-primary flex items-center gap-2 flex-1"
            >
              <Save size={16} />
              {crearMutation.isPending ? "Guardando..." : "Guardar Solicitud"}
            </button>
            <button
              type="button"
              onClick={() => navigate(RoutesConfig.solicitudes)}
              className="btn btn-outline"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearSolicitudPage;