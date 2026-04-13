import { useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@components";
import { useCrearPerfil } from "./hooks/useCrearPerfil";
import { useAsignarPermisos } from "./hooks/useAsignarPermisos";
import { usePermisos as useListaPermisos } from "../permisos/hooks/usePermisos";
import { useNiveles } from "../niveles/hooks/useNiveles";
import { PerfilForm } from "./components/PerfilForm";
import { AsignarPermisos } from "./components/AsignarPermisos";
import RoutesConfig from "@routes/RoutesConfig";

interface FormValues {
  nombre: string;
  nivel_id: string;
  es_operativo: boolean;
  username_manual: boolean;
}

interface FormErrors {
  nombre?: string;
  nivel_id?: string;
}

const CrearPerfil: FC = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState<FormValues>({
    nombre: "",
    nivel_id: "",
    es_operativo: false,
    username_manual: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [perfilCreadoId, setPerfilCreadoId] = useState<string | null>(null);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>(
    [],
  );

  const { data: permisos } = useListaPermisos();
  const { data: niveles } = useNiveles();
  const crearMutation = useCrearPerfil();
  const asignarMutation = useAsignarPermisos();

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!values.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!values.es_operativo && !values.nivel_id) {
      newErrors.nivel_id = "El nivel es requerido para perfiles políticos";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: "nombre" | "nivel_id", value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleChangeBoolean = (
    field: "es_operativo" | "username_manual",
    value: boolean,
  ) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
      nivel_id: field === "es_operativo" && value ? "" : prev.nivel_id,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    crearMutation.mutate(
      {
        nombre: values.nombre.trim().toUpperCase(),
        nivel_id: values.es_operativo ? undefined : values.nivel_id,
        es_operativo: values.es_operativo,
        username_manual: values.username_manual,
      },
      {
        onSuccess: (data) => {
          setPerfilCreadoId(data.id);
        },
      },
    );
  };

  const handleTogglePermiso = (permisoId: string) => {
    setPermisosSeleccionados((prev) =>
      prev.includes(permisoId)
        ? prev.filter((id) => id !== permisoId)
        : [...prev, permisoId],
    );
  };

  const handleGuardarPermisos = () => {
    if (!perfilCreadoId) return;
    asignarMutation.mutate(
      { id: perfilCreadoId, permisos_ids: permisosSeleccionados },
      { onSuccess: () => navigate(RoutesConfig.perfiles) },
    );
  };

  return (
    <div className="py-4 px-6">
      <PageHeader
        title="Nuevo Perfil"
        subtitle="Completá los datos del nuevo perfil"
        showDivider
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
        {/* Form */}
        <div className="bg-bg-content border border-border rounded-xl p-6">
          <h4 className="text-base font-semibold text-text-primary mb-4">
            Datos del Perfil
          </h4>
          <PerfilForm
            values={values}
            errors={errors}
            isPending={crearMutation.isPending}
            isEditing={false}
            niveles={niveles ?? []}
            onChange={handleChange}
            onChangeBoolean={handleChangeBoolean}
            onSubmit={handleSubmit}
            onCancel={() => navigate(RoutesConfig.perfiles)}
          />

          {perfilCreadoId && (
            <div className="mt-4 px-4 py-3 bg-success/10 border border-success/30 rounded-lg">
              <p className="text-success text-sm m-0">
                ✅ Perfil creado. Ahora asigná los permisos y guardá.
              </p>
            </div>
          )}
        </div>

        {/* Asignar permisos */}
        <div
          className={`transition-opacity duration-300 ${perfilCreadoId ? "opacity-100" : "opacity-40 pointer-events-none"}`}
        >
          {permisos && (
            <AsignarPermisos
              permisos={permisos}
              permisosSeleccionados={permisosSeleccionados}
              isPending={asignarMutation.isPending}
              onChange={handleTogglePermiso}
              onGuardar={handleGuardarPermisos}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CrearPerfil;
