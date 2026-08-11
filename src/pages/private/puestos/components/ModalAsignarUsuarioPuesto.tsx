import { type FC, useState, useEffect } from "react";
import { X, UserPlus, Search } from "lucide-react";
import axiosInstance from "@api/axios.config";
import toast from "react-hot-toast";
import { useAsignarPuesto } from "../hooks/useAsignarPuesto";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  puestoId: string;
  onSuccess: () => void;
}

interface UsuarioAsignable {
  id: string;
  nombre: string;
  apellido: string;
  username: string;
  perfil: {
    nombre: string;
  };
}

export const ModalAsignarUsuarioPuesto: FC<Props> = ({
  isOpen,
  onClose,
  puestoId,
  onSuccess,
}) => {
  const asignarMutation = useAsignarPuesto();

  const [usuarios, setUsuarios] = useState<UsuarioAsignable[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      const cargarUsuarios = async () => {
        setLoading(true);
        try {
          const response = await axiosInstance.get("/usuarios");
          const data: UsuarioAsignable[] =
            response.data.data || response.data;
          setUsuarios(data);
        } catch (error) {
          console.error("Error al cargar usuarios:", error);
          toast.error("Error al cargar usuarios");
        } finally {
          setLoading(false);
        }
      };

      cargarUsuarios();
    }
  }, [isOpen]);

  const handleAsignar = async () => {
    if (!usuarioSeleccionado) {
      toast.error("Selecciona un usuario");
      return;
    }

    try {
      await asignarMutation.mutateAsync({
        puestoId,
        usuario_id: usuarioSeleccionado,
      });

      setUsuarioSeleccionado("");
      setBusqueda("");
      onSuccess();
    } catch (error) {
      console.error("Error al asignar:", error);
    }
  };

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.username.toLowerCase().includes(busqueda.toLowerCase()),
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
            <h3 className="text-lg font-bold text-text-primary">
              Asignar Usuario al Puesto
            </h3>
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
          {/* Busqueda */}
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
                        ${
                          usuarioSeleccionado === usuario.id
                            ? "bg-primary/10 border-l-4 border-l-primary"
                            : "border-b border-border last:border-b-0"
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="usuario-puesto"
                        value={usuario.id}
                        checked={usuarioSeleccionado === usuario.id}
                        onChange={() => setUsuarioSeleccionado(usuario.id)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-primary">
                          {usuario.nombre} {usuario.apellido}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          @{usuario.username}
                        </p>
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

          <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
            <p className="text-xs text-warning">
              Importante: si el usuario ya tiene otro puesto activo, se
              desactivara esa asignacion automaticamente. Un usuario solo puede
              operar desde un puesto a la vez.
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
            {asignarMutation.isPending ? "Asignando..." : "Asignar"}
          </button>
        </div>
      </div>
    </>
  );
};