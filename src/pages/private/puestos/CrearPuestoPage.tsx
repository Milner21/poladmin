import { type FC } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { PageHeader } from "@components";
import { ArrowLeft, Save, MapPin } from "lucide-react";
import type { CreatePuestoDto } from "@dto/puesto.types";
import RoutesConfig from "@routes/RoutesConfig";
import { useCrearPuesto } from "./hooks/useCrearPuesto";

const CrearPuestoPage: FC = () => {
  const navigate = useNavigate();
  const crearMutation = useCrearPuesto();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<CreatePuestoDto>();

  const codigo = watch("codigo", "");

  const onSubmit = async (data: CreatePuestoDto) => {
    try {
      await crearMutation.mutateAsync({
        ...data,
        codigo: data.codigo.toUpperCase(),
      });
      navigate(RoutesConfig.puestosLista);
    } catch (error) {
      console.error("Error al crear:", error);
    }
  };

  const generarCodigo = () => {
    const numero = String(Math.floor(Math.random() * 99) + 1).padStart(2, "0");
    const input = document.querySelector(
      'input[name="codigo"]',
    ) as HTMLInputElement | null;
    if (input) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )?.set;
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(input, `PC-${numero}`);
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Crear Puesto de Control"
        subtitle="Registra un nuevo puesto de control para el dia de la eleccion"
      />

      <button
        onClick={() => navigate(RoutesConfig.puestosLista)}
        className="btn btn-outline mb-6 flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Volver
      </button>

      <div className="max-w-2xl mx-auto bg-bg-content border border-border rounded-xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <MapPin size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                Datos del Puesto
              </h3>
              <p className="text-sm text-text-tertiary">
                Completa la informacion del puesto de control
              </p>
            </div>
          </div>

          <div>
            <label className="label">
              Codigo del Puesto *
              <span className="text-xs text-text-tertiary ml-2">
                (Identificador unico dentro de la campana)
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="input flex-1 font-mono"
                placeholder="PC-01, PC-02, etc"
                {...register("codigo", {
                  required: "El codigo es requerido",
                  pattern: {
                    value: /^[A-Z0-9-]+$/,
                    message: "Solo mayusculas, numeros y guiones",
                  },
                  maxLength: {
                    value: 20,
                    message: "Maximo 20 caracteres",
                  },
                })}
                style={{ textTransform: "uppercase" }}
              />
              <button
                type="button"
                onClick={generarCodigo}
                className="btn btn-outline"
              >
                Generar
              </button>
            </div>
            {errors.codigo && (
              <p className="text-xs text-danger mt-1">
                {errors.codigo.message}
              </p>
            )}
            {codigo && (
              <p className="text-xs text-success mt-1">
                Vista previa:{" "}
                <span className="font-mono font-bold">
                  {codigo.toUpperCase()}
                </span>
              </p>
            )}
          </div>

          <div>
            <label className="label">Descripcion</label>
            <input
              type="text"
              className="input"
              placeholder="Ej: Puesto entrada principal, Puesto mesa 3"
              {...register("descripcion", {
                maxLength: {
                  value: 255,
                  message: "Maximo 255 caracteres",
                },
              })}
            />
            {errors.descripcion && (
              <p className="text-xs text-danger mt-1">
                {errors.descripcion.message}
              </p>
            )}
          </div>

          <div>
            <label className="label">Modo de Eleccion *</label>
            <select
              className="input"
              {...register("modo_eleccion", {
                required: "El modo de eleccion es requerido",
              })}
            >
              <option value="">Seleccionar modo</option>
              <option value="INTERNAS">Internas</option>
              <option value="GENERALES">Generales</option>
            </select>
            {errors.modo_eleccion && (
              <p className="text-xs text-danger mt-1">
                {errors.modo_eleccion.message}
              </p>
            )}
          </div>

          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-text-primary mb-2">
              Siguiente paso
            </h4>
            <p className="text-xs text-text-tertiary">
              Despues de crear el puesto, podras:
            </p>
            <ul className="text-xs text-text-tertiary mt-2 space-y-1 ml-4">
              <li>- Asignar usuarios al puesto (activadores, verificadores, etc.)</li>
              <li>- Ver las acciones realizadas desde este puesto</li>
              <li>- Activar o desactivar el puesto segun necesidad</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => navigate(RoutesConfig.puestosLista)}
              className="flex-1 btn btn-outline"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 btn btn-primary flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Crear Puesto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearPuestoPage;