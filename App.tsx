import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_DATA, MetricKey, OrgData, aggregate, fmt, loadData, saveData } from "./data";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { LanguageProvider, useLanguage } from "./LanguageContext";
import { AuthProvider, useAuth } from "./AuthContext";
import ChartsView from "./components/ChartsView";
import OrgsView from "./components/OrgsView";
import TablesView from "./components/TablesView";
import { PandaMascot, PandaMini } from "./components/PandaIcon";
import LanguageSwitcher from "./components/LanguageSwitcher";
import ThemeSwitcher from "./components/ThemeSwitcher";
import LoginModal from "./components/LoginModal";
import ScrollToTop from "./components/ScrollToTop";
import MobileNav from "./components/MobileNav";
import { useIsMobile } from "./hooks/useIsMobile";

type View = "charts" | "orgs" | "tables";

function AppContent() {
  const [rows, setRows] = useState<OrgData[]>(() => loadData());
  const [view, setView] = useState<View>("charts");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isMobile = useIsMobile();

  useEffect(() => saveData(rows), [rows]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2800);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const totals = useMemo(() => aggregate(rows), [rows]);
  const updateCell = useCallback((id: string, key: MetricKey, value: number) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  }, []);
  const resetData = useCallback(() => {
    setRows(DEFAULT_DATA.map((d) => ({ ...d })));
    setSelectedId(null);
    setToast("dataRestored");
  }, []);
  const goToTableFor = useCallback((orgId: string) => {
    setHighlightId(`${orgId}#${Date.now()}`);
    setView("tables");
  }, []);

  const today = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(new Date());
  const normPct = totals.norm > 0 ? Math.round((totals.total / totals.norm) * 100) : 0;

  const isDark = theme === "dark";

  return (
    <>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      <div className="relative min-h-screen overflow-x-clip">
        {/* ─── Ambient background ─── */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0" style={{
            background: isDark
              ? "radial-gradient(ellipse 120% 90% at 50% -10%, #14203a 0%, #0a0f1a 58%)"
              : "radial-gradient(ellipse 120% 90% at 50% -10%, #e8eef8 0%, #f8fafc 58%)"
          }} />
          <div className="bg-grid absolute inset-0" />
          {/* Glow effects - отключаем на мобильных для производительности */}
          {isDark && !isMobile && (
            <>
              <div className="glow anim-drift-a h-[420px] w-[560px] -left-40 -top-32 opacity-[0.16] bg-[radial-gradient(circle,#35c9a3_0%,transparent_65%)]" />
              <div className="glow anim-drift-b h-[380px] w-[520px] -right-36 top-16 opacity-[0.13] bg-[radial-gradient(circle,#5aa7f0_0%,transparent_65%)]" />
              <div className="glow anim-drift-a h-[340px] w-[460px] left-1/3 bottom-[-180px] opacity-[0.1] bg-[radial-gradient(circle,#f0a83e_0%,transparent_65%)]" />
            </>
          )}
          {/* Panda silhouettes */}
          <div className="absolute inset-0 overflow-hidden opacity-[0.025]" aria-hidden>
            <div className="absolute -left-12 -top-8 rotate-[-12deg]">
              <PandaMascot size={200} />
            </div>
            <div className="absolute -right-8 top-24 rotate-[8deg]">
              <PandaMascot size={160} />
            </div>
            <div className="absolute left-[10%] bottom-12 rotate-[15deg] hidden md:block">
              <PandaMascot size={180} />
            </div>
            <div className="absolute right-[15%] top-[55%] rotate-[-8deg] hidden md:block">
              <PandaMascot size={140} />
            </div>
          </div>
        </div>

        {/* ─── Color strip ─── */}
        <div className="flex h-1">
          {rows.map((r) => (
            <span key={r.id} className="flex-1 transition-all duration-500" style={{ background: r.color, opacity: selectedId && selectedId !== r.id ? 0.25 : 0.9 }} />
          ))}
        </div>

        {/* ─── Header ─── */}
        <header className="sticky top-0 z-40 border-b border-[rgba(96,126,190,0.16)] backdrop-blur-md" style={{
          background: isDark ? "rgba(10,15,26,0.92)" : "rgba(255,255,255,0.92)"
        }}>
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2.5 sm:px-4 sm:py-3 md:gap-x-6 md:px-6 md:py-3.5">
            {/* Logo */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl sm:h-10 sm:w-10" style={{
                background: isDark ? "rgba(51,69,111,0.35)" : "rgba(226,232,240,0.8)",
                boxShadow: isDark ? "0 0 20px rgba(53,201,163,0.15)" : "0 2px 8px rgba(0,0,0,0.06)"
              }}>
                <PandaMascot size={28} className="sm:hidden" />
                <PandaMascot size={32} className="hidden sm:block" />
              </div>
              <div className="min-w-0">
                <h1 className="font-display truncate text-[13px] font-bold leading-tight text-mist-100 sm:text-[15px] md:text-base">{t("siteTitle")}</h1>
                <p className="truncate text-[10px] font-bold text-mist-500 sm:mt-0.5 sm:text-[11px]">{t("organizations")}</p>
              </div>
            </div>

            {/* Navigation - скрыто на мобильных, используется нижняя навигация */}
            <nav className="hidden sm:block order-3 sm:w-auto sm:mx-auto">
              <div className="flex items-center justify-center gap-1 rounded-full border border-[rgba(96,126,190,0.22)] p-1" style={{
                background: isDark ? "rgba(19,28,48,0.8)" : "rgba(241,245,249,0.8)"
              }}>
                <button className={`tab-btn px-4 ${view === "charts" ? "active" : ""}`} onClick={() => setView("charts")}>
                  {t("charts")}
                </button>
                <button className={`tab-btn px-4 ${view === "orgs" ? "active" : ""}`} onClick={() => setView("orgs")}>
                  {t("orgs")}
                </button>
                <button className={`tab-btn px-4 ${view === "tables" ? "active" : ""}`} onClick={() => setView("tables")}>
                  {t("tables")}
                </button>
              </div>
            </nav>

            {/* Right controls */}
            <div className="ml-auto flex items-center gap-2 sm:gap-3 md:gap-4">
              <span className="relative flex items-center gap-1.5 text-[10px] font-bold text-mist-500 sm:text-[11px]">
                <span className="live-dot relative h-1.5 w-1.5 rounded-full bg-good text-good sm:h-2 sm:w-2" />
                <span className="hidden sm:inline">{t("autosave")}</span>
                <span className="sm:hidden">{t("autosaveShort")}</span>
              </span>
              <span className="hidden md:block rounded-full border border-[rgba(96,126,190,0.25)] px-3 py-1.5 text-[11px] font-bold text-mist-500">{today}</span>
              <ThemeSwitcher />
              <LanguageSwitcher />
              {isAuthenticated ? (
                <button onClick={logout} className="rounded-full border border-[rgba(239,111,94,0.4)] bg-[rgba(239,111,94,0.1)] px-3 py-1.5 text-[11px] font-bold text-speak transition hover:border-[rgba(239,111,94,0.6)] hover:bg-[rgba(239,111,94,0.2)]">{t("logout")}</button>
              ) : (
                <button onClick={() => setShowLogin(true)} className="rounded-full border border-[rgba(90,167,240,0.4)] bg-[rgba(90,167,240,0.1)] px-3 py-1.5 text-[11px] font-bold text-plan transition hover:border-[rgba(90,167,240,0.6)] hover:bg-[rgba(90,167,240,0.2)]">{t("login")}</button>
              )}
            </div>
          </div>
        </header>

        {/* ─── Content ─── */}
        <main key={view} className="view-enter mx-auto max-w-7xl px-3 py-4 pb-20 sm:px-4 sm:py-6 sm:pb-6 md:px-6 md:py-8">
          {view === "charts" && <ChartsView rows={rows} selectedId={selectedId} onSelect={setSelectedId} />}
          {view === "orgs" && <OrgsView rows={rows} onEditOrg={goToTableFor} />}
          {view === "tables" && <TablesView rows={rows} onUpdate={updateCell} onReset={resetData} highlightId={highlightId} />}

          {/* ─── Footer ─── */}
          <footer className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-[rgba(96,126,190,0.14)] pt-4 pb-6 sm:mt-8 sm:gap-3 sm:pt-5 sm:pb-8">
            <p className="flex items-center gap-2 text-[11px] font-semibold text-mist-500 sm:text-[12px]">
              <PandaMini className="text-mist-600 hidden sm:block" />
              <span>
                {t("total")}: <span className="tabular text-mist-300">{fmt(totals.total)}</span>
                <span className="hidden sm:inline"> {t("normativ")} </span>
                <span className="sm:hidden"> / </span>
                <span className="tabular text-mist-300">{fmt(totals.norm)}</span>
                {" "}
                <span className={`tabular ${totals.total > totals.norm ? "text-good" : "text-mist-300"}`}>({normPct}%)</span>
              </span>
            </p>
            <p className="text-[11px] font-semibold text-mist-500 sm:text-[12px]">{t("footerNote")}</p>
          </footer>
        </main>

        {/* ─── Toast ─── */}
        {toast && (
          <div className="toast-in fixed bottom-4 right-4 z-50 flex items-center gap-2.5 rounded-xl border border-[rgba(164,207,90,0.4)] px-3 py-2.5 shadow-2xl sm:bottom-6 sm:right-6 sm:gap-3 sm:px-4 sm:py-3" style={{
            background: isDark ? "rgba(19,28,48,0.96)" : "rgba(255,255,255,0.98)"
          }}>
            <PandaMini className="text-good" />
            <span className="text-[12px] font-bold text-mist-100 sm:text-sm">{t(toast as any)}</span>
          </div>
        )}

        {/* ─── Scroll to top ─── */}
        <ScrollToTop />

        {/* ─── Mobile bottom navigation ─── */}
        <MobileNav currentView={view} onViewChange={setView} />
      </div>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
