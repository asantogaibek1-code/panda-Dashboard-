export function PandaMascot({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden>
      {/* Уши */}
      <circle cx="18" cy="18" r="10" fill="#1a1a1a" />
      <circle cx="46" cy="18" r="10" fill="#1a1a1a" />
      <circle cx="18" cy="18" r="6" fill="#2a2a2a" />
      <circle cx="46" cy="18" r="6" fill="#2a2a2a" />
      
      {/* Голова - более округлая */}
      <ellipse cx="32" cy="38" rx="24" ry="22" fill="#ffffff" />
      
      {/* Большие милые глаза */}
      <ellipse cx="22" cy="34" rx="8" ry="9" fill="#1a1a1a" />
      <ellipse cx="42" cy="34" rx="8" ry="9" fill="#1a1a1a" />
      
      {/* Блики в глазах - большие */}
      <circle cx="24" cy="32" r="4" fill="#ffffff" />
      <circle cx="44" cy="32" r="4" fill="#ffffff" />
      <circle cx="20" cy="36" r="2" fill="#ffffff" opacity="0.6" />
      <circle cx="40" cy="36" r="2" fill="#ffffff" opacity="0.6" />
      
      {/* Нос */}
      <ellipse cx="32" cy="44" rx="4" ry="3" fill="#1a1a1a" />
      <ellipse cx="31" cy="43" rx="1.5" ry="1" fill="#4a4a4a" />
      
      {/* Милая улыбка */}
      <path d="M32 47 Q28 50 25 49" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 47 Q36 50 39 49" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
      
      {/* Румянец */}
      <circle cx="16" cy="42" r="4" fill="#ffb3d9" opacity="0.4" />
      <circle cx="48" cy="42" r="4" fill="#ffb3d9" opacity="0.4" />
    </svg>
  );
}

export function PandaMini({ className = "" }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="18" cy="18" r="8" fill="currentColor" opacity="0.6" />
      <circle cx="46" cy="18" r="8" fill="currentColor" opacity="0.6" />
      <ellipse cx="32" cy="38" rx="24" ry="22" fill="currentColor" />
      <ellipse cx="22" cy="34" rx="6" ry="7" fill="#0a0f1a" />
      <ellipse cx="42" cy="34" rx="6" ry="7" fill="#0a0f1a" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="#0a0f1a" />
    </svg>
  );
}
