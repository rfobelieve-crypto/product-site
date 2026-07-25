// Single source of truth for absolute URLs + contact address.
// Set NEXT_PUBLIC_SITE_URL when the custom domain lands.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://product-site-green.vercel.app';

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hello@flowbot.example';

// hreflang + canonical for one logical path. localePrefix is 'as-needed':
// en lives unprefixed, zh under /zh.
export function pageAlternates(locale: string, path: string) {
  const p = path === '/' ? '' : path;
  const en = `${SITE_URL}${p || '/'}`;
  const zh = `${SITE_URL}/zh${p}`;
  return {
    canonical: locale === 'zh' ? zh : en,
    languages: { en, 'zh-Hant': zh, 'x-default': en },
  };
}
