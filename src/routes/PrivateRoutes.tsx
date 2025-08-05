import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@hooks/useAuth";
import { Loading } from "@components";

export const PrivateRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;

  return user ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};