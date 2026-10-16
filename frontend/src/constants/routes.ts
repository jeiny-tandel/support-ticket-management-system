/**
 * Centralized application route paths for SolviX.
 */
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  TICKETS: '/tickets',
  DELETED_TICKETS: '/tickets/deleted',
  TICKET_DETAILS: '/tickets/:id',
  USERS: '/users',
  PROFILE: '/profile',
  UNAUTHORIZED: '/unauthorized',
} as const;


export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
