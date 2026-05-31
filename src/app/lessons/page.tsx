// src/app/lessons/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/sidebar'
import { BookOpen, CheckCircle2, Play, Circle, HelpCircle } from 'lucide-react'

interface LessonItem {
  id: string
  title: string
  description: string
  level: number
  order: number
  isCompleted: boolean
  stageTitle: string
}

export default function LessonList() {
  const [lessons, setLessons] = useState<LessonItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | '1' | '2'>('all')

  useEffect(() => {
    async function fetchLessons() {
      try {
        const res = await fetch('/api/roadmap')
        if (res.ok) {
          const data = await res.json()
          
          // Flatten lessons from roadmaps -> stages -> lessons
          const flattened: LessonItem[] = []
          data.roadmaps.forEach((rm: any) => {
            rm.stages.forEach((stage: any) => {
              stage.lessons.forEach((less: any) => {
                flattened.push({
                  ...less,
                  stageTitle: stage.title,
                })
              })
            })
          })

          setLessons(flattened)
        }
      } catch (err) {
        console.error('Error fetching lessons:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLessons()
  }, [])

  const filteredLessons = activeTab === 'all'
    ? lessons
    : lessons.filter(l => l.level === Number(activeTab))

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#faf9f6] dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <BookOpen className="w-8 h-8 text-rose-500" />
                Danh mục Bài học
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Tất cả các bài học tiếng Trung từ HSK 1 đến HSK 2.
              </p>
            </div>

            {/* Level tab selectors */}
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-slate-850 text-rose-500 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tất cả bài học
              </button>
              <button
                onClick={() => setActiveTab('1')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === '1'
                    ? 'bg-white dark:bg-slate-850 text-rose-500 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                HSK 1
              </button>
              <button
                onClick={() => setActiveTab('2')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === '2'
                    ? 'bg-white dark:bg-slate-850 text-rose-500 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                HSK 2
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
              <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-bold text-slate-400 animate-pulse">Đang tải danh sách bài học...</p>
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="text-center p-12 bg-white border rounded-3xl border-rose-100/20">
              <HelpCircle className="w-12 h-12 text-slate-350 mx-auto mb-4" />
              <p className="text-slate-500 font-bold">Không tìm thấy bài học nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between h-[200px] group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded border border-rose-100/10">
                        CẤP ĐỘ {lesson.level}
                      </span>
                      {lesson.isCompleted ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-500">
                          <CheckCircle2 className="w-4 h-4 fill-green-500 text-white" /> Đã hoàn thành
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-450">
                          <Circle className="w-4 h-4 text-slate-300" /> Chưa học
                        </span>
                      )}
                    </div>

                    <h2 className="text-base font-black text-slate-800 dark:text-slate-100 leading-snug group-hover:text-rose-500 transition-colors">
                      {lesson.title}
                    </h2>
                    <p className="text-[11px] leading-relaxed text-slate-450 dark:text-slate-500 line-clamp-2">
                      {lesson.description || 'Học và cải thiện từ vựng, ngữ pháp tiếng Trung cơ bản thông qua các ví dụ thực tế sinh động.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-rose-100/10 dark:border-slate-800/50 pt-3 mt-4">
                    <span className="text-[10px] font-medium text-slate-400 truncate max-w-[150px]">
                      {lesson.stageTitle}
                    </span>
                    <Link
                      href={`/lessons/${lesson.id}`}
                      className="px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-xl hover:bg-rose-600 transition-colors flex items-center gap-1 shadow-md shadow-rose-500/10"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      Vào học
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
