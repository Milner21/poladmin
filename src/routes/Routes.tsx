import { Navigate, Route, Routes } from "react-router";
import { PWAInstallBanner } from "@components";
import RoutesConfig, { basePaths } from "./RoutesConfig";
import { MainLayout } from "@components/layout";
import {
  Dashboard,
  Login,
  NotFound,
  Usuarios,
  CrearUsuario,
  EditarUsuario,
  Permisos,
  Perfiles,
  CrearPerfil,
  EditarPerfil,
  Niveles,
  CargarPadron,
} from "@pages";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoutes";
import { ProtectedModuleRoute } from "./ProtectedModuleRoute";
import {
  CrearSimpatizante,
  ListaSimpatizantes,
} from "@pages/private/simpatizantes";
import Campanas from "@pages/private/campanas/Campanas";
import CrearCampana from "@pages/private/campanas/CrearCampana";
import EditarCampana from "@pages/private/campanas/EditarCampana";
import { Reportes } from "@pages/private/reportes";
import { MapaCalor } from "@pages/private/mapa";
import SolicitudesListaPage from "@pages/private/solicitudes/lista/SolicitudesListaPage";
import TransportistasListaPage from "@pages/private/transportes/transportistas/TransportistasListaPage";
import PasajerosListaPage from "@pages/private/transportes/pasajeros/PasajerosListaPage";
import VerificacionesListaPage from "@pages/private/transportes/verificaciones/VerificacionesListaPage";
import CrearSolicitudPage from "@pages/private/solicitudes/crear/CrearSolicitudPage";
import CrearTransportistaPage from "@pages/private/transportes/transportistas/CrearTransportistaPage";
import RegistrarPasajeroPage from "@pages/private/transportes/pasajeros/RegistrarPasajeroPage";
import SolicitudDetallePage from "@pages/private/solicitudes/detalle/SolicitudDetallePage";
import ConfiguracionTransportePage from "@pages/private/transportes/configuracion/ConfiguracionTransportePage";
import TransportistaDetallePage from "@pages/private/transportes/transportistas/TransportistaDetallePage";
import TransportistaOperativaPage from "@pages/private/transportes/operativa/TransportistaOperativaPage";
import EscanearTransportePage from "@pages/private/transportes/escanear/EscanearTransportePage";
import ConfirmarTransportePage from "@pages/private/transportes/confirmar/ConfirmarTransportePage";
import ImpresorasListaPage from "@pages/private/impresoras/ImpresorasListaPage";
import CrearImpresoraPage from "@pages/private/impresoras/CrearImpresoraPage";
import ImpresoraDetallePage from "@pages/private/impresoras/components/ImpresoraDetallePage";
import { PartidosPage } from "@pages/private/partidos";
import ConfiguracionCampanaPage from "@pages/private/campanas/ConfiguracionCampanaPage";
import RegistrarSimpatizantePage from "@pages/private/simpatizantes/registrar/RegistrarSimpatizantePage";
import RedSimpatizantesPage from "@pages/private/simpatizantes/red/RedSimpatizantesPage";
import SimpatizantesDeUsuarioPage from "@pages/private/simpatizantes/red/SimpatizantesDeUsuarioPage";
import SeguimientoSimpatizantesPage from "@pages/private/simpatizantes/seguimiento/SeguimientoSimpatizantesPage";
import DuplicadosSimpatizantesPage from "@pages/private/simpatizantes/duplicados/DuplicadosSimpatizantesPage";
import PadronDetallePage from "@pages/private/padron/PadronDetallePage";

