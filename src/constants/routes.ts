export const ROUTES = {
  login: () => "/login" as const,
  forgotPassword: () => "/forgot-password" as const,
  resetPassword: () => "/reset-password" as const,
  acceptInvite: () => "/accept-invite" as const,
  dashboard: () => "/dashboard" as const,
  tenants: () => "/tenants" as const,
  tenantDetail: (tenantId: string) => `/tenants/${tenantId}` as const,
  plans: () => "/plans" as const,
  planDetail: (planId: string) => `/plans/${planId}` as const,
  admins: () => "/admins" as const,
  policies: () => "/policies" as const,
  auditLogs: () => "/audit-logs" as const,
};
