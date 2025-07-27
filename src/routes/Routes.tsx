import { Routes, Route } from "react-router";
import RoutesConfig from "./RoutesConfig";
import {  TransportRegistration } from "../pages/admin";
import BulkVoterRegistration from "../pages/admin/voters/voter_bulk_registration";
import VoterRegistration from "../pages/admin/voters/voter_registration";
import EventAttendance from "../pages/admin/event/EventAttendance";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path={RoutesConfig.home} element={<VoterRegistration />} />
      <Route path="/tr" element={<TransportRegistration />} />
      <Route path="/ev" element={<EventAttendance />} />
      <Route path="/rm" element={<BulkVoterRegistration/>} />
      {/* Rutas administrativas privadas */}
    </Routes>
  );
};

export default AppRoutes;
