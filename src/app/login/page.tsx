// src/app/login/page.tsx
'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Mail, Loader2, AlertCircle, BookOpen, Bookmark, Mic, CheckCircle } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.')
      }

      router.push(redirectPath)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: BookOpen, text: 'Lộ trình HSK 1–6 cá nhân hóa' },
    { icon: Mic, text: 'Luyện nói HSKK với AI chấm điểm' },
    { icon: Bookmark, text: 'Flashcard SRS thông minh' },
    { icon: CheckCircle, text: 'Quiz tương tác kiểu Duolingo' },
  ]

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-950">
      
      {/* Left Panel — Bold Color Block */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#E63946] relative overflow-hidden flex-col justify-between p-12">
        {/* Geometric decorations */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full translate-x-24 -translate-y-24" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full -translate-x-16 translate-y-16" />
        <div className="absolute top-1/2 right-8 w-32 h-32 bg-white/5 rotate-45" />
        <div className="absolute bottom-1/3 left-1/3 w-20 h-20 bg-white/8 rounded-full" />

        {/* Logo */}
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-md bg-white flex items-center justify-center text-[#E63946] font-extrabold text-2xl">
              H
            </div>
            <div>
              <span className="font-extrabold text-2xl text-white tracking-tight">HanziFlow</span>
              <span className="block text-xs text-white/60 font-semibold uppercase tracking-widest">Chinese Learning</span>
            </div>
          </div>
        </div>

        {/* Main copy */}
        <div className="relative space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
              Làm chủ<br />tiếng Trung<br />theo cách của bạn.
            </h1>
            <p className="text-white/70 text-base mt-4 leading-relaxed">
              Hệ thống học tập thông minh, cá nhân hóa theo lộ trình HSK từ nhập môn đến nâng cao.
            </p>
          </div>

          <div className="space-y-3">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/90 text-sm font-semibold">{f.text}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom stat numbers */}
        <div className="relative grid grid-cols-3 gap-4 pt-8 border-t-2 border-white/20">
          <div>
            <span className="block text-2xl font-black text-white">5000+</span>
            <span className="text-xs text-white/60 font-semibold uppercase tracking-wider">Từ vựng HSK</span>
          </div>
          <div>
            <span className="block text-2xl font-black text-amber-300">150+</span>
            <span className="text-xs text-white/60 font-semibold uppercase tracking-wider">Bài học</span>
          </div>
          <div>
            <span className="block text-2xl font-black text-emerald-300">HSK 6</span>
            <span className="text-xs text-white/60 font-semibold uppercase tracking-wider">Cấp cao nhất</span>
          </div>
        </div>
      </div>

      {/* Right Panel — White Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-md bg-[#E63946] flex items-center justify-center text-white font-extrabold text-lg">H</div>
          <span className="font-extrabold text-xl text-gray-900 dark:text-white">HanziFlow</span>
        </div>

        <div className="w-full max-w-sm mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Chào mừng trở lại</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Đăng nhập để tiếp tục lộ trình học tập.</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 mb-6 rounded-md bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="login-email" className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 transition-colors ${focusedField === 'email' ? 'text-[#E63946]' : 'text-gray-400'}`} />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="name@example.com"
                  className={`block w-full pl-10 pr-4 py-3.5 text-sm font-semibold rounded-md transition-all duration-200 outline-none ${
                    focusedField === 'email'
                      ? 'bg-white dark:bg-gray-950 border-2 border-[#E63946] text-gray-900 dark:text-white'
                      : 'bg-gray-100 dark:bg-gray-800 border-2 border-transparent text-gray-900 dark:text-white'
                  }`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 transition-colors ${focusedField === 'password' ? 'text-[#E63946]' : 'text-gray-400'}`} />
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  className={`block w-full pl-10 pr-4 py-3.5 text-sm font-semibold rounded-md transition-all duration-200 outline-none ${
                    focusedField === 'password'
                      ? 'bg-white dark:bg-gray-950 border-2 border-[#E63946] text-gray-900 dark:text-white'
                      : 'bg-gray-100 dark:bg-gray-800 border-2 border-transparent text-gray-900 dark:text-white'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="w-full h-14 flex justify-center items-center rounded-md text-sm font-bold text-white bg-[#E63946] hover:bg-red-700 disabled:opacity-50 transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E63946] focus-visible:ring-offset-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="font-bold text-[#E63946] hover:underline">
              Đăng ký miễn phí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
