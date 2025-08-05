import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@hooks/useAuth";
import { message } from "antd";

export const PublicRoutes = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (user) {
    message.info("Ya estás logueado");
    const from = (location.state as { from?: Location })?.from?.pathname || "/ts";
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};