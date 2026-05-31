// src/app/listening/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/sidebar'
import { Headphones, Play, Square, Eye, EyeOff, Volume2, HelpCircle } from 'lucide-react'

interface ListeningItem {
  id: string
  title: string
  audioUrl: string
  transcriptZh: string
  pinyin: string
  meaningVi: string
  lesson: { title: string; level: number }
}

export default function ListeningPractice() {
  const [listeningList, setListeningList] = useState<ListeningItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeItem, setActiveItem] = useState<ListeningItem | null>(null)

  // Player state
  const [isPlaying, setIsPlaying] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    async function fetchListening() {
      try {
        const res = await fetch('/api/skills/listening')
        if (res.ok) {
          const data = await res.json()
          setListeningList(data.skills)
          if (data.skills.length > 0) {
            setActiveItem(data.skills[0])
          }
        }
      } catch (err) {
        console.error('Error fetching listening skills:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchListening()
  }, [])

  const speakChinese = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'zh-CN'
      u.rate = 0.85
      window.speechSynthesis.speak(u)
    }
  }

  const handleTogglePlay = () => {
    if (!activeItem) return
    if (isPlaying) {
      setIsPlaying(false)
      if (timerRef.current) clearInterval(timerRef.current)
    } else {
      setIsPlaying(true)
      speakChinese(activeItem.transcriptZh)
      timerRef.current = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false)
            if (timerRef.current) clearInterval(timerRef.current)
            return 0
          }
          return prev + 10
        })
      }, 1000)
    }
  }

  const handleSelectItem = (item: ListeningItem) => {
    setActiveItem(item)
    setIsPlaying(false)
    setShowTranscript(false)
    setAudioProgress(0)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#faf9f6] dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Headphones className="w-8 h-8 text-rose-500" />
              Luyện nghe HSK
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Cải thiện kỹ năng nghe hiểu, chép chính tả dựa trên các đoạn hội thoại thực tế.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
              <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-bold text-slate-400 animate-pulse">Đang tải học liệu nghe...</p>
            </div>
          ) : listeningList.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-3xl border border-rose-100/20">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-bold">Chưa có bài nghe nào được tải lên.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Task Sidebar Selector */}
              <div className="lg:col-span-1 space-y-3">
                <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider px-1">Danh sách bài nghe</span>
                <div className="space-y-2">
                  {listeningList.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className={`w-full p-4 rounded-2xl text-left border text-xs font-bold transition-all flex items-start justify-between gap-3 ${
                        activeItem?.id === item.id
                          ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-400'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="block font-bold">{item.title}</span>
                        <span className="block text-[10px] text-slate-400 font-medium">{item.lesson.title}</span>
                      </div>
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded font-bold text-slate-450 border border-slate-200/10">
                        H{item.lesson.level}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Player and detail workspace */}
              {activeItem && (
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-6">
                    <div>
                      <h2 className="text-lg font-black text-slate-850 dark:text-slate-100">{activeItem.title}</h2>
                      <p className="text-slate-400 text-xs mt-0.5">{activeItem.lesson.title} • HSK {activeItem.lesson.level}</p>
                    </div>

                    {/* Tape Player Controls */}
                    <div className="p-5 rounded-2xl bg-rose-50/30 dark:bg-slate-950 border border-rose-100/10 dark:border-slate-850 flex items-center gap-4">
                      <button
                        onClick={handleTogglePlay}
                        className="w-11 h-11 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors"
                      >
                        {isPlaying ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                      </button>
                      <div className="flex-1 space-y-1">
                        <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                          {isPlaying ? 'ĐANG PHÁT AUDIO' : 'AUDIO CHỜ'}
                        </span>
                        <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-rose-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${audioProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dictation revealing panel */}
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-extrabold text-slate-500">Gợi ý & Đáp án phụ đề</h3>
                        <button
                          onClick={() => setShowTranscript(!showTranscript)}
                          className="text-xs font-bold text-rose-500 flex items-center gap-1 hover:underline"
                        >
                          {showTranscript ? (
                            <>
                              <EyeOff className="w-4 h-4" /> Ẩn đáp án
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" /> Hiện đáp án
                            </>
                          )}
                        </button>
                      </div>

                      {showTranscript ? (
                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 space-y-4 animate-in fade-in duration-200">
                          <div>
                            <span className="block text-[8px] font-bold text-slate-400 mb-1">CHỮ HÁN</span>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 font-sans leading-relaxed whitespace-pre-line">
                              {activeItem.transcriptZh}
                            </p>
                          </div>
                          <div>
                            <span className="block text-[8px] font-bold text-slate-400 mb-1">PINYIN</span>
                            <p className="text-xs text-rose-500 font-semibold whitespace-pre-line leading-relaxed">
                              {activeItem.pinyin}
                            </p>
                          </div>
                          <div>
                            <span className="block text-[8px] font-bold text-slate-400 mb-1">BẢN DỊCH TIẾNG VIỆT</span>
                            <p className="text-xs text-slate-500 dark:text-slate-450 whitespace-pre-line leading-relaxed font-semibold">
                              {activeItem.meaningVi}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="h-32 border border-dashed border-rose-100/40 dark:border-slate-850 rounded-2xl flex items-center justify-center text-xs font-semibold text-slate-400 text-center px-4">
                          Nghe kỹ và ghi chép lại. Bấm nút "Hiện đáp án" ở góc trên bên phải để so sánh!
                        </div>
                      )}
                    </div>
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
