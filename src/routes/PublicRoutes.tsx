import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@hooks/useAuth";
import { App } from "antd";
import RoutesConfig from "./RoutesConfig";

export const PublicRoutes = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { message } = App.useApp();

  useEffect(() => {
    if (user) {
      message.info("Ya estás logueado");
    }
  }, [user, message]);

  if (loading) return null;

  if (user) {
    const from =
      (location.state as { from?: Location })?.from?.pathname || RoutesConfig.dashboard;
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};
