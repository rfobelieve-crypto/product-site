import data from '@/content/writeups.json';

// Research write-ups. Authored as .docx (the LinkedIn posts), then extracted
// to content/writeups.json by linkedin_posts/assets/extract_for_site.py, which
// strips the LinkedIn-only furniture: the job-seeking bio, the disclaimer
// boilerplate, hashtags, the engagement question, and the drafts' authoring
// scaffolding (hook A/B tests, pre-publish checklists). Regenerate that script
// rather than hand-editing the JSON.
//
// These are deliberately methodology pieces, not market commentary: they are
// what makes the site read as an engineering journal instead of another crypto
// dashboard, and they stay true whichever asset class the reader works in.

export type Block = { type: 'h' | 'p'; text: string };

export type LocalizedWriteup = {
  title: string;
  subtitle: string;
  blocks: Block[];
};

export type Writeup = {
  slug: string;
  date: string;
  tags: string[];
  cover?: string;
  zh?: LocalizedWriteup;
  en?: LocalizedWriteup;
};

const ALL = data as Writeup[];

function pick(w: Writeup, locale: string): LocalizedWriteup | undefined {
  return locale === 'zh' ? w.zh : w.en;
}

/** Articles that exist in this locale, newest first. Pieces without a
 *  translation are omitted rather than shown in the wrong language. */
export function listWriteups(locale: string) {
  return ALL.filter((w) => pick(w, locale))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((w) => ({
      slug: w.slug,
      date: w.date,
      tags: w.tags,
      cover: w.cover,
      ...pick(w, locale)!,
    }));
}

export function getWriteup(slug: string, locale: string) {
  const w = ALL.find((x) => x.slug === slug);
  const loc = w && pick(w, locale);
  if (!w || !loc) return null;
  return { slug: w.slug, date: w.date, tags: w.tags, cover: w.cover, ...loc };
}

/** Every (locale, slug) pair that actually has content, for generateStaticParams. */
export function allWriteupParams() {
  const out: { locale: string; slug: string }[] = [];
  for (const w of ALL) {
    if (w.zh) out.push({ locale: 'zh', slug: w.slug });
    if (w.en) out.push({ locale: 'en', slug: w.slug });
  }
  return out;
}

/** First real paragraph, trimmed, for cards and meta descriptions. Skips
 *  leading headings: several pieces open with a section title, and using that
 *  as the excerpt produces a fragment like "一個 0.50 的差距" with no context. */
export function excerpt(blocks: Block[], max = 100) {
  const first = blocks.find((b) => b.type === 'p')?.text ?? '';
  return first.length > max ? `${first.slice(0, max)}…` : first;
}
