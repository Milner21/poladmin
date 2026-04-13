import { useState, useEffect, type FC } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@components";
import { CampanaForm } from "./components/CampanaForm";
import { useActualizarCampana } from "./hooks/useActualizarCampana";
import { useCampanas } from "./hooks/useCampanas";
import RoutesConfig from "@routes/RoutesConfig";
import type { ModoEleccion, NivelCampana, TipoCampana } from "@dto/campana.types";

interface FormValues {
  nombre: string;
  nivel_campana: NivelCampana;
  departamento: string;
  distrito: string;
  tipo_campana: TipoCampana;
  partido_id: string;
  modo_eleccion: ModoEleccion;
}

interface FormErrors {
  nombre?: string;
  nivel_campana?: string;
  departamento?: string;
  distrito?: string;
  tipo_campana?: string;
  partido_id?: string;
  modo_eleccion?: string;
}

const EditarCampana: FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: campanas } = useCampanas();
  const actualizarMutation = useActualizarCampana();

   const [values, setValues] = useState<FormValues>({
    nombre: '',
    nivel_campana: 'DISTRITO',
    departamento: '',
    distrito: '',
    tipo_campana: 'PARTIDO',
    partido_id: '',
    modo_eleccion: 'INTERNAS',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!campanas || !id) return;
    const campana = campanas.find((c) => c.id === id);
    if (!campana) return;

    setValues({
      nombre: campana.nombre,
      nivel_campana: campana.nivel_campana,
      departamento: campana.departamento || "",
      distrito: campana.distrito || "",
      tipo_campana: campana.tipo_campana,
      partido_id: campana.partido_id || "",
      modo_eleccion: campana.configuracion?.modo_eleccion || "INTERNAS",
    });
  }, [campanas, id]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!values.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    if (
      values.nivel_campana === "DEPARTAMENTO" &&
      !values.departamento.trim()
    ) {
      newErrors.departamento = "El departamento es obligatorio para este nivel";
    }

    if (values.nivel_campana === "DISTRITO") {
      if (!values.departamento.trim()) {
        newErrors.departamento = "El departamento es obligatorio";
      }
      if (!values.distrito.trim()) {
        newErrors.distrito = "El distrito es obligatorio";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !id) return;

    actualizarMutation.mutate(
      {
        id,
        data: {
          nombre: values.nombre.trim(),
          nivel_campana: values.nivel_campana,
          departamento: values.departamento.trim() || undefined,
          distrito: values.distrito.trim() || undefined,
          tipo_campana: values.tipo_campana,
          partido_id: values.partido_id.trim() || undefined,
          modo_eleccion: values.modo_eleccion,
        },
      },
      {
        onSuccess: () => navigate(RoutesConfig.campanas),
      },
    );
  };

  return (
    <div className="py-4 px-6">
      <PageHeader
        title="Editar Campaña"
        subtitle="Modificá los datos de la campaña"
        showDivider
      />
      <div className="max-w-3xl">
        <div className="bg-bg-content border border-border rounded-xl p-6 shadow-sm">
          <CampanaForm
            values={values}
            errors={errors}
            isPending={actualizarMutation.isPending}
            isEditing={true}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={() => navigate(RoutesConfig.campanas)}
          />
        </div>
      </div>
    </div>
  );
};

export default EditarCampana;
