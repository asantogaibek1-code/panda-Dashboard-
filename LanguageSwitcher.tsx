import { useLanguage } from "../LanguageContext";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-full border border-[rgba(96,126,190,0.25)] bg-[rgba(19,28,48,0.7)] p-0.5">
      <button
        onClick={() => setLanguage("ru")}
        className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${language === "ru" ? "bg-[rgba(51,69,111,0.8)] text-mist-100" : "text-mist-500 hover:text-mist-300"}`}
      >
        RU
      </button>
      <button
        onClick={() => setLanguage("kz")}
        className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${language === "kz" ? "bg-[rgba(51,69,111,0.8)] text-mist-100" : "text-mist-500 hover:text-mist-300"}`}
      >
        KZ
      </button>
    </div>
  );
}
