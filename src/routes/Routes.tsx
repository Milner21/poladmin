import { Routes, Route } from "react-router";
//import RoutesConfig from "./RoutesConfig";
import { TransportRegistration, VoterRegistration } from "../pages/admin";
import EventAttendance from "../pages/admin/event/EventAttendance";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path={"/home"} element={<VoterRegistration />} />
      <Route path="/tr" element={<TransportRegistration />} />
      <Route path="/ev" element={<EventAttendance />} />
      <Route path="/test" element={<div><h1>NOT FOUND</h1></div>} />
      {/* Rutas administrativas privadas */}
    </Routes>
  );
};

export default AppRoutes;
