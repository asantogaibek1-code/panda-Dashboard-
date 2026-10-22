import { useLanguage } from "../LanguageContext";
import { useTheme } from "../ThemeContext";

interface Props {
  currentView: "charts" | "orgs" | "tables";
  onViewChange: (view: "charts" | "orgs" | "tables") => void;
}

export default function MobileNav({ currentView, onViewChange }: Props) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[rgba(96,126,190,0.16)] backdrop-blur-md sm:hidden" style={{
      background: isDark ? "rgba(10,15,26,0.95)" : "rgba(255,255,255,0.95)",
      paddingBottom: "env(safe-area-inset-bottom)"
    }}>
      <div className="flex items-center justify-around gap-1 p-2">
        <button
          onClick={() => onViewChange("charts")}
          className={`flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-all ${
            currentView === "charts"
              ? "bg-plan/20 text-plan"
              : "text-mist-500 hover:text-mist-300"
          }`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-[10px] font-bold">{t("charts")}</span>
        </button>
        <button
          onClick={() => onViewChange("orgs")}
          className={`flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-all ${
            currentView === "orgs"
              ? "bg-plan/20 text-plan"
              : "text-mist-500 hover:text-mist-300"
          }`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="text-[10px] font-bold">{t("orgs")}</span>
        </button>
        <button
          onClick={() => onViewChange("tables")}
          className={`flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-all ${
            currentView === "tables"
              ? "bg-plan/20 text-plan"
              : "text-mist-500 hover:text-mist-300"
          }`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="text-[10px] font-bold">{t("tables")}</span>
        </button>
      </div>
    </nav>
  );
}
