// src/app/admin/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/sidebar'
import { Settings, Plus, BookOpen, Bookmark, FileText, CheckCircle2, AlertCircle, Upload, Link2, Users, Edit2, Trash2, X, Crown, Shield, CreditCard } from 'lucide-react'

interface AdminData {
  lessons: any[]
  vocabularies: any[]
  grammars: any[]
  stages: any[]
}

interface StudentUser {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  hskLevel: number
  subscription: string
  streak: number
  points: number
  placementCompleted: boolean
  learningGoal: string
  phone: string | null
  gender: string | null
  dob: string | null
  bio: string | null
  createdAt: string
  lastActive: string
  _count: { progress: number; quizResults: number }
}

export default function AdminCMS() {
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'lessons' | 'vocab' | 'import-vocab' | 'link-lesson' | 'users' | 'transactions'>('lessons')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Transactions management state
  const [transactions, setTransactions] = useState<any[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const [txActionLoading, setTxActionLoading] = useState<string | null>(null)

  const fetchTransactions = async () => {
    setTransactionsLoading(true)
    try {
      const res = await fetch('/api/admin/transactions')
      if (res.ok) {
        const json = await res.json()
        setTransactions(json.transactions)
      }
    } catch (err) {
      console.error('Error fetching transactions:', err)
    } finally {
      setTransactionsLoading(false)
    }
  }

  const handleProcessTransaction = async (transactionId: string, action: 'APPROVE' | 'REJECT') => {
    setTxActionLoading(transactionId)
    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, action }),
      })
      if (res.ok) {
        setSuccessMsg(action === 'APPROVE' ? 'Đã duyệt thanh toán và nâng cấp Pro thành công!' : 'Đã từ chối giao dịch.')
        fetchTransactions()
        setTimeout(() => setSuccessMsg(''), 3000)
      } else {
        const json = await res.json()
        setErrorMsg(json.error || 'Có lỗi xảy ra khi xử lý giao dịch.')
        setTimeout(() => setErrorMsg(''), 3000)
      }
    } catch (err) {
      console.error(err)
      setErrorMsg('Lỗi kết nối server.')
      setTimeout(() => setErrorMsg(''), 3000)
    } finally {
      setTxActionLoading(null)
    }
  }


  // Users management state
  const [users, setUsers] = useState<StudentUser[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [editUser, setEditUser] = useState<StudentUser | null>(null)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', hskLevel: 1, subscription: 'free', points: 0, streak: 0, phone: '', gender: '', bio: '' })
  const [userActionMsg, setUserActionMsg] = useState('')
  const [userActionError, setUserActionError] = useState('')
  const [userSearch, setUserSearch] = useState('')

  // CSV Importer States
  const [csvText, setCsvText] = useState('')
  const [parsedVocabs, setParsedVocabs] = useState<any[]>([])

  // Link Lesson States
  const [selectedLinkLessonId, setSelectedLinkLessonId] = useState('')
  const [selectedVocabIds, setSelectedVocabIds] = useState<string[]>([])
  const [selectedGrammarIds, setSelectedGrammarIds] = useState<string[]>([])

  // Form states - Vocabulary
  const [vChar, setVChar] = useState('')
  const [vPinyin, setVPinyin] = useState('')
  const [vMeanVi, setVMeanVi] = useState('')
  const [vMeanEn, setVMeanEn] = useState('')
  const [vExZh, setVExZh] = useState('')
  const [vExVi, setVExVi] = useState('')
  const [vLevel, setVLevel] = useState(1)
  const [vTopic, setVTopic] = useState('study')
  const [vLessonId, setVLessonId] = useState('')

  // Form states - Lesson
  const [lTitle, setLTitle] = useState('')
  const [lDesc, setLDesc] = useState('')
  const [lLevel, setLLevel] = useState(1)
  const [lOrder, setLOrder] = useState(1)
  const [lStageId, setLStageId] = useState('')

  // Fetch admin summary list
  const fetchCMSData = async () => {
    try {
      const res = await fetch('/api/admin')
      if (res.ok) {
        const json = await res.json()
        setData(json)
        if (json.stages.length > 0) {
          setLStageId(json.stages[0].id)
        }
        if (json.lessons.length > 0) {
          setVLessonId(json.lessons[0].id)
        }
      }
    } catch (err) {
      console.error('Error fetching admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCMSData()
  }, [])

  // Fetch users when switching to users or transactions tab
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    } else if (activeTab === 'transactions') {
      fetchTransactions()
    }
  }, [activeTab])

  const fetchUsers = async () => {
    setUsersLoading(true)
    setUserActionMsg('')
    setUserActionError('')
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const json = await res.json()
        setUsers(json.users)
      }
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setUsersLoading(false)
    }
  }

  const handleOpenEdit = (user: StudentUser) => {
    setEditUser(user)
    setEditForm({
      name: user.name || '',
      email: user.email,
      hskLevel: user.hskLevel,
      subscription: user.subscription,
      points: user.points,
      streak: user.streak,
      phone: user.phone || '',
      gender: user.gender || '',
      bio: user.bio || '',
    })
    setUserActionMsg('')
    setUserActionError('')
  }

  const handleSaveEdit = async () => {
    if (!editUser) return
    setUserActionMsg('')
    setUserActionError('')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: editUser.id, ...editForm, hskLevel: Number(editForm.hskLevel), points: Number(editForm.points), streak: Number(editForm.streak) }),
      })
      if (res.ok) {
        setUserActionMsg('Đã cập nhật thông tin học viên thành công!')
        setEditUser(null)
        fetchUsers()
      } else {
        const err = await res.json()
        setUserActionError(err.error || 'Cập nhật thất bại.')
      }
    } catch (e) {
      setUserActionError('Lỗi máy chủ.')
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteUserId) return
    setUserActionMsg('')
    setUserActionError('')
    try {
      const res = await fetch(`/api/admin/users?userId=${deleteUserId}`, { method: 'DELETE' })
      if (res.ok) {
        setUserActionMsg('Đã xóa tài khoản học viên thành công!')
        setDeleteUserId(null)
        fetchUsers()
      } else {
        const err = await res.json()
        setUserActionError(err.error || 'Xóa thất bại.')
        setDeleteUserId(null)
      }
    } catch (e) {
      setUserActionError('Lỗi máy chủ.')
      setDeleteUserId(null)
    }
  }

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.name || '').toLowerCase().includes(userSearch.toLowerCase())
  )

  // CSV Importer Handlers
  const handleParseCSV = () => {
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const lines = csvText.split('\n')
      const items: any[] = []
      lines.forEach(line => {
        const trimmed = line.trim()
        if (!trimmed) return
        const parts = trimmed.split(',')
        if (parts.length >= 3) {
          items.push({
            character: parts[0]?.trim(),
            pinyin: parts[1]?.trim(),
            meaningVi: parts[2]?.trim(),
            topic: parts[3]?.trim() || 'study',
            hskLevel: Number(parts[4]?.trim()) || 1,
            exampleZh: parts[5]?.trim() || '',
            exampleVi: parts[6]?.trim() || '',
          })
        }
      })
      if (items.length === 0) {
        setErrorMsg('Không tìm thấy dữ liệu hợp lệ. Vui lòng định dạng đúng CSV.')
      } else {
        setParsedVocabs(items)
        setSuccessMsg(`Đã phân tích thành công ${items.length} từ vựng! Hãy xác nhận lưu bên dưới.`)
      }
    } catch (e) {
      setErrorMsg('Lỗi định dạng CSV.')
    }
  }

  const handleSaveImportedVocabs = async () => {
    if (parsedVocabs.length === 0) return
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const res = await fetch('/api/admin/import-vocab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vocabularies: parsedVocabs }),
      })
      if (res.ok) {
        const result = await res.json()
        setSuccessMsg(`Đã lưu thành công ${result.count} từ vựng vào cơ sở dữ liệu!`)
        setCsvText('')
        setParsedVocabs([])
        fetchCMSData()
      } else {
        const err = await res.json()
        setErrorMsg(err.error || 'Nhập từ vựng thất bại.')
      }
    } catch (e) {
      setErrorMsg('Lỗi máy chủ khi import.')
    } finally {
      setLoading(false)
    }
  }

  // Pre-populate link selections when lesson changes
  useEffect(() => {
    if (!selectedLinkLessonId || !data) return
    const lessonVocabs = data.vocabularies
      .filter(v => v.lessonId === selectedLinkLessonId)
      .map(v => v.id)
    const lessonGrammars = data.grammars
      .filter(g => g.lessonId === selectedLinkLessonId)
      .map(g => g.id)
    
    setSelectedVocabIds(lessonVocabs)
    setSelectedGrammarIds(lessonGrammars)
  }, [selectedLinkLessonId, data])

  const handleUpdateLinks = async () => {
    if (!selectedLinkLessonId) return
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const res = await fetch('/api/admin/link-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: selectedLinkLessonId,
          vocabularyIds: selectedVocabIds,
          grammarIds: selectedGrammarIds,
        }),
      })
      if (res.ok) {
        setSuccessMsg('Liên kết tài nguyên bài học thành công!')
        fetchCMSData()
      } else {
        const err = await res.json()
        setErrorMsg(err.error || 'Cập nhật liên kết thất bại.')
      }
    } catch (e) {
      setErrorMsg('Lỗi máy chủ khi liên kết.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddVocab = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'vocabulary',
          character: vChar,
          pinyin: vPinyin,
          meaningVi: vMeanVi,
          meaningEn: vMeanEn || null,
          exampleZh: vExZh,
          exampleVi: vExVi,
          hskLevel: vLevel,
          topic: vTopic,
          lessonId: vLessonId || null,
        }),
      })

      if (res.ok) {
        setSuccessMsg('Đã thêm từ vựng thành công!')
        setVChar('')
        setVPinyin('')
        setVMeanVi('')
        setVMeanEn('')
        setVExZh('')
        setVExVi('')
        fetchCMSData()
      } else {
        const err = await res.json()
        setErrorMsg(err.error || 'Thất bại khi lưu từ.')
      }
    } catch (e) {
      setErrorMsg('Lỗi máy chủ.')
    }
  }

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'lesson',
          title: lTitle,
          description: lDesc,
          level: lLevel,
          order: lOrder,
          stageId: lStageId,
        }),
      })

      if (res.ok) {
        setSuccessMsg('Đã tạo bài học thành công!')
        setLTitle('')
        setLDesc('')
        setLOrder(prev => prev + 1)
        fetchCMSData()
      } else {
        const err = await res.json()
        setErrorMsg(err.error || 'Thất bại khi lưu bài.')
      }
    } catch (e) {
      setErrorMsg('Lỗi máy chủ.')
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#faf9f6] dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
        <div className="space-y-8 animate-in fade-in duration-350">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <Settings className="w-8 h-8 text-rose-500" />
                Admin CMS Dashboard
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Quản trị dữ liệu bài học, từ vựng và ngữ pháp của hệ thống học tiếng Trung HanziFlow.
              </p>
            </div>
            <Link 
              href="/admin/reviews" 
              className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm text-center"
            >
              Chấm bài học viên
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
              <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-bold text-slate-400 animate-pulse">Đang nạp hệ thống CMS...</p>
            </div>
          ) : !data ? (
            <p className="text-center text-slate-500 font-bold">Không được quyền truy cập trang này.</p>
          ) : (
            <div className="space-y-6">
              {/* Toast Messages */}
              {successMsg && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 text-xs border border-emerald-150 font-bold">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}
              {errorMsg && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450 text-xs border border-rose-150 font-bold">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="flex gap-2 border-b border-rose-100/30 dark:border-slate-800/80 pb-1.5 select-none overflow-x-auto">
                <button
                  onClick={() => setActiveTab('lessons')}
                  className={`flex items-center gap-1.5 px-4.5 py-3 border-b-2 text-xs font-bold transition-all shrink-0 ${
                    activeTab === 'lessons'
                      ? 'border-rose-500 text-rose-500'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Quản lý Bài học ({data.lessons.length})
                </button>
                <button
                  onClick={() => setActiveTab('vocab')}
                  className={`flex items-center gap-1.5 px-4.5 py-3 border-b-2 text-xs font-bold transition-all shrink-0 ${
                    activeTab === 'vocab'
                      ? 'border-rose-500 text-rose-500'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  Quản lý Từ vựng ({data.vocabularies.length})
                </button>
                <button
                  onClick={() => setActiveTab('import-vocab')}
                  className={`flex items-center gap-1.5 px-4.5 py-3 border-b-2 text-xs font-bold transition-all shrink-0 ${
                    activeTab === 'import-vocab'
                      ? 'border-rose-500 text-rose-500'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Nhập từ vựng CSV
                </button>
                <button
                  onClick={() => setActiveTab('link-lesson')}
                  className={`flex items-center gap-1.5 px-4.5 py-3 border-b-2 text-xs font-bold transition-all shrink-0 ${
                    activeTab === 'link-lesson'
                      ? 'border-rose-500 text-rose-500'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Link2 className="w-4 h-4" />
                  Liên kết Bài học
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center gap-1.5 px-4.5 py-3 border-b-2 text-xs font-bold transition-all shrink-0 ${
                    activeTab === 'users'
                      ? 'border-rose-500 text-rose-500'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Quản lý Học viên {users.length > 0 && `(${users.length})`}
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`flex items-center gap-1.5 px-4.5 py-3 border-b-2 text-xs font-bold transition-all shrink-0 ${
                    activeTab === 'transactions'
                      ? 'border-rose-500 text-rose-500'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Quản lý Thanh toán
                </button>
              </div>

              {/* TAB CONTENT: LESSONS */}
              {activeTab === 'lessons' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* List */}
                  <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/50 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="py-4 px-6">Tên bài học</th>
                            <th className="py-4 px-4">Giai đoạn</th>
                            <th className="py-4 px-4 text-center">Cấp độ</th>
                            <th className="py-4 px-4 text-center">Thứ tự</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-rose-100/10 dark:divide-slate-800/80 font-semibold text-slate-700 dark:text-slate-350">
                          {data.lessons.map((less) => (
                            <tr key={less.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                              <td className="py-4 px-6 font-bold text-slate-900 dark:text-slate-100">{less.title}</td>
                              <td className="py-4 px-4 text-slate-400 font-medium">{less.stage.title}</td>
                              <td className="py-4 px-4 text-center font-bold">H{less.level}</td>
                              <td className="py-4 px-4 text-center">{less.order}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                      <Plus className="w-5 h-5 text-rose-500" /> Tạo bài học mới
                    </h3>
                    <form onSubmit={handleAddLesson} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Tên bài học</label>
                        <input
                          type="text"
                          required
                          value={lTitle}
                          onChange={(e) => setLTitle(e.target.value)}
                          placeholder="e.g. Bài 6: Đi ăn cơm nhà hàng"
                          className="block w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 text-xs font-bold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1.5">Mô tả bài</label>
                        <textarea
                          value={lDesc}
                          onChange={(e) => setLDesc(e.target.value)}
                          placeholder="Học cách đặt món ăn và thanh toán..."
                          rows={3}
                          className="block w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 text-xs font-semibold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1.5">Giai đoạn roadmap</label>
                        <select
                          value={lStageId}
                          onChange={(e) => setLStageId(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-350 focus:outline-none"
                        >
                          {data.stages.map(st => (
                            <option key={st.id} value={st.id}>{st.title}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1.5">Mức HSK</label>
                          <input
                            type="number"
                            min={1}
                            max={6}
                            value={lLevel}
                            onChange={(e) => setLLevel(Number(e.target.value))}
                            className="block w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 text-xs font-bold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1.5">Thứ tự bài</label>
                          <input
                            type="number"
                            min={1}
                            value={lOrder}
                            onChange={(e) => setLOrder(Number(e.target.value))}
                            className="block w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 text-xs font-bold focus:outline-none"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-rose-500 text-white font-bold rounded-xl text-xs hover:bg-rose-600 transition-colors shadow-sm"
                      >
                        Tạo bài học
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: VOCABULARY */}
              {activeTab === 'vocab' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* List */}
                  <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/50 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="py-4 px-6">Từ Hán</th>
                            <th className="py-4 px-4">Pinyin</th>
                            <th className="py-4 px-4">Nghĩa tiếng Việt</th>
                            <th className="py-4 px-4 text-center">Cấp độ</th>
                            <th className="py-4 px-4">Chủ đề</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-rose-100/10 dark:divide-slate-800/80 font-semibold text-slate-700 dark:text-slate-350">
                          {data.vocabularies.map((vocab) => (
                            <tr key={vocab.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                              <td className="py-4 px-6 font-sans text-sm font-black text-slate-900 dark:text-slate-100">{vocab.character}</td>
                              <td className="py-4 px-4 text-rose-500 font-bold">{vocab.pinyin}</td>
                              <td className="py-4 px-4 leading-relaxed">{vocab.meaningVi}</td>
                              <td className="py-4 px-4 text-center">H{vocab.hskLevel}</td>
                              <td className="py-4 px-4 text-slate-400 font-medium">{vocab.topic}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                      <Plus className="w-5 h-5 text-rose-500" /> Thêm từ mới
                    </h3>
                    <form onSubmit={handleAddVocab} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1.5">Chữ Hán</label>
                          <input
                            type="text"
                            required
                            value={vChar}
                            onChange={(e) => setVChar(e.target.value)}
                            placeholder="餐厅"
                            className="block w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 text-xs font-bold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1.5">Phiên âm</label>
                          <input
                            type="text"
                            required
                            value={vPinyin}
                            onChange={(e) => setVPinyin(e.target.value)}
                            placeholder="cāntīng"
                            className="block w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 text-xs font-bold focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1.5">Nghĩa tiếng Việt</label>
                        <input
                          type="text"
                          required
                          value={vMeanVi}
                          onChange={(e) => setVMeanVi(e.target.value)}
                          placeholder="Nhà hàng, tiệm ăn"
                          className="block w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 text-xs font-bold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1.5">Nghĩa tiếng Anh (nếu có)</label>
                        <input
                          type="text"
                          value={vMeanEn}
                          onChange={(e) => setVMeanEn(e.target.value)}
                          placeholder="restaurant"
                          className="block w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 text-xs font-semibold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1.5">Câu ví dụ (chữ Hán)</label>
                        <input
                          type="text"
                          required
                          value={vExZh}
                          onChange={(e) => setVExZh(e.target.value)}
                          placeholder="我们在餐厅吃午饭。"
                          className="block w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 text-xs font-bold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1.5">Dịch nghĩa câu ví dụ</label>
                        <input
                          type="text"
                          required
                          value={vExVi}
                          onChange={(e) => setVExVi(e.target.value)}
                          placeholder="Chúng tôi ăn trưa tại nhà hàng."
                          className="block w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 text-xs font-bold focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1.5">Cấp HSK</label>
                          <select
                            value={vLevel}
                            onChange={(e) => setVLevel(Number(e.target.value))}
                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-350 focus:outline-none"
                          >
                            <option value="1">HSK 1</option>
                            <option value="2">HSK 2</option>
                            <option value="3">HSK 3</option>
                            <option value="4">HSK 4</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1.5">Chủ đề</label>
                          <select
                            value={vTopic}
                            onChange={(e) => setVTopic(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-350 focus:outline-none"
                          >
                            <option value="study">Học tập</option>
                            <option value="family">Gia đình</option>
                            <option value="work">Công việc</option>
                            <option value="food">Ẩm thực</option>
                            <option value="travel">Du lịch</option>
                            <option value="shopping">Mua sắm</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1.5">Thuộc Bài học</label>
                        <select
                          value={vLessonId}
                          onChange={(e) => setVLessonId(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-350 focus:outline-none"
                        >
                          <option value="">Không gán bài</option>
                          {data.lessons.map(less => (
                            <option key={less.id} value={less.id}>{less.title}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-rose-500 text-white font-bold rounded-xl text-xs hover:bg-rose-600 transition-colors shadow-sm"
                      >
                        Lưu từ vựng
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: CSV IMPORT */}
              {activeTab === 'import-vocab' && (
                <div className="bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-6">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-850 dark:text-slate-100 uppercase tracking-wider">
                      Nhập từ vựng hàng loạt (CSV Importer)
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Sao chép và dán danh sách từ vựng theo định dạng CSV để lưu nhanh vào hệ thống.
                    </p>
                  </div>

                  <div className="p-4 bg-rose-50/20 dark:bg-rose-950/10 border border-rose-100/30 rounded-2xl text-[10px] text-rose-500 font-semibold space-y-1">
                    <p className="font-black uppercase">Hướng dẫn định dạng:</p>
                    <p>Mỗi từ vựng nằm trên 1 dòng, phân tách bằng dấu phẩy: [Chữ Hán],[Phiên âm],[Nghĩa Việt],[Chủ đề],[Cấp HSK],[Câu ví dụ],[Dịch nghĩa câu]</p>
                    <p className="font-mono mt-1 text-[9px] bg-white dark:bg-slate-950 p-2 rounded">
                      餐厅,cāntīng,Nhà hàng,study,1,我们在餐厅吃午饭。,Chúng tôi ăn trưa tại nhà hàng.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Input CSV Textarea */}
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Dữ liệu CSV</label>
                      <textarea
                        rows={8}
                        value={csvText}
                        onChange={(e) => setCsvText(e.target.value)}
                        placeholder="餐厅,cāntīng,Nhà hàng,study,1,我们在餐厅吃午饭。,Chúng tôi ăn trưa tại nhà hàng."
                        className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500 font-sans"
                      />
                      <button
                        onClick={handleParseCSV}
                        className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                      >
                        Phân tích dữ liệu
                      </button>
                    </div>

                    {/* Preview Table */}
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Xem trước kết quả phân tích ({parsedVocabs.length})</label>
                      
                      {parsedVocabs.length === 0 ? (
                        <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400 italic text-xs">
                          Chưa có dữ liệu phân tích. Vui lòng bấm "Phân tích dữ liệu".
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="max-h-[220px] overflow-y-auto border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden">
                            <table className="w-full text-left border-collapse text-[10px]">
                              <thead>
                                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/50 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                  <th className="py-2.5 px-4">Từ Hán</th>
                                  <th className="py-2.5 px-2">Pinyin</th>
                                  <th className="py-2.5 px-2">Nghĩa Việt</th>
                                  <th className="py-2.5 px-2 text-center">HSK</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-rose-100/10 dark:divide-slate-800/80 font-semibold text-slate-655">
                                {parsedVocabs.map((item, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                                    <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200">{item.character}</td>
                                    <td className="py-2.5 px-2 text-rose-500 font-bold">{item.pinyin}</td>
                                    <td className="py-2.5 px-2 truncate max-w-[120px]">{item.meaningVi}</td>
                                    <td className="py-2.5 px-2 text-center">H{item.hskLevel}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <button
                            onClick={handleSaveImportedVocabs}
                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl text-xs transition-colors shadow-sm"
                          >
                            Xác nhận lưu {parsedVocabs.length} từ vựng
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: LINK LESSON */}
              {activeTab === 'link-lesson' && (
                <div className="bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-6">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-850 dark:text-slate-100 uppercase tracking-wider">
                      Liên kết Tài nguyên Bài học (Lesson Linker)
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Gán từ vựng và ngữ pháp vào bài học tương ứng để hiển thị trong giáo trình.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Lesson Selector */}
                    <div className="lg:col-span-1 space-y-3">
                      <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider">1. Chọn bài học đích</label>
                      <select
                        value={selectedLinkLessonId}
                        onChange={(e) => setSelectedLinkLessonId(e.target.value)}
                        className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-350 focus:outline-none"
                      >
                        <option value="">-- Chọn bài học --</option>
                        {data.lessons.map(less => (
                          <option key={less.id} value={less.id}>{less.title} (HSK {less.level})</option>
                        ))}
                      </select>

                      {selectedLinkLessonId && (
                        <div className="pt-4 space-y-2">
                          <button
                            onClick={handleUpdateLinks}
                            className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl text-xs transition-colors shadow-sm"
                          >
                            Lưu liên kết tài nguyên
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Resources Checklists */}
                    {selectedLinkLessonId ? (
                      <>
                        {/* Vocab checklist */}
                        <div className="lg:col-span-1 space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider">2. Chọn Từ vựng ({selectedVocabIds.length})</label>
                          </div>
                          
                          <div className="max-h-[300px] overflow-y-auto border border-slate-100 dark:border-slate-850 p-3 rounded-2xl space-y-2">
                            {data.vocabularies.map((vocab) => {
                              const isChecked = selectedVocabIds.includes(vocab.id)
                              return (
                                <label 
                                  key={vocab.id}
                                  className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-xs font-semibold cursor-pointer"
                                >
                                  <input 
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedVocabIds(prev => [...prev, vocab.id])
                                      } else {
                                        setSelectedVocabIds(prev => prev.filter(id => id !== vocab.id))
                                      }
                                    }}
                                    className="mt-0.5"
                                  />
                                  <div>
                                    <span className="font-black text-slate-800 dark:text-slate-200">{vocab.character}</span>
                                    <span className="block text-[9px] text-slate-400 font-medium">{vocab.pinyin} - {vocab.meaningVi}</span>
                                  </div>
                                </label>
                              )
                            })}
                          </div>
                        </div>

                        {/* Grammar checklist */}
                        <div className="lg:col-span-1 space-y-3">
                          <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider">3. Chọn Ngữ pháp ({selectedGrammarIds.length})</label>
                          
                          <div className="max-h-[300px] overflow-y-auto border border-slate-100 dark:border-slate-850 p-3 rounded-2xl space-y-2">
                            {data.grammars.length === 0 ? (
                              <p className="text-[10px] text-slate-400 italic">Không có cấu trúc ngữ pháp nào.</p>
                            ) : (
                              data.grammars.map((grammar) => {
                                const isChecked = selectedGrammarIds.includes(grammar.id)
                                return (
                                  <label 
                                    key={grammar.id}
                                    className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-xs font-semibold cursor-pointer"
                                  >
                                    <input 
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedGrammarIds(prev => [...prev, grammar.id])
                                        } else {
                                          setSelectedGrammarIds(prev => prev.filter(id => id !== grammar.id))
                                        }
                                      }}
                                      className="mt-0.5"
                                    />
                                    <div>
                                      <span className="font-extrabold text-slate-800 dark:text-slate-200">{grammar.title}</span>
                                      <span className="block text-[9px] text-slate-400 font-medium">{grammar.formula}</span>
                                    </div>
                                  </label>
                                )
                              })
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="lg:col-span-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 italic text-xs bg-slate-50/20">
                        Vui lòng chọn một bài học đích để thiết lập liên kết tài nguyên.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: USERS MANAGEMENT */}
              {activeTab === 'users' && (
                <div className="space-y-5">
                  {/* Action Messages */}
                  {userActionMsg && (
                    <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 text-xs border border-emerald-150 font-bold">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      <span>{userActionMsg}</span>
                    </div>
                  )}
                  {userActionError && (
                    <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450 text-xs border border-rose-150 font-bold">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span>{userActionError}</span>
                    </div>
                  )}

                  {/* Search bar */}
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Tìm kiếm theo tên hoặc email học viên..."
                      className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-400"
                    />
                    <button
                      onClick={fetchUsers}
                      className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                    >
                      Làm mới
                    </button>
                  </div>

                  {/* Users Table */}
                  <div className="bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm">
                    {usersLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="text-center py-16 text-slate-400 text-sm italic">
                        {userSearch ? 'Không tìm thấy học viên phù hợp.' : 'Chưa có học viên nào trong hệ thống.'}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/50 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                              <th className="py-4 px-5">Học viên</th>
                              <th className="py-4 px-4">Gói</th>
                              <th className="py-4 px-4 text-center">HSK</th>
                              <th className="py-4 px-4 text-center">Điểm</th>
                              <th className="py-4 px-4 text-center">Streak</th>
                              <th className="py-4 px-4 text-center">Bài học</th>
                              <th className="py-4 px-4 text-center">Quiz</th>
                              <th className="py-4 px-5 text-center">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-rose-100/10 dark:divide-slate-800/80">
                            {filteredUsers.map((user) => (
                              <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                                <td className="py-3.5 px-5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                                      {(user.name || user.email)[0].toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-800 dark:text-slate-100">{user.name || <span className="text-slate-400 italic">Chưa đặt tên</span>}</p>
                                      <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    user.subscription === 'pro'
                                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                  }`}>
                                    {user.subscription === 'pro' ? <Crown className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                                    {user.subscription === 'pro' ? 'Pro' : 'Free'}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-center font-bold text-rose-500">H{user.hskLevel}</td>
                                <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">{user.points.toLocaleString()}</td>
                                <td className="py-3.5 px-4 text-center">
                                  <span className="font-bold text-orange-500">🔥{user.streak}</span>
                                </td>
                                <td className="py-3.5 px-4 text-center font-semibold text-slate-500">{user._count.progress}</td>
                                <td className="py-3.5 px-4 text-center font-semibold text-slate-500">{user._count.quizResults}</td>
                                <td className="py-3.5 px-5">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => handleOpenEdit(user)}
                                      className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 transition-colors"
                                      title="Chỉnh sửa"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setDeleteUserId(user.id)}
                                      className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 transition-colors"
                                      title="Xóa tài khoản"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* EDIT USER MODAL */}
                  {editUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg p-7 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Chỉnh sửa học viên</h2>
                            <p className="text-xs text-slate-400 mt-0.5">{editUser.email}</p>
                          </div>
                          <button onClick={() => setEditUser(null)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Tên hiển thị</label>
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                              placeholder="Nguyễn Văn A"
                              className="block w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-rose-400"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Email</label>
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))}
                              className="block w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-rose-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Gói đăng ký</label>
                            <select
                              value={editForm.subscription}
                              onChange={(e) => setEditForm(f => ({ ...f, subscription: e.target.value }))}
                              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                            >
                              <option value="free">Free</option>
                              <option value="pro">Pro</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Mục tiêu HSK</label>
                            <select
                              value={editForm.hskLevel}
                              onChange={(e) => setEditForm(f => ({ ...f, hskLevel: Number(e.target.value) }))}
                              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                            >
                              {[1,2,3,4,5,6].map(l => <option key={l} value={l}>HSK {l}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Điểm XP</label>
                            <input
                              type="number"
                              min={0}
                              value={editForm.points}
                              onChange={(e) => setEditForm(f => ({ ...f, points: Number(e.target.value) }))}
                              className="block w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-rose-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Streak (ngày)</label>
                            <input
                              type="number"
                              min={0}
                              value={editForm.streak}
                              onChange={(e) => setEditForm(f => ({ ...f, streak: Number(e.target.value) }))}
                              className="block w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-rose-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Số điện thoại</label>
                            <input
                              type="text"
                              value={editForm.phone}
                              onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))}
                              placeholder="0912345678"
                              className="block w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-rose-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Giới tính</label>
                            <select
                              value={editForm.gender}
                              onChange={(e) => setEditForm(f => ({ ...f, gender: e.target.value }))}
                              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                            >
                              <option value="">Chưa xác định</option>
                              <option value="male">Nam</option>
                              <option value="female">Nữ</option>
                              <option value="other">Khác</option>
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Giới thiệu bản thân</label>
                            <textarea
                              rows={2}
                              value={editForm.bio}
                              onChange={(e) => setEditForm(f => ({ ...f, bio: e.target.value }))}
                              placeholder="Học viên yêu thích tiếng Trung..."
                              className="block w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-400"
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 pt-1">
                          <button
                            onClick={() => setEditUser(null)}
                            className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                          >
                            Lưu thay đổi
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DELETE CONFIRMATION MODAL */}
                  {deleteUserId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm p-7 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-200">
                        <div className="text-center space-y-3">
                          <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto">
                            <Trash2 className="w-7 h-7 text-rose-500" />
                          </div>
                          <div>
                            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Xác nhận xóa tài khoản</h2>
                            <p className="text-xs text-slate-500 mt-1">Hành động này không thể hoàn tác. Toàn bộ dữ liệu học tập của học viên sẽ bị xóa vĩnh viễn.</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setDeleteUserId(null)}
                            className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            Hủy bỏ
                          </button>
                          <button
                            onClick={handleConfirmDelete}
                            className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                          >
                            Xóa tài khoản
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: TRANSACTIONS */}
              {activeTab === 'transactions' && (
                <div className="bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm p-6 space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-rose-50/50 dark:border-slate-800">
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-rose-500" />
                        Quản lý Thanh toán & Nâng cấp Pro
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">Duyệt hoặc từ chối các yêu cầu nâng cấp gói Pro của học viên.</p>
                    </div>
                    <button
                      onClick={fetchTransactions}
                      disabled={transactionsLoading}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all"
                    >
                      {transactionsLoading ? 'Đang tải...' : 'Làm mới'}
                    </button>
                  </div>

                  {transactionsLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-slate-400 font-bold text-xs">Đang tải danh sách giao dịch...</p>
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                      Chưa có giao dịch chuyển khoản nào được tạo.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/50 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="px-5 py-3.5">Học viên</th>
                            <th className="px-5 py-3.5">Mã chuyển khoản</th>
                            <th className="px-5 py-3.5">Số tiền</th>
                            <th className="px-5 py-3.5">Thời gian tạo</th>
                            <th className="px-5 py-3.5">Trạng thái</th>
                            <th className="px-5 py-3.5 text-right">Hành động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-slate-600 dark:text-slate-350">
                          {transactions.map((tx: any) => (
                            <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all">
                              <td className="px-5 py-4">
                                <div className="font-extrabold text-slate-800 dark:text-slate-100">{tx.user?.name || 'Học viên'}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">{tx.user?.email}</div>
                              </td>
                              <td className="px-5 py-4">
                                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/40 px-2 py-1 rounded">
                                  {tx.code}
                                </span>
                              </td>
                              <td className="px-5 py-4 font-extrabold text-slate-800 dark:text-slate-100">
                                {tx.amount.toLocaleString('vi-VN')}đ
                              </td>
                              <td className="px-5 py-4 text-[11px] text-slate-400">
                                {new Date(tx.createdAt).toLocaleString('vi-VN')}
                              </td>
                              <td className="px-5 py-4">
                                {tx.status === 'PENDING' && (
                                  <span className="inline-flex items-center px-2 py-1 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-450 border border-amber-200/50 dark:border-amber-900/50 text-[10px] uppercase font-bold tracking-wider">
                                    Đang chờ (PENDING)
                                  </span>
                                )}
                                {tx.status === 'APPROVED' && (
                                  <span className="inline-flex items-center px-2 py-1 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-450 border border-emerald-200/50 dark:border-emerald-900/50 text-[10px] uppercase font-bold tracking-wider">
                                    Đã duyệt (APPROVED)
                                  </span>
                                )}
                                {tx.status === 'REJECTED' && (
                                  <span className="inline-flex items-center px-2 py-1 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-450 border border-rose-200/50 dark:border-rose-900/50 text-[10px] uppercase font-bold tracking-wider">
                                    Từ chối (REJECTED)
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-4 text-right">
                                {tx.status === 'PENDING' ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      disabled={txActionLoading !== null}
                                      onClick={() => handleProcessTransaction(tx.id, 'APPROVE')}
                                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[11px] font-bold transition-all duration-200 hover:scale-105"
                                    >
                                      {txActionLoading === tx.id ? '...' : 'Duyệt'}
                                    </button>
                                    <button
                                      disabled={txActionLoading !== null}
                                      onClick={() => handleProcessTransaction(tx.id, 'REJECT')}
                                      className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[11px] font-bold transition-all duration-200 hover:scale-105"
                                    >
                                      {txActionLoading === tx.id ? '...' : 'Từ chối'}
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-400 italic">Đã xử lý</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
