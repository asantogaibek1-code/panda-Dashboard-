import { ReactNode, useState } from "react";
import { OrgData, aggregate, fmt, normPct, orgTotal, pct, tierOf, CAT } from "../data";
import { useInView } from "../hooks";
import { useLanguage } from "../LanguageContext";
import { Donut, Ring, RingValue, DonutSegment } from "./Donut";

interface Props {
  rows: OrgData[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

function Card({ kicker, title, right, children, className = "", delay = 0 }: {
  kicker: string; title: string; right?: ReactNode; children: ReactNode; className?: string; delay?: number;
}) {
  const [ref, inView] = useInView<HTMLDivElement>(0.08);
  return (
    <section ref={ref} className={`card reveal ${inView ? "in" : ""} p-5 sm:p-6 ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      <header className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-mist-500">{kicker}</p>
          <h2 className="font-display font-semibold text-mist-100 text-sm sm:text-base mt-1 leading-snug">{title}</h2>
        </div>
        {right}
      </header>
      {children}
    </section>
  );
}

export default function ChartsView({ rows, selectedId, onSelect }: Props) {
  const { t } = useLanguage();
  const [hoverOrg, setHoverOrg] = useState<string | null>(null);
  const selected = rows.find((r) => r.id === selectedId) ?? null;
  const scope = selected ? [selected] : rows;
  const agg = aggregate(scope);
  const all = aggregate(rows);
  const totalEvents = all.total;

  const orgSegments: DonutSegment[] = rows.map((r) => ({ id: r.id, label: r.short, value: orgTotal(r), color: r.color }));
  const structure: DonutSegment[] = [
    { id: "practical", label: t("practical"), value: Math.min(agg.practical, agg.planned), color: CAT.practical },
    { id: "other-plan", label: t("planned"), value: Math.max(0, agg.planned - agg.practical), color: CAT.planned },
    { id: "unplanned", label: t("unplannedEvents"), value: agg.unplanned, color: CAT.unplanned },
  ];
  const speakersClamped = Math.min(agg.speakers, agg.total);
  const practiceClamped = Math.min(agg.practical, agg.total - speakersClamped);
  const formats: DonutSegment[] = [
    { id: "speakers", label: t("withSpeakers"), value: speakersClamped, color: CAT.speakers },
    { id: "practice", label: t("practical"), value: practiceClamped, color: CAT.practical },
    { id: "rest", label: t("planned"), value: Math.max(0, agg.total - speakersClamped - practiceClamped), color: CAT.muted },
  ];

  const scale = Math.max(1, ...rows.map((r) => Math.max(orgTotal(r), r.norm)));
  const overallPct = pct(all.completed, all.total);
  const overallTier = tierOf(overallPct);
  const overallNormPct = all.norm > 0 ? Math.round((all.total / all.norm) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
      {/* ─── By organizations ─── */}
      <Card kicker={t("distribution")} title={t("eventsByOrg")} className="lg:col-span-5 lg:row-span-2" delay={0}
        right={<span className="mt-0.5 inline-flex items-center gap-2 rounded-full border border-[rgba(130,160,220,0.25)] px-3 py-1 text-[11px] font-bold text-mist-500">{t("total")} <span className="text-mist-100 tabular">{fmt(totalEvents)}</span></span>}
      >
        <div className="flex flex-col items-center gap-6">
          <Donut segments={orgSegments} size={280} thickness={26} centerLabel={t("total")} centerValue={totalEvents} centerSub="7" activeId={selectedId} hoverId={hoverOrg} onSegmentClick={(id) => onSelect(selectedId === id ? null : id)} />
          <ul className="w-full space-y-1">
            {rows.map((r) => {
              const isSel = selectedId === r.id;
              return (
                <li key={r.id}>
                  <button onClick={() => onSelect(isSel ? null : r.id)} onPointerEnter={() => setHoverOrg(r.id)} onPointerLeave={() => setHoverOrg(null)}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition border ${isSel ? "border-[rgba(130,160,220,0.45)] bg-[rgba(51,69,111,0.4)]" : "border-transparent hover:bg-[rgba(51,69,111,0.28)]"} ${selectedId && !isSel ? "opacity-45" : ""}`}>
                    <span className="h-2.5 w-2.5 shrink-0 rounded-[4px]" style={{ background: r.color }} />
                    <span className="flex-1 truncate text-sm font-bold text-mist-300 group-hover:text-mist-100">{r.name}</span>
                    <span className="tabular text-sm font-extrabold text-mist-100">{fmt(orgTotal(r))}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </Card>

      {/* ─── Structure ─── */}
      <Card kicker={t("composition")} title={t("eventStructure")} className="lg:col-span-4" delay={80}>
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <Donut segments={structure} size={190} thickness={22} centerLabel={t("total")} centerValue={agg.total} />
          <ul className="w-full space-y-2.5">
            {structure.map((s) => (
              <li key={s.id} className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-[4px]" style={{ background: s.color }} />
                <span className="flex-1 text-[13px] font-semibold text-mist-300">{s.label}</span>
                <span className="tabular text-sm font-extrabold text-mist-100">{fmt(s.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* ─── Formats ─── */}
      <Card kicker={t("format")} title={t("speakersAndPractice")} className="lg:col-span-3" delay={140}>
        <div className="flex flex-col items-center gap-4">
          <Donut segments={formats} size={185} thickness={22} centerLabel={t("withSpeakers")} centerValue={speakersClamped} />
          <ul className="w-full space-y-2.5">
            {formats.map((s) => (
              <li key={s.id} className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-[4px]" style={{ background: s.color }} />
                <span className="flex-1 text-[13px] font-semibold text-mist-300">{s.label}</span>
                <span className="tabular text-sm font-extrabold text-mist-100">{fmt(s.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* ─── Comparison ─── */}
      <Card kicker={t("comparison")} title={t("planVsNorm")} className="lg:col-span-7" delay={200}>
        <ul className="space-y-3">
          {rows.map((r) => {
            const total = orgTotal(r);
            const barW = (total / scale) * 100;
            const trackW = (r.norm / scale) * 100;
            const planShare = total > 0 ? (r.planned / total) * 100 : 0;
            const markerLeft = (Math.min(r.completed, scale) / scale) * 100;
            const nPct = r.norm > 0 ? Math.round((total / r.norm) * 100) : 0;
            const over = total > r.norm;
            const isSel = selectedId === r.id;
            return (
              <li key={r.id}>
                <button onClick={() => onSelect(isSel ? null : r.id)}
                  className={`group grid w-full grid-cols-[80px_1fr_90px] items-center gap-3 rounded-xl px-2 py-1.5 text-left transition border ${isSel ? "border-[rgba(130,160,220,0.45)] bg-[rgba(51,69,111,0.4)]" : "border-transparent hover:bg-[rgba(51,69,111,0.28)]"} ${selectedId && !isSel ? "opacity-45" : ""}`}>
                  <span className="flex items-center gap-2 text-[13px] font-bold text-mist-300 group-hover:text-mist-100">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: r.color }} />
                    {r.short}
                  </span>
                  <span className="relative block h-4 overflow-visible">
                    <span className="absolute inset-y-0 left-0 rounded-full border-r-2 border-dashed border-good/70 bg-[rgba(38,52,86,0.55)] transition-[width] duration-700 ease-out" style={{ width: `${trackW}%` }} />
                    <span className="absolute inset-y-0 left-0 flex overflow-hidden rounded-full transition-[width] duration-700 ease-out" style={{ width: `${barW}%`, boxShadow: over ? "0 0 12px rgba(164,207,90,0.28)" : "none" }}>
                      <span className="h-full bg-plan transition-[width] duration-700" style={{ width: `${planShare}%` }} />
                      <span className="h-full flex-1 bg-unplan/90" />
                    </span>
                    <span className="absolute -inset-y-1 w-[3px] rounded-full bg-mist-100/85 shadow-[0_0_8px_rgba(238,242,251,0.5)] transition-[left] duration-700 ease-out" style={{ left: `calc(${markerLeft}% - 1px)` }} />
                  </span>
                  <span className="text-right">
                    <span className="tabular block text-sm font-extrabold text-mist-100">{fmt(total)}</span>
                    <span className={`tabular block text-[11px] font-extrabold ${over ? "text-good" : "text-mist-500"}`}>норма {nPct}%</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* ─── Performance ─── */}
      <Card kicker={t("result")} title={t("performanceByEvents")} className="lg:col-span-12" delay={260}
        right={<span className="mt-1 text-[11px] font-bold text-mist-500">{t("completed")} <span className="tabular text-mist-100">{fmt(all.completed)}</span> {t("total")} <span className="tabular text-mist-100">{fmt(all.total)}</span></span>}
      >
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex items-center gap-6 shrink-0">
            <Ring value={Math.min(overallPct, 100)} size={168} thickness={13} color={overallTier.color}>
              <RingValue value={overallPct} className="font-display font-bold text-3xl" />
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-mist-500 mt-1">{t("performance")}</span>
            </Ring>
            <div className="max-w-[210px] space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold" style={{ background: `${overallTier.color}1f`, color: overallTier.color }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: overallTier.color }} />
                {overallTier.label}
              </p>
              <p className={`inline-flex w-full items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold ${overallNormPct >= 100 ? "text-good" : "text-mist-300"}`} style={{ background: overallNormPct >= 100 ? "rgba(164,207,90,0.13)" : "rgba(51,69,111,0.4)" }}>
                {t("norm")}: {overallNormPct}%
              </p>
            </div>
          </div>
          <div className="h-px flex-1 w-full bg-[rgba(96,126,190,0.18)] lg:hidden" />
          <ul className="grid flex-1 grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-4 w-full justify-items-center">
            {rows.map((r) => {
              const p = pct(r.completed, orgTotal(r));
              const tier = tierOf(p);
              const nP = normPct(r);
              const isSel = selectedId === r.id;
              return (
                <li key={r.id} className="flex flex-col items-center gap-1.5">
                  <button onClick={() => onSelect(isSel ? null : r.id)} className={`rounded-full transition ${isSel ? "scale-105" : "hover:scale-105"} ${selectedId && !isSel ? "opacity-45" : ""}`}>
                    <Ring value={Math.min(p, 100)} size={86} thickness={8} color={tier.color}>
                      <RingValue value={p} className="font-display font-bold text-sm" />
                    </Ring>
                  </button>
                  <span className="text-[11px] font-bold text-mist-500">{r.short}</span>
                  <span className={`tabular rounded-full px-2 py-0.5 text-[10px] font-extrabold ${r.norm > 0 && nP >= 100 ? "text-good" : "text-mist-500"}`} style={{ background: r.norm > 0 && nP >= 100 ? "rgba(164,207,90,0.12)" : "rgba(38,52,86,0.4)" }}>
                    {r.norm > 0 ? `${nP}%` : "—"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </Card>
    </div>
  );
}
