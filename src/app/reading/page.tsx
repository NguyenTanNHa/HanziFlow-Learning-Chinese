// src/app/reading/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/sidebar'
import { BookOpen, Eye, EyeOff, Check, X, Award, HelpCircle, Volume2, Bookmark, Sparkles } from 'lucide-react'

interface ReadingItem {
  id: string
  title: string
  contentZh: string
  translationVi: string
  questions: string // JSON
  lesson: { title: string; level: number }
}

interface Question {
  question: string
  options: string[]
  answer: string
}

interface TooltipData {
  word: string
  pinyin: string
  mean: string
  coords?: {
    top: number
    left: number
    width: number
    height: number
  }
}

export default function ReadingPractice() {
  const [readingsList, setReadingsList] = useState<ReadingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeItem, setActiveItem] = useState<ReadingItem | null>(null)
  
  // Interactive states
  const [showTranslation, setShowTranslation] = useState(false)
  const [selectedTooltip, setSelectedTooltip] = useState<TooltipData | null>(null)
  
  // Quiz states
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [quizChecked, setQuizChecked] = useState<Record<number, boolean | null>>({})
  const [pointsAwarded, setPointsAwarded] = useState(0)

  // Floating Popover Dictionary States
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [srsLoading, setSrsLoading] = useState(false)
  const [srsSavedWords, setSrsSavedWords] = useState<Record<string, boolean>>({})
  const [showXpAward, setShowXpAward] = useState<number | null>(null)

  useEffect(() => {
    async function fetchReadings() {
      try {
        const res = await fetch('/api/skills/reading')
        if (res.ok) {
          const data = await res.json()
          setReadingsList(data.skills)
          if (data.skills.length > 0) {
            setActiveItem(data.skills[0])
          }
        }
      } catch (err) {
        console.error('Error fetching reading skills:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchReadings()
  }, [])

  const handleSelectItem = (item: ReadingItem) => {
    setActiveItem(item)
    setShowTranslation(false)
    setSelectedTooltip(null)
    setSelectedAnswers({})
    setQuizChecked({})
    setPointsAwarded(0)
    setSrsSavedWords({})
  }

  // Hover glossary dictionary
  const dictionary: Record<string, { pinyin: string; mean: string }> = {
    '王老师': { pinyin: 'Wáng lǎoshī', mean: 'Thầy Vương' },
    '老师': { pinyin: 'lǎoshī', mean: 'Giáo viên, thầy cô' },
    '汉语': { pinyin: 'Hànyǔ', mean: 'Tiếng Trung' },
    '北京人': { pinyin: 'Běijīng rén', mean: 'Người Bắc Kinh' },
    '留学生': { pinyin: 'liúxuéshēng', mean: 'Du học sinh' },
    '小明': { pinyin: 'Xiǎo Míng', mean: 'Tiểu Minh (Tên riêng)' },
    '家庭主妇': { pinyin: 'jiātíng zhǔfù', mean: 'Nội trợ gia đình' },
    '大学生': { pinyin: 'dàxuéshēng', mean: 'Sinh viên đại học' },
    '努力': { pinyin: 'nǔlì', mean: 'Nỗ lực, chăm chỉ' },
    '北京': { pinyin: 'Běijīng', mean: 'Bắc Kinh' },
    '季节': { pinyin: 'jìjié', mean: 'Mùa trong năm' },
    '夏天': { pinyin: 'xiàtiān', mean: 'Mùa hè' },
    '冬天': { pinyin: 'dōngtiān', mean: 'Mùa đông' },
    '下雪': { pinyin: 'xiàxuě', mean: 'Tuyết rơi' },
    '秋天': { pinyin: 'qiūtiān', mean: 'Mùa thu' }
  }

  const speakWord = (word: string) => {
    if (typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'zh-CN'
    const voices = window.speechSynthesis.getVoices()
    const zhVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('ZH'))
    if (zhVoice) {
      utterance.voice = zhVoice
    }
    window.speechSynthesis.speak(utterance)
  }

  const saveToSrs = async (word: string, pinyin: string, mean: string) => {
    setSrsLoading(true)
    try {
      const res = await fetch('/api/vocabulary/srs-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character: word, pinyin, meaningVi: mean })
      })
      if (res.ok) {
        setSrsSavedWords(prev => ({ ...prev, [word]: true }))
        setShowXpAward(5)
        setTimeout(() => setShowXpAward(null), 1500)
      }
    } catch (err) {
      console.error('Error saving SRS card:', err)
    } finally {
      setSrsLoading(false)
    }
  }

  const renderContentWithGlossary = (text: string) => {
    const words = Object.keys(dictionary)
    words.sort((a, b) => b.length - a.length)

    let parts: React.ReactNode[] = [text]
    let keyCounter = 0

    words.forEach(word => {
      const nextParts: React.ReactNode[] = []
      parts.forEach(part => {
        if (typeof part === 'string') {
          const regex = new RegExp(`(${word})`, 'g')
          const splits = part.split(regex)
          splits.forEach((split) => {
            if (split === word) {
              const entry = dictionary[word]
              keyCounter++
              nextParts.push(
                <span
                  key={`${word}-${keyCounter}`}
                  onMouseEnter={(e) => {
                    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current)
                    const rect = e.currentTarget.getBoundingClientRect()
                    // Add coords relative to window viewport
                    setSelectedTooltip({
                      word,
                      ...entry,
                      coords: {
                        top: rect.top + window.scrollY,
                        left: rect.left + window.scrollX,
                        width: rect.width,
                        height: rect.height
                      }
                    })
                  }}
                  onMouseLeave={() => {
                    tooltipTimeoutRef.current = setTimeout(() => {
                      setSelectedTooltip(null)
                    }, 220)
                  }}
                  className="relative group cursor-help underline decoration-dotted decoration-rose-450 hover:decoration-rose-500 font-bold text-rose-600 dark:text-rose-450 hover:bg-rose-500/5 px-0.5 rounded transition-colors"
                >
                  {word}
                </span>
              )
            } else {
              nextParts.push(split)
            }
          })
        } else {
          nextParts.push(part)
        }
      })
      parts = nextParts
    })

    return parts
  }

  const checkAnswer = async (qIdx: number, correctAnswer: string) => {
    const userAns = selectedAnswers[qIdx]
    if (!userAns) return

    const isCorrect = userAns === correctAnswer
    setQuizChecked(prev => ({ ...prev, [qIdx]: isCorrect }))

    if (isCorrect && !pointsAwarded) {
      setPointsAwarded(10)
      // Award XP
      try {
        await fetch('/api/vocabulary/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vocabularyId: 'reading-exercise-dummy', rating: 'mastered' }),
        })
      } catch (e) {
        console.error(e)
      }
    }
  }

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current)
    }
  }, [])

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#faf9f6] dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full relative">
        {/* Floating Contextual Dictionary Card */}
        {selectedTooltip && selectedTooltip.coords && (
          <div
            className="absolute bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-4 rounded-2xl shadow-2xl border border-rose-100/50 dark:border-slate-800/80 z-50 flex flex-col gap-2 w-64 pointer-events-auto animate-in fade-in zoom-in-95 duration-200"
            style={{
              top: `${selectedTooltip.coords.top - 12}px`,
              left: `${selectedTooltip.coords.left + selectedTooltip.coords.width / 2}px`,
              transform: 'translate(-50%, -100%)'
            }}
            onMouseEnter={() => {
              if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current)
            }}
            onMouseLeave={() => {
              setSelectedTooltip(null)
            }}
          >
            {/* Header info */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-[8px] font-black text-rose-500 tracking-wider flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                TỪ ĐIỂN NGỮ CẢNH
              </span>
              {showXpAward !== null && (
                <span className="text-[8px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded-full border border-emerald-250/20 animate-bounce">
                  +{showXpAward} XP
                </span>
              )}
            </div>

            {/* Word and TTS */}
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-wide">{selectedTooltip.word}</span>
              <button
                onClick={() => speakWord(selectedTooltip.word)}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:scale-105 active:scale-95 transition-all"
                title="Nghe phát âm từ"
              >
                <Volume2 className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Pinyin */}
            <p className="text-rose-500 dark:text-rose-400 font-bold text-xs italic mt-0.5">
              [{selectedTooltip.pinyin}]
            </p>

            {/* Definition */}
            <p className="text-slate-650 dark:text-slate-350 text-xs font-semibold leading-relaxed mt-1">
              {selectedTooltip.mean}
            </p>

            {/* SRS Button */}
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              {srsSavedWords[selectedTooltip.word] ? (
                <div className="w-full py-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250/25 rounded-xl text-[10px] text-emerald-600 dark:text-emerald-450 font-black flex items-center justify-center gap-1.5 shadow-sm animate-in zoom-in duration-200">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  Đã lưu vào SRS
                </div>
              ) : (
                <button
                  onClick={() => saveToSrs(selectedTooltip.word, selectedTooltip.pinyin, selectedTooltip.mean)}
                  disabled={srsLoading}
                  className="w-full py-2 bg-rose-500 text-white rounded-xl text-[10px] font-black hover:bg-rose-600 hover:scale-[1.01] active:scale-95 transition-all shadow-sm shadow-rose-500/10 flex items-center justify-center gap-1.5"
                >
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                  {srsLoading ? 'Đang lưu...' : 'Lưu thẻ SRS (+5 XP)'}
                </button>
              )}
            </div>
            
            {/* Popover Arrow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[8px] w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white dark:border-t-slate-900 filter drop-shadow-[0_4px_2px_rgba(0,0,0,0.05)]" />
          </div>
        )}

        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-rose-500" />
              Luyện đọc tiếng Trung
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Đọc đoạn văn ngắn theo HSK, di chuột lên từ được gạch chân để tra cứu nhanh ngữ cảnh, phát âm và thêm vào ôn tập SRS.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
              <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-bold text-slate-400 animate-pulse">Đang tải đoạn văn...</p>
            </div>
          ) : readingsList.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-3xl border border-rose-100/20">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-bold">Chưa tải lên bài đọc nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sidebar selectors */}
              <div className="lg:col-span-1 space-y-3">
                <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">Danh sách văn bản</span>
                <div className="space-y-2">
                  {readingsList.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className={`w-full p-4 rounded-2xl text-left border text-xs font-bold transition-all flex items-start justify-between gap-3 ${
                        activeItem?.id === item.id
                          ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-400'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="block font-bold">{item.title}</span>
                        <span className="block text-[10px] text-slate-450 dark:text-slate-500 font-medium">{item.lesson.title}</span>
                      </div>
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded font-bold text-slate-450 border border-slate-200/10">
                        H{item.lesson.level}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reading panel details */}
              {activeItem && (
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-6">
                    <div>
                      <h2 className="text-lg font-black text-slate-850 dark:text-slate-100">{activeItem.title}</h2>
                      <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">{activeItem.lesson.title} • HSK {activeItem.lesson.level}</p>
                    </div>

                    {/* Text box */}
                    <div className="p-6 rounded-2xl bg-rose-50/5 dark:bg-slate-950 border border-rose-100/10 dark:border-slate-850">
                      <p className="text-base sm:text-lg text-slate-800 dark:text-slate-200 leading-loose font-sans tracking-wide">
                        {renderContentWithGlossary(activeItem.contentZh)}
                      </p>
                    </div>

                    {/* Translation toggle */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-extrabold text-slate-550 dark:text-slate-400">Bản dịch tiếng Việt</h3>
                        <button
                          onClick={() => setShowTranslation(!showTranslation)}
                          className="text-xs font-bold text-rose-500 flex items-center gap-1 hover:underline"
                        >
                          {showTranslation ? (
                            <>
                              <EyeOff className="w-4 h-4" /> Ẩn bản dịch
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" /> Hiện bản dịch
                            </>
                          )}
                        </button>
                      </div>

                      {showTranslation && (
                        <p className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-xs leading-relaxed text-slate-600 dark:text-slate-350 font-semibold animate-in fade-in duration-200">
                          {activeItem.translationVi}
                        </p>
                      )}
                    </div>

                    {/* Reading comprehension Quiz */}
                    {activeItem.questions && (
                      <div className="border-t border-rose-100/10 dark:border-slate-850 pt-6 space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xs font-extrabold text-slate-550 dark:text-slate-400">Câu hỏi đọc hiểu</h3>
                          {pointsAwarded > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-250 animate-bounce">
                              <Award className="w-3.5 h-3.5 fill-emerald-500" /> +{pointsAwarded} XP
                            </span>
                          )}
                        </div>

                        <div className="space-y-6">
                          {(JSON.parse(activeItem.questions) as Question[]).map((q, qIdx) => {
                            const isAnswerCorrect = quizChecked[qIdx]
                            return (
                              <div key={qIdx} className="space-y-3 p-5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950">
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-150">
                                  {qIdx + 1}. {q.question}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  {q.options.map((opt) => (
                                    <button
                                      key={opt}
                                      type="button"
                                      disabled={isAnswerCorrect === true}
                                      onClick={() => {
                                        setSelectedAnswers(prev => ({ ...prev, [qIdx]: opt }))
                                        setQuizChecked(prev => ({ ...prev, [qIdx]: null }))
                                      }}
                                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                                        selectedAnswers[qIdx] === opt
                                          ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600'
                                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-650 dark:text-slate-400'
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                  <div>
                                    {isAnswerCorrect === true && (
                                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                                        <Check className="w-4 h-4 stroke-[3]" /> Chính xác!
                                      </span>
                                    )}
                                    {isAnswerCorrect === false && (
                                      <span className="flex items-center gap-1 text-[11px] font-bold text-rose-500">
                                        <X className="w-4 h-4 stroke-[3]" /> Chưa đúng, hãy chọn lại!
                                      </span>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    disabled={!selectedAnswers[qIdx] || isAnswerCorrect === true}
                                    onClick={() => checkAnswer(qIdx, q.answer)}
                                    className="px-4 py-2 bg-rose-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs hover:bg-rose-600 transition-colors shadow-sm animate-in fade-in"
                                  >
                                    Kiểm tra
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
