import { OrgData, fmt, normPct, orgTotal, pct, tierOf } from "../data";
import { useInView } from "../hooks";
import { useLanguage } from "../LanguageContext";
import { useAuth } from "../AuthContext";
import { Donut, DonutSegment } from "./Donut";

interface Props {
  rows: OrgData[];
  onEditOrg: (id: string) => void;
}

function OrgCard({ r, index, onEdit }: { r: OrgData; index: number; onEdit: () => void }) {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [ref, inView] = useInView<HTMLElement>(0.1);
  const total = orgTotal(r);
  const p = pct(r.completed, total);
  const tier = tierOf(p);
  const nP = normPct(r);
  const over = r.norm > 0 && total > r.norm;

  const segments: DonutSegment[] = [
    { id: "planned", label: t("planned"), value: r.planned, color: "#5aa7f0" },
    { id: "unplanned", label: t("unplannedEvents"), value: r.unplanned, color: "#f0a83e" },
  ];

  return (
    <article ref={ref} className={`card reveal ${inView ? "in" : ""} p-5 sm:p-6`} style={{ transitionDelay: `${(index % 3) * 90}ms` }}>
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl font-display text-[13px] font-bold" style={{ background: `${r.color}1a`, color: r.color, border: `1px solid ${r.color}55` }}>
            {r.short.slice(0, 4)}
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-mist-100 leading-tight">{r.name}</h3>
            <p className="mt-0.5 text-[11px] font-bold text-mist-500">{t("organization")} {String(index + 1).padStart(2, "0")} · {t("total")} {fmt(total)}</p>
          </div>
        </div>
        <span className="h-2.5 w-2.5 shrink-0 rounded-full mt-1.5" style={{ background: r.color }} />
      </header>

      <div className="mt-4 flex flex-col sm:flex-row items-center gap-5">
        <Donut segments={segments} size={172} thickness={20} centerLabel={t("total")} centerValue={total} centerSub={`${t("normativ")} ${fmt(r.norm)}`} />
        <div className="w-full space-y-3.5">
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="flex items-center gap-2 text-[12px] font-bold text-mist-300">
                <span className="h-2 w-2 rounded-[3px]" style={{ background: "#5aa7f0" }} />
                {t("planned")}
              </span>
              <span className="tabular text-sm font-extrabold text-mist-100">{fmt(r.planned)}<span className="ml-1.5 text-[11px] font-bold text-mist-500">{total > 0 ? `${Math.round((r.planned / total) * 100)}%` : "—"}</span></span>
            </div>
            <div className="pbar mt-1.5"><div className="pbar-fill" style={{ width: `${(r.planned / total) * 100}%`, background: "#5aa7f0" }} /></div>
          </div>
          <div className="pl-3.5 border-l-2 border-[rgba(96,126,190,0.22)]">
            <div className="flex items-baseline justify-between gap-2">
              <span className="flex items-center gap-2 text-[12px] font-bold text-mist-300">
                <span className="h-2 w-2 rounded-[3px]" style={{ background: "#35c9a3" }} />
                {t("practical")}
              </span>
              <span className="tabular text-sm font-extrabold text-mist-100">{fmt(r.practical)}</span>
            </div>
            <div className="pbar mt-1.5"><div className="pbar-fill" style={{ width: `${(r.practical / total) * 100}%`, background: "#35c9a3" }} /></div>
            <p className="mt-1 text-[10px] font-bold text-mist-500">{t("fromPlanned")}</p>
          </div>
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="flex items-center gap-2 text-[12px] font-bold text-mist-300">
                <span className="h-2 w-2 rounded-[3px]" style={{ background: "#f0a83e" }} />
                {t("unplannedEvents")}
              </span>
              <span className="tabular text-sm font-extrabold text-mist-100">{fmt(r.unplanned)}<span className="ml-1.5 text-[11px] font-bold text-mist-500">{total > 0 ? `${Math.round((r.unplanned / total) * 100)}%` : "—"}</span></span>
            </div>
            <div className="pbar mt-1.5"><div className="pbar-fill" style={{ width: `${(r.unplanned / total) * 100}%`, background: "#f0a83e" }} /></div>
          </div>
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="flex items-center gap-2 text-[12px] font-bold text-mist-300">
                <span className="h-2 w-2 rounded-[3px]" style={{ background: "#ef6f5e" }} />
                {t("withSpeakers")}
              </span>
              <span className="tabular text-sm font-extrabold text-mist-100">{fmt(Math.min(r.speakers, total))}<span className="ml-1.5 text-[11px] font-bold text-mist-500">{total > 0 ? `${Math.round((Math.min(r.speakers, total) / total) * 100)}%` : "—"}</span></span>
            </div>
            <div className="pbar mt-1.5"><div className="pbar-fill" style={{ width: `${(Math.min(r.speakers, total) / total) * 100}%`, background: "#ef6f5e" }} /></div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2.5">
        <div className="rounded-xl border border-[rgba(96,126,190,0.16)] bg-[rgba(9,14,25,0.5)] px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-mist-500">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: tier.color }} />
            {t("performance")}
          </p>
          <p className="tabular mt-1 font-display text-lg font-bold text-mist-100">{Math.round(p)}%</p>
          <p className="text-[10px] font-bold text-mist-500">{tier.label}</p>
        </div>
        <div className="rounded-xl border border-[rgba(96,126,190,0.16)] bg-[rgba(9,14,25,0.5)] px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-mist-500">
            <span className="h-1.5 w-1.5 rounded-full bg-mist-100" />
            {t("completedEvents")}
          </p>
          <p className="tabular mt-1 font-display text-lg font-bold text-mist-100">{fmt(r.completed)}</p>
          <p className="text-[10px] font-bold text-mist-500">{t("total")} {fmt(total)}</p>
        </div>
        <div className="rounded-xl border border-[rgba(96,126,190,0.16)] bg-[rgba(9,14,25,0.5)] px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-mist-500">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: over ? "#a4cf5a" : "#8b98b8" }} />
            {t("normativ")}
          </p>
          <p className="tabular mt-1 font-display text-lg font-bold" style={{ color: over ? "#a4cf5a" : "#8b98b8" }}>{nP}%</p>
          <p className="text-[10px] font-bold text-mist-500">{over ? `+${fmt(total - r.norm)} ${t("overNorm")}` : t("withinNorm")}</p>
        </div>
      </div>

      {isAuthenticated && (
        <button onClick={onEdit} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[rgba(96,126,190,0.3)] bg-[rgba(51,69,111,0.35)] px-4 py-2.5 text-[13px] font-bold text-mist-300 transition hover:border-[rgba(90,167,240,0.6)] hover:bg-[rgba(51,69,111,0.6)] hover:text-mist-100">
          <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden>
            <path d="M10.2 1.9a1.3 1.3 0 0 1 1.9 0l0 0a1.3 1.3 0 0 1 0 1.9L5 10.9l-2.7.9.9-2.7 7-7.2Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="m8.8 3.3 1.9 1.9" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          {t("editInTable")}
        </button>
      )}
    </article>
  );
}

export default function OrgsView({ rows, onEditOrg }: Props) {
  const { t } = useLanguage();

  return (
    <div>
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-mist-500">{t("orgBreakdown")}</p>
        <h2 className="font-display mt-1 text-xl sm:text-2xl font-bold text-mist-100">{t("separateOrgs")}</h2>
        <p className="mt-1.5 text-sm font-semibold text-mist-500">{t("orgsNote")}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {rows.map((r, i) => (
          <OrgCard key={r.id} r={r} index={i} onEdit={() => onEditOrg(r.id)} />
        ))}
      </div>
    </div>
  );
}
