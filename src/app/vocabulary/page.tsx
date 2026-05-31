// src/app/vocabulary/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/sidebar'
import { Bookmark, Volume2, Check, RefreshCw, Layers, List, Search, ArrowLeft, ArrowRight, HelpCircle, Brain, Award, Sparkles, X } from 'lucide-react'

interface VocabularyWord {
  id: string
  character: string
  pinyin: string
  meaningVi: string
  meaningEn: string | null
  exampleZh: string
  exampleVi: string
  hskLevel: number
  topic: string
  status: string // 'not_learned', 'learning', 'mastered'
  interval?: number
  easeFactor?: number
  repetitions?: number
  nextReview?: string | null
}

interface TestQuestion {
  vocabId: string
  character: string
  questionText: string
  options: string[]
  correctAnswer: string
  type: 'meaning' | 'pinyin'
}

interface Confetti {
  id: number
  left: number
  color: string
  delay: number
  scale: number
}

export default function VocabularyTrainer() {
  const [vocabList, setVocabList] = useState<VocabularyWord[]>([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'flashcard' | 'list' | 'test'>('flashcard')
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all')
  const [topicFilter, setTopicFilter] = useState<string | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [srsDueOnly, setSrsDueOnly] = useState<boolean>(false)

  // Flashcard state
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [xpEarned, setXpEarned] = useState<number | null>(null)

  // Spaced Repetition Completion Confetti States
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiParticles, setConfettiParticles] = useState<Confetti[]>([])

  // Memory Test State
  const [testState, setTestState] = useState<{
    isStarted: boolean
    isFinished: boolean
    questions: TestQuestion[]
    currentQuestionIdx: number
    selectedAnswer: string | null
    score: number
    xpAwarded: number
  }>({
    isStarted: false,
    isFinished: false,
    questions: [],
    currentQuestionIdx: 0,
    selectedAnswer: null,
    score: 0,
    xpAwarded: 0,
  })

  // Generate Confetti particles when deck is finished
  useEffect(() => {
    if (showConfetti) {
      const colors = ['#f43f5e', '#fb923c', '#eab308', '#10b981', '#3b82f6', '#8b5cf6']
      const particles = Array.from({ length: 80 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100, // percentage
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 2.5, // seconds
        scale: 0.5 + Math.random() * 0.8
      }))
      setConfettiParticles(particles)
    } else {
      setConfettiParticles([])
    }
  }, [showConfetti])

  useEffect(() => {
    async function fetchVocabs() {
      setLoading(true)
      try {
        let url = '/api/vocabulary'
        const params: string[] = []
        if (levelFilter !== 'all') params.push(`level=${levelFilter}`)
        if (topicFilter !== 'all') params.push(`topic=${topicFilter}`)
        if (srsDueOnly) params.push(`dueOnly=true`)
        if (params.length > 0) {
          url += `?${params.join('&')}`
        }

        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setVocabList(data.vocabularies)
          setCurrentIndex(0)
          setIsFlipped(false)
          setShowConfetti(false)
          // Reset test state when filters change
          setTestState({
            isStarted: false,
            isFinished: false,
            questions: [],
            currentQuestionIdx: 0,
            selectedAnswer: null,
            score: 0,
            xpAwarded: 0,
          })
        }
      } catch (err) {
        console.error('Error fetching vocabulary:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchVocabs()
  }, [levelFilter, topicFilter, srsDueOnly])

  // Browser Text-To-Speech (TTS) pronunciation helper
  const speakWord = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN' // Mandarin Chinese
      utterance.rate = 0.85    // Slightly slower for learners
      const voices = window.speechSynthesis.getVoices()
      const zhVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('ZH'))
      if (zhVoice) {
        utterance.voice = zhVoice
      }
      window.speechSynthesis.speak(utterance)
    }
  }

  // Trigger voice automatically when card flips to back
  const currentWord = filteredVocab(vocabList)[currentIndex]
  useEffect(() => {
    if (isFlipped && currentWord) {
      speakWord(currentWord.character)
    }
  }, [isFlipped, currentIndex])

  // Filter list by search query client-side
  function filteredVocab(words: VocabularyWord[]) {
    return words.filter(word => {
      const query = searchQuery.toLowerCase()
      return (
        word.character.includes(query) ||
        word.pinyin.toLowerCase().includes(query) ||
        word.meaningVi.toLowerCase().includes(query)
      )
    })
  }

  const activeFilteredVocab = filteredVocab(vocabList)

  // Handle flashcard review rating submittal
  const handleReview = async (vocabId: string, rating: 'again' | 'hard' | 'good' | 'easy' | 'mastered') => {
    setIsFlipped(false)
    try {
      const res = await fetch('/api/vocabulary/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vocabularyId: vocabId, rating }),
      })

      if (res.ok) {
        const data = await res.json()
        
        // Show XP gains
        setXpEarned(data.pointsAwarded)
        setTimeout(() => setXpEarned(null), 1200)

        // Optimistically update list item status and SRS metrics
        setVocabList(prev =>
          prev.map(v =>
            v.id === vocabId
              ? { 
                  ...v, 
                  status: data.review.status,
                  interval: data.review.interval,
                  easeFactor: data.review.easeFactor,
                  repetitions: data.review.repetitions,
                  nextReview: data.review.nextReview
                }
              : v
          )
        )

        // Advance to next card
        if (currentIndex < activeFilteredVocab.length - 1) {
          setTimeout(() => {
            setCurrentIndex(prev => prev + 1)
          }, 200)
        } else {
          // Deck finished! Trigger celebration confetti
          setShowConfetti(true)
          setTimeout(() => {
            setCurrentIndex(0)
          }, 200)
        }
      }
    } catch (err) {
      console.error('Review submit error:', err)
    }
  }

  // Helper utility to shuffle arrays
  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  // Generate memory test questions from current filtered vocab
  const startMemoryTest = () => {
    if (activeFilteredVocab.length < 2) {
      alert("Cần ít nhất 2 từ vựng trong bộ lọc hiện tại để tạo câu hỏi kiểm tra! Vui lòng thay đổi bộ lọc.")
      return
    }

    const shuffledSource = shuffleArray(activeFilteredVocab)
    const selectedWords = shuffledSource.slice(0, Math.min(10, shuffledSource.length))

    const generatedQuestions: TestQuestion[] = selectedWords.map(word => {
      const isMeaningQuestion = Math.random() > 0.5
      const type: 'meaning' | 'pinyin' = isMeaningQuestion ? 'meaning' : 'pinyin'
      const questionText = isMeaningQuestion 
        ? `Chữ Hán "${word.character}" có nghĩa tiếng Việt là gì?` 
        : `Từ "${word.character}" phát âm (Pinyin) là gì?`
      const correctAnswer = isMeaningQuestion ? word.meaningVi : word.pinyin

      // Get distractors from entire vocabulary list
      const allOtherWords = vocabList.filter(w => w.id !== word.id)
      const shuffledOthers = shuffleArray(allOtherWords)
      
      const distractors: string[] = []
      for (const other of shuffledOthers) {
        const val = isMeaningQuestion ? other.meaningVi : other.pinyin
        if (val !== correctAnswer && !distractors.includes(val)) {
          distractors.push(val)
        }
        if (distractors.length >= 3) break
      }

      // Pad distractors if vocab set is very small
      while (distractors.length < 3) {
        distractors.push(isMeaningQuestion ? `Đáp án ngẫu nhiên ${distractors.length + 1}` : 'nǐ hǎo')
      }

      const options = shuffleArray([correctAnswer, ...distractors])

      return {
        vocabId: word.id,
        character: word.character,
        questionText,
        options,
        correctAnswer,
        type
      }
    })

    setTestState({
      isStarted: true,
      isFinished: false,
      questions: generatedQuestions,
      currentQuestionIdx: 0,
      selectedAnswer: null,
      score: 0,
      xpAwarded: 0
    })
  }

  // Answer selection handler in memory check
  const handleAnswerSelect = async (option: string) => {
    if (testState.selectedAnswer !== null) return // Block multiple clicks

    const currentQ = testState.questions[testState.currentQuestionIdx]
    const isCorrect = option === currentQ.correctAnswer
    const nextScore = isCorrect ? testState.score + 1 : testState.score

    setTestState(prev => ({
      ...prev,
      selectedAnswer: option,
      score: nextScore
    }))

    // Wait and advance
    setTimeout(async () => {
      if (testState.currentQuestionIdx < testState.questions.length - 1) {
        setTestState(prev => ({
          ...prev,
          currentQuestionIdx: prev.currentQuestionIdx + 1,
          selectedAnswer: null
        }))
      } else {
        // Test finished - submit XP
        const xpEarnedValue = nextScore * 5 // 5 XP per correct answer
        try {
          const res = await fetch('/api/vocabulary/test-complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ points: xpEarnedValue }),
          })
          if (res.ok) {
            const data = await res.json()
            console.log('XP synced with database. Added:', data.pointsAwarded)
          }
        } catch (err) {
          console.error('Failed syncing test XP:', err)
        }

        setTestState(prev => ({
          ...prev,
          isFinished: true,
          xpAwarded: xpEarnedValue,
          selectedAnswer: null
        }))
      }
    }, 1200)
  }

  // Translate HSK topic labels
  const translateTopic = (topic: string) => {
    const map: Record<string, string> = {
      study: 'Học tập',
      family: 'Gia đình',
      work: 'Công việc',
      food: 'Ẩm thực',
      travel: 'Du lịch',
      shopping: 'Mua sắm',
      health: 'Sức khỏe',
      entertainment: 'Giải trí',
      reading: 'Đọc hiểu',
    }
    return map[topic] || topic
  }

  // Estimate next review interval for buttons based on SM-2 algorithm
  const getNextIntervalEstimate = (word: VocabularyWord, rating: 'again' | 'hard' | 'good' | 'easy') => {
    const prevRep = word.repetitions ?? 0
    const prevInterval = word.interval ?? 0
    const prevEF = word.easeFactor ?? 2.5

    if (rating === 'again') return '< 1 ngày'
    if (rating === 'hard') {
      if (prevRep === 0) return '1 ngày'
      if (prevRep === 1) return '3 ngày'
      return `${Math.max(1, Math.round(prevInterval * 1.2))} ngày`
    }
    if (rating === 'good') {
      if (prevRep === 0) return '1 ngày'
      if (prevRep === 1) return '6 ngày'
      return `${Math.max(1, Math.round(prevInterval * prevEF))} ngày`
    }
    if (rating === 'easy') {
      if (prevRep === 0) return '4 ngày'
      if (prevRep === 1) return '8 ngày'
      const nextEF = Math.max(1.3, prevEF + 0.15)
      return `${Math.max(1, Math.round(prevInterval * nextEF * 1.3))} ngày`
    }
    return '1 ngày'
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#faf9f6] dark:bg-slate-950">
      <Sidebar />

      {/* Confetti Falling Animation Style Injector */}
      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(105vh) rotate(720deg);
            opacity: 0.2;
          }
        }
        .confetti-particle {
          position: fixed;
          top: -20px;
          width: 8px;
          height: 14px;
          border-radius: 2px;
          z-index: 100;
          animation: confettiFall 3s linear forwards;
          pointer-events: none;
        }
      `}</style>

      {/* Confetti particles element */}
      {showConfetti && confettiParticles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            transform: `scale(${p.scale})`,
          }}
        />
      ))}

      <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full relative">
        
        {/* Congratulations SRS Deck Complete Modal Overlay */}
        {showConfetti && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border-2 border-rose-100/50 dark:border-slate-800 rounded-[2.5rem] p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative animate-in zoom-in duration-300">
              <button
                onClick={() => setShowConfetti(false)}
                className="absolute top-5 right-5 p-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-100/10 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-rose-500 animate-spin-slow" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-850 dark:text-white">Hoàn Thành Ôn Tập! 🎉</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Tuyệt vời! Bạn đã vượt qua tất cả từ vựng trong bộ lọc hiện tại. Khoa học Spaced Repetition (SRS) đang ghi nhận tiến trình để tối ưu lịch ôn tập tiếp theo cho bạn.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-slate-950 border border-rose-100/10 flex items-center justify-center gap-4 text-xs font-bold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-1">
                  <Layers className="w-4 h-4 text-rose-500" />
                  Đã ôn: {activeFilteredVocab.length} từ
                </span>
                <div className="h-4 w-px bg-rose-200/50" />
                <span className="flex items-center gap-1 text-emerald-500">
                  <Award className="w-4 h-4 fill-emerald-500 text-white" />
                  Mục tiêu đạt được!
                </span>
              </div>

              <button
                onClick={() => setShowConfetti(false)}
                className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all shadow-md shadow-rose-500/10"
              >
                Tiếp tục ôn tập bộ lọc khác
              </button>
            </div>
          </div>
        )}

        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <Bookmark className="w-8 h-8 text-rose-500 fill-rose-500/10" />
                Ôn luyện Từ vựng
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Luyện nhớ chữ Hán qua Spaced Repetition (SRS) Flashcards có phát âm và lật 3D.
              </p>
            </div>

            {/* Mode selection buttons */}
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 self-start">
              <button
                onClick={() => setMode('flashcard')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === 'flashcard'
                    ? 'bg-white dark:bg-slate-850 text-rose-500 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <Layers className="w-4 h-4" />
                Thẻ Flashcard
              </button>
              <button
                onClick={() => setMode('test')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === 'test'
                    ? 'bg-white dark:bg-slate-850 text-rose-500 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <Brain className="w-4 h-4" />
                Kiểm tra ghi nhớ
              </button>
              <button
                onClick={() => setMode('list')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === 'list'
                    ? 'bg-white dark:bg-slate-850 text-rose-500 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <List className="w-4 h-4" />
                Danh sách từ
              </button>
            </div>
          </div>

          {/* Filters Area */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-rose-100/30 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Level Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Cấp độ HSK
              </label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">Tất cả HSK</option>
                <option value="1">HSK 1</option>
                <option value="2">HSK 2</option>
              </select>
            </div>

            {/* Topic Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Chủ đề học tập
              </label>
              <select
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">Tất cả chủ đề</option>
                <option value="study">Học tập</option>
                <option value="family">Gia đình</option>
                <option value="work">Công việc</option>
                <option value="food">Ẩm thực</option>
                <option value="travel">Du lịch</option>
                <option value="shopping">Mua sắm</option>
                <option value="health">Sức khỏe</option>
                <option value="entertainment">Giải trí</option>
                <option value="reading">Đọc hiểu</option>
              </select>
            </div>

            {/* Search Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Tìm kiếm từ khóa
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Nhập chữ Hán, Pinyin..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                />
              </div>
            </div>

            {/* SRS Due Filter */}
            <div className="flex flex-col justify-end">
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Học ngắt quãng (SRS)
              </label>
              <button
                onClick={() => setSrsDueOnly(!srsDueOnly)}
                className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  srsDueOnly
                    ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-500/10'
                    : 'bg-slate-50/50 dark:bg-slate-950 hover:bg-slate-100/50 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Brain className={`w-4 h-4 ${srsDueOnly ? 'animate-pulse' : ''}`} />
                {srsDueOnly ? 'Chỉ từ cần ôn (Bật)' : 'Chỉ từ cần ôn (Tắt)'}
              </button>
            </div>
          </div>

          {/* Core Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
              <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-bold text-slate-400 animate-pulse">Đang tải dữ liệu học...</p>
            </div>
          ) : activeFilteredVocab.length === 0 ? (
            <div className="text-center p-12 bg-white dark:bg-slate-900 border rounded-3xl border-rose-100/20">
              <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-655 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-bold">Không tìm thấy từ vựng nào khớp.</p>
              <p className="text-xs text-slate-400 mt-1">Vui lòng chọn bộ lọc chủ đề hoặc đổi từ khóa tìm kiếm.</p>
            </div>
          ) : mode === 'flashcard' ? (
            /* ================= FLASHCARD MODE ================= */
            <div className="space-y-6 flex flex-col items-center">
              {/* Progress Count */}
              <div className="w-full flex items-center justify-between px-2 text-xs font-semibold text-slate-400">
                <span>Tiến trình ôn tập</span>
                <span className="font-bold text-rose-500">{currentIndex + 1} / {activeFilteredVocab.length}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-rose-500 h-full rounded-full transition-all duration-350"
                  style={{ width: `${((currentIndex + 1) / activeFilteredVocab.length) * 100}%` }}
                />
              </div>

              {/* Floating XP Indicator */}
              <div className="relative h-6 w-full flex justify-center">
                {xpEarned !== null && (
                  <span className="absolute animate-bounce text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full border border-emerald-200">
                    +{xpEarned} XP
                  </span>
                )}
              </div>

              {/* 3D Flipping Card Container */}
              {currentWord && (
                <div 
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full max-w-lg h-[320px] cursor-pointer perspective-1000 group relative"
                >
                  <div className={`w-full h-full duration-550 transform-style-3d relative transition-transform ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}>
                    {/* FRONT SIDE (Hanzi Character) */}
                    <div className="absolute inset-0 bg-white dark:bg-slate-900 border-2 border-rose-100/40 dark:border-slate-800/80 rounded-[2.5rem] shadow-md hover:shadow-lg transition-shadow backface-hidden flex flex-col items-center justify-center p-6 text-center select-none">
                      <span className="absolute top-4 left-6 text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-850 px-3 py-1.5 rounded-full">
                        HSK {currentWord.hskLevel}
                      </span>
                      <span className="absolute top-4 right-6 text-xs font-extrabold text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-3 py-1.5 rounded-full border border-rose-100/10">
                        {translateTopic(currentWord.topic).toUpperCase()}
                      </span>

                      <h2 className="text-9xl sm:text-[7rem] font-black text-slate-800 dark:text-slate-50 tracking-tight leading-none mb-4 font-sans">
                        {currentWord.character}
                      </h2>

                      <p className="text-xs text-slate-400 tracking-widest font-bold uppercase animate-pulse">
                        Click để lật thẻ xem nghĩa
                      </p>
                    </div>

                    {/* BACK SIDE (Pinyin, Translation, Example) */}
                    <div className="absolute inset-0 bg-white dark:bg-slate-900 border-2 border-rose-100/40 dark:border-slate-800/80 rounded-[2.5rem] shadow-md rotate-y-180 backface-hidden flex flex-col justify-between p-8 select-none">
                      <div className="text-center space-y-3">
                        <div>
                          <span className="text-4xl font-black text-rose-500">{currentWord.pinyin}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              speakWord(currentWord.character)
                            }}
                            className="ml-2.5 p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-500 hover:scale-105 active:scale-95 transition-all inline-flex items-center align-middle"
                            title="Phát âm"
                          >
                            <Volume2 className="w-4.5 h-4.5" />
                          </button>
                        </div>

                        <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 leading-snug">
                          {currentWord.meaningVi}
                        </h3>
                        {currentWord.meaningEn && (
                          <p className="text-xs text-slate-400 dark:text-slate-505 italic">
                            Eng: {currentWord.meaningEn}
                          </p>
                        )}
                      </div>

                      {/* Example sentence box */}
                      <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-slate-950 border border-rose-100/20 dark:border-slate-800/60 space-y-1">
                        <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans">Ví dụ</span>
                        <p className="text-base font-extrabold text-slate-800 dark:text-slate-200 text-left font-sans leading-relaxed">
                          {currentWord.exampleZh}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-left">
                          {currentWord.exampleVi}
                        </p>
                      </div>

                      {/* Status indicator & SRS Statistics */}
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          currentWord.status === 'mastered'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20'
                            : currentWord.status === 'learning'
                            ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20'
                            : 'bg-slate-50 text-slate-400 border-slate-150 dark:bg-slate-850 dark:border-slate-800'
                        }`}>
                          {currentWord.status === 'mastered' ? 'ĐÃ THUỘC' : currentWord.status === 'learning' ? 'ĐANG HỌC' : 'CHƯA HỌC'}
                        </span>
                        
                        {currentWord.repetitions !== undefined && currentWord.repetitions > 0 && (
                          <div className="flex gap-2">
                            <span className="text-[8px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800/85 px-2 py-0.5 rounded">
                              🔄 Ôn: {currentWord.repetitions} lần
                            </span>
                            <span className="text-[8px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800/85 px-2 py-0.5 rounded">
                              📈 Ease: {currentWord.easeFactor?.toFixed(2) ?? '2.50'}
                            </span>
                            <span className="text-[8px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800/85 px-2 py-0.5 rounded">
                              📅 Hạn: {currentWord.interval ?? 0} ngày
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons below card - 4 choices matching SM-2 spaced repetition */}
              {currentWord && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg mt-4 px-2">
                  <button
                    onClick={() => handleReview(currentWord.id, 'again')}
                    className="py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/60 text-red-500 rounded-2xl transition-all hover:scale-[1.01] shadow-sm flex flex-col items-center justify-center gap-0.5"
                  >
                    <span className="text-xs font-extrabold">Lần nữa</span>
                    <span className="text-[9px] font-semibold opacity-70">({getNextIntervalEstimate(currentWord, 'again')})</span>
                  </button>
                  <button
                    onClick={() => handleReview(currentWord.id, 'hard')}
                    className="py-2.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-600 dark:text-amber-400 rounded-2xl transition-all hover:scale-[1.01] shadow-sm flex flex-col items-center justify-center gap-0.5"
                  >
                    <span className="text-xs font-extrabold">Khó</span>
                    <span className="text-[9px] font-semibold opacity-70">({getNextIntervalEstimate(currentWord, 'hard')})</span>
                  </button>
                  <button
                    onClick={() => handleReview(currentWord.id, 'good')}
                    className="py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-blue-500 rounded-2xl transition-all hover:scale-[1.01] shadow-sm flex flex-col items-center justify-center gap-0.5"
                  >
                    <span className="text-xs font-extrabold">Tốt</span>
                    <span className="text-[9px] font-semibold opacity-70">({getNextIntervalEstimate(currentWord, 'good')})</span>
                  </button>
                  <button
                    onClick={() => handleReview(currentWord.id, 'easy')}
                    className="py-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 rounded-2xl transition-all hover:scale-[1.01] shadow-sm flex flex-col items-center justify-center gap-0.5"
                  >
                    <span className="text-xs font-extrabold">Dễ</span>
                    <span className="text-[9px] font-semibold opacity-70">({getNextIntervalEstimate(currentWord, 'easy')})</span>
                  </button>
                </div>
              )}

              {/* Deck Navigation Controls */}
              {currentWord && (
                <div className="flex items-center gap-6 mt-4 text-xs font-semibold text-slate-400">
                  <button
                    onClick={() => {
                      setIsFlipped(false)
                      setCurrentIndex(prev => (prev > 0 ? prev - 1 : activeFilteredVocab.length - 1))
                    }}
                    className="p-2 hover:text-rose-500 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Trước
                  </button>
                  <button
                    onClick={() => speakWord(currentWord.character)}
                    className="px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-555 hover:text-slate-800 flex items-center gap-1 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" /> Nghe phát âm
                  </button>
                  <button
                    onClick={() => {
                      setIsFlipped(false)
                      setCurrentIndex(prev => (prev < activeFilteredVocab.length - 1 ? prev + 1 : 0))
                    }}
                    className="p-2 hover:text-rose-500 flex items-center gap-1"
                  >
                    Sau
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : mode === 'test' ? (
            /* ================= MEMORY CHECKING MODE ================= */
            <div className="space-y-6 flex flex-col items-center">
              {!testState.isStarted ? (
                // SPLASH SCREEN
                <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-rose-100/40 dark:border-slate-800/80 rounded-[2rem] p-8 text-center space-y-6 shadow-md animate-in fade-in duration-200">
                  <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center mx-auto border border-rose-100/10">
                    <Brain className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Bắt đầu kiểm tra ghi nhớ</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                      Hệ thống sẽ tạo ngẫu nhiên câu hỏi lựa chọn nghĩa hoặc phát âm đúng từ tập từ vựng hiện tại của bạn.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 space-y-2.5 text-xs text-left font-semibold text-slate-555">
                    <div className="flex justify-between">
                      <span>Cấp độ ôn tập:</span>
                      <span className="text-rose-500">HSK {levelFilter === 'all' ? 'Tất cả' : levelFilter}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chủ đề ôn tập:</span>
                      <span className="text-rose-500">{topicFilter === 'all' ? 'Tất cả chủ đề' : translateTopic(topicFilter)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 dark:border-slate-850 pt-2">
                      <span>Số câu hỏi:</span>
                      <span className="text-slate-800 dark:text-slate-200">{Math.min(10, activeFilteredVocab.length)} câu</span>
                    </div>
                  </div>

                  <button
                    onClick={startMemoryTest}
                    className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-orange-400 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/15 hover:shadow-rose-500/30 hover:scale-[1.01] transition-all"
                  >
                    Bắt đầu ngay
                  </button>
                </div>
              ) : testState.isFinished ? (
                // COMPLETION SCREEN
                <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-rose-100/40 dark:border-slate-800/80 rounded-[2rem] p-8 text-center space-y-6 shadow-md animate-in zoom-in duration-200">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center mx-auto border border-amber-100/10">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-850 dark:text-slate-100">Kết quả kiểm tra</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Chúc mừng bạn đã hoàn thành kiểm tra ghi nhớ!
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Điểm số</p>
                      <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
                        {testState.score} / {testState.questions.length}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Điểm tích lũy</p>
                      <p className="text-2xl font-black text-emerald-500 mt-1 flex items-center justify-center gap-1">
                        <Sparkles className="w-5 h-5" />
                        +{testState.xpAwarded} XP
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setTestState(prev => ({ ...prev, isStarted: false }))}
                      className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-colors text-sm"
                    >
                      Đổi chủ đề / Bộ lọc
                    </button>
                    <button
                      onClick={startMemoryTest}
                      className="flex-1 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-colors text-sm shadow-md"
                    >
                      Luyện tập lại
                    </button>
                  </div>
                </div>
              ) : (
                // INTERACTIVE TEST INTERFACE
                <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-rose-100/40 dark:border-slate-800/80 rounded-[2rem] p-6 shadow-md space-y-6">
                  {/* Progress Header */}
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                    <span>Kiểm tra: Cấp {levelFilter === 'all' ? '1-2' : levelFilter} · {topicFilter === 'all' ? 'Tổng hợp' : translateTopic(topicFilter)}</span>
                    <span>Câu {testState.currentQuestionIdx + 1} / {testState.questions.length}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${((testState.currentQuestionIdx + 1) / testState.questions.length) * 100}%` }}
                    />
                  </div>

                  {/* Character presentation card */}
                  <div className="p-8 rounded-2xl bg-rose-50/20 dark:bg-slate-950 border border-rose-100/20 dark:border-slate-800/60 text-center space-y-4">
                    <h3 className="text-8xl sm:text-9xl font-black text-slate-850 dark:text-slate-100 font-sans tracking-tight">
                      {testState.questions[testState.currentQuestionIdx].character}
                    </h3>
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-base sm:text-lg font-bold text-slate-600 dark:text-slate-350">
                        {testState.questions[testState.currentQuestionIdx].questionText}
                      </p>
                      <button
                        onClick={() => speakWord(testState.questions[testState.currentQuestionIdx].character)}
                        className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 4 Choices Grid */}
                  <div className="grid grid-cols-1 gap-3">
                    {testState.questions[testState.currentQuestionIdx].options.map((option, idx) => {
                      const currentQ = testState.questions[testState.currentQuestionIdx]
                      const isSelected = testState.selectedAnswer === option
                      const isCorrect = option === currentQ.correctAnswer
                      const hasChosen = testState.selectedAnswer !== null

                      let buttonStyle = 'bg-[#faf9f6] dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-rose-300 hover:bg-rose-50/10'
                      let feedbackIcon = null

                      if (hasChosen) {
                        if (isCorrect) {
                          buttonStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-450 font-extrabold shadow-sm'
                          feedbackIcon = <Check className="w-4 h-4 text-emerald-500" />
                        } else if (isSelected) {
                          buttonStyle = 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 font-extrabold'
                          feedbackIcon = <span className="text-rose-500 font-bold">✗</span>
                        } else {
                          buttonStyle = 'opacity-40 border-slate-200 dark:border-slate-800'
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={hasChosen}
                          onClick={() => handleAnswerSelect(option)}
                          className={`w-full p-4 rounded-2xl border text-left text-sm sm:text-base font-bold flex justify-between items-center transition-all ${buttonStyle}`}
                        >
                          <span>{option}</span>
                          {feedbackIcon}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ================= LIST VIEW MODE ================= */
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-100/30 dark:border-slate-800/80 shadow-sm overflow-hidden animate-in fade-in duration-300">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-rose-100/20 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Chữ Hán</th>
                      <th className="py-4 px-4">Pinyin</th>
                      <th className="py-4 px-4">Nghĩa tiếng Việt</th>
                      <th className="py-4 px-4 text-center">HSK</th>
                      <th className="py-4 px-4">Chủ đề</th>
                      <th className="py-4 px-4">Trạng thái</th>
                      <th className="py-4 px-6 text-center">Âm thanh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100/10 dark:divide-slate-800/80 text-xs font-semibold text-slate-755 dark:text-slate-300">
                    {activeFilteredVocab.map((word) => (
                      <tr key={word.id} className="hover:bg-rose-50/20 dark:hover:bg-slate-850/50 transition-colors">
                        <td className="py-4 px-6 font-sans text-lg font-black text-slate-900 dark:text-slate-100">
                          {word.character}
                        </td>
                        <td className="py-4 px-4 text-rose-500 font-bold">{word.pinyin}</td>
                        <td className="py-4 px-4 leading-relaxed font-bold">{word.meaningVi}</td>
                        <td className="py-4 px-4 text-center">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold">
                            H{word.hskLevel}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-455 font-medium">
                          {translateTopic(word.topic)}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded border ${
                            word.status === 'mastered'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-150 dark:bg-emerald-950/20'
                              : word.status === 'learning'
                              ? 'bg-blue-50 text-blue-600 border-blue-150 dark:bg-blue-950/20'
                              : 'bg-slate-50 text-slate-400 border-slate-150 dark:bg-slate-850 dark:border-slate-800'
                          }`}>
                            {word.status === 'mastered' ? 'ĐÃ THUỘC' : word.status === 'learning' ? 'ĐANG HỌC' : 'CHƯA HỌC'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => speakWord(word.character)}
                            className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-500 hover:scale-105 transition-transform"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