const AppRoutes = () => {
  return (
    <>
      <Routes>
        {/* Rutas públicas */}
        <Route element={<PublicRoute />}>
          <Route path={RoutesConfig.login} element={<Login />} />
        </Route>

        {/* Redirección de /admin a /admin/dashboard */}
        <Route
          path={basePaths.admin}
          element={<Navigate to={RoutesConfig.dashboard} replace />}
        />

        {/* Rutas privadas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* Dashboard - todos pueden ver */}
            <Route path={RoutesConfig.dashboard} element={<Dashboard />} />

            {/* Reportes */}
            <Route element={<ProtectedModuleRoute modulo="dashboard" />}>
              <Route path={RoutesConfig.reportes} element={<Reportes />} />
            </Route>

            {/* Mapa de Calor */}
            <Route element={<ProtectedModuleRoute modulo="dashboard" />}>
              <Route path={RoutesConfig.mapa} element={<MapaCalor />} />
            </Route>

            {/* Campañas - solo ROOT */}
            <Route element={<ProtectedModuleRoute modulo="campanas" />}>
              <Route path={RoutesConfig.partidos} element={<PartidosPage />} />
              <Route path={RoutesConfig.campanas} element={<Campanas />} />
              <Route
                path={RoutesConfig.campanasCrear}
                element={<CrearCampana />}
              />
              <Route
                path={`${RoutesConfig.campanas}/editar/:id`}
                element={<EditarCampana />}
              />
              <Route
                path={RoutesConfig.configuracion}
                element={<ConfiguracionCampanaPage />}
              />
            </Route>

            {/* Niveles - solo ROOT */}
            <Route element={<ProtectedModuleRoute modulo="niveles" />}>
              <Route path={RoutesConfig.niveles} element={<Niveles />} />
            </Route>

            {/* Usuarios */}
            <Route element={<ProtectedModuleRoute modulo="usuarios" />}>
              <Route path={RoutesConfig.usuarios} element={<Usuarios />} />
              <Route
                path={RoutesConfig.usuariosCrear}
                element={<CrearUsuario />}
              />
              <Route
                path={`${RoutesConfig.usuarios}/editar/:id`}
                element={<EditarUsuario />}
              />
            </Route>

            {/* Permisos */}
            <Route element={<ProtectedModuleRoute modulo="permisos" />}>
              <Route path={RoutesConfig.permisos} element={<Permisos />} />
            </Route>

            {/* Perfiles */}
            <Route element={<ProtectedModuleRoute modulo="perfiles" />}>
              <Route path={RoutesConfig.perfiles} element={<Perfiles />} />
              <Route
                path={RoutesConfig.perfilesCrear}
                element={<CrearPerfil />}
              />
              <Route
                path={`${RoutesConfig.perfiles}/editar/:id`}
                element={<EditarPerfil />}
              />
            </Route>

            {/* Padron - solo ROOT */}
            <Route element={<ProtectedModuleRoute modulo="padron" />}>
              <Route
                path={RoutesConfig.padronCargar}
                element={<CargarPadron />}
              />
              <Route
                path={`${basePaths.admin}/padron/detalle/:tipo/:departamento/:distrito`}
                element={<PadronDetallePage />}
              />
            </Route>
            {/* Simpatizantes */}
            <Route element={<ProtectedModuleRoute modulo="simpatizantes" />}>
              <Route
                path={RoutesConfig.simpatizantesCrear}
                element={<CrearSimpatizante />}
              />
              <Route
                path={RoutesConfig.simpatizantesRegistrar}
                element={<RegistrarSimpatizantePage />}
              />
              <Route
                path={RoutesConfig.simpatizantesLista}
                element={<ListaSimpatizantes />}
              />
              <Route
                path={RoutesConfig.simpatizantesRed}
                element={<RedSimpatizantesPage />}
              />
              <Route
                path={`${RoutesConfig.simpatizantesRed}/:usuarioId`}
                element={<SimpatizantesDeUsuarioPage />}
              />
              <Route
                path={RoutesConfig.simpatizantesSeguimiento}
                element={<SeguimientoSimpatizantesPage />}
              />
              <Route
                path={RoutesConfig.simpatizantesDuplicados}
                element={<DuplicadosSimpatizantesPage />}
              />
            </Route>

            {/* Solicitudes */}
            <Route element={<ProtectedModuleRoute modulo="solicitudes" />}>
              <Route
                path={RoutesConfig.solicitudes}
                element={<SolicitudesListaPage />}
              />
              <Route
                path={RoutesConfig.solicitudesCrear}
                element={<CrearSolicitudPage />}
              />
              <Route
                path={`${RoutesConfig.solicitudes}/:id`}
                element={<SolicitudDetallePage />}
              />
            </Route>

            {/* Transportes */}
            <Route element={<ProtectedModuleRoute modulo="transportes" />}>
              <Route
                path={RoutesConfig.transportesTransportistas}
                element={<TransportistasListaPage />}
              />
              <Route
                path={RoutesConfig.transportesTransportistasCrear}
                element={<CrearTransportistaPage />}
              />
              <Route
                path={`${RoutesConfig.transportesTransportistas}/:id`}
                element={<TransportistaDetallePage />}
              />
              <Route
                path={RoutesConfig.transportesPasajeros}
                element={<PasajerosListaPage />}
              />
              <Route
                path={RoutesConfig.transportesPasajerosRegistrar}
                element={<RegistrarPasajeroPage />}
              />
              <Route
                path={RoutesConfig.transportesVerificaciones}
                element={<VerificacionesListaPage />}
              />
              <Route
                path={RoutesConfig.transportesConfiguracion}
                element={<ConfiguracionTransportePage />}
              />
              <Route
                path={RoutesConfig.transportesOperativa}
                element={<TransportistaOperativaPage />}
              />
              <Route
                path={RoutesConfig.transportesEscanear}
                element={<EscanearTransportePage />}
              />
              <Route
                path={RoutesConfig.transportesConfirmar}
                element={<ConfirmarTransportePage />}
              />
            </Route>

            {/* impresoras */}
            <Route element={<ProtectedModuleRoute modulo="impresoras" />}>
              <Route
                path={RoutesConfig.impresorasLista}
                element={<ImpresorasListaPage />}
              />
              <Route
                path={RoutesConfig.impresorasCrear}
                element={<CrearImpresoraPage />}
              />
              <Route
                path={RoutesConfig.impresorasDetalle}
                element={<ImpresoraDetallePage />}
              />
            </Route>

            <Route path="*" element={<div>Estamos trabajando en ello</div>} />
          </Route>
        </Route>

        {/* Redirección raíz */}
        <Route
          path={RoutesConfig.home}
          element={<Navigate to={RoutesConfig.login} replace />}
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <PWAInstallBanner />
    </>
  );
};

export default AppRoutes;
