import { type FC, useState, useEffect } from 'react';
import { X, UserPlus, Search } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@api/axios.config';
import toast from 'react-hot-toast';
import { useAsignarImpresora } from '../hooks/useAsignarImpresora';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  impresoraId: string;
}

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  username: string;
  perfil: {
    nombre: string;
  };
}

export const ModalAsignarUsuario: FC<Props> = ({ isOpen, onClose, impresoraId }) => {
  const queryClient = useQueryClient();
  const asignarMutation = useAsignarImpresora();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<string>('');
  const [esPrincipal, setEsPrincipal] = useState(true);

  useEffect(() => {
    if (isOpen) {
      cargarUsuarios();
    }
  }, [isOpen]);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/usuarios');
      const data = response.data.data || response.data;
      setUsuarios(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleAsignar = async () => {
    if (!usuarioSeleccionado) {
      toast.error('Seleccioná un usuario');
      return;
    }

    try {
      await asignarMutation.mutateAsync({
        usuario_id: usuarioSeleccionado,
        impresora_id: impresoraId,
        es_principal: esPrincipal,
      });

      queryClient.invalidateQueries({ queryKey: ['impresora', impresoraId] });
      
      setUsuarioSeleccionado('');
      setEsPrincipal(true);
      setBusqueda('');
      onClose();
    } catch (error) {
      console.error('Error al asignar:', error);
    }
  };

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.username.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content border border-border rounded-xl shadow-xl w-full max-w-md z-50 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus size={20} className="text-primary" />
            <h3 className="text-lg font-bold text-text-primary">Asignar Usuario</h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Búsqueda */}
          <div>
            <label className="label">Buscar usuario</label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                size={18}
              />
              <input
                type="text"
                placeholder="Nombre, apellido o username..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Lista de usuarios */}
          <div>
            <label className="label">Seleccionar usuario *</label>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="border border-border rounded-lg max-h-64 overflow-y-auto">
                {usuariosFiltrados.length > 0 ? (
                  usuariosFiltrados.map((usuario) => (
                    <label
                      key={usuario.id}
                      className={`
                        flex items-center gap-3 p-3 cursor-pointer transition-colors
                        hover:bg-bg-surface
                        ${usuarioSeleccionado === usuario.id ? 'bg-primary/10 border-l-4 border-l-primary' : 'border-b border-border last:border-b-0'}
                      `}
                    >
                      <input
                        type="radio"
                        name="usuario"
                        value={usuario.id}
                        checked={usuarioSeleccionado === usuario.id}
                        onChange={() => setUsuarioSeleccionado(usuario.id)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-primary">
                          {usuario.nombre} {usuario.apellido}
                        </p>
                        <p className="text-xs text-text-tertiary">@{usuario.username}</p>
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-bg-surface border border-border rounded">
                          {usuario.perfil.nombre}
                        </span>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-text-tertiary text-center py-8">
                    No se encontraron usuarios
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Opción principal */}
          <div className="flex items-center gap-3 p-3 bg-bg-surface border border-border rounded-lg">
            <input
              type="checkbox"
              id="es_principal"
              checked={esPrincipal}
              onChange={(e) => setEsPrincipal(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="es_principal" className="text-sm text-text-primary cursor-pointer">
              Establecer como impresora principal del usuario
            </label>
          </div>

          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
            <p className="text-xs text-text-tertiary">
              Al asignar un usuario a esta impresora, todos sus trabajos de impresión se
              enviarán automáticamente a este dispositivo.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-3">
          <button onClick={onClose} className="flex-1 btn btn-outline">
            Cancelar
          </button>
          <button
            onClick={handleAsignar}
            disabled={!usuarioSeleccionado || asignarMutation.isPending}
            className="flex-1 btn btn-primary"
          >
            {asignarMutation.isPending ? 'Asignando...' : 'Asignar'}
          </button>
        </div>
      </div>
    </>
  );
};