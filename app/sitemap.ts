import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { listWriteups } from '@/lib/writeups';

// login/register deliberately excluded.
const PATHS = [
  '/',
  '/dashboard',
  '/system',
  '/track-record',
  '/signals',
  '/incidents',
  '/charts',
  '/charts/v7',
  '/charts/liquidity',
  '/charts/cancel-flow',
  '/writeups',
  '/privacy',
  '/terms',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const fixed = PATHS.flatMap((path) => {
    const p = path === '/' ? '' : path;
    const en = `${SITE_URL}${p || '/'}`;
    const zh = `${SITE_URL}/zh${p}`;
    const alternates = { languages: { en, 'zh-Hant': zh } };
    return [
      { url: en, lastModified: now, alternates },
      { url: zh, lastModified: now, alternates },
    ];
  });

  // Individual write-ups. Unlike the fixed pages these do not all exist in
  // both locales, so each URL is emitted only for languages it was actually
  // written in, and hreflang only claims the translations that exist.
  const zhSlugs = new Set(listWriteups('zh').map((w) => w.slug));
  const enSlugs = new Set(listWriteups('en').map((w) => w.slug));
  const articles = [...new Set([...zhSlugs, ...enSlugs])].flatMap((slug) => {
    const en = `${SITE_URL}/writeups/${slug}`;
    const zh = `${SITE_URL}/zh/writeups/${slug}`;
    const languages: Record<string, string> = {};
    if (enSlugs.has(slug)) languages.en = en;
    if (zhSlugs.has(slug)) languages['zh-Hant'] = zh;
    const alternates = { languages };
    const out: MetadataRoute.Sitemap = [];
    if (enSlugs.has(slug)) out.push({ url: en, lastModified: now, alternates });
    if (zhSlugs.has(slug)) out.push({ url: zh, lastModified: now, alternates });
    return out;
  });

  return [...fixed, ...articles];
}
