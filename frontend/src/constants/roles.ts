export const USER_ROLES = {
  ADMIN: "ADMIN",
  SUPPORT_AGENT: "SUPPORT_AGENT",
} as const;

export const ROLES = USER_ROLES;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
