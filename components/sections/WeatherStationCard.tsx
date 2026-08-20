import { getWeatherStation, type WeatherGauge } from '@/lib/weatherStation';

// Crowd-strategy weather station (survival layer, 2026-08-17). Shows which
// popular-strategy crowds the market has been feeding/starving over the
// trailing 30 days — the regime definition the survival cards condition on.
// Labels ship inline (zh/en picked by locale prop) instead of the messages
// JSON: the 2026-08-01 i18n surgery incident is why this component carries
// its own strings. Server component, same degrade contract as the KPI rows:
// outage renders dashes, never an error. Evidence tiers are rendered
// honestly per the public-surface rule (研究結論上牆必標狀態): only the
// CI-grade gauge gets the solid "已驗證" chip; tier-1 gauges say 顯示級;
// sensors are visually muted.
const L = {
  zh: {
    title: '市場天氣站',
    subtitle: '大眾策略群眾近 30 天被市場餵食或挨餓的狀態',
    paid: '被餵食',
    starved: '挨餓',
    dormant: '休眠',
    trending: '趨勢',
    ranging: '盤整',
    neutral: '中性',
    tier2: '已驗證 · CI 級',
    tier1: '顯示級',
    sensor: '感測器',
    sensors: '感測器（無註冊預測）',
    unavailable: '資料暫不可用',
    updated: '更新',
    reefingChip: '預註冊 · forward 累積中',
    reefingSail: '此刻帆量',
    reefingBtc: 'BTC',
    reefingCore9: 'core9 平均',
    reefingAdx: 'ADX 檔位',
    reefingCorr: '回歸家族相關 60d',
    reefingVerdict: '判決',
    reefingDays: '天後',
  },
  en: {
    title: 'Market Weather Station',
    subtitle: 'Which strategy crowds the market fed or starved over the trailing 30d',
    paid: 'FED',
    starved: 'STARVED',
    dormant: 'DORMANT',
    trending: 'TRENDING',
    ranging: 'RANGING',
    neutral: 'NEUTRAL',
    tier2: 'verified · CI-grade',
    tier1: 'display-grade',
    sensor: 'sensor',
    sensors: 'Sensors (no registered predictions)',
    unavailable: 'temporarily unavailable',
    updated: 'updated',
    reefingChip: 'pre-registered · accumulating forward',
    reefingSail: 'sail right now',
    reefingBtc: 'BTC',
    reefingCore9: 'core9 avg',
    reefingAdx: 'ADX gear',
    reefingCorr: 'MR-family corr 60d',
    reefingVerdict: 'verdict',
    reefingDays: 'days',
  },
} as const;

function valueText(v: string, t: (typeof L)['zh'] | (typeof L)['en']) {
  switch (v) {
    case 'PAID':
      return t.paid;
    case 'STARVED':
      return t.starved;
    case 'DORMANT':
      return t.dormant;
    case 'TRENDING':
      return t.trending;
    case 'RANGING':
      return t.ranging;
    case 'NEUTRAL':
      return t.neutral;
    default:
      return v;
  }
}

function valueTone(v: string) {
  if (v === 'PAID' || v === 'TRENDING') return 'text-[#00ffa3]';
  if (v === 'STARVED') return 'text-[#ff3860]';
  return 'text-mist/70';
}

function GaugeTile({
  g,
  t,
  locale,
}: {
  g: WeatherGauge;
  t: (typeof L)['zh'] | (typeof L)['en'];
  locale: string;
}) {
  const zh = locale === 'zh';
  const tierChip =
    g.tier === 'verified-2' ? (
      <span className="rounded-full border border-iris-cyan/50 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-iris-cyan/90">
        {t.tier2}
      </span>
    ) : g.tier === 'verified-1' ? (
      <span className="rounded-full border border-white/[0.14] px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-mist/55">
        {t.tier1}
      </span>
    ) : (
      <span className="rounded-full border border-dashed border-white/[0.12] px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-mist/40">
        {t.sensor}
      </span>
    );
  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3.5 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="truncate font-body text-[10px] uppercase tracking-[0.14em] text-mist/45">
          {zh ? g.label_zh : g.label_en}
        </div>
        {tierChip}
      </div>
      <div
        className={`mt-1.5 font-display text-lg font-light leading-none tracking-tight tabular-nums sm:text-xl ${valueTone(g.value)}`}
      >
        {valueText(g.value, t)}
      </div>
      <div className="mt-1.5 truncate font-body text-[11px] text-mist/40">
        {[g.detail, zh ? g.note_zh : g.note_en].filter(Boolean).join(' · ') || ' '}
      </div>
    </div>
  );
}

