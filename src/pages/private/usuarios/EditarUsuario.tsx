// src/pages/private/usuarios/EditarUsuario.tsx

import { PageHeader } from "@components";
import { useAuth } from "@hooks/useAuth";
import { useCampanaSeleccionada } from "@hooks/useCampanaSeleccionada";
import { usePermisos } from "@hooks/usePermisos";
import RoutesConfig from "@routes/RoutesConfig";
import { useEffect, useMemo, useState, type FC } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePerfiles } from "../perfiles/hooks/usePerfiles";
import { usePermisos as useListaPermisos } from "../permisos/hooks/usePermisos";
import { UsuarioForm, type FormValues, type FormErrors } from "./components/UsuarioForm";
import { useActualizarUsuario } from "./hooks/useActualizarUsuario";
import { useUsuario } from "./hooks/useUsuario";
import { useCandidatosSuperiores } from "./hooks/useCandidatosSuperiores";
import toast from "react-hot-toast";
import type { UpdateUsuarioDto } from "@dto/usuario.types";
import { SimpatizanteStatusCard } from "./components/SimpatizanteStatusCard";
import { useSimpatizanteStatus } from "./hooks/useSimpatizanteStatus";

const EditarUsuario: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario: usuarioActual } = useAuth();
  const { esRoot } = usePermisos();
  const { campanaSeleccionada } = useCampanaSeleccionada();

  const {
    estadoSimpatizante,
    cargandoEstado,
    reactivarSimpatizante,
    reactivandoSimpatizante,
  } = useSimpatizanteStatus(id);

  // Estados del formulario
  const [values, setValues] = useState<FormValues>({
    nombre: "",
    apellido: "",
    documento: "",
    telefono: "",
    barrio: "",
    password: "",
    confirmarPassword: "",
    perfil_id: "",
    candidato_superior_id: "",
    username: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Estados para Operativo
  const [tipoUsuario, setTipoUsuario] = useState<"politico" | "operativo">(
    "politico",
  );
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>(
    [],
  );

  // Hooks de datos
  const { data: usuarioAEditar, isLoading: isLoadingUsuario } = useUsuario(id);
  const { data: perfiles } = usePerfiles();
  const { data: todosLosPermisosDb } = useListaPermisos();
  const actualizarMutation = useActualizarUsuario();

  // Mapeo del perfil seleccionado y nivel de orden
  const perfilSeleccionado = useMemo(() => {
    if (!perfiles || !values.perfil_id) return undefined;
    return perfiles.find((p) => p.id === values.perfil_id);
  }, [perfiles, values.perfil_id]);

  const nivelOrdenSeleccionado = useMemo(() => {
    if (tipoUsuario === "operativo") {
      return 99; // Retorna la lista completa de candidatos políticos
    }
    return perfilSeleccionado?.nivel?.orden ?? 0;
  }, [tipoUsuario, perfilSeleccionado]);

  // Mostrar el selector de candidato superior cuando sea ROOT
  const mostrarSelectorSuperior = useMemo(() => {
    return (
      esRoot &&
      !!values.perfil_id &&
      (tipoUsuario === "operativo" || (tipoUsuario === "politico" && nivelOrdenSeleccionado > 1))
    );
  }, [esRoot, values.perfil_id, tipoUsuario, nivelOrdenSeleccionado]);

  const { data: candidatosSuperiores, isLoading: isLoadingCandidatos } =
    useCandidatosSuperiores(
      usuarioAEditar?.campana_id ?? campanaSeleccionada,
      nivelOrdenSeleccionado,
    );

  // Calcular si puede editar username
  const puedeEditarUsername = useMemo(() => {
    if (!usuarioActual) return false;
    if (usuarioActual.perfil?.nombre === "ROOT") return true;

    const todosLosPermisos = [
      ...(usuarioActual.perfil?.permisos?.map((p) => p.permiso.nombre) || []),
      ...(usuarioActual.permisos_personalizados?.map((p) => p.permiso.nombre) || []),
    ];

    return todosLosPermisos.includes("editar_username_usuario");
  }, [usuarioActual]);

  // Cargar datos del usuario a editar
  useEffect(() => {
    if (
      usuarioActual?.perfil?.nombre !== "ROOT" &&
      usuarioAEditar?.perfil?.nivel?.exclusivo_root
    ) {
      toast.error("No tenés permiso para editar este usuario");
      navigate(RoutesConfig.usuarios);
    }

    if (usuarioAEditar) {
      const esOperativoEdicion = usuarioAEditar.perfil.es_operativo;
      setTipoUsuario(esOperativoEdicion ? "operativo" : "politico");

      setValues({
        nombre: usuarioAEditar.nombre,
        apellido: usuarioAEditar.apellido,
        documento: usuarioAEditar.documento,
        telefono: usuarioAEditar.telefono ?? "",
        barrio: "",
        password: "",
        confirmarPassword: "",
        perfil_id: usuarioAEditar.perfil.id,
        candidato_superior_id: usuarioAEditar.candidato_superior_id ?? "",
        username: usuarioAEditar.username,
      });

      if (esOperativoEdicion && usuarioAEditar.permisos_personalizados) {
        const permisosPreviosIds = usuarioAEditar.permisos_personalizados.map(
          (pp) => pp.permiso_id,
        );
        setPermisosSeleccionados(permisosPreviosIds);
      }
    }
  }, [usuarioAEditar, usuarioActual, navigate]);

  // Precargar barrio desde el simpatizante asociado
  useEffect(() => {
    if (estadoSimpatizante?.barrio) {
      setValues((prev) => ({
        ...prev,
        barrio: estadoSimpatizante.barrio ?? "",
      }));
    }
  }, [estadoSimpatizante]);

  // Filtrado de perfiles
  const perfilesFiltrados = useMemo(() => {
    if (!perfiles) return [];

    return perfiles.filter((perfil) => {
      if (tipoUsuario === "operativo") {
        return perfil.es_operativo;
      }

      if (tipoUsuario === "politico") {
        if (perfil.es_operativo) return false;
        if (usuarioActual?.perfil?.nombre === "ROOT") return perfil.nombre !== "ROOT";
        if (!perfil.nivel) return false;
        return true;
      }
      return false;
    });
  }, [perfiles, tipoUsuario, usuarioActual]);

  // Filtrado de permisos
  const permisosParaAsignar = useMemo(() => {
    if (!todosLosPermisosDb) return [];
    if (usuarioActual?.perfil?.nombre === "ROOT") return todosLosPermisosDb;

    const misPermisosNombres = [
      ...(usuarioActual?.perfil?.permisos?.map((p) => p.permiso.nombre) || []),
      ...(usuarioActual?.permisos_personalizados?.map(
        (p) => p.permiso.nombre,
      ) || []),
    ];

    return todosLosPermisosDb.filter((p) =>
      misPermisosNombres.includes(p.nombre),
    );
  }, [todosLosPermisosDb, usuarioActual]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!values.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!values.apellido.trim()) newErrors.apellido = "El apellido es requerido";
    if (!values.perfil_id) newErrors.perfil_id = "El perfil es requerido";

    if (mostrarSelectorSuperior && !values.candidato_superior_id) {
      newErrors.perfil_id = "Debes seleccionar el candidato superior";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTogglePermiso = (permisoId: string) => {
    setPermisosSeleccionados((prev) =>
      prev.includes(permisoId)
        ? prev.filter((pId) => pId !== permisoId)
        : [...prev, permisoId],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !id) return;

    const dataToUpdate: UpdateUsuarioDto = {
      nombre: values.nombre.trim(),
      apellido: values.apellido.trim(),
      telefono: values.telefono.trim() || undefined,
      barrio: values.barrio.trim() || undefined,
      perfil_id: values.perfil_id,
      candidato_superior_id: mostrarSelectorSuperior
        ? values.candidato_superior_id || undefined
        : undefined,
      permisos_ids:
        tipoUsuario === "operativo" ? permisosSeleccionados : undefined,
    };

    if (puedeEditarUsername && values.username !== usuarioAEditar?.username) {
      dataToUpdate.username = values.username.trim();
    }

    actualizarMutation.mutate(
      { id, data: dataToUpdate },
      {
        onSuccess: () => navigate(RoutesConfig.usuarios),
      },
    );
  };

  if (isLoadingUsuario || !usuarioAEditar) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-4 px-6">
      <PageHeader
        title={`Editar: ${usuarioAEditar.nombre} ${usuarioAEditar.apellido}`}
        subtitle={
          tipoUsuario === "operativo"
            ? "Modificá los datos y permisos de este operador"
            : "Modificá los datos de este político"
        }
        showDivider
      />

      <div className="max-w-3xl">
        <SimpatizanteStatusCard
          estadoSimpatizante={estadoSimpatizante}
          cargandoEstado={cargandoEstado}
          onReactivar={() => id && reactivarSimpatizante(id)}
          reactivandoSimpatizante={reactivandoSimpatizante}
        />
        <div className="bg-bg-content border border-border rounded-xl p-6 shadow-sm">
          <UsuarioForm
            values={values}
            errors={errors}
            isPending={actualizarMutation.isPending}
            isEditing={true}
            puedeEditarUsername={puedeEditarUsername}
            perfiles={perfilesFiltrados}
            tipoUsuario={tipoUsuario}
            permisosDisponibles={permisosParaAsignar}
            permisosSeleccionados={permisosSeleccionados}
            onTogglePermiso={handleTogglePermiso}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={() => navigate(RoutesConfig.usuarios)}
            mostrarSelectorSuperior={mostrarSelectorSuperior}
            candidatosSuperiores={candidatosSuperiores}
            isLoadingCandidatos={isLoadingCandidatos}
          />
        </div>
      </div>
    </div>
  );
};

export default EditarUsuario;