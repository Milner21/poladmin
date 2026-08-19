//src/routes/Routes.tsx
import { PWAInstallBanner } from "@components";
import { MainLayout } from "@components/layout";
import {
  CargarPadron,
  CrearPerfil,
  CrearUsuario,
  Dashboard,
  EditarPerfil,
  EditarUsuario,
  Login,
  Niveles,
  NotFound,
  Perfiles,
  Permisos,
  Usuarios,
} from "@pages";
import ActivadorPage from "@pages/private/activador/ActivadorPage";
import CuposActivadorPage from "@pages/private/activador/CuposActivadorPage";
import Campanas from "@pages/private/campanas/Campanas";
import ConfiguracionCampanaPage from "@pages/private/campanas/ConfiguracionCampanaPage";
import CrearCampana from "@pages/private/campanas/CrearCampana";
import EditarCampana from "@pages/private/campanas/EditarCampana";
import CrearImpresoraPage from "@pages/private/impresoras/CrearImpresoraPage";
import ImpresorasListaPage from "@pages/private/impresoras/ImpresorasListaPage";
import ReporteImpresionesPage from "@pages/private/impresoras/ReporteImpresionesPage";
import ImpresoraDetallePage from "@pages/private/impresoras/components/ImpresoraDetallePage";
import { MapaCalor } from "@pages/private/mapa";
import PadronDetallePage from "@pages/private/padron/PadronDetallePage";
import ConsultaVotantePage from "@pages/private/padron/consulta/ConsultaVotantePage";
import { PartidosPage } from "@pages/private/partidos";
import CrearPuestoPage from "@pages/private/puestos/CrearPuestoPage";
import PuestosListaPage from "@pages/private/puestos/PuestosListaPage";
import PuestoDetallePage from "@pages/private/puestos/components/PuestoDetallePage";
import { Reportes } from "@pages/private/reportes";
import { ReportesImprimirPage } from "@pages/private/reportes-imprimir";
import {
  CrearSimpatizante,
  ListaSimpatizantes,
  RegistrarParaPage,
} from "@pages/private/simpatizantes";
import ConsultaVotoPage from "@pages/private/simpatizantes/consulta-voto/ConsultaVotoPage";
import DashboardVotacionPage from "@pages/private/simpatizantes/dashboard-votacion/DashboardVotacionPage";
import DuplicadosSimpatizantesPage from "@pages/private/simpatizantes/duplicados/DuplicadosSimpatizantesPage";
import LocalesVotacionPage from "@pages/private/simpatizantes/locales/LocalesVotacionPage";
import RedSimpatizantesPage from "@pages/private/simpatizantes/red/RedSimpatizantesPage";
import SimpatizantesDeUsuarioPage from "@pages/private/simpatizantes/red/SimpatizantesDeUsuarioPage";
import RegistrarSimpatizantePage from "@pages/private/simpatizantes/registrar/RegistrarSimpatizantePage";
import SeguimientoSimpatizantesPage from "@pages/private/simpatizantes/seguimiento/SeguimientoSimpatizantesPage";
import CrearSolicitudPage from "@pages/private/solicitudes/crear/CrearSolicitudPage";
import SolicitudDetallePage from "@pages/private/solicitudes/detalle/SolicitudDetallePage";
import SolicitudesListaPage from "@pages/private/solicitudes/lista/SolicitudesListaPage";
import ConfiguracionTransportePage from "@pages/private/transportes/configuracion/ConfiguracionTransportePage";
import ConfirmarTransportePage from "@pages/private/transportes/confirmar/ConfirmarTransportePage";
import EscanearTransportePage from "@pages/private/transportes/escanear/EscanearTransportePage";
import TransportistaOperativaPage from "@pages/private/transportes/operativa/TransportistaOperativaPage";
import PasajerosListaPage from "@pages/private/transportes/pasajeros/PasajerosListaPage";
import RegistrarPasajeroPage from "@pages/private/transportes/pasajeros/RegistrarPasajeroPage";
import CrearTransportistaPage from "@pages/private/transportes/transportistas/CrearTransportistaPage";
import TransportistaDetallePage from "@pages/private/transportes/transportistas/TransportistaDetallePage";
import TransportistasListaPage from "@pages/private/transportes/transportistas/TransportistasListaPage";
import VerificacionesListaPage from "@pages/private/transportes/verificaciones/VerificacionesListaPage";
import { Navigate, Route, Routes } from "react-router";
import { ProtectedModuleRoute } from "./ProtectedModuleRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoutes";
import RoutesConfig, { basePaths } from "./RoutesConfig";
import SolidaridadPage from "@pages/private/solidaridad/SolidaridadPage";
import VerificadorPage from "@pages/private/verificador/VerificadorPage";
import ConfiguracionListaPage from "@pages/private/campanas/ConfiguracionListaPage";
import TemplateEditorPage from "@pages/private/templates/TemplateEditorPage";
import TemplatesListaPage from "@pages/private/templates/TemplatesListaPage";
import SimpatizantesDeCandidatoPage from "@pages/private/simpatizantes/red/SimpatizantesDeCandidatoPage";

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
            <Route element={<ProtectedModuleRoute modulo="reportes" />}>
              <Route path={RoutesConfig.reportes} element={<Reportes />} />
              <Route
                path={RoutesConfig.reportesImprimir}
                element={<ReportesImprimirPage />}
              />
            </Route>

            {/* Mapa de Calor */}
            <Route element={<ProtectedModuleRoute modulo="reportes" />}>
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
                element={<ConfiguracionListaPage />}
              />
              <Route
                path={`${RoutesConfig.configuracion}/:campanaId`}
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

            {/* Padron */}
            <Route element={<ProtectedModuleRoute modulo="padron" />}>
              <Route
                path={RoutesConfig.padronCargar}
                element={<CargarPadron />}
              />
              <Route
                path={`${basePaths.admin}/padron/detalle/:tipo/:departamento/:distrito`}
                element={<PadronDetallePage />}
              />
              <Route
                path={RoutesConfig.padronConsultar}
                element={<ConsultaVotantePage />}
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
                path={RoutesConfig.simpatizantesRegistrarPara}
                element={<RegistrarParaPage />}
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
                path={`${RoutesConfig.simpatizantesRed}/candidato/:candidatoId`}
                element={<SimpatizantesDeCandidatoPage />}
              />
              <Route
                path={RoutesConfig.simpatizantesSeguimiento}
                element={<SeguimientoSimpatizantesPage />}
              />
              <Route
                path={RoutesConfig.simpatizantesDuplicados}
                element={<DuplicadosSimpatizantesPage />}
              />
              <Route
                path={RoutesConfig.simpatizantesLocales}
                element={<LocalesVotacionPage />}
              />
              <Route
                path={RoutesConfig.simpatizantesConsultaVoto}
                element={<ConsultaVotoPage />}
              />
              <Route
                path={RoutesConfig.simpatizantesDashboardVotacion}
                element={<DashboardVotacionPage />}
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
              <Route
                path={RoutesConfig.impresorasReportes}
                element={<ReporteImpresionesPage />}
              />
            </Route>
            {/* Puestos de Control */}
            <Route element={<ProtectedModuleRoute modulo="puestos" />}>
              <Route
                path={RoutesConfig.puestosLista}
                element={<PuestosListaPage />}
              />
              <Route
                path={RoutesConfig.puestosCrear}
                element={<CrearPuestoPage />}
              />
              <Route
                path={`${RoutesConfig.puestosLista}/:id`}
                element={<PuestoDetallePage />}
              />
            </Route>
            {/* Activador */}
            <Route element={<ProtectedModuleRoute modulo="tickets" />}>
              <Route
                path={RoutesConfig.activadorPanel}
                element={<ActivadorPage />}
              />
              <Route
                path={RoutesConfig.activadorCupos}
                element={<CuposActivadorPage />}
              />
              <Route
                path={RoutesConfig.verificadorPanel}
                element={<VerificadorPage />}
              />
              <Route
                path={RoutesConfig.solidaridadPanel}
                element={<SolidaridadPage />}
              />
              <Route
                path={RoutesConfig.templateLista}
                element={<TemplatesListaPage />}
              />
              <Route
                path="/admin/templates/:campanaId/:modo"
                element={<TemplateEditorPage />}
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
