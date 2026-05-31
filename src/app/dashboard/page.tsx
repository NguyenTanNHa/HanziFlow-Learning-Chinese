// src/app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/sidebar'
import {
  Flame,
  Award,
  BookOpen,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Bookmark,
  FileText,
  Mic,
  Headphones,
  Compass,
  Play,
  Zap,
  Crown
} from 'lucide-react'

interface DashboardStats {
  user: {
    name: string
    hskLevel: number
    learningGoal: string
    streak: number
    points: number
  }
  progressPercent: number
  lessonsCompleted: number
  totalLessons: number
  wordsLearned: number
  suggestedLesson: {
    id: string
    title: string
    description: string
    level: number
    stageTitle: string
  } | null
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [missionsData, setMissionsData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsRes, missionsRes] = await Promise.all([
          fetch('/api/dashboard'),
          fetch('/api/dashboard/daily-missions')
        ])
        
        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats(data)
        }
        if (missionsRes.ok) {
          const data = await missionsRes.json()
          setMissionsData(data)
        }
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Chào buổi sáng'
    if (hour < 18) return 'Chào buổi chiều'
    return 'Chào buổi tối'
  }

  const skillCards = [
    {
      name: 'Từ vựng',
      desc: 'Ôn tập theo SRS thông minh.',
      href: '/vocabulary',
      icon: Bookmark,
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      iconBg: 'bg-[#E63946]',
      accent: 'text-[#E63946]'
    },
    {
      name: 'Ngữ pháp',
      desc: 'Cấu trúc câu và công thức.',
      href: '/grammar',
      icon: FileText,
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      iconBg: 'bg-amber-500',
      accent: 'text-amber-600'
    },
    {
      name: 'Luyện nói',
      desc: 'Thi thử HSKK chuẩn.',
      href: '/speaking',
      icon: Mic,
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      iconBg: 'bg-emerald-600',
      accent: 'text-emerald-600'
    },
    {
      name: 'Luyện nghe',
      desc: 'Cải thiện phản xạ nghe hiểu.',
      href: '/listening',
      icon: Headphones,
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      iconBg: 'bg-blue-600',
      accent: 'text-blue-600'
    },
    {
      name: 'Luyện đọc',
      desc: 'Văn bản HSK với highlight.',
      href: '/reading',
      icon: BookOpen,
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      iconBg: 'bg-purple-600',
      accent: 'text-purple-600'
    },
    {
      name: 'Lộ trình',
      desc: 'Bản đồ học tập chi tiết.',
      href: '/roadmap',
      icon: Compass,
      bg: 'bg-orange-50 dark:bg-orange-950/30',
      iconBg: 'bg-orange-500',
      accent: 'text-orange-600'
    }
  ]

  const badgesList = [
    {
      id: 'first_step',
      name: 'Khởi đầu',
      desc: 'Đạt XP đầu tiên',
      emoji: '🚀',
      unlocked: stats ? stats.user.points > 0 : false,
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      id: 'vocab_master',
      name: 'Vua từ vựng',
      desc: 'Học 10+ từ HSK',
      emoji: '📚',
      unlocked: stats ? stats.wordsLearned >= 10 : false,
      bg: 'bg-rose-50 dark:bg-rose-950/30',
    },
    {
      id: 'streak_king',
      name: 'Kiên trì',
      desc: 'Streak 3 ngày liên tục',
      emoji: '🔥',
      unlocked: stats ? stats.user.streak >= 3 : false,
      bg: 'bg-orange-50 dark:bg-orange-950/30',
    },
    {
      id: 'quiz_hero',
      name: 'Vua kiểm tra',
      desc: 'Hoàn thành 1 quiz',
      emoji: '🏆',
      unlocked: stats ? stats.lessonsCompleted > 0 : false,
      bg: 'bg-purple-50 dark:bg-purple-950/30',
    }
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white dark:bg-gray-950">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4">
            <div className="w-10 h-10 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">
              Đang tải...
            </p>
          </div>
        ) : !stats ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center gap-4">
            <p className="text-gray-500 font-bold">Không thể tải thông tin học tập.</p>
            <Link href="/login" className="px-6 py-3 h-12 bg-[#E63946] text-white rounded-md font-bold text-sm hover:bg-red-700 transition-all duration-200 hover:scale-105">
              Đăng nhập lại
            </Link>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{getGreeting()}</p>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {stats.user.name} <span className="text-[#E63946]">👋</span>
                </h1>
              </div>

              <div className="flex items-center gap-2">
                {(stats.user as any).subscription === 'pro' ? (
                  <span className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-md text-xs font-bold uppercase tracking-wider">
                    <Crown className="w-3.5 h-3.5" /> Pro
                  </span>
                ) : (
                  <Link
                    href="/upgrade"
                    className="flex items-center gap-1.5 px-4 py-2 h-10 bg-[#E63946] hover:bg-red-700 text-white rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105"
                  >
                    <Zap className="w-3.5 h-3.5" /> Nâng cấp Pro
                  </Link>
                )}
              </div>
            </div>

            {/* Stats Grid — Color block cards, no shadow */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-orange-50 dark:bg-orange-950/30 p-5 rounded-lg group cursor-default transition-all duration-200 hover:scale-[1.02]">
                <div className="w-12 h-12 rounded-md bg-orange-500 flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Streak</span>
                <span className="block text-2xl font-black text-gray-900 dark:text-white mt-0.5">{stats.user.streak} <span className="text-sm font-semibold text-gray-400">ngày</span></span>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 p-5 rounded-lg group cursor-default transition-all duration-200 hover:scale-[1.02]">
                <div className="w-12 h-12 rounded-md bg-amber-500 flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Điểm XP</span>
                <span className="block text-2xl font-black text-gray-900 dark:text-white mt-0.5">{stats.user.points} <span className="text-sm font-semibold text-gray-400">XP</span></span>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/30 p-5 rounded-lg group cursor-default transition-all duration-200 hover:scale-[1.02]">
                <div className="w-12 h-12 rounded-md bg-emerald-600 flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tiến độ</span>
                <span className="block text-2xl font-black text-gray-900 dark:text-white mt-0.5">{stats.progressPercent}<span className="text-sm font-semibold text-gray-400">%</span></span>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stats.progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="bg-rose-50 dark:bg-rose-950/30 p-5 rounded-lg group cursor-default transition-all duration-200 hover:scale-[1.02]">
                <div className="w-12 h-12 rounded-md bg-[#E63946] flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Từ đã học</span>
                <span className="block text-2xl font-black text-gray-900 dark:text-white mt-0.5">{stats.wordsLearned} <span className="text-sm font-semibold text-gray-400">từ</span></span>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left: Suggested + Skills */}
              <div className="lg:col-span-2 space-y-8">

                {/* Suggested Lesson — Solid bold red block */}
                {stats.suggestedLesson && (
                  <div className="relative bg-[#E63946] p-7 rounded-lg overflow-hidden">
                    {/* Geometric decoration */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-16 -translate-y-16" />
                    <div className="absolute bottom-0 right-12 w-24 h-24 bg-white/5 rounded-full translate-y-8" />
                    <div className="absolute top-4 right-4 w-16 h-16 bg-white/5 rotate-12" />

                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/20 text-white font-bold text-xs uppercase tracking-wider">
                          <Play className="w-3 h-3 fill-white" />
                          Bài học đề xuất hôm nay
                        </div>
                        <h2 className="text-2xl font-extrabold text-white tracking-tight">{stats.suggestedLesson.title}</h2>
                        <p className="text-white/75 text-sm max-w-md">
                          {stats.suggestedLesson.description || 'Học từ vựng và ngữ pháp để cải thiện kỹ năng tiếng Trung.'}
                        </p>
                        <p className="text-xs text-white/50 font-semibold uppercase tracking-wider">
                          {stats.suggestedLesson.stageTitle} · HSK {stats.suggestedLesson.level}
                        </p>
                      </div>
                      <Link
                        href={`/lessons/${stats.suggestedLesson.id}`}
                        className="inline-flex items-center gap-2 px-6 py-3 h-12 bg-white text-[#E63946] font-bold rounded-md text-sm hover:bg-gray-100 transition-all duration-200 hover:scale-105 self-start md:self-auto flex-shrink-0"
                      >
                        Tiếp tục học
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Skill Cards */}
                <div>
                  <h2 className="text-base font-extrabold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Luyện tập theo kỹ năng</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {skillCards.map((card) => {
                      const Icon = card.icon
                      return (
                        <Link
                          key={card.name}
                          href={card.href}
                          className={`${card.bg} p-5 rounded-lg group cursor-pointer transition-all duration-200 hover:scale-[1.02] block`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-md ${card.iconBg} flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110`}>
                              <Icon className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-sm text-gray-900 dark:text-white">{card.name}</h3>
                              <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{card.desc}</p>
                            </div>
                            <ArrowRight className={`w-4 h-4 flex-shrink-0 ${card.accent} opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5`} />
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Right: Level + Missions + Badges */}
              <div className="lg:col-span-1 space-y-5">

                {/* Level Progress */}
                {missionsData && (
                  <div className="bg-gray-100 dark:bg-gray-900 p-5 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cấp độ</span>
                      <span className="px-2.5 py-1 bg-[#E63946] text-white rounded-md text-[10px] font-black uppercase tracking-wider">
                        Cấp {missionsData.level}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-gray-500 dark:text-gray-400">Tiến trình</span>
                        <span className="text-[#E63946]">{missionsData.xpInLevel} / {missionsData.nextLevelXp} XP</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#E63946] h-full rounded-full transition-all duration-500"
                          style={{ width: `${(missionsData.xpInLevel / missionsData.nextLevelXp) * 100}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 font-semibold text-center">
                        Cần thêm {missionsData.nextLevelXp - missionsData.xpInLevel} XP → Cấp {missionsData.level + 1}
                      </p>
                    </div>
                  </div>
                )}

                {/* Daily Missions */}
                {missionsData && (
                  <div className="bg-gray-100 dark:bg-gray-900 p-5 rounded-lg">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Nhiệm vụ hàng ngày</h3>
                    <div className="space-y-2">
                      {missionsData.missions.map((mission: any) => (
                        <div
                          key={mission.id}
                          className={`p-3 rounded-md text-xs flex items-center justify-between gap-3 transition-all duration-200 ${
                            mission.completed
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800'
                              : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-gray-900 dark:text-white block">{mission.name}</span>
                            <span className="text-[10px] text-gray-400 font-semibold">
                              {mission.current}/{mission.target}
                            </span>
                          </div>
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] font-black ${
                            mission.completed
                              ? 'bg-emerald-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                          }`}>
                            {mission.completed ? '✓' : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Badges */}
                <div className="bg-gray-100 dark:bg-gray-900 p-5 rounded-lg">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Huy hiệu</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {badgesList.map((badge) => (
                      <div
                        key={badge.id}
                        className={`p-3 rounded-md flex flex-col items-center text-center transition-all duration-200 ${
                          badge.unlocked
                            ? `${badge.bg} hover:scale-[1.02] cursor-default`
                            : 'bg-gray-200 dark:bg-gray-800 opacity-40'
                        }`}
                      >
                        <span className="text-xl mb-1">{badge.emoji}</span>
                        <span className="font-black text-[10px] text-gray-900 dark:text-white block">{badge.name}</span>
                        <span className="text-[8px] text-gray-400 font-semibold leading-tight mt-0.5">{badge.desc}</span>
                        {!badge.unlocked && <span className="text-[9px] mt-1">🔒</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
