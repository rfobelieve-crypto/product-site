import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Nav } from '@/components/sections/Nav';
import { Footer } from '@/components/sections/Footer';
import { CONTACT_EMAIL, pageAlternates } from '@/lib/seo';

const UPDATED = '2026-07-25';

// Legal copy lives here, not in messages/*.json — it's page-long prose,
// versioned with the page itself.
const CONTENT = {
  zh: {
    eyebrow: '隱私權政策',
    title: '我們收什麼、為什麼收。',
    updated: `最後更新：${UPDATED}`,
    sections: [
      {
        h: '我們收集的資料',
        p: '通知名單：你的 email。帳號:你的 email 與密碼(密碼以雜湊形式儲存於後端服務,本網站本身不儲存任何密碼)。本站目前沒有安裝任何行為分析或廣告追蹤。',
      },
      {
        h: '用途',
        p: 'email 只用來寄送文章與方法論更新(通知名單),以及讓你登入查看訊號紀錄(帳號)。不會有交易訊號或行銷訊息從這裡發出,也不會將你的資料出售或提供給第三方作行銷用途。',
      },
      {
        h: '基礎服務供應商',
        p: '網站託管於 Vercel;帳號與名單資料儲存於我們部署在 Railway 的後端服務。這些供應商僅在提供基礎設施的範圍內處理資料。',
      },
      {
        h: 'Cookie',
        p: '只使用登入所需的 session cookie(next-auth),沒有追蹤型 cookie。',
      },
      {
        h: '保留與刪除',
        p: `資料保留到你要求刪除為止。想退出名單或刪除帳號,來信 ${CONTACT_EMAIL},我們會在合理時間內處理。`,
      },
      {
        h: '政策變更',
        p: '政策若有實質變更,會更新本頁與「最後更新」日期。',
      },
    ],
  },
  en: {
    eyebrow: 'Privacy policy',
    title: 'What we collect, and why.',
    updated: `Last updated: ${UPDATED}`,
    sections: [
      {
        h: 'What we collect',
        p: 'Notification list: your email. Accounts: your email and password (stored as a hash on our backend service — this site itself never stores a password). No behavioral analytics or ad tracking is installed.',
      },
      {
        h: 'How it is used',
        p: 'Email addresses are used only to send write-up and methodology updates (list) and to sign you in to the signal history (accounts). No trading calls or marketing go out, and your data is never sold or shared for marketing.',
      },
      {
        h: 'Infrastructure providers',
        p: 'The site is hosted on Vercel; account and list data live in our backend service deployed on Railway. These providers process data only as infrastructure.',
      },
      {
        h: 'Cookies',
        p: 'Only the session cookie required for sign-in (next-auth). No tracking cookies.',
      },
      {
        h: 'Retention and deletion',
        p: `Data is kept until you ask for deletion. To leave the list or delete an account, email ${CONTACT_EMAIL}.`,
      },
      {
        h: 'Changes',
        p: 'Material changes will be reflected on this page with an updated date.',
      },
    ],
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const c = CONTENT[locale === 'zh' ? 'zh' : 'en'];
  return {
    title: `${c.eyebrow} — flowbot`,
    alternates: pageAlternates(locale, '/privacy'),
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = CONTENT[locale === 'zh' ? 'zh' : 'en'];
  return (
    <div className="relative min-h-screen">
      <Nav />
      <main className="content-layer px-6 pb-24 pt-32 sm:px-16">
        <div className="mx-auto max-w-2xl">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-cyan/80">
            {c.eyebrow}
          </span>
          <h1 className="mt-4 font-display text-3xl font-light leading-tight sm:text-4xl">
            {c.title}
          </h1>
          <p className="mt-3 font-body text-xs text-mist/50">{c.updated}</p>
          <div className="mt-10 flex flex-col gap-8">
            {c.sections.map((s) => (
              <section key={s.h}>
                <h2 className="font-display text-lg font-light text-mist">{s.h}</h2>
                <p className="mt-2 font-body text-sm leading-relaxed text-mist/60">{s.p}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
