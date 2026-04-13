import { Navigate, Outlet, useLocation } from "react-router-dom";
import { storage } from "../utils/storage";
import RoutesConfig from "./RoutesConfig";

export const PublicRoute = () => {
  const location = useLocation();
  const token = storage.getToken();

  if (token) {
    const from =
      (location.state as { from?: Location })?.from?.pathname ||
      RoutesConfig.dashboard;
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};