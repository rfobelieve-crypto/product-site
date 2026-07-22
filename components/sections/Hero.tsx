'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { PixelDrift } from '@/components/effects/PixelDrift';

// mist (near-white) dominant with cyan/violet flecks — same palette
// language as the point lights and glass-panel glow elsewhere on the site.
const PIXEL_COLORS = ['#e8e8ef', '#e8e8ef', '#7ef9ff', '#b98bff'];

// var(--font-display) resolves through the container's real inline style
// (see PixelDrift's getComputedStyle fix) rather than being handed to
// Canvas directly, which doesn't understand CSS custom properties. Space
// Grotesk has no CJK coverage, so explicit bold-capable CJK fallbacks are
// listed too — otherwise zh renders through some unpredictable, possibly
// non-bold system substitute.
const PIXEL_FONT_FAMILY =
  "var(--font-display), 'Noto Sans TC', 'Microsoft JhengHei', 'PingFang TC', sans-serif";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  }),
};

export function Hero() {
  const t = useTranslations('hero');
  return (
    <section className="relative flex h-screen flex-col items-center justify-center px-6 text-center">
      <motion.p
        custom={0}
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="mb-4 font-body text-xs uppercase tracking-[0.3em] text-iris-cyan/80"
      >
        {t('eyebrow')}
      </motion.p>

      <motion.div
        custom={1}
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="mx-auto w-full max-w-4xl"
      >
        {/* Mobile keeps real crisp text — an 8-character CJK line only gets
            ~40px/char at mobile widths, and particle sampling (verified via
            screenshot) can't hold CJK strokes legible below roughly
            desktop-size characters, however fine the stride. Below `sm`
            this is the whole headline, not a fallback for something hidden. */}
        <h1 className="text-balance font-display text-5xl font-light leading-[1.05] tracking-tightest sm:hidden">
          {t('titleLine1')}
          <br />
          <span className="font-medium">{t('titleLine2')}</span>
        </h1>

        {/* `sm` and up: particle typography (originkit.dev "Pixel Drift",
            ported — components/effects/PixelDrift.tsx). Assembles from
            drifting particles on load; the cursor carves a moving void
            through it — literal "a system that watches itself" instead of
            static text. Canvas text isn't selectable/crawlable, so the
            sr-only <h1> stands in for screen readers/SEO at this
            breakpoint. */}
        <h1 className="sr-only hidden sm:block">
          {t('titleLine1')} {t('titleLine2')}
        </h1>
        <div aria-hidden className="hidden sm:block sm:h-24 md:h-28">
          <PixelDrift
            text={t('titleLine1')}
            colors={PIXEL_COLORS}
            fontFamily={PIXEL_FONT_FAMILY}
            fontSize={160}
            particleCount={200}
            autoFit
            mode="onEnter"
            transition={{ type: 'tween', duration: 1.4, ease: 'easeOut' }}
            mouseEnabled
            mouseRadius={70}
            mouseForce={22}
            style={{ minWidth: 0 }}
          />
        </div>
        <div aria-hidden className="hidden sm:mt-1 sm:block sm:h-24 md:h-28">
          <PixelDrift
            text={t('titleLine2')}
            colors={PIXEL_COLORS}
            fontFamily={PIXEL_FONT_FAMILY}
            fontSize={160}
            particleCount={200}
            autoFit
            mode="onEnter"
            transition={{ type: 'tween', duration: 1.4, ease: 'easeOut' }}
            mouseEnabled
            mouseRadius={70}
            mouseForce={22}
            style={{ minWidth: 0 }}
          />
        </div>
      </motion.div>

      <motion.p
        custom={2}
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="mt-6 max-w-md text-balance font-body text-sm text-mist/60 sm:text-base"
      >
        {t('subtitle')}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-10 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-mist/55">
          {t('scroll')}
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="h-8 w-px bg-gradient-to-b from-iris-cyan to-transparent"
        />
      </motion.div>
    </section>
  );
}
