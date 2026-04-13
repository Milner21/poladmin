// src/routes/ProtectedRoute.tsx

import { storage } from "@utils/storage";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import RoutesConfig from "./RoutesConfig";

export const ProtectedRoute = () => {
  const location = useLocation();
  const token = storage.getToken();

  if (!token) {
    return <Navigate to={RoutesConfig.login} state={{ from: location }} replace />;
  }

  return <Outlet />;
};