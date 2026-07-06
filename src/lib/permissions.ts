export type AppRole = "ADMIN" | "MANAGER" | "EMPLOYEE";

export type PermissionKey =
  | "canViewProducts"
  | "canManageProducts"
  | "canCreateSales"
  | "canViewSales"
  | "canViewDashboard"
  | "canManageUsers";

export const ROLE_PERMISSIONS: Record<AppRole, Record<PermissionKey, boolean>> = {
  ADMIN: {
    canViewProducts: true,
    canManageProducts: true,
    canCreateSales: true,
    canViewSales: true,
    canViewDashboard: true,
    canManageUsers: true,
  },
  MANAGER: {
    canViewProducts: true,
    canManageProducts: true,
    canCreateSales: true,
    canViewSales: true,
    canViewDashboard: true,
    canManageUsers: false,
  },
  EMPLOYEE: {
    canViewProducts: true,
    canManageProducts: false,
    canCreateSales: true,
    canViewSales: false,
    canViewDashboard: true,
    canManageUsers: false,
  },
};

export const getRolePermissions = (role?: string | null) => {
  if (role === "ADMIN" || role === "MANAGER" || role === "EMPLOYEE") {
    return ROLE_PERMISSIONS[role as AppRole];
  }

  return ROLE_PERMISSIONS.EMPLOYEE;
};
