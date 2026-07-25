import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Nav } from '@/components/sections/Nav';
import { Footer } from '@/components/sections/Footer';
import { CONTACT_EMAIL, pageAlternates } from '@/lib/seo';

const UPDATED = '2026-07-25';

const CONTENT = {
  zh: {
    eyebrow: '使用條款',
    title: '使用本站前,先講清楚。',
    updated: `最後更新：${UPDATED}`,
    sections: [
      {
        h: '非投資建議',
        p: '本站所有內容——包括訊號、勝率、圖表與文章——僅供資訊與研究參考,不構成投資建議、要約或交易招攬。過去績效不代表未來表現。任何交易決定與其結果由你自行承擔。',
      },
      {
        h: '內容性質',
        p: '本站記錄一個真實系統的建置與驗證過程。數字會隨時間更新,也可能因事故而修正(見事故紀錄頁)。內容以「現狀」提供,不保證完整、即時或無誤。',
      },
      {
        h: '帳號',
        p: '帳號僅用於查看訊號紀錄。你有責任保管密碼;濫用(自動化抓取、嘗試未授權存取、干擾服務)將導致帳號停用。',
      },
      {
        h: '服務可用性',
        p: '本站與其資料來源可能隨時中斷、變更或終止,不另行通知,也不因此對你負任何責任。',
      },
      {
        h: '責任限制',
        p: '在法律允許的最大範圍內,我們不對因使用或無法使用本站內容而生的任何損失負責,包括交易損失。',
      },
      {
        h: '聯絡',
        p: `對條款有疑問,來信 ${CONTACT_EMAIL}。`,
      },
    ],
  },
  en: {
    eyebrow: 'Terms of use',
    title: 'The ground rules, stated plainly.',
    updated: `Last updated: ${UPDATED}`,
    sections: [
      {
        h: 'Not investment advice',
        p: 'Nothing on this site — signals, win rates, charts, or write-ups — is investment advice, an offer, or a solicitation to trade. Past performance does not guarantee future results. Trading decisions and their outcomes are yours alone.',
      },
      {
        h: 'Nature of the content',
        p: 'This site documents a real system being built and validated. Numbers update over time and may be corrected after incidents (see the Incidents page). Content is provided as-is, with no guarantee of completeness, timeliness, or accuracy.',
      },
      {
        h: 'Accounts',
        p: 'Accounts exist only to view the signal history. You are responsible for your password; abuse (scraping, unauthorized-access attempts, service interference) leads to account termination.',
      },
      {
        h: 'Availability',
        p: 'The site and its data feeds may be interrupted, changed, or discontinued at any time without notice and without liability.',
      },
      {
        h: 'Limitation of liability',
        p: 'To the maximum extent permitted by law, we are not liable for any loss arising from use of, or inability to use, this site — including trading losses.',
      },
      {
        h: 'Contact',
        p: `Questions about these terms: ${CONTACT_EMAIL}.`,
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
    alternates: pageAlternates(locale, '/terms'),
  };
}

export default async function TermsPage({
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
