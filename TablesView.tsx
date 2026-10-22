import { useEffect, useRef, useState } from "react";
import { METRIC_META, MetricKey, OrgData, aggregate, fmt, normPct, orgTotal, pct, tierOf } from "../data";
import { useLanguage } from "../LanguageContext";
import { useAuth } from "../AuthContext";

interface Props {
  rows: OrgData[];
  onUpdate: (id: string, key: MetricKey, value: number) => void;
  onReset: () => void;
  highlightId?: string | null;
}

export default function TablesView({ rows, onUpdate, onReset, highlightId }: Props) {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const totals = aggregate(rows);
  const [flashId, setFlashId] = useState<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  useEffect(() => {
    if (!highlightId) return;
    const orgId = highlightId.split("#")[0];
    setFlashId(orgId);
    const scroll = setTimeout(() => {
      rowRefs.current[orgId]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
    const clear = setTimeout(() => setFlashId(null), 2400);
    return () => { clearTimeout(scroll); clearTimeout(clear); };
  }, [highlightId]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-mist-500">{t("exactNumbers")}</p>
          <h2 className="font-display mt-1 text-xl font-bold text-mist-100 sm:text-2xl">{t("eventsByOrgs")}</h2>
          <p className="mt-1.5 text-sm font-semibold text-mist-500">{t("editNote")}</p>
        </div>
        {isAuthenticated && (
          <button onClick={onReset} className="inline-flex items-center gap-2 rounded-full border border-[rgba(96,126,190,0.3)] px-4 py-2 text-xs font-bold text-mist-300 transition hover:border-[rgba(239,111,94,0.55)] hover:text-mist-100">
            <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden>
              <path d="M2.2 7a4.8 4.8 0 1 0 1.4-3.4M3.6 1.2v2.6h2.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t("restoreDefaults")}
          </button>
        )}
      </div>

      {/* ─── Точные цифры ─── */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-mist-100">{t("eventsByOrgs")}</h3>
          <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${isAuthenticated ? "border border-[rgba(164,207,90,0.3)] bg-[rgba(164,207,90,0.1)] text-good" : "border border-[rgba(130,160,220,0.25)] text-mist-500"}`}>
            {isAuthenticated ? t("editMode") : t("viewOnly")}
          </span>
        </div>
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="data-table w-full min-w-[720px] border-collapse">
            <thead>
              <tr>
                <th className="pl-2">{t("organization")}</th>
                {METRIC_META.map((m) => (
                  <th key={m.key} title={m.hint}>{m.label}</th>
                ))}
                <th>{t("totalPlanUnplan")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} ref={(el) => { rowRefs.current[r.id] = el; }} className={flashId === r.id ? "row-flash" : ""}>
                  <td className="pl-2">
                    <span className="flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-[4px]" style={{ background: r.color }} />
                      <span className="text-sm font-bold text-mist-100">{r.name}</span>
                    </span>
                  </td>
                  {METRIC_META.map((m) => (
                    <td key={m.key} className="w-[104px]">
                      {isAuthenticated ? (
                        <input type="number" min={0} value={r[m.key]} onChange={(e) => onUpdate(r.id, m.key, Math.max(0, Math.floor(Number(e.target.value)) || 0))} className="cell-input" />
                      ) : (
                        <span className="tabular text-sm font-bold text-mist-300">{fmt(r[m.key])}</span>
                      )}
                    </td>
                  ))}
                  <td className="text-right">
                    <span className="tabular inline-block rounded-lg bg-[rgba(51,69,111,0.45)] px-3 py-1.5 text-sm font-extrabold text-mist-100">{fmt(orgTotal(r))}</span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[rgba(130,160,220,0.3)] bg-[rgba(51,69,111,0.25)]">
                <td className="pl-2 text-sm font-extrabold uppercase tracking-wider text-mist-300">{t("total")}</td>
                {METRIC_META.map((m) => (
                  <td key={m.key} className="text-right text-sm font-extrabold text-mist-100">{fmt(totals[m.key])}</td>
                ))}
                <td className="text-right">
                  <span className="tabular inline-block rounded-lg bg-plan/20 px-3 py-1.5 text-sm font-extrabold text-plan">{fmt(totals.total)}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ─── Успеваемость ─── */}
      <div className="card p-5 sm:p-6">
        <h3 className="font-display font-semibold text-mist-100 mb-4">{t("performanceTable")}</h3>
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="data-table w-full min-w-[640px] border-collapse">
            <thead>
              <tr>
                <th className="pl-2">{t("organization")}</th>
                <th>{t("total")}</th>
                <th>{t("completedEvents")}</th>
                <th>{t("left")}</th>
                <th className="!text-left !pl-6 min-w-[220px]">{t("performance")}</th>
                <th>{t("status")}</th>
                <th>{t("normativ")}</th>
                <th>{t("normPercent")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const total = orgTotal(r);
                const p = pct(r.completed, total);
                const tier = tierOf(p);
                const nP = normPct(r);
                const over = r.norm > 0 && nP >= 100;
                return (
                  <tr key={r.id} ref={(el) => { rowRefs.current[r.id] = el; }} className={flashId === r.id ? "row-flash" : ""}>
                    <td className="pl-2">
                      <span className="flex items-center gap-2.5">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-[4px]" style={{ background: r.color }} />
                        <span className="text-sm font-bold text-mist-100">{r.name}</span>
                      </span>
                    </td>
                    <td className="text-right font-bold text-mist-300">{fmt(total)}</td>
                    <td className="text-right font-bold text-mist-300">{fmt(r.completed)}</td>
                    <td className="text-right">
                      <span className={`font-bold ${total > r.completed ? "text-unplan" : "text-good"}`}>{total > r.completed ? fmt(total - r.completed) : "0"}</span>
                    </td>
                    <td className="w-[220px] pl-6">
                      <span className="flex items-center gap-3">
                        <span className="pbar flex-1"><span className="pbar-fill" style={{ width: `${Math.min(p, 100)}%`, background: tier.color }} /></span>
                        <span className="tabular w-14 text-right text-sm font-extrabold" style={{ color: tier.color }}>{p}%</span>
                        <span className="whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-extrabold" style={{ background: `${tier.color}1c`, color: tier.color }}>{tier.label}</span>
                      </span>
                    </td>
                    <td className="text-right">
                      <span className={`tabular rounded-lg px-2.5 py-1.5 text-sm font-extrabold ${over ? "text-good" : "text-mist-300"}`} style={{ background: over ? "rgba(164,207,90,0.12)" : "rgba(51,69,111,0.3)" }}>
                        {r.norm > 0 ? `${nP}%` : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[rgba(130,160,220,0.3)] bg-[rgba(51,69,111,0.25)]">
                <td className="pl-2 text-sm font-extrabold uppercase tracking-wider text-mist-300">{t("total")}</td>
                <td className="text-right text-sm font-extrabold text-mist-100">{fmt(totals.total)}</td>
                <td className="text-right text-sm font-extrabold text-mist-100">{fmt(totals.completed)}</td>
                <td className="text-right text-sm font-extrabold text-mist-100">{totals.total > totals.completed ? fmt(totals.total - totals.completed) : "0"}</td>
                <td className="pl-6">
                  <span className="text-sm font-extrabold text-mist-100">{pct(totals.completed, totals.total)}%</span>
                </td>
                <td className="text-right">
                  <span className="inline-block rounded-full px-2.5 py-1 text-[11px] font-extrabold" style={{ background: `${tierOf(pct(totals.completed, totals.total)).color}1c`, color: tierOf(pct(totals.completed, totals.total)).color }}>
                    {tierOf(pct(totals.completed, totals.total)).label}
                  </span>
                </td>
                <td className="text-right text-sm font-extrabold text-mist-100">{fmt(totals.norm)}</td>
                <td className="text-right">
                  <span className={`tabular rounded-lg px-2.5 py-1.5 text-sm font-extrabold ${totals.total >= totals.norm ? "text-good" : "text-mist-300"}`} style={{ background: totals.total >= totals.norm ? "rgba(164,207,90,0.12)" : "rgba(51,69,111,0.3)" }}>
                    {totals.norm > 0 ? `${Math.round((totals.total / totals.norm) * 100)}%` : "—"}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
