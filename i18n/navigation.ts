import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Locale-aware Link/useRouter/usePathname/redirect — every internal
// <Link> in the app should import from here instead of next/link, so
// navigating within the site preserves whichever locale the visitor is
// currently on instead of bouncing them back to the default.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
