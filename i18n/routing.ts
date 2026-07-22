import { defineRouting } from 'next-intl/routing';

// English default, Traditional Chinese as the second locale — matches
// how this project's own internal docs/chat are already written (zh-TW,
// not simplified).
export const routing = defineRouting({
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  // English keeps its existing unprefixed URLs (/track-record, /system,
  // …) — this site's already live and those may be bookmarked/indexed.
  // Only the new language gets a prefix (/zh/track-record).
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];
