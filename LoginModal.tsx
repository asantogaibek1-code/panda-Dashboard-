import { useState } from "react";
import { useAuth } from "../AuthContext";
import { useLanguage } from "../LanguageContext";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      onClose();
      setPassword("");
      setError("");
    } else {
      setError(t("wrongPassword"));
      setPassword("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(51,69,111,0.35)]">
            <svg width="32" height="32" viewBox="0 0 64 64" aria-hidden>
              <circle cx="18" cy="18" r="8" fill="#1a1a1a" />
              <circle cx="46" cy="18" r="8" fill="#1a1a1a" />
              <circle cx="32" cy="34" r="20" fill="#f5f5f5" />
              <ellipse cx="24" cy="32" rx="6" ry="7" fill="#1a1a1a" />
              <ellipse cx="40" cy="32" rx="6" ry="7" fill="#1a1a1a" />
              <ellipse cx="32" cy="40" rx="3" ry="2.5" fill="#1a1a1a" />
            </svg>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-mist-100">{t("loginTitle")}</h2>
            <p className="text-xs font-semibold text-mist-500">{t("loginSubtitle")}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-mist-300 mb-2">{t("password")}</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="cell-input w-full text-left" placeholder={t("passwordPlaceholder")} autoFocus />
            {error && <p className="mt-2 text-sm font-bold text-speak">{error}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-[rgba(96,126,190,0.3)] bg-[rgba(19,28,48,0.7)] px-4 py-2.5 text-sm font-bold text-mist-300 transition hover:border-[rgba(130,160,220,0.5)] hover:text-mist-100">{t("cancel")}</button>
            <button type="submit" className="flex-1 rounded-xl bg-plan/20 border border-plan/40 px-4 py-2.5 text-sm font-bold text-plan transition hover:bg-plan/30 hover:border-plan/60">{t("submit")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
