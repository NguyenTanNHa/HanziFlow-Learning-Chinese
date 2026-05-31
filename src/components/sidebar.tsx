// src/components/sidebar.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Map,
  BookOpen,
  Bookmark,
  Headphones,
  Mic,
  FileText,
  PenTool,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Flame,
  Award,
  Brain,
  Trophy,
  TrendingUp,
  Sun,
  Moon,
  Heart,
  ChevronRight
} from 'lucide-react'

interface UserSession {
  id: string
  email: string
  name: string
  hskLevel: number
  learningGoal: string
  streak: number
  points: number
  role: string
  subscription: string
  dailyMissions: string
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
    setTheme(savedTheme)
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setUser(data.user)
          } else {
            if (pathname !== '/' && pathname !== '/login' && pathname !== '/register') {
              router.push('/login')
            }
          }
        }
      } catch (err) {
        console.error('Error fetching session:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [pathname, router])

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        router.push('/login')
        router.refresh()
      }
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const toggleSidebar = () => setIsOpen(!isOpen)

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Lộ trình học', href: '/roadmap', icon: Map },
    { name: 'Từ vựng (Flashcard)', href: '/vocabulary', icon: Bookmark },
    { name: 'Ngữ pháp', href: '/grammar', icon: FileText },
    { name: 'Trợ lý học tập AI', href: '/ai-assistant', icon: Brain },
    { name: 'Kỹ năng Nghe', href: '/listening', icon: Headphones },
    { name: 'Luyện nói HSKK', href: '/speaking', icon: Mic },
    { name: 'Luyện đọc', href: '/reading', icon: BookOpen },
    { name: 'Luyện viết', href: '/writing', icon: PenTool },
    { name: 'Bảng xếp hạng', href: '/leaderboard', icon: Trophy },
    { name: 'Phân tích tiến độ', href: '/analytics', icon: TrendingUp },
    { name: 'Hồ sơ cá nhân', href: '/profile', icon: User },
  ]

  if (user && user.role === 'admin') {
    navItems.push({ name: 'Admin CMS', href: '/admin', icon: Settings })
  }

  // Get hearts from dailyMissions
  const getHearts = () => {
    if (!user) return 5
    if (user.subscription === 'pro') return '∞'
    try {
      const parsed = JSON.parse(user.dailyMissions || '{}')
      return parsed.hearts !== undefined ? parsed.hearts : 5
    } catch {
      return 5
    }
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 border-r-2 border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100">
      
      {/* Brand Header */}
      <div className="p-5 border-b-2 border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-md bg-[#E63946] flex items-center justify-center text-white font-extrabold text-lg transition-all duration-200 group-hover:scale-105">
            H
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-gray-900 dark:text-white">
              HanziFlow
            </span>
            <span className="block text-[9px] font-semibold text-gray-400 tracking-widest uppercase mt-0.5">
              Chinese Learning
            </span>
          </div>
        </Link>

        <button
          onClick={toggleTheme}
          type="button"
          className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all duration-200 hover:scale-105"
          title={theme === 'dark' ? 'Giao diện sáng' : 'Giao diện tối'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
        </button>
      </div>

      {/* User Stats Block */}
      {user && (
        <div className="mx-4 my-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-900">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-md bg-[#E63946] flex items-center justify-center text-white font-black text-base flex-shrink-0">
              {(user.name || user.email)[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {user.learningGoal} · HSK {user.hskLevel}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t-2 border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-orange-500" />
                <span className="text-xs font-black text-gray-900 dark:text-white">{user.streak}</span>
              </div>
              <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Streak</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Award className="w-3 h-3 text-amber-500" />
                <span className="text-xs font-black text-gray-900 dark:text-white">{user.points}</span>
              </div>
              <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">XP</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Heart className="w-3 h-3 text-[#E63946]" />
                <span className="text-xs font-black text-gray-900 dark:text-white">{getHearts()}</span>
              </div>
              <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Tim</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E63946] focus-visible:ring-offset-2 ${
                isActive
                  ? 'bg-[#E63946] text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white hover:scale-[1.01]'
              }`}
            >
              <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-white' : ''} transition-transform duration-200 ${!isActive ? 'group-hover:scale-110' : ''}`} />
              <span className="flex-1 truncate">{item.name}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t-2 border-gray-100 dark:border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-[#E63946] dark:hover:text-[#E63946] transition-all duration-200 hover:scale-[1.01] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E63946] focus-visible:ring-offset-2"
        >
          <LogOut className="w-4.5 h-4.5 transition-transform duration-200 group-hover:scale-110" />
          Đăng xuất
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-950 border-b-2 border-gray-100 dark:border-gray-800 sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-[#E63946] flex items-center justify-center text-white font-extrabold text-base">
            H
          </div>
          <span className="font-extrabold text-lg text-gray-900 dark:text-white tracking-tight">
            HanziFlow
          </span>
        </Link>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            type="button"
            className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 transition-all duration-200"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>
          
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-60 h-screen sticky top-0 flex-shrink-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={toggleSidebar} />
          <div className="relative w-64 max-w-xs h-full animate-in slide-in-from-left duration-200">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  )
}
