import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

// login/register deliberately excluded.
const PATHS = [
  '/',
  '/system',
  '/track-record',
  '/signals',
  '/incidents',
  '/charts',
  '/charts/v7',
  '/charts/cancel-flow',
  '/privacy',
  '/terms',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PATHS.flatMap((path) => {
    const p = path === '/' ? '' : path;
    const en = `${SITE_URL}${p || '/'}`;
    const zh = `${SITE_URL}/zh${p}`;
    const alternates = { languages: { en, 'zh-Hant': zh } };
    return [
      { url: en, lastModified: now, alternates },
      { url: zh, lastModified: now, alternates },
    ];
  });
}
