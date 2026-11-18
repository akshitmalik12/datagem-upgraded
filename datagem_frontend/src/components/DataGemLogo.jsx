import React from 'react';

export default function DataGemLogo({ 
  size = 'md', 
  showWordmark = false, 
  className = '', 
  glow = false,
  wordmarkClassName = '' 
}) {
  const sizeMap = {
    xs: { box: 20, icon: 20, text: 'text-sm' },
    sm: { box: 26, icon: 26, text: 'text-base' },
    md: { box: 32, icon: 32, text: 'text-lg' },
    lg: { box: 40, icon: 40, text: 'text-xl' },
    xl: { box: 48, icon: 48, text: 'text-2xl' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Geometric Monogram Icon */}
      <div 
        style={{ width: currentSize.box, height: currentSize.box }}
        className={`relative flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 shadow-sm transition-all duration-300 ${
          glow ? 'shadow-[0_0_16px_rgba(16,185,129,0.25)] border-emerald-500/40' : ''
        }`}
      >
        <svg 
          viewBox="0 0 32 32" 
          width={currentSize.icon} 
          height={currentSize.icon} 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
        >
          <defs>
            <linearGradient id="dgPrimaryGrad" x1="6" y1="6" x2="26" y2="26" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <linearGradient id="dgAccentGrad" x1="12" y1="8" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          
          {/* Outer faceted geometric data shield */}
          <path 
            d="M16 4L26 9.5V20.5L16 27L6 20.5V9.5L16 4Z" 
            stroke="url(#dgPrimaryGrad)" 
            strokeWidth="2.2" 
            strokeLinejoin="round" 
            strokeLinecap="round"
            className="transition-all duration-300"
          />
          {/* Internal ascending data axis node */}
          <path 
            d="M16 11V21M11 14.5L16 17.5L21 14.5" 
            stroke="url(#dgAccentGrad)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          {/* Central precision core anchor */}
          <circle cx="16" cy="11" r="1.5" fill="#34D399" />
        </svg>
      </div>

      {showWordmark && (
        <span className={`font-bold tracking-tight text-slate-900 dark:text-white font-sans ${currentSize.text} ${wordmarkClassName}`}>
          Data<span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">Gem</span>
        </span>
      )}
    </div>
  );
}
