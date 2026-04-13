import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { PageHeader } from '@components';
import { ArrowLeft, Save, Printer } from 'lucide-react';
import type { CreateImpresoraDto } from '@dto/impresora.types';
import RoutesConfig from '@routes/RoutesConfig';
import { useCrearImpresora } from './hooks/useCrearImpresora';

const CrearImpresoraPage: FC = () => {
  const navigate = useNavigate();
  const crearMutation = useCrearImpresora();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<CreateImpresoraDto>();

  const codigo = watch('codigo', '');

  const onSubmit = async (data: CreateImpresoraDto) => {
    try {
      await crearMutation.mutateAsync({
        ...data,
        codigo: data.codigo.toUpperCase(),
      });
      navigate(RoutesConfig.impresorasLista);
    } catch (error) {
      console.error('Error al crear:', error);
    }
  };

  const generarCodigo = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `IMP-${timestamp}`;
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Registrar Impresora"
        subtitle="Agregá una nueva impresora térmica al sistema"
      />

      <button
        onClick={() => navigate(RoutesConfig.impresorasLista)}
        className="btn btn-outline mb-6 flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Volver
      </button>

      <div className="max-w-2xl mx-auto bg-bg-content border border-border rounded-xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Printer size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                Datos de la Impresora
              </h3>
              <p className="text-sm text-text-tertiary">
                Completá la información básica
              </p>
            </div>
          </div>

          <div>
            <label className="label">
              Código de Impresora *
              <span className="text-xs text-text-tertiary ml-2">
                (Se usará para conectar el agente)
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="input flex-1 font-mono"
                placeholder="MESA-001, OFICINA-A, etc"
                {...register('codigo', {
                  required: 'El código es requerido',
                  pattern: {
                    value: /^[A-Z0-9-]+$/,
                    message: 'Solo mayúsculas, números y guiones',
                  },
                  maxLength: {
                    value: 20,
                    message: 'Máximo 20 caracteres',
                  },
                })}
                style={{ textTransform: 'uppercase' }}
              />
              <button
                type="button"
                onClick={() => {
                  const campo = document.querySelector(
                    'input[name="codigo"]'
                  ) as HTMLInputElement;
                  if (campo) campo.value = generarCodigo();
                }}
                className="btn btn-outline"
              >
                Generar
              </button>
            </div>
            {errors.codigo && (
              <p className="text-xs text-danger mt-1">{errors.codigo.message}</p>
            )}
            {codigo && (
              <p className="text-xs text-success mt-1">
                Vista previa: <span className="font-mono font-bold">{codigo.toUpperCase()}</span>
              </p>
            )}
          </div>

          <div>
            <label className="label">Nombre de la Impresora *</label>
            <input
              type="text"
              className="input"
              placeholder="Ej: Impresora Mesa 1"
              {...register('nombre', {
                required: 'El nombre es requerido',
                maxLength: {
                  value: 100,
                  message: 'Máximo 100 caracteres',
                },
              })}
            />
            {errors.nombre && (
              <p className="text-xs text-danger mt-1">{errors.nombre.message}</p>
            )}
          </div>

          <div>
            <label className="label">Descripción</label>
            <input
              type="text"
              className="input"
              placeholder="Ej: Epson TM-T20II - Oficina Principal"
              {...register('descripcion', {
                maxLength: {
                  value: 255,
                  message: 'Máximo 255 caracteres',
                },
              })}
            />
            {errors.descripcion && (
              <p className="text-xs text-danger mt-1">{errors.descripcion.message}</p>
            )}
          </div>

          <div>
            <label className="label">Ubicación</label>
            <input
              type="text"
              className="input"
              placeholder="Ej: Planta baja - Mesa de operadores"
              {...register('ubicacion', {
                maxLength: {
                  value: 100,
                  message: 'Máximo 100 caracteres',
                },
              })}
            />
            {errors.ubicacion && (
              <p className="text-xs text-danger mt-1">{errors.ubicacion.message}</p>
            )}
          </div>

          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-text-primary mb-2">
              Siguiente paso
            </h4>
            <p className="text-xs text-text-tertiary">
              Después de crear la impresora, podrás:
            </p>
            <ul className="text-xs text-text-tertiary mt-2 space-y-1 ml-4">
              <li>• Asignar usuarios a esta impresora</li>
              <li>• Instalar el agente en la PC con el código generado</li>
              <li>• Ver el historial de trabajos de impresión</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => navigate(RoutesConfig.impresorasLista)}
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
                  Crear Impresora
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearImpresoraPage;