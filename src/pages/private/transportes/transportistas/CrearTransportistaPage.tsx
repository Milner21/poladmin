import { useState, useMemo, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@components";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { transportesService } from "@services/transportes.service";
import { perfilesService } from "@services/perfiles.service";
import { usuariosService } from "@services/usuarios.service";
import { ArrowLeft, Save, ShieldAlert } from "lucide-react";
import RoutesConfig from "@routes/RoutesConfig";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import type { TipoVehiculo } from "@dto/transporte.types";

const CrearTransportistaPage: FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Cargar perfiles para buscar el de TRANSPORTISTA
  const { data: perfiles, isLoading: isLoadingPerfiles } = useQuery({
    queryKey: ["perfiles"],
    queryFn: perfilesService.getAll,
    staleTime: 60000,
  });

  const perfilTransportista = useMemo(() => {
    if (!perfiles) return null;
    return perfiles.find((p) => p.nombre.toUpperCase().includes("TRANSPORTISTA"));
  }, [perfiles]);

  // 2. Estado del Formulario Combinado
  const [formData, setFormData] = useState({
    // Credenciales
    username: "",
    password: "",
    // Personales
    nombre: "",
    apellido: "",
    documento: "",
    telefono: "",
    // Vehículo
    tipo_vehiculo: "AUTO" as TipoVehiculo,
    marca_vehiculo: "",
    chapa_vehiculo: "",
    capacidad_pasajeros: 4,
  });

  // 3. Mutación Transaccional (Crea Usuario -> Crea Transportista)
  const crearTodoMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!perfilTransportista) throw new Error("Perfil de transportista no encontrado");

      // PASO A: Crear el Usuario
      const nuevoUsuario = await usuariosService.create({
        nombre: data.nombre,
        apellido: data.apellido,
        documento: data.documento,
        telefono: data.telefono || undefined,
        username: data.username,
        password: data.password,
        perfil_id: perfilTransportista.id,
      });

      // PASO B: Crear el Transportista vinculado a ese Usuario
      const nuevoTransportista = await transportesService.crearTransportista({
        usuario_id: nuevoUsuario.id,
        nombre: data.nombre,
        apellido: data.apellido,
        documento: data.documento,
        telefono: data.telefono || undefined,
        tipo_vehiculo: data.tipo_vehiculo,
        marca_vehiculo: data.marca_vehiculo || undefined,
        chapa_vehiculo: data.chapa_vehiculo,
        capacidad_pasajeros: data.capacidad_pasajeros,
      });

      return nuevoTransportista;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["transportistas"] });
      await queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      toast.success("Usuario y transportista registrados correctamente");
      navigate(RoutesConfig.transportesTransportistas);
    },
    onError: (error: unknown) => {
      let mensaje = "Error al registrar el transportista";
      if (error instanceof AxiosError) {
        mensaje = error.response?.data?.message || mensaje;
      } else if (error instanceof Error) {
        mensaje = error.message;
      }
      toast.error(mensaje);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    crearTodoMutation.mutate(formData);
  };

  // Pantalla de carga inicial
  if (isLoadingPerfiles) {
    return (
      <div className="py-4 px-6 flex justify-center items-center h-64">
        <p className="text-text-tertiary">Verificando configuración de perfiles...</p>
      </div>
    );
  }

  // Pantalla de Bloqueo si no existe el perfil
  if (!perfilTransportista) {
    return (
      <div className="py-4 px-6">
        <PageHeader
          title="Registrar Transportista"
          subtitle="Registra un nuevo transportista y su vehículo"
          showDivider
        />
        <button
          onClick={() => navigate(RoutesConfig.transportesTransportistas)}
          className="btn btn-outline mb-4 flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Volver
        </button>
        <div className="flex flex-col items-center justify-center p-12 bg-bg-content border border-border rounded-xl mt-6">
          <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert size={32} className="text-warning" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Perfil No Encontrado</h2>
          <p className="text-text-tertiary mb-6 text-center max-w-md">
            Para poder registrar un transportista, el sistema requiere que exista un perfil de usuario llamado <strong>"TRANSPORTISTA"</strong>.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(RoutesConfig.perfilesCrear)}
              className="btn btn-primary px-6"
            >
              Ir a Crear Perfil
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Formulario Principal
  return (
    <div className="py-4 px-6">
      <PageHeader
        title="Registrar Transportista"
        subtitle="Crea la cuenta de usuario y asigna el vehículo en un solo paso"
        showDivider
      />

      <button
        onClick={() => navigate(RoutesConfig.transportesTransportistas)}
        className="btn btn-outline mb-4 flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Volver
      </button>

      <div className="max-w-3xl bg-bg-content border border-border rounded-xl p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* BLOQUE 1: Datos Personales */}
          <section>
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
              Datos Personales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Nombre <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  minLength={2}
                  className="w-full px-3 py-2 bg-bg-base border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Apellido <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  required
                  minLength={2}
                  className="w-full px-3 py-2 bg-bg-base border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  CI / Documento <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={formData.documento}
                  onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                  required
                  minLength={3}
                  className="w-full px-3 py-2 bg-bg-base border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-3 py-2 bg-bg-base border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </section>

          <hr className="border-border" />

          {/* BLOQUE 2: Credenciales */}
          <section>
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">2</span>
              Credenciales de Acceso
            </h3>
            <p className="text-sm text-text-tertiary mb-4">
              Estos son los datos con los que el transportista ingresará a la aplicación.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Nombre de Usuario <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  minLength={4}
                  placeholder="Ej: juan.perez"
                  className="w-full px-3 py-2 bg-bg-base border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Contraseña <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2 bg-bg-base border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </section>

          <hr className="border-border" />

          {/* BLOQUE 3: Vehículo */}
          <section>
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">3</span>
              Datos del Vehículo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Tipo de Vehículo <span className="text-danger">*</span>
                </label>
                <select
                  value={formData.tipo_vehiculo}
                  onChange={(e) => setFormData({ ...formData, tipo_vehiculo: e.target.value as TipoVehiculo })}
                  className="w-full px-3 py-2 bg-bg-base border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="AUTO">Auto</option>
                  <option value="SUV">SUV</option>
                  <option value="FURGON">Furgón</option>
                  <option value="OMNIBUS">Ómnibus</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Marca
                </label>
                <input
                  type="text"
                  value={formData.marca_vehiculo}
                  onChange={(e) => setFormData({ ...formData, marca_vehiculo: e.target.value })}
                  placeholder="Toyota, Nissan, etc."
                  className="w-full px-3 py-2 bg-bg-base border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Chapa <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={formData.chapa_vehiculo}
                  onChange={(e) => setFormData({ ...formData, chapa_vehiculo: e.target.value.toUpperCase() })}
                  required
                  minLength={3}
                  placeholder="ABC123"
                  className="w-full px-3 py-2 bg-bg-base border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Capacidad de Pasajeros <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  value={formData.capacidad_pasajeros}
                  onChange={(e) => setFormData({ ...formData, capacidad_pasajeros: parseInt(e.target.value) })}
                  required
                  min={1}
                  max={60}
                  className="w-full px-3 py-2 bg-bg-base border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </section>

          <div className="flex gap-3 pt-6 border-t border-border">
            <button
              type="submit"
              disabled={crearTodoMutation.isPending}
              className="btn btn-primary flex items-center justify-center gap-2 flex-1 md:flex-none md:w-64"
            >
              <Save size={16} />
              {crearTodoMutation.isPending ? "Guardando..." : "Guardar Todo"}
            </button>
            <button
              type="button"
              onClick={() => navigate(RoutesConfig.transportesTransportistas)}
              className="btn btn-outline flex-1 md:flex-none md:w-32"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearTransportistaPage;