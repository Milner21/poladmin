import { useState, useEffect, type FC } from 'react';
import { X } from 'lucide-react';
import type { Nivel, CreateNivelDto } from '@dto/nivel.types';

interface NivelFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateNivelDto) => void;
  isPending: boolean;
  nivelEditar?: Nivel | null;
}

interface FormValues {
  nombre: string;
  orden: string;
  descripcion: string;
  permite_operadores: boolean;
  exclusivo_root: boolean; // ← AGREGAR
}

interface FormErrors {
  nombre?: string;
  orden?: string;
}

const initialValues: FormValues = {
  nombre: '',
  orden: '',
  descripcion: '',
  permite_operadores: false,
  exclusivo_root: false, // ← AGREGAR
};

export const NivelFormModal: FC<NivelFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  isPending,
  nivelEditar,
}) => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (nivelEditar) {
      setValues({
        nombre: nivelEditar.nombre,
        orden: String(nivelEditar.orden),
        descripcion: nivelEditar.descripcion ?? '',
        permite_operadores: nivelEditar.permite_operadores,
        exclusivo_root: nivelEditar.exclusivo_root, // ← AGREGAR
      });
    } else {
      setValues(initialValues);
    }
    setErrors({});
  }, [nivelEditar, open]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!values.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!values.orden) {
      newErrors.orden = 'El orden es requerido';
    } else if (isNaN(Number(values.orden)) || Number(values.orden) < 1) {
      newErrors.orden = 'El orden debe ser un número mayor a 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      nombre: values.nombre.trim().toUpperCase(),
      orden: Number(values.orden),
      descripcion: values.descripcion.trim() || undefined,
      permite_operadores: values.permite_operadores,
      exclusivo_root: values.exclusivo_root, // ← AGREGAR
    });
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="
        fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
        bg-bg-content border border-border rounded-xl shadow-xl
        w-full max-w-md z-50 p-6
      ">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-text-primary m-0">
            {nivelEditar ? 'Editar Nivel' : 'Nuevo Nivel'}
          </h3>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Nombre <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={values.nombre}
              onChange={e => setValues(prev => ({ ...prev, nombre: e.target.value }))}
              placeholder="ej: Intendente"
              className={`
                w-full px-4 py-2 rounded-lg border bg-bg-content
                text-text-primary placeholder:text-text-tertiary
                focus:outline-none focus:ring-2 focus:ring-primary
                transition-all uppercase
                ${errors.nombre ? 'border-danger ring-2 ring-danger/20' : 'border-border'}
              `}
            />
            {errors.nombre && (
              <p className="text-danger text-xs mt-1">{errors.nombre}</p>
            )}
          </div>

          {/* Orden */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Orden jerárquico <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={values.orden}
              onChange={e => setValues(prev => ({ ...prev, orden: e.target.value }))}
              placeholder="ej: 1"
              className={`
                w-full px-4 py-2 rounded-lg border bg-bg-content
                text-text-primary placeholder:text-text-tertiary
                focus:outline-none focus:ring-2 focus:ring-primary
                transition-all
                ${errors.orden ? 'border-danger ring-2 ring-danger/20' : 'border-border'}
              `}
            />
            {errors.orden && (
              <p className="text-danger text-xs mt-1">{errors.orden}</p>
            )}
            <p className="text-text-tertiary text-xs mt-1">
              Número más bajo = mayor jerarquía (1 = más alto)
            </p>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Descripción
              <span className="text-text-tertiary text-xs ml-1">(opcional)</span>
            </label>
            <textarea
              value={values.descripcion}
              onChange={e => setValues(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Descripción del nivel..."
              rows={2}
              className="
                w-full px-4 py-2 rounded-lg border border-border bg-bg-content
                text-text-primary placeholder:text-text-tertiary
                focus:outline-none focus:ring-2 focus:ring-primary
                transition-all resize-none
              "
            />
          </div>

          {/* Permite operadores */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={values.permite_operadores}
              onChange={e =>
                setValues(prev => ({ ...prev, permite_operadores: e.target.checked }))
              }
              className="w-4 h-4 accent-primary cursor-pointer"
            />
            <div>
              <span className="text-sm font-medium text-text-primary">
                Permite usuarios operativos
              </span>
              <p className="text-xs text-text-tertiary">
                Los usuarios de este nivel pueden tener gestores asignados
              </p>
            </div>
          </label>

          {/* Exclusivo ROOT ← AGREGAR */}
          <label className="flex items-center gap-3 cursor-pointer p-3 border border-warning/30 bg-warning/5 rounded-lg">
            <input
              type="checkbox"
              checked={values.exclusivo_root}
              onChange={e =>
                setValues(prev => ({ ...prev, exclusivo_root: e.target.checked }))
              }
              className="w-4 h-4 accent-primary cursor-pointer"
            />
            <div>
              <span className="text-sm font-medium text-text-primary">
                ⚠️ Exclusivo ROOT (Facturable)
              </span>
              <p className="text-xs text-text-tertiary">
                Solo ROOT puede crear usuarios de este nivel. Actívalo para candidatos principales como Intendente o Concejal.
              </p>
            </div>
          </label>

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
                text-white font-medium transition-colors
                disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center gap-2
              "
            >
              {isPending && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {nivelEditar ? 'Guardar Cambios' : 'Crear Nivel'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};