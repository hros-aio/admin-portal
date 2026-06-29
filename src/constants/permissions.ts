export type Module =
  | "dashboard"
  | "tenant_management"
  | "plan_management"
  | "admin_management"
  | "policy_management"
  | "subscription_management"
  | "audit_logs";

export type Action =
  | "can_view"
  | "can_create"
  | "can_update"
  | "can_delete"
  | "can_approve"
  | "can_export";

export type PermissionMatrix = Partial<Record<Module, Partial<Record<Action, boolean>>>>;

export const MODULES: Module[] = [
  "dashboard",
  "tenant_management",
  "plan_management",
  "admin_management",
  "policy_management",
  "subscription_management",
  "audit_logs",
];

export const ACTIONS: Action[] = [
  "can_view",
  "can_create",
  "can_update",
  "can_delete",
  "can_approve",
  "can_export",
];
