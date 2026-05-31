// src/app/writing/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/sidebar'
import { PenTool, Check, CheckCircle2, Award, History, HelpCircle, Sparkles, Loader2, AlertCircle } from 'lucide-react'

interface WritingItem {
  id: string
  title: string
  prompt: string
  minWords: number
  checklist: string // JSON array
  lesson: { title: string; level: number }
}

interface GrammarError {
  original: string
  corrected: string
  explanation: string
}

interface AIFeedback {
  score: number
  feedback: string
  grammarErrors: GrammarError[]
  improvedVersion: string
}

export default function WritingPractice() {
  const [writingList, setWritingList] = useState<WritingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeItem, setActiveItem] = useState<WritingItem | null>(null)
  
  // Input states
  const [draftText, setDraftText] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submissionsLog, setSubmissionsLog] = useState<any[]>([])
  const [awardXp, setAwardXp] = useState<number | null>(null)

  // AI Evaluation states
  const [aiEvaluating, setAiEvaluating] = useState(false)
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)

  const fetchWritingHistory = async () => {
    try {
      const res = await fetch('/api/skills/writing/submit')
      if (res.ok) {
        const data = await res.json()
        setSubmissionsLog(data.submissions || [])
      }
    } catch (e) {
      console.error('Error fetching writing history:', e)
    }
  }

  useEffect(() => {
    async function fetchWriting() {
      try {
        const res = await fetch('/api/skills/writing')
        if (res.ok) {
          const data = await res.json()
          setWritingList(data.skills)
          if (data.skills.length > 0) {
            setActiveItem(data.skills[0])
          }
        }
      } catch (err) {
        console.error('Error fetching writing skills:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchWriting()
    fetchWritingHistory()
  }, [])

  const handleSelectItem = (item: WritingItem) => {
    setActiveItem(item)
    setDraftText('')
    setWordCount(0)
    setCheckedItems({})
    setSubmitted(false)
    setAiFeedback(null)
    setAiError(null)
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setDraftText(val)
    // Count Chinese characters only
    const cleaned = val.replace(/[^\u4e00-\u9fa5]/g, '')
    setWordCount(cleaned.length)
  }

  const toggleCheck = (idx: number) => {
    setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  // Trigger Gemini AI Writing evaluation
  const handleAIEvaluation = async () => {
    if (!activeItem || !draftText.trim()) return
    setAiEvaluating(true)
    setAiError(null)
    setAiFeedback(null)

    try {
      const res = await fetch('/api/skills/writing/ai-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          writingTaskId: activeItem.id,
          content: draftText,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi khi gọi AI phân tích bài viết.')
      }

      setAiFeedback(data.evaluation)
    } catch (err: any) {
      console.error(err)
      setAiError(err.message || 'Không thể liên kết với máy chủ AI.')
    } finally {
      setAiEvaluating(false)
    }
  }

  // Submit final draft along with AI score to the DB
  const handleDraftSubmit = async () => {
    if (!activeItem) return
    setSubmitted(true)
    setAwardXp(20)

    try {
      const res = await fetch('/api/skills/writing/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          writingTaskId: activeItem.id,
          content: draftText,
          isVocabularyChecked: !!checkedItems[0],
          isGrammarChecked: !!checkedItems[1],
          isSentenceCountChecked: !!checkedItems[2],
          teacherScore: aiFeedback ? aiFeedback.score : undefined,
          teacherFeedback: aiFeedback ? aiFeedback.feedback : 'Chấm điểm bằng AI.',
        }),
      })
      if (res.ok) {
        fetchWritingHistory()
      }
    } catch (e) {
      console.error(e)
    }

    setTimeout(() => setAwardXp(null), 1500)
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#faf9f6] dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Header */}
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <PenTool className="w-8 h-8 text-rose-500" />
              Luyện viết đoạn văn
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Viết câu và đoạn văn chữ Hán, nhận phản hồi sửa lỗi ngữ pháp thời gian thực từ AI.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
              <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-bold text-slate-400 animate-pulse">Đang tải đề tài viết...</p>
            </div>
          ) : writingList.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-3xl border border-rose-100/20">
              <HelpCircle className="w-12 h-12 text-slate-350 mx-auto mb-4" />
              <p className="text-slate-500 font-bold">Chưa cấu hình đề thi viết nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Task Sidebar list */}
              <div className="lg:col-span-1 space-y-4">
                <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">Đề tài viết</span>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {writingList.map((item) => (
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
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold text-slate-450 border border-slate-200/10 dark:border-slate-700">
                        H{item.lesson.level}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Submissions history list in sidebar */}
                {submissionsLog.length > 0 && (
                  <div className="pt-2 space-y-3 animate-in slide-in-from-bottom duration-250">
                    <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1 flex items-center gap-1">
                      <History className="w-3.5 h-3.5" /> Lịch sử viết & AI đánh giá
                    </span>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                      {submissionsLog.map((log) => (
                        <div key={log.id} className="p-3.5 bg-slate-100/50 dark:bg-slate-900/60 rounded-2xl border border-slate-250/45 dark:border-slate-800/80 space-y-2 text-[10px]">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-slate-700 dark:text-slate-350 truncate max-w-[120px]">
                              {log.writingTask?.title || 'Luyện viết'}
                            </span>
                            <span className="text-slate-400 dark:text-slate-550">
                              {new Date(log.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <p className="text-slate-505 dark:text-slate-400 line-clamp-2 italic font-sans leading-relaxed">
                            "{log.content}"
                          </p>
                          
                          {/* Teacher feedback */}
                          {log.teacherScore !== null ? (
                            <div className="mt-1 pt-1.5 border-t border-dashed border-rose-100/35 dark:border-slate-800 space-y-0.5">
                              <div className="flex justify-between items-center font-bold text-rose-500">
                                <span>AI chấm điểm:</span>
                                <span>{log.teacherScore}/10 điểm</span>
                              </div>
                              {log.teacherFeedback && (
                                <p className="text-slate-600 dark:text-slate-400 italic">
                                  "{log.teacherFeedback}"
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="mt-1 pt-1 text-[8px] text-slate-455 text-center italic border-t border-dashed border-slate-200/40 dark:border-slate-800">
                              Chưa được chấm điểm...
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Workspace details */}
              {activeItem && (
                <div className="lg:col-span-2 space-y-6 animate-in fade-in duration-200">
                  <div className="bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-6">
                    <div>
                      <h2 className="text-lg font-black text-slate-850 dark:text-slate-100">{activeItem.title}</h2>
                      <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">{activeItem.lesson.title} • HSK {activeItem.lesson.level}</p>
                    </div>

                    {/* Prompt text */}
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 space-y-1">
                      <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">ĐỀ BÀI YÊU CẦU</span>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                        {activeItem.prompt}
                      </p>
                    </div>

                    {/* Requirements checkboxes */}
                    <div className="space-y-2">
                      <span className="block text-[8px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Tiêu chí kiểm tra cấu trúc</span>
                      <div className="space-y-1.5">
                        {(JSON.parse(activeItem.checklist) as string[]).map((checkText, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => toggleCheck(idx)}
                            className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 hover:dark:text-slate-200 transition-colors w-full text-left font-medium"
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                              checkedItems[idx]
                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                : 'border-slate-300 dark:border-slate-700/80'
                            }`}>
                              {checkedItems[idx] && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span>{checkText}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Text draft editor */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs text-slate-400">
                        <span>Nhập bài nháp chữ Hán</span>
                        <span className={`font-bold ${wordCount >= activeItem.minWords ? 'text-emerald-500' : 'text-rose-500'}`}>
                          Số ký tự: {wordCount} / tối thiểu {activeItem.minWords}
                        </span>
                      </div>
                      
                      <textarea
                        disabled={submitted}
                        value={draftText}
                        onChange={handleTextChange}
                        placeholder="Gõ tiếng Trung chữ Hán tại đây..."
                        rows={6}
                        className="block w-full px-4 py-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 dark:text-slate-100 text-xs font-semibold font-sans leading-relaxed transition-all"
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-rose-100/10 dark:border-slate-850">
                      {/* AI evaluation status */}
                      {aiEvaluating && (
                        <div className="flex items-center gap-2 text-xs font-bold text-rose-500">
                          <Loader2 className="w-4.5 h-4.5 animate-spin" />
                          <span>AI đang phân tích ngữ pháp...</span>
                        </div>
                      )}
                      
                      {aiError && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-rose-500">
                          <AlertCircle className="w-4 h-4" />
                          <span>{aiError}</span>
                        </div>
                      )}

                      <div className="flex gap-3 ml-auto">
                        <button
                          type="button"
                          disabled={aiEvaluating || submitted || !draftText.trim()}
                          onClick={handleAIEvaluation}
                          className="px-4 py-2.5 bg-slate-100 text-slate-700 dark:bg-slate-850 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Sparkles className="w-4 h-4 text-rose-500" />
                          Chấm điểm AI
                        </button>

                        <button
                          type="button"
                          disabled={submitted || wordCount < activeItem.minWords}
                          onClick={handleDraftSubmit}
                          className="px-6 py-2.5 bg-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl hover:bg-rose-600 transition-colors shadow-sm"
                        >
                          {submitted ? 'Đã nộp bài nháp' : 'Nộp bài nháp'}
                        </button>
                      </div>
                    </div>

                    {/* AI Feedback Report Panel */}
                    {aiFeedback && (
                      <div className="p-6 rounded-2xl bg-rose-50/5 dark:bg-slate-950/40 border border-rose-100/25 dark:border-slate-850 space-y-6 animate-in slide-in-from-top duration-300">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-extrabold text-slate-850 dark:text-slate-200 flex items-center gap-1.5">
                            <Sparkles className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
                            AI Báo cáo chấm điểm
                          </h3>
                          <span className="text-xl font-black text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-3 py-1 rounded-xl border border-rose-150/10">
                            {aiFeedback.score} / 10 điểm
                          </span>
                        </div>

                        {/* Overview feedback */}
                        <div className="space-y-1.5 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-850 shadow-sm text-xs leading-relaxed">
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wide">Nhận xét của Giáo viên AI</span>
                          <p className="text-slate-650 dark:text-slate-350 font-semibold">{aiFeedback.feedback}</p>
                        </div>

                        {/* Grammar corrections */}
                        {aiFeedback.grammarErrors && aiFeedback.grammarErrors.length > 0 ? (
                          <div className="space-y-3">
                            <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wide">Phân tích lỗi sai ({aiFeedback.grammarErrors.length})</span>
                            <div className="space-y-2.5">
                              {aiFeedback.grammarErrors.map((err, idx) => (
                                <div key={idx} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl space-y-2 text-xs">
                                  <div className="space-y-1">
                                    <p className="line-through text-rose-500 font-bold font-sans">
                                      ❌ {err.original}
                                    </p>
                                    <p className="text-emerald-500 dark:text-emerald-400 font-bold font-sans">
                                      ✓ {err.corrected}
                                    </p>
                                  </div>
                                  <p className="text-slate-500 dark:text-slate-400 italic text-[11px] leading-relaxed pt-1.5 border-t border-slate-50 dark:border-slate-850">
                                    {err.explanation}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-450 rounded-xl text-xs font-bold flex items-center gap-2">
                            <Check className="w-5 h-5" />
                            <span>Tuyệt vời! Không tìm thấy lỗi ngữ pháp nghiêm trọng nào trong bài viết.</span>
                          </div>
                        )}

                        {/* Improved version */}
                        <div className="space-y-1.5 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-850 shadow-sm">
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wide mb-1">Phiên bản viết lại gợi ý</span>
                          <p className="text-sm font-bold text-slate-750 dark:text-slate-200 leading-loose font-sans tracking-wide">
                            {aiFeedback.improvedVersion}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Submission confirmation XP award */}
                    {submitted && (
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-450 rounded-2xl flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-5 h-5 fill-emerald-500 text-white" />
                          Đã ghi nhận bài nháp thành công và cập nhật điểm số AI!
                        </span>
                        {awardXp !== null && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-250 text-emerald-600 animate-bounce">
                            +{awardXp} XP
                          </span>
                        )}
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
