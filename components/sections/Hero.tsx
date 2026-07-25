'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { MeshTextHover } from '@/components/effects/MeshTextHover';

// var(--font-cjk) is Noto Sans TC, actually loaded via next/font in the
// locale layout — the canvas headline no longer depends on whatever CJK
// font the OS happens to have.
const MESH_FONT_FAMILY =
  "var(--font-display), var(--font-cjk), 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  }),
};

function TitleMeshLine({ text, fontSize, className }: { text: string; fontSize: number; className: string }) {
  return (
    <MeshTextHover
      text={text}
      color="#ffffff"
      fontFamily={MESH_FONT_FAMILY}
      fontWeight={700}
      fontSize={fontSize}
      colorSplit
      customColors={['#7ef9ff', '#b98bff']}
      force={18}
      className={className}
    />
  );
}

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
        aria-hidden
      >
        <div className="sm:hidden">
          <TitleMeshLine text={t('titleLine1')} fontSize={42} className="h-14" />
          <TitleMeshLine text={t('titleLine2')} fontSize={42} className="h-14" />
        </div>
        <div className="hidden sm:block md:hidden">
          <TitleMeshLine text={t('titleLine1')} fontSize={74} className="h-24" />
          <TitleMeshLine text={t('titleLine2')} fontSize={74} className="h-24" />
        </div>
        <div className="hidden md:block">
          <TitleMeshLine text={t('titleLine1')} fontSize={100} className="h-28" />
          <TitleMeshLine text={t('titleLine2')} fontSize={100} className="h-28" />
        </div>
      </motion.div>
      <h1 className="sr-only">
        {t('titleLine1')} {t('titleLine2')}
      </h1>

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
