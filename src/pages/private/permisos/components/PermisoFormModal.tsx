import { useState, useEffect, type FC } from 'react';
import { X } from 'lucide-react';
import type { Permiso, CreatePermisoDto, ModuloPermiso } from '@dto/permiso.types';
import { MODULOS } from '@dto/permiso.types';

interface PermisoFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePermisoDto) => void;
  isPending: boolean;
  permisoEditar?: Permiso | null;
}

interface FormValues {
  nombre: string;
  modulo: ModuloPermiso;
  accion: string;
  descripcion: string;
}

interface FormErrors {
  nombre?: string;
  modulo?: string;
  accion?: string;
}

const initialValues: FormValues = {
  nombre: '',
  modulo: 'usuarios',
  accion: '',
  descripcion: '',
};

export const PermisoFormModal: FC<PermisoFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  isPending,
  permisoEditar,
}) => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});

  // Cargar valores si es edición
  useEffect(() => {
    if (permisoEditar) {
      setValues({
        nombre: permisoEditar.nombre,
        modulo: permisoEditar.modulo as ModuloPermiso,
        accion: permisoEditar.accion,
        descripcion: permisoEditar.descripcion ?? '',
      });
    } else {
      setValues(initialValues);
    }
    setErrors({});
  }, [permisoEditar, open]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!values.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    if (!values.modulo) {
      newErrors.modulo = 'El módulo es requerido';
    }
    if (!values.accion.trim()) {
      newErrors.accion = 'La acción es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    field: keyof FormValues,
    value: string,
  ) => {
    setValues(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      nombre: values.nombre.trim(),
      modulo: values.modulo,
      accion: values.accion.trim(),
      descripcion: values.descripcion.trim() || undefined,
    });
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="
        fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
        bg-bg-content border border-border rounded-xl shadow-xl
        w-full max-w-md z-50 p-6
      ">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-text-primary m-0">
            {permisoEditar ? 'Editar Permiso' : 'Nuevo Permiso'}
          </h3>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Nombre <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={values.nombre}
              onChange={e => handleChange('nombre', e.target.value)}
              placeholder="ej: ver_usuarios"
              className={`
                w-full px-4 py-2 rounded-lg border bg-bg-content
                text-text-primary placeholder:text-text-tertiary
                focus:outline-none focus:ring-2 focus:ring-primary
                transition-all
                ${errors.nombre ? 'border-danger ring-2 ring-danger/20' : 'border-border'}
              `}
            />
            {errors.nombre && (
              <p className="text-danger text-xs mt-1">{errors.nombre}</p>
            )}
          </div>

          {/* Módulo */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Módulo <span className="text-danger">*</span>
            </label>
            <select
              value={values.modulo}
              onChange={e => handleChange('modulo', e.target.value)}
              className={`
                w-full px-4 py-2 rounded-lg border bg-bg-content
                text-text-primary
                focus:outline-none focus:ring-2 focus:ring-primary
                transition-all capitalize
                ${errors.modulo ? 'border-danger ring-2 ring-danger/20' : 'border-border'}
              `}
            >
              {MODULOS.map(modulo => (
                <option key={modulo} value={modulo}>
                  {modulo.charAt(0).toUpperCase() + modulo.slice(1)}
                </option>
              ))}
            </select>
            {errors.modulo && (
              <p className="text-danger text-xs mt-1">{errors.modulo}</p>
            )}
          </div>

          {/* Acción */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Acción <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={values.accion}
              onChange={e => handleChange('accion', e.target.value)}
              placeholder="ej: leer, crear, editar, eliminar"
              className={`
                w-full px-4 py-2 rounded-lg border bg-bg-content
                text-text-primary placeholder:text-text-tertiary
                focus:outline-none focus:ring-2 focus:ring-primary
                transition-all
                ${errors.accion ? 'border-danger ring-2 ring-danger/20' : 'border-border'}
              `}
            />
            {errors.accion && (
              <p className="text-danger text-xs mt-1">{errors.accion}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Descripción <span className="text-text-tertiary text-xs">(opcional)</span>
            </label>
            <textarea
              value={values.descripcion}
              onChange={e => handleChange('descripcion', e.target.value)}
              placeholder="Descripción del permiso..."
              rows={3}
              className="
                w-full px-4 py-2 rounded-lg border border-border bg-bg-content
                text-text-primary placeholder:text-text-tertiary
                focus:outline-none focus:ring-2 focus:ring-primary
                transition-all resize-none
              "
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="
                px-4 py-2 text-sm rounded-lg
                border border-border text-text-primary
                hover:bg-bg-base transition-colors
              "
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="
                px-4 py-2 text-sm rounded-lg
                bg-primary hover:bg-primary-hover
                text-white font-medium
                transition-colors
                disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center gap-2
              "
            >
              {isPending && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {permisoEditar ? 'Guardar Cambios' : 'Crear Permiso'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};