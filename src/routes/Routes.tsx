import { Routes, Route } from "react-router";
import RoutesConfig from "./RoutesConfig";
import { lazy, Suspense } from "react";
/////////////////////////////////////////////////////////
import { TransportRegistration } from "../pages/admin";
import BulkVoterRegistration from "../pages/admin/voters/voter_bulk_registration";
import VoterRegistration from "../pages/admin/voters/voter_registration";
import EventAttendance from "../pages/admin/event/EventAttendance";
import { Login } from "@pages";
import { PrivateRoute } from "./PrivateRoutes";
import { Loading } from "@components";
import { PublicRoutes } from "./PublicRoutes";

const Test = lazy(() => import("@components/Test"));

//////////////////////////////////////////////////////////

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path={RoutesConfig.home} element={<VoterRegistration />} />
      {/* elementos pesados */}
      <Route
        path="/ts"
        element={
          <Suspense fallback={<Loading />}>
            <Test />
          </Suspense>
        }
      />
      <Route path="/tr" element={<TransportRegistration />} />
      <Route path="/rm" element={<BulkVoterRegistration />} />
      <Route element={<PublicRoutes />}>
        <Route path={RoutesConfig.login} element={<Login />} />
      </Route>

      {/* Rutas administrativas privadas */}
      <Route element={<PrivateRoute />}>
        <Route path="/pr" element={<Test />} />
        <Route path="/ev" element={<EventAttendance />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
