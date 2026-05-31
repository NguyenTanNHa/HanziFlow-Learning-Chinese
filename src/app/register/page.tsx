// src/app/register/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, Loader2, AlertCircle, CheckCircle2, Sparkles, BookOpen, ShieldCheck, ArrowRight, ArrowLeft, Zap } from 'lucide-react'

type Step = 'email' | 'otp' | 'details'

export default function Register() {
  const router = useRouter()
  
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [hskLevel, setHskLevel] = useState(1)
  const [learningGoal, setLearningGoal] = useState('HSK')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [debugOtp, setDebugOtp] = useState<string | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null); setSuccessMsg(null); setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-email/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gửi mã xác nhận thất bại.')
      setSuccessMsg(data.message)
      if (data.debugCode) setDebugOtp(data.debugCode)
      setStep('otp')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null); setSuccessMsg(null); setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-email/confirm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Mã xác nhận không đúng.')
      setSuccessMsg(data.message)
      setStep('details')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, hskLevel, learningGoal }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Đăng ký thất bại.')
      router.push('/dashboard'); router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const hskLevels = [
    { value: 1, label: 'HSK 1', desc: '150 từ' },
    { value: 2, label: 'HSK 2', desc: '300 từ' },
    { value: 3, label: 'HSK 3', desc: '600 từ' },
    { value: 4, label: 'HSK 4', desc: '1200 từ' },
  ]

  const learningGoals = [
    { value: 'HSK', label: 'Thi chứng chỉ HSK' },
    { value: 'HSKK', label: 'Thi nói HSKK' },
    { value: 'communication', label: 'Giao tiếp thực tế' },
    { value: 'reading', label: 'Đọc tài liệu / Báo' },
    { value: 'work', label: 'Đi làm công sở' },
  ]

  const stepLabels = ['Email', 'Xác minh', 'Hồ sơ']
  const currentStepIdx = step === 'email' ? 0 : step === 'otp' ? 1 : 2

  const inputClass = (field: string) =>
    `block w-full px-4 py-3.5 text-sm font-semibold rounded-md transition-all duration-200 outline-none ${
      focusedField === field
        ? 'bg-white dark:bg-gray-950 border-2 border-[#E63946] text-gray-900 dark:text-white'
        : 'bg-gray-100 dark:bg-gray-800 border-2 border-transparent text-gray-900 dark:text-white'
    }`

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-950">

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-[#E63946] relative overflow-hidden flex-col justify-between p-12">
        {/* Geometric decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-20 -translate-y-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-12 translate-y-12" />
        <div className="absolute top-1/3 right-6 w-28 h-28 bg-white/5 rotate-45" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-md bg-white flex items-center justify-center text-[#E63946] font-extrabold text-2xl">H</div>
            <div>
              <span className="font-extrabold text-2xl text-white tracking-tight">HanziFlow</span>
              <span className="block text-xs text-white/60 font-semibold uppercase tracking-widest">Chinese Learning</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight mb-6">
            Bắt đầu<br />hành trình<br />tiếng Trung.
          </h2>
          <div className="space-y-3">
            {['Miễn phí hoàn toàn để bắt đầu', 'Lộ trình học cá nhân hóa', 'AI chấm điểm & phản hồi tức thì', 'Hơn 5000 từ vựng HSK 1–6'].map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-md bg-white/25 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[10px] font-black">✓</span>
                </div>
                <span className="text-white/85 text-sm font-semibold">{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-3 p-4 bg-white/15 rounded-lg">
          <Zap className="w-6 h-6 text-amber-300 flex-shrink-0" />
          <p className="text-white/85 text-xs font-semibold leading-relaxed">
            Nâng cấp Pro bất kỳ lúc nào để mở khóa không giới hạn tim và tính năng AI nâng cao.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-16 overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-md bg-[#E63946] flex items-center justify-center text-white font-extrabold text-lg">H</div>
          <span className="font-extrabold text-xl text-gray-900 dark:text-white">HanziFlow</span>
        </div>

        <div className="w-full max-w-lg mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Tạo tài khoản mới</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Gia nhập HanziFlow để bắt đầu lộ trình học tiếng Trung.</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-8">
            {stepLabels.map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 ${i <= currentStepIdx ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-black transition-all duration-200 ${
                    i < currentStepIdx ? 'bg-emerald-500 text-white' :
                    i === currentStepIdx ? 'bg-[#E63946] text-white' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}>
                    {i < currentStepIdx ? '✓' : i + 1}
                  </div>
                  <span className="text-xs font-bold hidden sm:block">{label}</span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`h-0.5 w-8 transition-all duration-200 ${i < currentStepIdx ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Alerts */}
          {error && (
            <div className="flex items-center gap-2 p-4 mb-5 rounded-md bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="flex items-center gap-2 p-4 mb-5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          {debugOtp && step === 'otp' && (
            <div className="p-4 mb-5 rounded-md bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400 space-y-1">
              <p className="font-bold flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> [Local Dev]</p>
              <p>Mã OTP để test:</p>
              <div className="text-lg font-black tracking-widest text-gray-900 dark:text-white bg-white dark:bg-gray-900 inline-block px-3 py-1 rounded-md border-2 border-amber-300">{debugOtp}</div>
            </div>
          )}

          {/* STEP 1 */}
          {step === 'email' && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <label htmlFor="reg-email" className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Địa chỉ Email</label>
                <p className="text-xs text-gray-400 mb-3">Hệ thống sẽ gửi mã xác thực 6 chữ số đến email này.</p>
                <div className="relative">
                  <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 transition-colors ${focusedField === 'email' ? 'text-[#E63946]' : 'text-gray-400'}`} />
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="student@example.com"
                    className={`${inputClass('email')} pl-10`}
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full h-14 flex justify-center items-center gap-2 rounded-md text-sm font-bold text-white bg-[#E63946] hover:bg-red-700 disabled:opacity-50 transition-all duration-200 hover:scale-105">
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><span>Gửi mã xác nhận</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {/* STEP 2 */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label htmlFor="reg-otp" className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Mã OTP</label>
                <p className="text-xs text-gray-400 mb-3">Kiểm tra hộp thư <span className="font-bold text-gray-700 dark:text-gray-300">{email}</span> để lấy mã.</p>
                <input
                  id="reg-otp"
                  type="text"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  onFocus={() => setFocusedField('otp')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="6 chữ số"
                  className={`${inputClass('otp')} text-center tracking-widest text-2xl font-black`}
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep('email')} className="flex items-center justify-center gap-1.5 w-1/3 h-14 rounded-md border-2 border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105">
                  <ArrowLeft className="w-4 h-4" /> Quay lại
                </button>
                <button type="submit" disabled={loading || otpCode.length !== 6} className="flex-1 h-14 flex justify-center items-center gap-2 rounded-md text-sm font-bold text-white bg-[#E63946] hover:bg-red-700 disabled:opacity-50 transition-all duration-200 hover:scale-105">
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><span>Xác minh</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3 */}
          {step === 'details' && (
            <form onSubmit={handleCompleteRegister} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Credentials */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Thông tin đăng nhập
                  </h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Họ và Tên</label>
                    <div className="relative">
                      <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === 'name' ? 'text-[#E63946]' : 'text-gray-400'}`} />
                      <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                        onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                        placeholder="Nguyễn Văn A" className={`${inputClass('name')} pl-10`} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                    <input type="email" disabled value={email}
                      className="block w-full px-4 py-3.5 text-sm font-semibold rounded-md bg-gray-100 dark:bg-gray-800 border-2 border-transparent text-gray-400 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mật khẩu</label>
                    <div className="relative">
                      <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === 'pass' ? 'text-[#E63946]' : 'text-gray-400'}`} />
                      <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('pass')} onBlur={() => setFocusedField(null)}
                        placeholder="Tối thiểu 6 ký tự" className={`${inputClass('pass')} pl-10`} />
                    </div>
                  </div>
                </div>

                {/* Personalization */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Thiết lập lộ trình
                  </h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mục tiêu HSK</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {hskLevels.map((lvl) => (
                        <button key={lvl.value} type="button" onClick={() => setHskLevel(lvl.value)}
                          className={`p-2.5 text-left rounded-md border-2 transition-all duration-200 hover:scale-[1.02] ${
                            hskLevel === lvl.value
                              ? 'border-[#E63946] bg-red-50 dark:bg-red-950/30 text-[#E63946]'
                              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500'
                          }`}>
                          <span className="block font-black text-xs">{lvl.label}</span>
                          <span className="block text-[10px] font-semibold opacity-60">{lvl.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mục tiêu chính</label>
                    <div className="space-y-1.5">
                      {learningGoals.map((goal) => (
                        <button key={goal.value} type="button" onClick={() => setLearningGoal(goal.value)}
                          className={`w-full p-2.5 text-left rounded-md border-2 flex items-center gap-2 transition-all duration-200 hover:scale-[1.01] ${
                            learningGoal === goal.value
                              ? 'border-[#E63946] bg-red-50 dark:bg-red-950/30 text-[#E63946]'
                              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500'
                          }`}>
                          <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="font-bold text-xs">{goal.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full h-14 flex justify-center items-center gap-2 rounded-md text-sm font-bold text-white bg-[#E63946] hover:bg-red-700 disabled:opacity-50 transition-all duration-200 hover:scale-105">
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><span>Bắt đầu học miễn phí</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
            Đã có tài khoản?{' '}
            <Link href="/login" className="font-bold text-[#E63946] hover:underline">Đăng nhập tại đây</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
