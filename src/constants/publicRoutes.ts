/**
 * Public routes that don't require authentication
 * Used by auth watcher and route guards
 * 
 * This matches the web app's architecture to avoid route duplication
 */
export const AUTH_STORE_REDIRECT_ROUTES = [
  '/',
  '/sign-in',
  '/registration',
  '/reset-password',
  '/reset-password-email',
  '/update-password',
  '/user',
  '/preview'
] as const

