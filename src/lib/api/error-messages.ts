export const ERROR_MESSAGES: Record<string, string> = {
  PERMISSION_DENIED: "You don't have permission to do this.",
  TENANT_CODE_EXISTS: "This tenant code is already in use.",
  CONFIRMATION_MISMATCH: "The name you typed doesn't match. Please try again.",
  LAST_ACTIVE_PLAN: "You can't archive the only active plan.",
  DOWNGRADE_EMPLOYEE_LIMIT: "Current employee count exceeds the new plan's limit.",
  SELF_DEACTIVATION: "You cannot modify your own account.",
  SELF_ROLE_CHANGE: "You cannot change your own role.",
  SELF_REMOVAL: "You cannot remove your own account.",
  SUPER_ADMIN_IMMUTABLE: "Super Admin permissions cannot be modified.",
  SUPER_ADMIN_INVITE_RESTRICTED: "Only Super Admins can invite Super Admins.",
  EMAIL_DUPLICATE: "This email is already in use.",
  EMPTY_RESPONSE: "Received an empty response from the server.",
};

export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? "An unexpected error occurred. Please try again.";
}
