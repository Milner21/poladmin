import { Routes, Route, Navigate } from "react-router";
import { lazy, Suspense } from "react";
//importacion de componentes
import { Loading, PWAInstallBanner } from "@components";
///importacion de rutas
import { PublicRoutes } from "./PublicRoutes";
import { PrivateRoute } from "./PrivateRoutes";
import {RoutesConfig as RC} from "./RoutesConfig";
//importacion de pages
import {NotFound, Login} from "@pages";
import { TransportRegistration } from "../pages/admin";
import BulkVoterRegistration from "../pages/admin/voters/voter_bulk_registration";
import EventAttendance from "../pages/admin/event/EventAttendance";

const Test = lazy(() => import("@components/Test"));

const AppRoutes = () => {
  return (
    <>
      <Routes>
        {/* Rutas públicas protegidas (no accesibles si ya estás logueado) */}
        <Route element={<PublicRoutes />}>
          <Route path={RC.login} element={<Login />} />
        </Route>

        {/* Rutas públicas sin protección */}
        <Route path={RC.home} element={<div>Home Page</div>} />
        <Route path="/tr" element={<TransportRegistration />} />
        <Route path="/rm" element={<BulkVoterRegistration />} />
        
        {/* Elementos pesados con lazy loading */}
        <Route
          path="/ts"
          element={
            <Suspense fallback={<Loading />}>
              <Test />
            </Suspense>
          }
        />

        {/* Redirección de /admin a /admin/dashboard */}
        <Route path="/admin" element={<Navigate to={RC.dashboard} replace />} />

        {/* Rutas administrativas privadas */}
        <Route element={<PrivateRoute />}>
          <Route path={RC.dashboard} element={<Test />} />
          <Route path={RC.eventos} element={<EventAttendance />} />
          <Route path={RC.registro_votantes} element={<div>Registro Votantes</div>} />
        </Route>

        {/* Ruta catch-all para 404 - DEBE IR AL FINAL */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <PWAInstallBanner />
    </>
  );
};

export default AppRoutes;