export async function WeatherStationCard({ locale }: { locale: string }) {
  const t = locale === 'zh' ? L.zh : L.en;
  const w = await getWeatherStation();

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="font-display text-sm font-light text-mist">{t.title}</h3>
          <p className="mt-0.5 font-body text-[11px] text-mist/45">{t.subtitle}</p>
        </div>
        {w?.asof_utc ? (
          <span className="font-body text-[10px] uppercase tracking-[0.14em] text-mist/35">
            {t.updated} UTC {w.asof_utc}
          </span>
        ) : null}
      </div>
      {!w ? (
        <div className="mt-3 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3.5 py-4 font-body text-[12px] text-mist/40">
          {t.unavailable}
        </div>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {w.gauges.map((g) => (
              <GaugeTile key={g.id} g={g} t={t} locale={locale} />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-body text-[10px] uppercase tracking-[0.14em] text-mist/35">
              {t.sensors}
            </span>
            {w.sensors.map((s) => (
              <span key={s.id} className="font-body text-[11px] text-mist/50">
                {locale === 'zh' ? s.label_zh : s.label_en}{' '}
                <span className={valueTone(s.value)}>{valueText(s.value, t)}</span>
              </span>
            ))}
          </div>
          {w.reefing ? (
            // Reefing (縮帆) — the station's response arm. Dashed border +
            // amber chip = the D5-style 待整合 pattern: pre-registered
            // research whose forward verdict has NOT landed. Nothing here
            // is an active rule; weights are what the frozen rules WOULD
            // carry right now.
            <div className="mt-3 rounded-lg border border-dashed border-amber-400/30 bg-white/[0.02] px-3.5 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-body text-[10px] uppercase tracking-[0.14em] text-mist/45">
                  {locale === 'zh' ? w.reefing.label_zh : w.reefing.label_en}
                </div>
                <span className="rounded-full border border-amber-400/40 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-amber-300/80">
                  {t.reefingChip}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-5 gap-y-1.5">
                <span className="font-body text-[11px] text-mist/45">
                  {t.reefingSail}{' '}
                  <span className="font-display text-base tabular-nums text-mist">
                    {t.reefingBtc} {w.reefing.vol_target_w_btc ?? '—'}
                  </span>{' '}
                  <span className="font-display text-base tabular-nums text-mist/70">
                    · {t.reefingCore9} {w.reefing.vol_target_w_core9 ?? '—'}
                  </span>
                </span>
                <span className="font-body text-[11px] text-mist/45">
                  {t.reefingAdx}{' '}
                  <span
                    className={`font-display tabular-nums ${w.reefing.adx_desize_now === 'x0.5' ? 'text-amber-300/90' : 'text-mist/70'}`}
                  >
                    {w.reefing.adx_desize_now}
                  </span>
                </span>
                <span className="font-body text-[11px] text-mist/45">
                  {t.reefingCorr}{' '}
                  <span className="font-display tabular-nums text-mist/70">
                    {w.reefing.mr_family_corr_60d ?? '—'}
                  </span>
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                {w.reefing.clocks.map((c) => (
                  <span key={c.id} className="font-body text-[10px] text-mist/40">
                    {c.label_zh} · {c.due}（{c.days_left} {t.reefingDays}）
                  </span>
                ))}
              </div>
              <p className="mt-1.5 font-body text-[10px] text-mist/35">
                {locale === 'zh' ? w.reefing.note_zh : w.reefing.note_en}
              </p>
            </div>
          ) : null}
          <p className="mt-2 font-body text-[10px] text-mist/30">{w.disclaimer}</p>
        </>
      )}
    </div>
  );
}
