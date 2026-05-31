// src/app/roadmap/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/sidebar'
import { Check, Lock, Award, Play, ChevronRight, BookOpen, Compass } from 'lucide-react'

interface LessonNode {
  id: string
  title: string
  description: string
  order: number
  level: number
  isCompleted: boolean
  isUnlocked: boolean
}

interface StageNode {
  id: string
  title: string
  description: string
  order: number
  lessons: LessonNode[]
}

interface RoadmapNode {
  id: string
  title: string
  description: string
  level: number
  stages: StageNode[]
}

export default function RoadmapTimeline() {
  const [roadmaps, setRoadmaps] = useState<RoadmapNode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRoadmaps() {
      try {
        const res = await fetch('/api/roadmap')
        if (res.ok) {
          const data = await res.json()
          setRoadmaps(data.roadmaps)
        }
      } catch (err) {
        console.error('Error fetching roadmap:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchRoadmaps()
  }, [])

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#faf9f6] dark:bg-slate-950">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Timeline main container */}
      <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
        <div className="space-y-8 animate-in fade-in duration-300">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <Compass className="w-8 h-8 text-rose-500" />
              Lộ trình học cá nhân hóa
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Bản đồ bài học chia theo từng giai đoạn giúp bạn tiến bộ bền vững.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
              <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 animate-pulse">
                Đang tạo bản đồ lộ trình...
              </p>
            </div>
          ) : roadmaps.length === 0 ? (
            <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-rose-100/30">
              <p className="text-slate-500 font-bold">Chưa cấu hình lộ trình. Vui lòng liên hệ Admin.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {roadmaps.map((roadmap, rIdx) => (
                <div key={roadmap.id} className="space-y-6">
                  {/* Roadmap Title Banner */}
                  <div className="p-6 rounded-3xl bg-rose-50 dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] uppercase">
                      Cấp độ HSK {roadmap.level}
                    </span>
                    <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mt-2">{roadmap.title}</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{roadmap.description}</p>
                  </div>

                  {/* Vertical Stage Map */}
                  <div className="space-y-8 pl-4 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-rose-100 dark:before:bg-slate-800">
                    {roadmap.stages.map((stage, sIdx) => (
                      <div key={stage.id} className="relative pl-10 space-y-4">
                        {/* Stage Node Dot on main line */}
                        <div className="absolute left-0 top-1.5 w-9 h-9 rounded-full bg-white dark:bg-slate-950 border-2 border-rose-300 dark:border-slate-700 flex items-center justify-center shadow-sm z-10">
                          <span className="text-xs font-bold text-rose-500">{stage.order}</span>
                        </div>

                        {/* Stage Header */}
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{stage.title}</h3>
                          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-medium">{stage.description}</p>
                        </div>

                        {/* Lessons inside stage */}
                        <div className="grid grid-cols-1 gap-3">
                          {stage.lessons.map((lesson) => (
                            <Link
                              key={lesson.id}
                              href={`/lessons/${lesson.id}`}
                              onClick={(e) => {
                                if (!lesson.isUnlocked) {
                                  e.preventDefault()
                                  alert(`Bạn cần đạt trình độ HSK ${lesson.level} để mở khóa bài học này!`)
                                }
                              }}
                              className={`p-4 bg-white dark:bg-slate-900 border rounded-2xl flex items-center justify-between gap-4 transition-all group ${
                                !lesson.isUnlocked
                                  ? 'opacity-55 border-slate-200 dark:border-slate-800/80 cursor-not-allowed'
                                  : lesson.isCompleted
                                  ? 'border-emerald-100 dark:border-emerald-950/20 bg-emerald-50/10 hover:shadow-md hover:-translate-y-0.5'
                                  : 'border-slate-200/60 dark:border-slate-850 hover:shadow-md hover:-translate-y-0.5'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {/* Completion/Lock state indicator */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  !lesson.isUnlocked
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                    : lesson.isCompleted
                                    ? 'bg-emerald-500 text-white shadow-sm'
                                    : 'bg-rose-50 dark:bg-rose-950/30 text-rose-500 group-hover:scale-105 transition-transform'
                                }`}>
                                  {!lesson.isUnlocked ? (
                                    <Lock className="w-3.5 h-3.5" />
                                  ) : lesson.isCompleted ? (
                                    <Check className="w-4.5 h-4.5 stroke-[3]" />
                                  ) : (
                                    <Play className="w-3.5 h-3.5 fill-rose-500 ml-0.5" />
                                  )}
                                </div>
                                <div>
                                  <span className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                                    {lesson.title}
                                  </span>
                                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[200px] sm:max-w-md mt-0.5">
                                    {lesson.description}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 border border-slate-100 dark:border-slate-850 px-2 py-0.5 rounded-lg bg-slate-50/50 dark:bg-slate-950">
                                  HSK {lesson.level}
                                </span>
                                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
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
