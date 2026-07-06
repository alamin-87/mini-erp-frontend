import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getStoredAuth } from "@/lib/api";

export default function ProtectedRoute() {
  const location = useLocation();
  const token = getStoredAuth();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
