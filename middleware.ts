import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next.js internals, and anything that looks like a
  // static file (has a dot in the last path segment) — those aren't
  // localized routes and shouldn't be redirected through locale
  // detection.
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
