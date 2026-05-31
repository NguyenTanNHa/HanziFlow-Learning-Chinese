// src/app/grammar/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/sidebar'
import { FileText, ChevronDown, ChevronUp, Check, X, Award, HelpCircle } from 'lucide-react'

interface GrammarPoint {
  id: string
  title: string
  formula: string
  explanationVi: string
  example1Zh: string
  example1Vi: string
  example2Zh: string
  example2Vi: string
  example3Zh: string
  example3Vi: string
  quizQuestion: string | null
  quizOptions: string | null // JSON string array
  quizAnswer: string | null
}

export default function GrammarLibrary() {
  const [grammarList, setGrammarList] = useState<GrammarPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  // Track quiz responses
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [quizChecked, setQuizChecked] = useState<Record<string, 'correct' | 'wrong' | null>>({})
  const [pointsEarned, setPointsEarned] = useState<Record<string, number>>({})

  useEffect(() => {
    async function fetchGrammar() {
      try {
        const res = await fetch('/api/grammar')
        if (res.ok) {
          const data = await res.json()
          setGrammarList(data.grammarPoints)
          if (data.grammarPoints.length > 0) {
            setExpandedId(data.grammarPoints[0].id) // Expand first one by default
          }
        }
      } catch (err) {
        console.error('Error fetching grammar:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchGrammar()
  }, [])

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  // Handle inline answer check
  const handleCheckAnswer = async (id: string, correctAnswer: string) => {
    const userAnswer = userAnswers[id]
    if (!userAnswer) return

    // Clean comparison (remove whitespace / dots)
    const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, '').replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    const isCorrect = normalize(userAnswer) === normalize(correctAnswer)

    setQuizChecked(prev => ({ ...prev, [id]: isCorrect ? 'correct' : 'wrong' }))

    if (isCorrect && !pointsEarned[id]) {
      // Award XP
      try {
        const res = await fetch('/api/vocabulary/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vocabularyId: 'grammar-exercise-dummy', rating: 'mastered' }),
        })
        if (res.ok) {
          setPointsEarned(prev => ({ ...prev, [id]: 5 }))
        }
      } catch (err) {
        console.error('Points award error:', err)
        // Fallback local credit
        setPointsEarned(prev => ({ ...prev, [id]: 5 }))
      }
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#faf9f6] dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <FileText className="w-8 h-8 text-rose-500" />
              Thư viện Ngữ pháp
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Học các cấu trúc ngữ pháp tiếng Trung cốt lõi dạng công thức toán học dễ nhớ.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
              <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-bold text-slate-400 animate-pulse">Đang chuẩn bị bài học...</p>
            </div>
          ) : grammarList.length === 0 ? (
            <div className="text-center p-12 bg-white dark:bg-slate-900 border rounded-3xl border-rose-100/20">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-bold">Chưa có bài ngữ pháp nào.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {grammarList.map((gp) => {
                const isExpanded = expandedId === gp.id
                const options: string[] = gp.quizOptions ? JSON.parse(gp.quizOptions) : []
                const isChecked = quizChecked[gp.id] || null
                const points = pointsEarned[gp.id] || 0

                return (
                  <div
                    key={gp.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-100/30 dark:border-slate-800/80 shadow-sm overflow-hidden transition-all duration-200"
                  >
                    {/* Collapsible Header */}
                    <button
                      onClick={() => toggleExpand(gp.id)}
                      className="w-full px-6 py-5 flex items-center justify-between hover:bg-rose-50/20 dark:hover:bg-slate-850/30 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
                          <FileText className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h2 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{gp.title}</h2>
                          <span className="inline-block text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-md border border-amber-100/10 mt-1">
                            {gp.formula}
                          </span>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </button>

                    {/* Detailed Content */}
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 border-t border-rose-100/10 dark:border-slate-800/50 space-y-6 animate-in slide-in-from-top-3 duration-250">
                        {/* Explanation */}
                        <div>
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Giải thích ngữ pháp</span>
                          <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                            {gp.explanationVi}
                          </p>
                        </div>

                        {/* Examples Matrix */}
                        <div className="space-y-3">
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Ví dụ minh họa</span>
                          <div className="grid grid-cols-1 gap-2.5">
                            {[
                              { zh: gp.example1Zh, vi: gp.example1Vi },
                              { zh: gp.example2Zh, vi: gp.example2Vi },
                              { zh: gp.example3Zh, vi: gp.example3Vi },
                            ].map((ex, idx) => (
                              <div
                                key={idx}
                                className="p-3.5 rounded-2xl bg-rose-50/20 dark:bg-slate-950/50 border border-rose-100/10 dark:border-slate-850 space-y-1"
                              >
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-150 font-sans">{ex.zh}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">{ex.vi}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Interactive Exercise Check */}
                        {gp.quizQuestion && (
                          <div className="p-5 rounded-2xl bg-amber-50/20 dark:bg-slate-950 border border-amber-100/20 dark:border-slate-800 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Bài tập thực hành</span>
                              {points > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full border border-emerald-250 animate-bounce">
                                  <Award className="w-3.5 h-3.5 fill-emerald-500" /> +{points} XP
                                </span>
                              )}
                            </div>
                            
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-150 leading-relaxed font-semibold">
                              {gp.quizQuestion}
                            </p>

                            {/* Choice Options */}
                            {options.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {options.map((opt) => (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => {
                                      if (isChecked === 'correct') return // lock choice if correct
                                      setUserAnswers(prev => ({ ...prev, [gp.id]: opt }))
                                      setQuizChecked(prev => ({ ...prev, [gp.id]: null }))
                                    }}
                                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                                      userAnswers[gp.id] === opt
                                        ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450'
                                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              /* Text Input for Fill-in-the-blank */
                              <input
                                type="text"
                                placeholder="Nhập đáp án của bạn..."
                                disabled={isChecked === 'correct'}
                                value={userAnswers[gp.id] || ''}
                                onChange={(e) => {
                                  setUserAnswers(prev => ({ ...prev, [gp.id]: e.target.value }))
                                  setQuizChecked(prev => ({ ...prev, [gp.id]: null }))
                                }}
                                className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 dark:text-slate-100 text-xs font-bold transition-all"
                              />
                            )}

                            {/* Submission button and feedback */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                              <div>
                                {isChecked === 'correct' && (
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                                    <Check className="w-5 h-5 stroke-[3]" /> Đáp án hoàn toàn chính xác!
                                  </div>
                                )}
                                {isChecked === 'wrong' && (
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-500">
                                    <X className="w-5 h-5 stroke-[3]" /> Đáp án chưa đúng. Hãy thử lại!
                                  </div>
                                )}
                              </div>

                              <button
                                type="button"
                                disabled={!userAnswers[gp.id] || isChecked === 'correct'}
                                onClick={() => handleCheckAnswer(gp.id, gp.quizAnswer || '')}
                                className="px-5 py-2.5 bg-rose-500 disabled:opacity-55 text-white font-bold rounded-xl text-xs hover:bg-rose-600 transition-colors shadow-sm self-end"
                              >
                                Kiểm tra đáp án
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
