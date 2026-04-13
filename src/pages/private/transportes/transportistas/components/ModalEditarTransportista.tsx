import { type FC } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save } from 'lucide-react';
import { useActualizarTransportista } from '../../hooks/useActualizarTransportista';
import type { Transportista, TipoVehiculo } from '@dto/transporte.types';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  transportista: Transportista;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  nombre: string;
  apellido: string;
  telefono: string;
  tipo_vehiculo: TipoVehiculo;
  marca_vehiculo: string;
  chapa_vehiculo: string;
  capacidad_pasajeros: number;
  estado: boolean;
}

export const ModalEditarTransportista: FC<Props> = ({ 
  isOpen, 
  transportista, 
  onClose, 
  onSuccess 
}) => {
  const actualizarMutation = useActualizarTransportista();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      nombre: transportista.nombre,
      apellido: transportista.apellido,
      telefono: transportista.telefono ?? '',
      tipo_vehiculo: transportista.tipo_vehiculo,
      marca_vehiculo: transportista.marca_vehiculo ?? '',
      chapa_vehiculo: transportista.chapa_vehiculo,
      capacidad_pasajeros: transportista.capacidad_pasajeros,
      estado: transportista.estado,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await actualizarMutation.mutateAsync({
        id: transportista.id,
        data: {
          ...data,
          telefono: data.telefono || undefined,
          marca_vehiculo: data.marca_vehiculo || undefined,
        },
      });
      toast.success('Transportista actualizado correctamente');
      onSuccess();
    } catch (error) {
      console.error('Error al actualizar:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content border border-border rounded-xl shadow-xl w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-bg-content border-b border-border px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-primary">
            Editar Transportista
          </h3>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Datos personales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre *</label>
              <input
                type="text"
                className="input"
                {...register('nombre', { required: 'El nombre es requerido' })}
              />
              {errors.nombre && (
                <p className="text-xs text-danger mt-1">{errors.nombre.message}</p>
              )}
            </div>

            <div>
              <label className="label">Apellido *</label>
              <input
                type="text"
                className="input"
                {...register('apellido', { required: 'El apellido es requerido' })}
              />
              {errors.apellido && (
                <p className="text-xs text-danger mt-1">{errors.apellido.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="label">Teléfono</label>
            <input
              type="text"
              className="input"
              placeholder="Ej: 0981123456"
              {...register('telefono')}
            />
          </div>

          {/* Datos del vehículo */}
          <div className="border-t border-border pt-4 mt-4">
            <h4 className="text-sm font-semibold text-text-primary mb-3">
              Datos del Vehículo
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Tipo de vehículo *</label>
                <select
                  className="input"
                  {...register('tipo_vehiculo', { required: 'El tipo es requerido' })}
                >
                  <option value="AUTO">Auto</option>
                  <option value="SUV">SUV</option>
                  <option value="FURGON">Furgón</option>
                  <option value="OMNIBUS">Ómnibus</option>
                  <option value="OTRO">Otro</option>
                </select>
                {errors.tipo_vehiculo && (
                  <p className="text-xs text-danger mt-1">{errors.tipo_vehiculo.message}</p>
                )}
              </div>

              <div>
                <label className="label">Marca</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ej: Toyota"
                  {...register('marca_vehiculo')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="label">Chapa *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ej: ABC123"
                  {...register('chapa_vehiculo', { required: 'La chapa es requerida' })}
                />
                {errors.chapa_vehiculo && (
                  <p className="text-xs text-danger mt-1">{errors.chapa_vehiculo.message}</p>
                )}
              </div>

              <div>
                <label className="label">Capacidad de pasajeros *</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  className="input"
                  {...register('capacidad_pasajeros', {
                    required: 'La capacidad es requerida',
                    min: { value: 1, message: 'Mínimo 1 pasajero' },
                    max: { value: 50, message: 'Máximo 50 pasajeros' },
                    valueAsNumber: true,
                  })}
                />
                {errors.capacidad_pasajeros && (
                  <p className="text-xs text-danger mt-1">{errors.capacidad_pasajeros.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Estado */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <input
              type="checkbox"
              id="estado"
              className="w-4 h-4"
              {...register('estado')}
            />
            <label htmlFor="estado" className="text-sm text-text-primary cursor-pointer">
              Transportista activo
            </label>
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
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
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};