import React from 'react';

export function FennecBrandLogo({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Fennec Fox Mascot Logo"
    >
      {/* Big Fennec Fox Ears */}
      {/* Left Ear */}
      <path
        d="M20 50 C5 10, 10 5, 38 32 C34 40, 26 48, 20 50 Z"
        fill="#E07A5F"
        stroke="#1F1914"
        strokeWidth="2.5"
      />
      <path
        d="M22 46 C12 18, 15 14, 34 33 C32 38, 26 44, 22 46 Z"
        fill="#F59E0B"
        opacity="0.8"
      />

      {/* Right Ear */}
      <path
        d="M80 50 C95 10, 90 5, 62 32 C66 40, 74 48, 80 50 Z"
        fill="#E07A5F"
        stroke="#1F1914"
        strokeWidth="2.5"
      />
      <path
        d="M78 46 C88 18, 85 14, 66 33 C68 38, 74 44, 78 46 Z"
        fill="#F59E0B"
        opacity="0.8"
      />

      {/* Fennec Head */}
      <path
        d="M30 45 C30 35, 70 35, 70 45 C75 62, 50 82, 50 82 C50 82, 25 62, 30 45 Z"
        fill="#FDF8F5"
        stroke="#1F1914"
        strokeWidth="2.5"
      />

      {/* Cute Muzzle & Cheeks */}
      <ellipse cx="50" cy="62" rx="12" ry="10" fill="#E07A5F" opacity="0.15" />

      {/* Eyes */}
      <circle cx="41" cy="52" r="3.5" fill="#1F1914" />
      <circle cx="59" cy="52" r="3.5" fill="#1F1914" />
      <circle cx="42.5" cy="50.5" r="1" fill="#FFFFFF" />
      <circle cx="60.5" cy="50.5" r="1" fill="#FFFFFF" />

      {/* Nose */}
      <polygon points="50,60 46,56 54,56" fill="#1F1914" />
      
      {/* Friendly Smile */}
      <path
        d="M47 64 Q50 67 53 64"
        stroke="#1F1914"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function FennecHeader({ title = 'Fennec Scheduler', subtitle = 'Schedule time with me' }: { title?: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center text-center space-y-2 py-4">
      <div className="flex items-center space-x-3 bg-white/80 dark:bg-amber-950/40 backdrop-blur-md px-4 py-2 rounded-full border border-amber-200 dark:border-amber-900/60 shadow-sm">
        <FennecBrandLogo className="w-8 h-8 transform hover:scale-110 transition-transform duration-200" />
        <h1 className="text-xl font-bold bg-gradient-to-r from-amber-700 via-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
          {title}
        </h1>
      </div>
      {subtitle && <p className="text-sm text-stone-600 dark:text-stone-400 max-w-sm">{subtitle}</p>}
    </div>
  );
}
