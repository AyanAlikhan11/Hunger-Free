'use client';

export function FoodPatternBackground({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      {/* Grain patterns */}
      <svg className="absolute top-10 left-10 w-24 h-24 text-emerald-300 opacity-[0.06] animate-pulse-soft" viewBox="0 0 100 100" fill="currentColor">
        <ellipse cx="50" cy="50" rx="8" ry="18" transform="rotate(-30 50 50)" />
        <ellipse cx="50" cy="50" rx="8" ry="18" transform="rotate(10 50 50)" />
        <ellipse cx="50" cy="50" rx="8" ry="18" transform="rotate(50 50 50)" />
        <line x1="50" y1="20" x2="50" y2="80" strokeWidth="2" />
      </svg>

      <svg className="absolute top-32 right-20 w-20 h-20 text-amber-300 opacity-[0.06] animate-pulse-soft stagger-1" viewBox="0 0 100 100" fill="currentColor">
        <ellipse cx="50" cy="50" rx="8" ry="18" transform="rotate(-20 50 50)" />
        <ellipse cx="50" cy="50" rx="8" ry="18" transform="rotate(20 50 50)" />
        <ellipse cx="50" cy="50" rx="8" ry="18" transform="rotate(60 50 50)" />
        <line x1="50" y1="25" x2="50" y2="75" strokeWidth="2" />
      </svg>

      {/* Leaf patterns */}
      <svg className="absolute bottom-20 left-20 w-32 h-32 text-emerald-400 opacity-[0.05] animate-float" viewBox="0 0 100 100" fill="currentColor">
        <path d="M50 10 Q80 40 50 90 Q20 40 50 10 Z" />
        <line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>

      <svg className="absolute top-60 left-1/3 w-16 h-16 text-emerald-300 opacity-[0.05] animate-float stagger-2" viewBox="0 0 100 100" fill="currentColor">
        <path d="M50 10 Q80 40 50 90 Q20 40 50 10 Z" />
        <line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>

      {/* Apple/carrot patterns */}
      <svg className="absolute top-20 left-1/2 w-16 h-16 text-red-300 opacity-[0.06] animate-float stagger-3" viewBox="0 0 100 100" fill="currentColor">
        <circle cx="50" cy="55" r="30" />
        <rect x="46" y="15" width="8" height="25" rx="4" />
        <ellipse cx="62" cy="28" rx="10" ry="6" transform="rotate(30 62 28)" />
      </svg>

      <svg className="absolute bottom-40 right-1/4 w-14 h-14 text-orange-300 opacity-[0.06] animate-float stagger-4" viewBox="0 0 100 100" fill="currentColor">
        <path d="M50 20 L65 80 L35 80 Z" />
        <line x1="50" y1="20" x2="50" y2="80" strokeWidth="3" stroke="currentColor" fill="none" />
      </svg>

      {/* Circle dots */}
      <div className="absolute top-1/4 right-1/3 w-3 h-3 rounded-full bg-emerald-400 opacity-[0.08] animate-pulse-soft" />
      <div className="absolute bottom-1/3 left-1/4 w-2 h-2 rounded-full bg-amber-400 opacity-[0.08] animate-pulse-soft stagger-1" />
      <div className="absolute top-1/2 right-10 w-4 h-4 rounded-full bg-emerald-300 opacity-[0.06] animate-pulse-soft stagger-2" />
      <div className="absolute top-40 left-10 w-2.5 h-2.5 rounded-full bg-amber-300 opacity-[0.07] animate-pulse-soft stagger-3" />

      {/* Additional floating elements */}
      <svg className="absolute bottom-32 left-1/3 w-20 h-20 text-emerald-200 opacity-[0.05] animate-float stagger-5" viewBox="0 0 100 100" fill="currentColor">
        <circle cx="50" cy="50" r="40" />
      </svg>

      <svg className="absolute top-1/3 right-10 w-12 h-12 text-amber-200 opacity-[0.06]" viewBox="0 0 100 100" fill="currentColor">
        <ellipse cx="50" cy="50" rx="10" ry="20" transform="rotate(-15 50 50)" />
        <ellipse cx="50" cy="50" rx="10" ry="20" transform="rotate(15 50 50)" />
      </svg>
    </div>
  );
}
