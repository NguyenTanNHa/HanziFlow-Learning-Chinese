// src/components/mascot.tsx
'use client'

import React from 'react'

interface MascotProps {
  state: 'neutral' | 'correct' | 'wrong' | 'exhausted'
  size?: number
}

export default function BaoBaoMascot({ state, size = 120 }: MascotProps) {
  return (
    <div className="flex flex-col items-center justify-center select-none p-2 relative animate-in fade-in duration-200">
      {/* Animated Background Effects */}
      {state === 'correct' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
          {/* Confetti particles */}
          <div className="absolute w-2 h-2 bg-rose-400 rounded-full animate-ping top-4 left-6" />
          <div className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping bottom-6 right-8" />
          <div className="absolute w-2 h-1 bg-emerald-400 rotate-12 top-8 right-6 animate-bounce" />
          <div className="absolute w-1.5 h-3 bg-blue-400 -rotate-45 bottom-4 left-8 animate-bounce" />
        </div>
      )}

      {state === 'wrong' && (
        <div className="absolute inset-0 pointer-events-none flex justify-center">
          {/* Tear drops */}
          <div className="absolute w-1.5 h-3 bg-cyan-400 rounded-full animate-bounce top-16 left-[35%] opacity-80" style={{ animationDelay: '0.1s' }} />
          <div className="absolute w-1.5 h-3 bg-cyan-400 rounded-full animate-bounce top-18 right-[35%] opacity-80" style={{ animationDelay: '0.3s' }} />
        </div>
      )}

      {/* SVG Panda Mascot */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={`transition-all duration-300 ${
          state === 'correct'
            ? 'animate-bounce hover:scale-105'
            : state === 'wrong'
            ? 'animate-shake translate-y-0.5'
            : state === 'exhausted'
            ? 'animate-pulse opacity-85 scale-95'
            : 'hover:rotate-6 transition-transform'
        }`}
      >
        <defs>
          <style>{`
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-2px); }
              75% { transform: translateX(2px); }
            }
            .animate-shake {
              animation: shake 0.4s ease-in-out infinite;
            }
            @keyframes pulse-scale {
              0%, 100% { transform: scale(0.95); }
              50% { transform: scale(0.98); }
            }
            .animate-pulse {
              animation: pulse-scale 2s ease-in-out infinite;
            }
          `}</style>
        </defs>

        {/* Ears */}
        <circle cx="28" cy="22" r="10" fill="#1e293b" />
        <circle cx="72" cy="22" r="10" fill="#1e293b" />

        {/* Head */}
        <circle cx="50" cy="48" r="32" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />

        {/* Body (partial) */}
        <path d="M25,78 C35,68 65,68 75,78 C70,88 30,88 25,78 Z" fill="#1e293b" />

        {/* Inner white circle for snout/mouth background */}
        <ellipse cx="50" cy="58" rx="14" ry="10" fill="#f8fafc" />

        {/* Nose */}
        <polygon points="46,53 54,53 50,57" fill="#1e293b" />

        {/* Mouth based on state */}
        {state === 'correct' && (
          // Huge Smile
          <path d="M43,60 Q50,67 57,60" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
        )}
        {state === 'wrong' && (
          // Frown / Cry mouth
          <path d="M44,63 Q50,58 56,63" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
        )}
        {state === 'exhausted' && (
          // Straight neutral tired mouth
          <path d="M45,61 L55,61" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
        )}
        {state === 'neutral' && (
          // Small Smile
          <path d="M45,59 Q50,64 55,59" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
        )}

        {/* Eye Patches */}
        <ellipse cx="36" cy="42" rx="9" ry="11" fill="#1e293b" transform="rotate(-10, 36, 42)" />
        <ellipse cx="64" cy="42" rx="9" ry="11" fill="#1e293b" transform="rotate(10, 64, 42)" />

        {/* Eyes based on state */}
        {state === 'correct' && (
          <>
            {/* Cool Sunglasses! */}
            <path d="M24,38 L76,38" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
            <path d="M26,38 Q36,54 45,38" fill="#0f172a" />
            <path d="M55,38 Q64,54 74,38" fill="#0f172a" />
          </>
        )}

        {state === 'wrong' && (
          <>
            {/* Tearing/sad eyes */}
            <circle cx="38" cy="40" r="3" fill="#ffffff" />
            <circle cx="62" cy="40" r="3" fill="#ffffff" />
            {/* Tear streams */}
            <path d="M38,43 L38,49" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
            <path d="M62,43 L62,49" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
          </>
        )}

        {state === 'exhausted' && (
          <>
            {/* Spiral/Cross eyes (X X) */}
            <path d="M33,37 L39,43 M39,37 L33,43" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <path d="M61,37 L67,43 M67,37 L61,43" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          </>
        )}

        {state === 'neutral' && (
          <>
            {/* Happy eyes with glint */}
            <circle cx="37" cy="40" r="4.5" fill="#ffffff" />
            <circle cx="38.5" cy="38.5" r="1.5" fill="#1e293b" />
            
            <circle cx="63" cy="40" r="4.5" fill="#ffffff" />
            <circle cx="64.5" cy="38.5" r="1.5" fill="#1e293b" />
          </>
        )}

        {/* Blushing cheeks (except exhausted) */}
        {state !== 'exhausted' && (
          <>
            <circle cx="27" cy="50" r="3.5" fill="#f43f5e" opacity="0.35" />
            <circle cx="73" cy="50" r="3.5" fill="#f43f5e" opacity="0.35" />
          </>
        )}

        {/* Sweat drop on exhausted state */}
        {state === 'exhausted' && (
          <path d="M78,35 C78,38 75,41 73,41 C71,41 70,39 71,37 C72,35 77,32 78,35 Z" fill="#38bdf8" />
        )}
      </svg>

      {/* Short Dynamic Text Below Mascot */}
      <span className={`text-[10px] font-extrabold mt-1.5 px-3 py-1 rounded-full uppercase tracking-wider text-center border shadow-sm ${
        state === 'correct'
          ? 'bg-emerald-50 text-emerald-600 border-emerald-250 animate-bounce'
          : state === 'wrong'
          ? 'bg-rose-50 text-rose-500 border-rose-250 animate-shake'
          : state === 'exhausted'
          ? 'bg-slate-100 text-slate-500 border-slate-200'
          : 'bg-white text-slate-500 border-slate-150 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350'
      }`}>
        {state === 'correct' && 'Tuyệt cú mèo! 🎉'}
        {state === 'wrong' && 'Thử lại xem nào! 🥺'}
        {state === 'exhausted' && 'Cần nạp thêm tim! 🪫'}
        {state === 'neutral' && 'Bao Bao đồng hành 🐼'}
      </span>
    </div>
  )
}
