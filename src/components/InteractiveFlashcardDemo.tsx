// src/components/InteractiveFlashcardDemo.tsx
'use client'

import { useState, useEffect } from 'react'
import { RotateCcw, Volume2, Sparkles, AlertCircle } from 'lucide-react'

interface DemoVocab {
  character: string
  pinyin: string
  meaningVi: string
  exampleZh: string
  exampleVi: string
  hskLevel: number
  topic: string
}

const DEMO_VOCABS: DemoVocab[] = [
  {
    character: '学习',
    pinyin: 'xuéxí',
    meaningVi: 'Học tập / Nghiên cứu',
    exampleZh: '我们一起学习汉语吧！',
    exampleVi: 'Chúng ta cùng học tiếng Trung nhé!',
    hskLevel: 2,
    topic: 'Học tập'
  },
  {
    character: '高兴',
    pinyin: 'gāoxìng',
    meaningVi: 'Vui vẻ / Phấn khởi',
    exampleZh: '今天能认识你，我很高兴。',
    exampleVi: 'Hôm nay có thể quen biết bạn, tôi rất vui.',
    hskLevel: 1,
    topic: 'Cảm xúc'
  },
  {
    character: '漂亮',
    pinyin: 'piàoliang',
    meaningVi: 'Xinh đẹp / Đẹp đẽ',
    exampleZh: '你的裙子非常漂亮。',
    exampleVi: 'Váy của bạn vô cùng xinh đẹp.',
    hskLevel: 2,
    topic: 'Mô tả'
  },
  {
    character: '谢谢',
    pinyin: 'xièxie',
    meaningVi: 'Cảm ơn',
    exampleZh: '谢谢你帮我洗衣服。',
    exampleVi: 'Cảm ơn bạn đã giặt quần áo giúp tôi.',
    hskLevel: 1,
    topic: 'Giao tiếp'
  },
  {
    character: '准备',
    pinyin: 'zhǔnbèi',
    meaningVi: 'Chuẩn bị',
    exampleZh: '我准备好了下周的旅行。',
    exampleVi: 'Tôi đã chuẩn bị sẵn sàng cho chuyến du lịch tuần tới.',
    hskLevel: 3,
    topic: 'Hành động'
  }
]

interface FloatingToast {
  id: number
  text: string
  classNames: string
}

