import { useState, useEffect, type FC } from 'react';
import { X } from 'lucide-react';
import type { Partido, CreatePartidoDto } from '@dto/partido.types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePartidoDto) => void;
  isPending: boolean;
  partidoEditar?: Partido | null;
}

interface FormValues {
  nombre: string;
  sigla: string;
  descripcion: string;
}

interface FormErrors {
  nombre?: string;
  sigla?: string;
}

const initialValues: FormValues = {
  nombre: '',
  sigla: '',
  descripcion: '',
};

export const PartidoFormModal: FC<Props> = ({
  open,
  onClose,
  onSubmit,
  isPending,
  partidoEditar,
}) => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (partidoEditar) {
      setValues({
        nombre: partidoEditar.nombre,
        sigla: partidoEditar.sigla,
        descripcion: partidoEditar.descripcion ?? '',
      });
    } else {
      setValues(initialValues);
    }
    setErrors({});
  }, [partidoEditar, open]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!values.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!values.sigla.trim()) newErrors.sigla = 'La sigla es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      nombre: values.nombre.trim().toUpperCase(),
      sigla: values.sigla.trim().toUpperCase(),
      descripcion: values.descripcion.trim() || undefined,
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
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-text-primary m-0">
            {partidoEditar ? 'Editar Partido' : 'Nuevo Partido'}
          </h3>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Nombre <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={values.nombre}
              onChange={(e) => setValues((prev) => ({ ...prev, nombre: e.target.value }))}
              placeholder="Ej: PARTIDO COLORADO"
              className={`
                w-full px-4 py-2 rounded-lg border bg-bg-content uppercase
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

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Sigla <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={values.sigla}
              onChange={(e) => setValues((prev) => ({ ...prev, sigla: e.target.value }))}
              placeholder="Ej: ANR"
              maxLength={20}
              className={`
                w-full px-4 py-2 rounded-lg border bg-bg-content uppercase
                text-text-primary placeholder:text-text-tertiary
                focus:outline-none focus:ring-2 focus:ring-primary
                transition-all
                ${errors.sigla ? 'border-danger ring-2 ring-danger/20' : 'border-border'}
              `}
            />
            {errors.sigla && (
              <p className="text-danger text-xs mt-1">{errors.sigla}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Descripcion
              <span className="text-text-tertiary text-xs ml-1">(opcional)</span>
            </label>
            <textarea
              value={values.descripcion}
              onChange={(e) => setValues((prev) => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Descripcion del partido..."
              rows={2}
              className="
                w-full px-4 py-2 rounded-lg border border-border bg-bg-content
                text-text-primary placeholder:text-text-tertiary
                focus:outline-none focus:ring-2 focus:ring-primary
                transition-all resize-none
              "
            />
          </div>

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
              {partidoEditar ? 'Guardar Cambios' : 'Crear Partido'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};