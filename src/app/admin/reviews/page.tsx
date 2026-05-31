// src/app/admin/reviews/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/sidebar'
import Link from 'next/link'
import { CheckCircle2, MessageSquare, Mic, PenTool, Award, Play, ShieldAlert, Star, RefreshCw } from 'lucide-react'

export default function TeacherReviews() {
  const [speakingList, setSpeakingList] = useState<any[]>([])
  const [writingList, setWritingList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'speaking' | 'writing'>('speaking')
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  
  // Review inputs
  const [score, setScore] = useState<number>(8)
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/reviews')
      if (res.ok) {
        const json = await res.json()
        setSpeakingList(json.speakingRecordings || [])
        setWritingList(json.writingSubmissions || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleOpenReview = (item: any) => {
    setSelectedItem(item)
    setScore(item.teacherScore ?? 8)
    setFeedback(item.teacherFeedback ?? '')
    setSuccessMsg('')
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return
    setSubmitting(true)
    setSuccessMsg('')

    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          id: selectedItem.id,
          score,
          feedback,
        }),
      })

      if (res.ok) {
        setSuccessMsg('Đã lưu đánh giá nhận xét thành công!')
        fetchReviews()
        setSelectedItem(null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#faf9f6] dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b border-rose-100/30 dark:border-slate-800 pb-5">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <MessageSquare className="w-8 h-8 text-rose-500" />
                Đánh giá bài làm khẩu ngữ & viết
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Chấm điểm bài thi thử HSKK Speaking và sửa bài viết luận cho học viên.
              </p>
            </div>
            
            <button 
              onClick={fetchReviews}
              className="p-2.5 rounded-xl border border-rose-100/40 bg-white hover:bg-rose-50 text-slate-650 hover:text-rose-500 transition-colors dark:bg-slate-900 dark:border-slate-800"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl w-fit">
            <button
              onClick={() => { setActiveTab('speaking'); setSelectedItem(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'speaking'
                  ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Mic className="w-4 h-4" />
              Khẩu ngữ HSKK ({speakingList.length})
            </button>
            <button
              onClick={() => { setActiveTab('writing'); setSelectedItem(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'writing'
                  ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <PenTool className="w-4 h-4" />
              Bài viết luận ({writingList.length})
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
              <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-bold text-slate-400 animate-pulse">Đang tải danh sách bài làm...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Submission Lists Column */}
              <div className="lg:col-span-2 space-y-3">
                <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  Danh sách bài làm của học viên
                </span>

                {activeTab === 'speaking' ? (
                  speakingList.length === 0 ? (
                    <div className="text-center p-8 bg-white rounded-3xl border border-rose-100/10 italic text-xs text-slate-400">
                      Không có file ghi âm nào.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {speakingList.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleOpenReview(item)}
                          className={`w-full p-5 bg-white dark:bg-slate-900 border rounded-3xl text-left hover:shadow-md transition-all flex justify-between items-start gap-4 ${
                            selectedItem?.id === item.id 
                              ? 'border-rose-500 ring-1 ring-rose-500' 
                              : 'border-rose-100/20 dark:border-slate-800'
                          }`}
                        >
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                              <span>Học viên: {item.userProfile.name}</span>
                              <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 truncate">{item.speakingTopic.title}</h3>
                            <p className="text-[10px] text-slate-500 dark:text-slate-450 truncate">
                              Đề bài: "{item.speakingTopic.prompt}"
                            </p>
                          </div>
                          <div className="shrink-0 flex flex-col items-end gap-1.5">
                            {item.teacherScore !== null ? (
                              <span className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 text-emerald-600 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                                Đã chấm: {item.teacherScore}/10
                              </span>
                            ) : (
                              <span className="bg-amber-50 dark:bg-amber-950/20 border border-amber-250 text-amber-600 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                                Chờ đánh giá
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                ) : (
                  writingList.length === 0 ? (
                    <div className="text-center p-8 bg-white rounded-3xl border border-rose-100/10 italic text-xs text-slate-400">
                      Không có bài viết luận nào.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {writingList.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleOpenReview(item)}
                          className={`w-full p-5 bg-white dark:bg-slate-900 border rounded-3xl text-left hover:shadow-md transition-all flex justify-between items-start gap-4 ${
                            selectedItem?.id === item.id 
                              ? 'border-rose-500 ring-1 ring-rose-500' 
                              : 'border-rose-100/20 dark:border-slate-800'
                          }`}
                        >
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                              <span>Học viên: {item.userProfile.name}</span>
                              <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 truncate">{item.writingTask.title}</h3>
                            <p className="text-[10px] text-slate-500 dark:text-slate-450 line-clamp-1 italic font-sans">
                              "{item.content}"
                            </p>
                          </div>
                          <div className="shrink-0 flex flex-col items-end gap-1.5">
                            {item.teacherScore !== null ? (
                              <span className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 text-emerald-600 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                                Đã chấm: {item.teacherScore}/10
                              </span>
                            ) : (
                              <span className="bg-amber-50 dark:bg-amber-950/20 border border-amber-250 text-amber-600 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                                Chờ chấm điểm
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                )}
              </div>

              {/* Review / Evaluation Panel Column */}
              <div className="lg:col-span-1">
                {selectedItem ? (
                  <form 
                    onSubmit={handleSubmitReview}
                    className="bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-6 animate-in slide-in-from-right duration-200"
                  >
                    <div>
                      <span className="text-[9px] bg-rose-50 dark:bg-rose-950/20 text-rose-500 px-2 py-0.5 rounded font-black border border-rose-100/30 uppercase tracking-widest block w-fit mb-2">
                        Chi tiết bài chấm
                      </span>
                      <h2 className="text-base font-black text-slate-850 dark:text-slate-100 truncate">
                        {activeTab === 'speaking' ? selectedItem.speakingTopic.title : selectedItem.writingTask.title}
                      </h2>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">
                        Học viên: {selectedItem.userProfile.name}
                      </p>
                    </div>

                    {/* Question block info */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 text-xs">
                      <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                        YÊU CẦU ĐỀ BÀI
                      </span>
                      <p className="font-semibold text-slate-700 dark:text-slate-350 leading-relaxed font-sans">
                        {activeTab === 'speaking' ? selectedItem.speakingTopic.prompt : selectedItem.writingTask.prompt}
                      </p>
                    </div>

                    {/* Student performance */}
                    <div className="space-y-2">
                      <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                        BÀI LÀM CỦA HỌC VIÊN
                      </span>
                      
                      {activeTab === 'speaking' ? (
                        <div className="space-y-3">
                          <audio src={selectedItem.audioUrl} controls className="w-full" />
                          <div className="p-3.5 bg-rose-50/10 dark:bg-rose-950/15 border border-rose-100/10 dark:border-rose-900/20 rounded-2xl space-y-2 text-[10px] font-bold">
                            <span className="block text-rose-500 text-[8px] uppercase tracking-wider">Học viên tự chấm (Self evaluate)</span>
                            <div className="grid grid-cols-2 gap-1.5 text-slate-600 dark:text-slate-450">
                              <span>Phát âm: {selectedItem.selfPronScore}/5 ★</span>
                              <span>Thanh điệu: {selectedItem.selfToneScore}/5 ★</span>
                              <span>Trôi chảy: {selectedItem.selfFluencyScore}/5 ★</span>
                              <span>Từ vựng: {selectedItem.selfVocabScore}/5 ★</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-amber-50/10 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-2xl text-xs font-medium font-sans leading-relaxed text-slate-700 dark:text-slate-250 whitespace-pre-wrap">
                          "{selectedItem.content}"
                        </div>
                      )}
                    </div>

                    {/* Review Forms */}
                    <div className="space-y-4 pt-4 border-t border-rose-100/10 dark:border-slate-850">
                      {/* Score Input */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          ĐIỂM SỐ GIÁO VIÊN CHẤM (0 - 10)
                        </label>
                        <div className="flex items-center gap-3">
                          <input 
                            type="number" 
                            min="0" 
                            max="10" 
                            step="0.5"
                            value={score} 
                            onChange={(e) => setScore(Number(e.target.value))}
                            className="w-20 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 font-black text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
                          />
                          <span className="text-[10px] text-slate-400 font-semibold">điểm trên thang điểm 10</span>
                        </div>
                      </div>

                      {/* Comment Feedback Input */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          NHẬN XÉT GỢI Ý CHI TIẾT
                        </label>
                        <textarea 
                          rows={4}
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Ví dụ: Phát âm thanh điệu 3 rất tốt, cần sửa thêm cấu trúc câu..."
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 font-medium text-slate-700 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
                        />
                      </div>

                      {/* Success / Submit */}
                      {successMsg && (
                        <p className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                          {successMsg}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 transition-colors shadow-sm text-xs"
                      >
                        {submitting ? 'Đang gửi...' : 'Lưu kết quả chấm điểm'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="border border-dashed border-slate-200/80 dark:border-slate-800 p-8 rounded-3xl text-center space-y-2 text-slate-400 dark:text-slate-600 bg-slate-50/20">
                    <ShieldAlert className="w-8 h-8 mx-auto opacity-70" />
                    <p className="text-xs font-bold">Vui lòng chọn một bài nộp để chấm điểm và đánh giá.</p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  )
}
