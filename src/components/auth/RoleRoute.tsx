import { Navigate, Outlet } from "react-router-dom";
import { getStoredUser } from "@/lib/api";
import { getRolePermissions, type PermissionKey } from "@/lib/permissions";

interface RoleRouteProps {
  permission: PermissionKey;
}

export default function RoleRoute({ permission }: RoleRouteProps) {
  const user = getStoredUser();
  const permissions = getRolePermissions(user?.role);

  if (!permissions[permission]) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
