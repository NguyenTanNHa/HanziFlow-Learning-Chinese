// src/app/analytics/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/sidebar'
import Link from 'next/link'
import { 
  TrendingUp, 
  BookOpen, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight,
  Headphones,
  Mic,
  PenTool,
  Bookmark
} from 'lucide-react'

interface AnalyticsData {
  success: boolean
  skills: {
    listening: number
    speaking: number
    reading: number
    writing: number
  }
  vocab: {
    mastered: number
    learning: number
    total: number
  }
  quiz: {
    taken: number
    avgScore: number
  }
  recommendations: {
    vocabs: Array<{
      id: string
      character: string
      pinyin: string
      meaningVi: string
    }>
    grammars: Array<{
      id: string
      title: string
      formula: string
      explanationVi: string
    }>
  }
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics')
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (err) {
        console.error('Error fetching analytics:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#faf9f6] dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Header */}
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-rose-500" />
              Phân tích tiến độ học tập
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Theo dõi chi tiết mức độ thông thạo 4 kỹ năng chính và nhận gợi ý học tập tối ưu.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
              <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-bold text-slate-400 animate-pulse">Đang tổng hợp dữ liệu phân tích...</p>
            </div>
          ) : !data ? (
            <div className="text-center p-12 bg-white rounded-3xl border border-rose-100/20">
              <HelpCircle className="w-12 h-12 text-slate-350 mx-auto mb-4" />
              <p className="text-slate-500 font-bold">Không tìm thấy dữ liệu phân tích.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Skill chart rings & General stats */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 4 Skills Competency Dashboard */}
                <div className="bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-6">
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-150 uppercase tracking-wider">
                    Độ thông thạo kỹ năng
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { name: 'Nghe hiểu', score: data.skills.listening, icon: Headphones, color: 'text-blue-500', stroke: 'stroke-blue-500' },
                      { name: 'Khẩu ngữ', score: data.skills.speaking, icon: Mic, color: 'text-emerald-500', stroke: 'stroke-emerald-500' },
                      { name: 'Đọc hiểu', score: data.skills.reading, icon: BookOpen, color: 'text-purple-500', stroke: 'stroke-purple-500' },
                      { name: 'Viết luận', score: data.skills.writing, icon: PenTool, color: 'text-rose-500', stroke: 'stroke-rose-500' },
                    ].map((skill, sIdx) => {
                      const Icon = skill.icon
                      const radius = 35
                      const circumference = 2 * Math.PI * radius
                      const offset = circumference - (skill.score / 100) * circumference

                      return (
                        <div key={sIdx} className="flex flex-col items-center text-center space-y-3">
                          {/* Radial Progress Ring */}
                          <div className="relative w-20 h-20 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle 
                                cx="40" 
                                cy="40" 
                                r={radius} 
                                className="stroke-slate-100 dark:stroke-slate-800 fill-none" 
                                strokeWidth="6" 
                              />
                              <circle 
                                cx="40" 
                                cy="40" 
                                r={radius} 
                                className={`${skill.stroke} fill-none transition-all duration-500`}
                                strokeWidth="6"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center">
                              <Icon className={`w-5 h-5 ${skill.color}`} />
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <span className="block font-bold text-xs text-slate-700 dark:text-slate-350">{skill.name}</span>
                            <span className="block font-black text-sm text-slate-850 dark:text-slate-100">{skill.score}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Progress metrics detailed cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vocab stats card */}
                  <div className="bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <Bookmark className="w-4 h-4 text-rose-500" />
                      Tiến độ từ vựng HSK
                    </h3>

                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                        <span>Đã ghi nhớ (Mastered):</span>
                        <span className="text-emerald-500 font-extrabold">{data.vocab.mastered} từ</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                        <span>Đang ôn luyện (Learning):</span>
                        <span className="text-orange-500 font-extrabold">{data.vocab.learning} từ</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-rose-500 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(((data.vocab.mastered + data.vocab.learning) / Math.max(data.vocab.total, 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="block text-[9px] text-slate-400 font-semibold text-center italic">
                        Đã tiếp cận {data.vocab.mastered + data.vocab.learning} trên tổng số {data.vocab.total} từ vựng
                      </span>
                    </div>
                  </div>

                  {/* Quizzes stats card */}
                  <div className="bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-amber-500" />
                      Kiểm tra định kỳ (Quizzes)
                    </h3>

                    <div className="space-y-2.5">
                      <div className="flex justify-between text-xs font-bold text-slate-650">
                        <span>Bài kiểm tra đã làm:</span>
                        <span className="text-slate-850 dark:text-slate-100">{data.quiz.taken} bài</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-slate-650">
                        <span>Tỷ lệ chính xác trung bình:</span>
                        <span className="text-amber-500 font-extrabold">{data.quiz.avgScore}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full rounded-full transition-all"
                          style={{ width: `${data.quiz.avgScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Review suggestions (Weak Areas) */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-6">
                  <div className="flex items-center gap-2 font-black text-sm text-slate-850 dark:text-slate-100 uppercase tracking-wider border-b border-rose-100/20 dark:border-slate-800 pb-3">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>Gợi ý ôn tập trọng tâm</span>
                  </div>

                  {/* Vocabulary recommendations */}
                  <div className="space-y-3">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Từ vựng cần ôn lại</span>
                    
                    {data.recommendations.vocabs.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic">
                        Tuyệt vời! Không có từ vựng nào nằm trong hàng chờ ôn tập gấp.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {data.recommendations.vocabs.map((vocab) => (
                          <div key={vocab.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex justify-between items-center text-xs">
                            <div className="space-y-0.5">
                              <span className="block font-black text-slate-800 dark:text-slate-100 text-sm">{vocab.character}</span>
                              <span className="block text-[10px] text-slate-400 font-medium">{vocab.pinyin} - {vocab.meaningVi}</span>
                            </div>
                            <Link href="/vocabulary" className="text-[9px] bg-rose-500 text-white font-bold px-2.5 py-1 rounded-full flex items-center gap-0.5">
                              Ôn
                              <ArrowRight className="w-2.5 h-2.5" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Grammar recommendations */}
                  <div className="space-y-3">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Ngữ pháp nên củng cố</span>
                    
                    {data.recommendations.grammars.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic">
                        Chưa có đề xuất ngữ pháp nào cho cấp độ này.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {data.recommendations.grammars.map((grammar) => (
                          <div key={grammar.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-1.5 text-xs">
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-extrabold text-slate-850 dark:text-slate-100 truncate max-w-[150px]">{grammar.title}</span>
                              <Link href="/grammar" className="text-[9px] text-rose-500 font-bold hover:underline shrink-0">
                                Chi tiết
                              </Link>
                            </div>
                            <span className="block text-[9.5px] bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-rose-600 dark:text-rose-400 font-bold font-mono truncate">
                              {grammar.formula}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  )
}
