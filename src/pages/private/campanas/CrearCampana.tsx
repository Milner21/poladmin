import { useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@components";
import { CampanaForm } from "./components/CampanaForm";
import { useCrearCampana } from "./hooks/useCrearCampana";
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

const initialValues: FormValues = {
  nombre: "",
  nivel_campana: "DISTRITO",
  departamento: "",
  distrito: "",
  tipo_campana: "PARTIDO",
  partido_id: "",
  modo_eleccion: "INTERNAS",
};

const CrearCampana: FC = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const crearMutation = useCrearCampana();

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
    if (!validate()) return;

    crearMutation.mutate(
      {
        nombre: values.nombre.trim(),
        nivel_campana: values.nivel_campana,
        departamento: values.departamento.trim() || undefined,
        distrito: values.distrito.trim() || undefined,
        tipo_campana: values.tipo_campana,
        partido_id: values.partido_id.trim() || undefined,
        modo_eleccion: values.modo_eleccion,
      },
      {
        onSuccess: () => navigate(RoutesConfig.campanas),
      },
    );
  };

  return (
    <div className="py-4 px-6">
      <PageHeader
        title="Nueva Campaña"
        subtitle="Creá una nueva campaña electoral"
        showDivider
      />
      <div className="max-w-3xl">
        <div className="bg-bg-content border border-border rounded-xl p-6 shadow-sm">
          <CampanaForm
            values={values}
            errors={errors}
            isPending={crearMutation.isPending}
            isEditing={false}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={() => navigate(RoutesConfig.campanas)}
          />
        </div>
      </div>
    </div>
  );
};

export default CrearCampana;