export default function InteractiveFlashcardDemo() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [animationState, setAnimationState] = useState<'idle' | 'swipe-left' | 'swipe-right' | 'swipe-up' | 'incoming'>('idle')
  const [toasts, setToasts] = useState<FloatingToast[]>([])

  const currentWord = DEMO_VOCABS[currentIndex]

  // Speak word using SpeechSynthesis
  const speakWord = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      utterance.rate = 0.85
      window.speechSynthesis.speak(utterance)
    }
  }

  // Handle rating interaction
  const handleRate = (rating: 'again' | 'hard' | 'easy') => {
    if (animationState !== 'idle') return

    // Speak word automatically if unflipped and user rates it (or just pronounce for fun)
    // We let user hear pronunciation on success
    if (rating === 'easy') {
      speakWord(currentWord.character)
    }

    // Determine animation swipe direction
    let nextState: 'swipe-left' | 'swipe-right' | 'swipe-up' = 'swipe-up'
    let toastText = ''
    let toastClass = ''

    if (rating === 'again') {
      nextState = 'swipe-left'
      toastText = '🔄 Ôn lại sớm!'
      toastClass = 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50'
    } else if (rating === 'hard') {
      nextState = 'swipe-up'
      toastText = '🤔 Cần xem lại!'
      toastClass = 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50'
    } else if (rating === 'easy') {
      nextState = 'swipe-right'
      toastText = '🔥 +15 XP'
      toastClass = 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50'
    }

    // Set animation state
    setAnimationState(nextState)

    // Add floating toast message
    const newToastId = Date.now()
    setToasts(prev => [...prev, { id: newToastId, text: toastText, classNames: toastClass }])

    // Remove toast after animation duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToastId))
    }, 1500)

    // Wait for card swipe animation to complete
    setTimeout(() => {
      setIsFlipped(false)
      setCurrentIndex(prev => (prev + 1) % DEMO_VOCABS.length)
      setAnimationState('incoming')

      // Slide card in
      setTimeout(() => {
        setAnimationState('idle')
      }, 50)
    }, 350)
  }

  // Auto pronounces first load character when user flips
  useEffect(() => {
    if (isFlipped) {
      speakWord(currentWord.character)
    }
  }, [isFlipped, currentIndex])

  // Get current swipe CSS class
  const getCardTransformClass = () => {
    switch (animationState) {
      case 'swipe-left':
        return 'transition-all duration-350 transform -translate-x-48 rotate-[-12deg] opacity-0 scale-90'
      case 'swipe-right':
        return 'transition-all duration-350 transform translate-x-48 rotate-[12deg] opacity-0 scale-90'
      case 'swipe-up':
        return 'transition-all duration-350 transform -translate-y-24 opacity-0 scale-95'
      case 'incoming':
        return 'transform scale-90 opacity-0 translate-y-4'
      case 'idle':
      default:
        return 'transition-all duration-300 transform scale-100 translate-x-0 translate-y-0 rotate-0 opacity-100 hover:scale-[1.02]'
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm relative">
      {/* Dynamic Keyframes for float up toast */}
      <style>{`
        @keyframes float-up-fade {
          0% {
            transform: translateY(10px) scale(0.9);
            opacity: 0;
          }
          15% {
            transform: translateY(0px) scale(1);
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: translateY(-80px) scale(1.05);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation: float-up-fade 1.2s cubic-bezier(0.25, 1, 0.50, 1) forwards;
        }
      `}</style>

      {/* Floating Toast Messages Container */}
      <div className="absolute top-1/3 left-0 right-0 z-50 pointer-events-none flex flex-col items-center gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`animate-float-up px-4 py-2 rounded-full border text-sm font-bold shadow-lg flex items-center gap-1.5 backdrop-blur-md ${toast.classNames}`}
          >
            {toast.text}
          </div>
        ))}
      </div>

      {/* 3D Flipping Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-[320px] cursor-pointer perspective-1000 group select-none relative"
      >
        <div
          className={`w-full h-full duration-500 transform-style-3d relative ${getCardTransformClass()} ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT SIDE (Hanzi Character) */}
          <div className="absolute inset-0 bg-white dark:bg-slate-900 border-2 border-rose-100/60 dark:border-slate-800/80 rounded-[2.5rem] shadow-xl shadow-rose-200/20 hover:shadow-rose-200/30 transition-shadow backface-hidden flex flex-col items-center justify-between p-8 text-center">
            <div className="w-full flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-3 py-1 rounded-full border border-rose-100/10">
                HSK {currentWord.hskLevel}
              </span>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                {currentWord.topic}
              </span>
            </div>

            <div className="my-auto space-y-3">
              <h2
                className="text-9xl sm:text-[7rem] font-black text-slate-800 dark:text-slate-50 tracking-tight leading-none mb-4 font-serif select-all"
                style={{ fontFamily: "'Noto Serif SC', serif" }}
              >
                {currentWord.character}
              </h2>
              <div className="flex items-center justify-center gap-1.5 py-1 px-3 bg-slate-50 dark:bg-slate-850 rounded-full text-slate-400 group-hover:text-rose-500 transition-colors">
                <RotateCcw className="w-3.5 h-3.5 animate-spin-slow" />
                <span className="text-[10px] font-bold tracking-wide">Nhấp để lật thẻ</span>
              </div>
            </div>

            <div className="w-full flex items-center justify-center gap-1 text-[10px] font-semibold text-slate-400">
              <span>Đang demo từ {currentIndex + 1} / {DEMO_VOCABS.length}</span>
            </div>
          </div>

          {/* BACK SIDE (Pinyin, Translation, Example) */}
          <div className="absolute inset-0 bg-white dark:bg-slate-900 border-2 border-rose-100/60 dark:border-slate-800/80 rounded-[2.5rem] shadow-xl rotate-y-180 backface-hidden flex flex-col justify-between p-8">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-black text-rose-500 tracking-wide">{currentWord.pinyin}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    speakWord(currentWord.character)
                  }}
                  className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 hover:scale-110 active:scale-95 transition-all inline-flex items-center justify-center shadow-sm border border-rose-100/50"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 leading-snug">
                {currentWord.meaningVi}
              </h3>
            </div>

            {/* Example sentence box */}
            <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-slate-950 border border-rose-100/10 dark:border-slate-800/60 space-y-1.5">
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Ví dụ minh họa</span>
              <p className="text-base font-extrabold text-slate-800 dark:text-slate-200 text-left font-serif leading-tight">
                {currentWord.exampleZh}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-left leading-snug">
                {currentWord.exampleVi}
              </p>
            </div>

            <div className="flex justify-center items-center gap-1.5 text-[9px] font-bold text-rose-400/80 uppercase">
              <RotateCcw className="w-3 h-3" /> Click để xem mặt trước
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2.5 w-full">
        <button
          onClick={() => handleRate('again')}
          className="flex-1 py-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 font-extrabold text-xs hover:bg-rose-100/80 active:scale-95 shadow-sm transition-all flex flex-col items-center justify-center gap-0.5 group"
        >
          <span className="text-lg group-hover:-translate-y-0.5 transition-transform">😕</span>
          <span>Quên rồi</span>
        </button>
        <button
          onClick={() => handleRate('hard')}
          className="flex-1 py-3.5 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 font-extrabold text-xs hover:bg-amber-100/80 active:scale-95 shadow-sm transition-all flex flex-col items-center justify-center gap-0.5 group"
        >
          <span className="text-lg group-hover:-translate-y-0.5 transition-transform">🤔</span>
          <span>Hơi nhớ</span>
        </button>
        <button
          onClick={() => handleRate('easy')}
          className="flex-1 py-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 font-extrabold text-xs hover:bg-emerald-100/80 active:scale-95 shadow-sm transition-all flex flex-col items-center justify-center gap-0.5 group"
        >
          <span className="text-lg group-hover:-translate-y-0.5 transition-transform">✅</span>
          <span>Nhớ rõ</span>
        </button>
      </div>

      {/* Dots progress indicator */}
      <div className="flex gap-2 mt-1">
        {DEMO_VOCABS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (animationState === 'idle') {
                setIsFlipped(false)
                setCurrentIndex(idx)
              }
            }}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-6 bg-rose-500' : 'w-2.5 bg-slate-200 dark:bg-slate-800'
            }`}
            title={`Chuyển tới từ ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
