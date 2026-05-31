// src/app/profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/sidebar'
import { User, Award, Flame, Save, CheckCircle2, Sparkles, BookOpen, Calendar, Phone, Info, Globe, Clock, UserCheck, Heart } from 'lucide-react'

interface UserSession {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  hskLevel: number
  learningGoal: string
  streak: number
  points: number
  role: string
  dob: string | null
  bio: string | null
  phone: string | null
  gender: string | null
  nativeLanguage: string | null
  learningTimeGoal: number
  streakFreezes: number
}

const AVATAR_PRESETS = [
  { name: 'Felix', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix' },
  { name: 'Aria', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aria' },
  { name: 'Leo', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo' },
  { name: 'Jack', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack' },
  { name: 'Milo', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Milo' },
  { name: 'Zoe', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe' },
]

export default function ProfileSettings() {
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Form states
  const [name, setName] = useState('')
  const [hskLevel, setHskLevel] = useState(1)
  const [learningGoal, setLearningGoal] = useState('HSK')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [dob, setDob] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState('')
  const [nativeLanguage, setNativeLanguage] = useState('')
  const [learningTimeGoal, setLearningTimeGoal] = useState(15)
  
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [buyLoading, setBuyLoading] = useState(false)

  const handleBuyStreakFreeze = async () => {
    setBuyLoading(true)
    try {
      const res = await fetch('/api/profile/streak-freeze', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        if (user) {
          setUser({
            ...user,
            points: data.points,
            streakFreezes: data.streakFreezes,
          })
        }
        alert('Chúc mừng! Bạn đã đổi thành công 1 Thẻ đóng băng Streak (đã trừ 150 XP).')
      } else {
        const data = await res.json()
        alert(data.error || 'Có lỗi xảy ra khi mua vật phẩm.')
      }
    } catch (e) {
      console.error(e)
      alert('Không thể kết nối đến máy chủ.')
    } finally {
      setBuyLoading(false)
    }
  }

  // Format ISO Date to YYYY-MM-DD for input[type="date"]
  const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return ''
    return d.toISOString().split('T')[0]
  }

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setUser(data.user)
            setName(data.user.name || '')
            setAvatarUrl(data.user.avatarUrl || '')
            setHskLevel(data.user.hskLevel)
            setLearningGoal(data.user.learningGoal)
            setDob(formatDateForInput(data.user.dob))
            setBio(data.user.bio || '')
            setPhone(data.user.phone || '')
            setGender(data.user.gender || '')
            setNativeLanguage(data.user.nativeLanguage || '')
            setLearningTimeGoal(data.user.learningTimeGoal || 15)
          }
        }
      } catch (err) {
        console.error('Error fetching profile details:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          hskLevel,
          learningGoal,
          avatarUrl,
          dob: dob || null,
          bio,
          phone,
          gender,
          nativeLanguage,
          learningTimeGoal,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
      }
    } catch (err) {
      console.error('Error saving profile changes:', err)
    } finally {
      setSaving(false)
    }
  }

  const hskLevels = [
    { value: 1, label: 'HSK 1', desc: 'Nhập môn (150 từ)' },
    { value: 2, label: 'HSK 2', desc: 'Sơ cấp 1 (300 từ)' },
    { value: 3, label: 'HSK 3', desc: 'Sơ cấp 2 (600 từ)' },
    { value: 4, label: 'HSK 4', desc: 'Trung cấp (1200 từ)' },
    { value: 5, label: 'HSK 5', desc: 'Cao cấp 1 (2500 từ)' },
    { value: 6, label: 'HSK 6', desc: 'Cao cấp 2 (5000+ từ)' },
  ]

  const learningGoals = [
    { value: 'communication', label: 'Giao tiếp thực tế', desc: 'Tập trung khẩu ngữ, phản xạ nghe nói' },
    { value: 'HSK', label: 'Thi lấy chứng chỉ HSK', desc: 'Học từ vựng, ngữ pháp theo chuẩn kỳ thi HSK' },
    { value: 'HSKK', label: 'Thi nói HSKK', desc: 'Luyện trả lời, nghe phát âm chuẩn và đọc to' },
    { value: 'reading', label: 'Đọc tài liệu / Báo chí', desc: 'Tập trung nhận diện chữ Hán, dịch nghĩa' },
    { value: 'work', label: 'Đi làm công sở', desc: 'Từ vựng chuyên ngành, email và viết báo cáo' },
  ]

  const learningTimeOptions = [
    { value: 15, label: 'Tối giản (15 phút/ngày)' },
    { value: 30, label: 'Tiêu chuẩn (30 phút/ngày)' },
    { value: 45, label: 'Chuyên sâu (45 phút/ngày)' },
    { value: 60, label: 'Đột phá (60 phút/ngày)' },
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#faf9f6] dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <User className="w-8 h-8 text-rose-500" />
              Hồ sơ cá nhân
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Quản lý thông tin cá nhân, cập nhật ảnh đại diện và tùy biến lộ trình học tiếng Trung.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
              <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-bold text-slate-400 animate-pulse">Đang tải thông tin cá nhân...</p>
            </div>
          ) : !user ? (
            <div className="text-center p-12">
              <p className="text-slate-500 font-bold">Không tìm thấy thông tin đăng nhập.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Column: Stats & Meta */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm text-center space-y-4">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="w-24 h-24 rounded-3xl mx-auto border-2 border-rose-200 dark:border-rose-950 p-1 object-cover bg-rose-50 dark:bg-slate-950 shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-rose-100 dark:bg-rose-950/40 text-rose-500 rounded-3xl flex items-center justify-center mx-auto text-4xl font-black shadow-inner">
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-850 dark:text-slate-100">{user.name}</h2>
                    <p className="text-slate-400 text-xs">{user.email}</p>
                    {gender && (
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-slate-50 dark:bg-slate-850 text-slate-500 border border-slate-200/60 dark:border-slate-800 text-[10px] font-bold">
                        {gender === 'male' ? '♂ Nam' : gender === 'female' ? '♀ Nữ' : '✨ Khác'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Score panel */}
                <div className="bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Thành tựu của bạn</h3>
                  
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/20 dark:bg-slate-950 border border-rose-100/10">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Học đều đặn</span>
                    </div>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100">{user.streak} ngày</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/20 dark:bg-slate-950 border border-amber-100/10">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Kinh nghiệm</span>
                    </div>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100">{user.points} XP</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/20 dark:bg-slate-950 border border-emerald-100/10">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-500" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Mục tiêu học</span>
                    </div>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100">{learningTimeGoal} phút/ngày</span>
                  </div>
                </div>

                {/* Item Shop Panel */}
                <div className="bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Cửa hàng vật phẩm
                  </h3>
                  
                  <div className="p-3.5 rounded-2xl bg-amber-50/20 dark:bg-slate-950 border border-amber-100/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-cyan-500 fill-cyan-500 animate-pulse" />
                        <div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Đóng băng Streak</span>
                          <span className="text-[9px] text-slate-400 block font-medium">Bảo vệ Streak khi nghỉ học 1 ngày</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {user.streakFreezes ?? 0} thẻ
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={buyLoading || user.points < 150}
                      onClick={handleBuyStreakFreeze}
                      className={`w-full py-2.5 rounded-xl text-[10.5px] font-bold transition-all ${
                        user.points >= 150
                          ? 'bg-amber-500 hover:bg-amber-600 text-white hover:scale-105 active:scale-95 cursor-pointer'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {buyLoading ? 'Đang giao dịch...' : 'Mua Thẻ Đóng Băng (150 XP)'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Profile details form */}
              <div className="lg:col-span-2">
                <form
                  onSubmit={handleSaveChanges}
                  className="bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6"
                >
                  <h3 className="text-base font-black text-slate-850 dark:text-slate-100 border-b border-rose-50 dark:border-slate-800 pb-3 flex items-center gap-1.5">
                    <UserCheck className="w-5 h-5 text-rose-500" />
                    Chỉnh sửa thông tin chi tiết
                  </h3>
                  
                  {success && (
                    <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 text-xs border border-emerald-100 dark:border-emerald-900/50 font-bold">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      <span>Đã cập nhật thay đổi thành công!</span>
                    </div>
                  )}

                  {/* 1. Avatar selector */}
                  <div className="space-y-3">
                    <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                      Chọn ảnh đại diện
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {AVATAR_PRESETS.map((avatar) => (
                        <button
                          key={avatar.name}
                          type="button"
                          onClick={() => setAvatarUrl(avatar.url)}
                          className={`p-1 rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 bg-slate-50 dark:bg-slate-950 ${
                            avatarUrl === avatar.url
                              ? 'border-rose-500 shadow-md ring-2 ring-rose-100 dark:ring-rose-950'
                              : 'border-slate-100 dark:border-slate-800'
                          }`}
                        >
                          <img src={avatar.url} alt={avatar.name} className="w-full h-auto rounded-xl object-contain" />
                        </button>
                      ))}
                    </div>
                    <div>
                      <input
                        type="url"
                        placeholder="Hoặc điền địa chỉ ảnh trực tuyến..."
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs dark:text-slate-100 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  {/* Basic fields grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name field */}
                    <div>
                      <label htmlFor="name" className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" /> Họ và tên
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 dark:text-slate-100 text-xs font-bold transition-all"
                      />
                    </div>

                    {/* Phone field */}
                    <div>
                      <label htmlFor="phone" className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> Số điện thoại
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="Ví dụ: 0987654321"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 dark:text-slate-100 text-xs font-bold transition-all"
                      />
                    </div>

                    {/* Date of Birth field */}
                    <div>
                      <label htmlFor="dob" className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Ngày sinh
                      </label>
                      <input
                        id="dob"
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 dark:text-slate-100 text-xs font-bold transition-all"
                      />
                    </div>

                    {/* Gender field */}
                    <div>
                      <label htmlFor="gender" className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-slate-400" /> Giới tính
                      </label>
                      <select
                        id="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 dark:text-slate-100 text-xs font-bold transition-all"
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>

                    {/* Native Language field */}
                    <div>
                      <label htmlFor="language" className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-slate-400" /> Ngôn ngữ mẹ đẻ
                      </label>
                      <input
                        id="language"
                        type="text"
                        placeholder="Ví dụ: Tiếng Việt, Tiếng Anh"
                        value={nativeLanguage}
                        onChange={(e) => setNativeLanguage(e.target.value)}
                        className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 dark:text-slate-100 text-xs font-bold transition-all"
                      />
                    </div>

                    {/* Daily Time Goal */}
                    <div>
                      <label htmlFor="timeGoal" className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> Mục tiêu học tập ngày
                      </label>
                      <select
                        id="timeGoal"
                        value={learningTimeGoal}
                        onChange={(e) => setLearningTimeGoal(Number(e.target.value))}
                        className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 dark:text-slate-100 text-xs font-bold transition-all"
                      >
                        {learningTimeOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Biography (Bio) */}
                  <div>
                    <label htmlFor="bio" className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-slate-400" /> Giới thiệu ngắn về bản thân
                    </label>
                    <textarea
                      id="bio"
                      rows={3}
                      placeholder="Hãy viết vài dòng giới thiệu về bản thân hoặc mục tiêu chinh phục tiếng Trung của bạn..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 dark:text-slate-100 text-xs font-semibold leading-relaxed transition-all resize-none"
                    />
                  </div>

                  {/* Level selection */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-rose-500" /> Mục tiêu HSK
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {hskLevels.map((lvl) => (
                        <button
                          key={lvl.value}
                          type="button"
                          onClick={() => setHskLevel(lvl.value)}
                          className={`p-2.5 text-left border rounded-2xl transition-all ${
                            hskLevel === lvl.value
                              ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 font-bold shadow-sm text-xs'
                              : 'border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-450 text-xs'
                          }`}
                        >
                          <span className="block font-bold">{lvl.label}</span>
                          <span className="block text-[8px] opacity-75 mt-0.5">{lvl.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Goal selection */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <BookOpen className="w-4 h-4 text-rose-500" /> Định hướng học tập
                    </label>
                    <div className="space-y-2">
                      {learningGoals.map((goal) => (
                        <button
                          key={goal.value}
                          type="button"
                          onClick={() => setLearningGoal(goal.value)}
                          className={`w-full p-3 text-left border rounded-2xl flex items-start gap-2.5 transition-all ${
                            learningGoal === goal.value
                              ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 font-bold shadow-sm text-xs'
                              : 'border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-450 text-xs'
                          }`}
                        >
                          <BookOpen className="w-4 h-4 mt-0.5 text-rose-500 flex-shrink-0" />
                          <div>
                            <span className="block font-bold">{goal.label}</span>
                            <span className="block text-[9px] opacity-75 mt-0.5">{goal.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full flex justify-center items-center py-3.5 bg-rose-500 text-white rounded-2xl font-bold text-xs hover:bg-rose-600 shadow-md shadow-rose-500/10 transition-all disabled:opacity-50"
                  >
                    <Save className="w-4.5 h-4.5 mr-2" />
                    {saving ? 'Đang lưu cài đặt...' : 'Lưu tất cả thay đổi'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
