import { CTable, PageHeader, ProtectedAction } from "@components";
import type { Usuario } from "@dto/usuario.types";
import { useAuth } from "@hooks/useAuth";
import { useCampanaSeleccionada } from "@hooks/useCampanaSeleccionada";
import RoutesConfig from "@routes/RoutesConfig";
import { Trash2, UserCheck, UserPlus, UserX, X, KeyRound } from "lucide-react";
import { useMemo, useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { getUsuariosColumns } from "./components/usuariosColumns";
import { CambiarPasswordModal } from "./components/CambiarPasswordModal";
import { useActualizarUsuario } from "./hooks/useActualizarUsuario";
import { useEliminarUsuario } from "./hooks/useEliminarUsuario";
import { useCambiarPassword } from "./hooks/useCambiarPassword";
import { useUsuarios } from "./hooks/useUsuarios";

const Usuarios: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPasswordVisible, setModalPasswordVisible] = useState(false);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const actualizarMutation = useActualizarUsuario();
  const eliminarMutation = useEliminarUsuario();
  const cambiarPasswordMutation = useCambiarPassword();
  const { campanaActual, esRoot } = useCampanaSeleccionada();

  const { data: usuarios, isLoading } = useUsuarios(
    esRoot ? campanaActual?.id : undefined,
  );

  const handleRowDoubleClick = (record: Usuario) => {
    setSelectedUsuario(record);
    setModalVisible(true);
  };

  const handleCerrarModal = () => {
    setModalVisible(false);
    setSelectedUsuario(null);
    setConfirmarEliminar(false);
  };

  const handleCerrarModalPassword = () => {
    setModalPasswordVisible(false);
  };

  const handleAbrirModalPassword = () => {
    setModalPasswordVisible(true);
  };

  const handleEditar = () => {
    if (selectedUsuario) {
      navigate(`${RoutesConfig.usuarios}/editar/${selectedUsuario.id}`);
      handleCerrarModal();
    }
  };

  const handleToggleEstado = () => {
    if (!selectedUsuario) return;
    actualizarMutation.mutate(
      { id: selectedUsuario.id, data: { estado: !selectedUsuario.estado } },
      { onSuccess: handleCerrarModal },
    );
  };

  const handleEliminar = () => {
    if (!selectedUsuario) return;
    eliminarMutation.mutate(selectedUsuario.id, {
      onSuccess: handleCerrarModal,
    });
  };

  const handleCambiarPassword = (
    passwordNuevo: string,
    passwordActual?: string,
  ) => {
    if (!selectedUsuario) return;

    cambiarPasswordMutation.mutate(
      {
        id: selectedUsuario.id,
        password_nuevo: passwordNuevo,
        password_actual: passwordActual,
      },
      {
        onSuccess: () => {
          handleCerrarModalPassword();
          handleCerrarModal();
        },
      },
    );
  };

  // Determinar si el usuario actual puede cambiar contraseñas de otros
  // Determinar si el usuario actual puede cambiar contraseñas de otros
  const puedeEditarPassword = useMemo(() => {
    if (!usuario) {
      console.log("🔍 DEBUG puedeEditarPassword: No hay usuario");
      return false;
    }

    console.log("🔍 DEBUG puedeEditarPassword - Usuario:", {
      nombre: usuario.nombre,
      perfil: usuario.perfil?.nombre,
      permisosPerfil:
        usuario.perfil?.permisos?.map((p) => p.permiso.nombre) || [],
      permisosPersonalizados:
        usuario.permisos_personalizados?.map((p) => p.permiso.nombre) || [],
    });

    if (usuario.perfil?.nombre === "ROOT") {
      console.log("🔍 DEBUG puedeEditarPassword: Es ROOT - TRUE");
      return true;
    }

    // Verificar si tiene el permiso específico
    const todosLosPermisos = [
      ...(usuario.perfil?.permisos?.map((p) => p.permiso.nombre) || []),
      ...(usuario.permisos_personalizados?.map((p) => p.permiso.nombre) || []),
    ];

    console.log(
      "🔍 DEBUG puedeEditarPassword - Todos los permisos:",
      todosLosPermisos,
    );

    const tienePermiso = todosLosPermisos.includes("cambiar_password_usuario");
    console.log(
      "🔍 DEBUG puedeEditarPassword - Tiene permiso cambiar_password_usuario:",
      tienePermiso,
    );

    return tienePermiso;
  }, [usuario]);

  // Determinar si requiere contraseña actual
  const requierePasswordActual = useMemo(() => {
    if (!selectedUsuario || !usuario) return true;

    // ROOT nunca requiere contraseña actual
    if (usuario.perfil?.nombre === "ROOT") return false;

    // Si tiene permiso para cambiar contraseñas, no requiere la actual
    if (puedeEditarPassword) return false;

    // Si es su propia contraseña, sí requiere la actual
    return selectedUsuario.id === usuario.id;
  }, [selectedUsuario, usuario, puedeEditarPassword]);

  // Extraer perfiles únicos de los usuarios cargados
  const perfilesUnicos = useMemo(() => {
    if (!usuarios || usuarios.length === 0) return [];

    const perfilesSet = new Set<string>();
    usuarios.forEach((usuario) => {
      perfilesSet.add(usuario.perfil.nombre);
    });

    return Array.from(perfilesSet).sort();
  }, [usuarios]);

  const columns = getUsuariosColumns(perfilesUnicos);

  return (
    <div className="py-4 px-6">
      <PageHeader
        title={
          esRoot && campanaActual
            ? `Gestión de Usuarios — ${campanaActual.nombre}`
            : "Gestión de Usuarios"
        }
        subtitle="Administra los usuarios del sistema"
        extraContent={
          <ProtectedAction modulo="usuarios" accion="crear" ocultar>
            <button
              onClick={() => navigate(RoutesConfig.usuariosCrear)}
              className="
          flex items-center gap-2 px-4 py-2
          bg-primary hover:bg-primary-hover
          text-white text-sm font-medium rounded-lg
          transition-colors
        "
            >
              <UserPlus size={16} />
              Agregar Usuario
            </button>
          </ProtectedAction>
        }
      />

      <CTable<Usuario>
        data={usuarios || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        onRowDoubleClick={handleRowDoubleClick}
        searchable={true}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        pagination={true}
        defaultPageSize={10}
      />

      {/* Modal detalle */}
      {modalVisible && selectedUsuario && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleCerrarModal}
          />
          <div
            className="
            fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            bg-bg-content border border-border rounded-xl shadow-xl
            w-full max-w-md z-50 p-6
          "
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-text-primary m-0">
                  {selectedUsuario.nombre} {selectedUsuario.apellido}
                </h3>
                <span
                  className={`
                  text-xs px-2 py-0.5 rounded-full
                  ${
                    selectedUsuario.estado
                      ? "bg-success/10 text-success"
                      : "bg-danger/10 text-danger"
                  }
                `}
                >
                  {selectedUsuario.estado ? "Activo" : "Inactivo"}
                </span>
              </div>
              <button
                onClick={handleCerrarModal}
                className="text-text-tertiary hover:text-text-primary transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-2 text-sm text-text-primary mb-6">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-text-tertiary text-xs">Username</p>
                  <p className="font-medium">{selectedUsuario.username}</p>
                </div>
                <div>
                  <p className="text-text-tertiary text-xs">Documento</p>
                  <p className="font-medium">{selectedUsuario.documento}</p>
                </div>
                <div>
                  <p className="text-text-tertiary text-xs">Perfil</p>
                  <p className="font-medium">{selectedUsuario.perfil.nombre}</p>
                </div>
                <div>
                  <p className="text-text-tertiary text-xs">Nivel</p>
                  <p className="font-medium">
                    {selectedUsuario.perfil.es_operativo
                      ? "Operativo"
                      : selectedUsuario.perfil.nivel
                        ? `${selectedUsuario.perfil.nivel.nombre}`
                        : "Sin nivel"}
                  </p>
                </div>
                <div>
                  <p className="text-text-tertiary text-xs">Teléfono</p>
                  <p className="font-medium">
                    {selectedUsuario.telefono ?? "-"}
                  </p>
                </div>
                <div>
                  <p className="text-text-tertiary text-xs">Fecha Registro</p>
                  <p className="font-medium">
                    {new Date(
                      selectedUsuario.fecha_registro,
                    ).toLocaleDateString("es-PY")}
                  </p>
                </div>
              </div>
            </div>

            {/* Confirmar eliminar */}
            {confirmarEliminar && (
              <div className="mb-4 px-4 py-3 bg-danger/10 border border-danger/30 rounded-lg">
                <p className="text-danger text-sm m-0">
                  ¿Estás seguro que querés eliminar este usuario? Esta acción no
                  se puede deshacer.
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-between gap-2">
              {/* Eliminar */}
              <ProtectedAction modulo="usuarios" accion="eliminar" ocultar>
                <div>
                  {/* Solo mostrar si es ROOT O si el usuario NO es exclusivo_root */}
                  {(usuario?.perfil?.nombre === "ROOT" ||
                    !selectedUsuario.perfil.nivel?.exclusivo_root) && (
                    <>
                      {!confirmarEliminar ? (
                        <button
                          onClick={() => setConfirmarEliminar(true)}
                          className="
                flex items-center gap-2 px-3 py-2 text-sm rounded-lg
                bg-danger/10 hover:bg-danger/20
                text-danger border border-danger/30
                transition-colors
              "
                        >
                          <Trash2 size={15} />
                          Eliminar
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setConfirmarEliminar(false)}
                            className="
                  px-3 py-2 text-sm rounded-lg
                  border border-border text-text-primary
                  hover:bg-bg-base transition-colors
                "
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleEliminar}
                            disabled={eliminarMutation.isPending}
                            className="
                  flex items-center gap-2 px-3 py-2 text-sm rounded-lg
                  bg-danger hover:bg-danger/80
                  text-white font-medium transition-colors
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
                          >
                            {eliminarMutation.isPending && (
                              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            )}
                            Confirmar
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </ProtectedAction>

              {/* Acciones principales */}
              <div className="flex gap-2">
                {/* Cambiar Contraseña - Solo si tiene permiso o es ROOT */}
                {(puedeEditarPassword || selectedUsuario.id === usuario?.id) &&
                  (usuario?.perfil?.nombre === "ROOT" ||
                    !selectedUsuario.perfil.nivel?.exclusivo_root) && (
                    <button
                      onClick={handleAbrirModalPassword}
                      className="
            flex items-center gap-2 px-3 py-2 text-sm rounded-lg
            bg-warning/10 hover:bg-warning/20 text-warning border border-warning/30
            transition-colors font-medium
          "
                    >
                      <KeyRound size={15} />
                      Cambiar Contraseña
                    </button>
                  )}

                {/* Activar / Desactivar - Solo ROOT o NO exclusivo_root */}
                {(usuario?.perfil?.nombre === "ROOT" ||
                  !selectedUsuario.perfil.nivel?.exclusivo_root) && (
                  <ProtectedAction modulo="usuarios" accion="editar" ocultar>
                    <button
                      onClick={handleToggleEstado}
                      disabled={actualizarMutation.isPending}
                      className={`
            flex items-center gap-2 px-3 py-2 text-sm rounded-lg
            transition-colors font-medium
            disabled:opacity-60 disabled:cursor-not-allowed
            ${
              selectedUsuario.estado
                ? "bg-warning/10 hover:bg-warning/20 text-warning border border-warning/30"
                : "bg-success/10 hover:bg-success/20 text-success border border-success/30"
            }
          `}
                    >
                      {actualizarMutation.isPending ? (
                        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : selectedUsuario.estado ? (
                        <UserX size={15} />
                      ) : (
                        <UserCheck size={15} />
                      )}
                      {selectedUsuario.estado ? "Desactivar" : "Activar"}
                    </button>
                  </ProtectedAction>
                )}

                {/* Editar - Solo ROOT o NO exclusivo_root */}
                {(usuario?.perfil?.nombre === "ROOT" ||
                  !selectedUsuario.perfil.nivel?.exclusivo_root) && (
                  <ProtectedAction modulo="usuarios" accion="editar" ocultar>
                    <button
                      onClick={handleEditar}
                      className="
            px-3 py-2 text-sm rounded-lg
            bg-primary hover:bg-primary-hover
            text-white transition-colors
          "
                    >
                      Editar
                    </button>
                  </ProtectedAction>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal Cambiar Contraseña */}
      {modalPasswordVisible && selectedUsuario && (
        <CambiarPasswordModal
          visible={modalPasswordVisible}
          usuario={{
            id: selectedUsuario.id,
            nombre: selectedUsuario.nombre,
            apellido: selectedUsuario.apellido,
            documento: selectedUsuario.documento,
          }}
          onClose={handleCerrarModalPassword}
          onConfirm={handleCambiarPassword}
          isPending={cambiarPasswordMutation.isPending}
          requierePasswordActual={requierePasswordActual}
        />
      )}
    </div>
  );
};

export default Usuarios;
