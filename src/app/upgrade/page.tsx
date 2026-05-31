// src/app/upgrade/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/sidebar'
import { Check, Sparkles, Star, ArrowRight, X, Info, Copy, CheckCircle2, Building2, Smartphone, Crown, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function UpgradePage() {
  const router = useRouter()
  const [subscription, setSubscription] = useState('free')
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'momo' | 'bank'>('momo')
  const [upgradeSuccess, setUpgradeSuccess] = useState(false)
  const [pendingTx, setPendingTx] = useState<any>(null)

  const checkPendingTransaction = async () => {
    try {
      const res = await fetch('/api/profile/upgrade')
      if (res.ok) {
        const data = await res.json()
        if (data.pending) {
          setPendingTx(data.transaction)
        } else {
          setPendingTx(null)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }


  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const json = await res.json()
        if (json.user) {
          setSubscription(json.user.subscription || 'free')
          setUserEmail(json.user.email || '')
          setUserName(json.user.name || '')
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSession()
    checkPendingTransaction()
  }, [])

  useEffect(() => {
    if (!pendingTx) return

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch('/api/profile/upgrade')
        if (res.ok) {
          const data = await res.json()
          if (!data.pending) {
            clearInterval(intervalId)
            
            if (data.transaction && data.transaction.status === 'APPROVED') {
              setUpgradeSuccess(true)
              setPendingTx(null)
            } else if (data.transaction && data.transaction.status === 'REJECTED') {
              setPendingTx(null)
              alert('Yêu cầu thanh toán của bạn đã bị từ chối. Vui lòng kiểm tra lại giao dịch.')
            }
            await fetchSession()
            router.refresh()
          }
        }
      } catch (e) {
        console.error('Error polling upgrade status:', e)
      }
    }, 8000)

    return () => clearInterval(intervalId)
  }, [pendingTx])

  // Tạo nội dung chuyển khoản gọn gàng, dễ nhập
  const getTransferContent = () => {
    const prefix = userEmail.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
    return `NANGCAP ${prefix}`
  }

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // fallback
    }
  }

  const handleUpgrade = async () => {
    if (!confirmed) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/profile/upgrade', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        if (data.status === 'PENDING') {
          setPendingTx(data.transaction)
          setConfirmed(false)
        } else if (data.success && !data.status) {
          setUpgradeSuccess(true)
          setPendingTx(null)
        }
        await fetchSession()
        router.refresh()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDowngrade = async () => {
    if (!confirm('Bạn có chắc muốn huỷ gói Pro? Các tính năng nâng cao sẽ bị khoá lại.')) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/profile/upgrade', { method: 'DELETE' })
      if (res.ok) {
        await fetchSession()
        router.refresh()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const freeFeatures = [
    'Học lộ trình HSK 1 cơ bản',
    'Ôn tập tối đa 5 từ vựng/ngày',
    '3 câu hỏi Trợ lý AI mỗi ngày',
    'Theo dõi tiến độ học cơ bản',
  ]

  const proFeatures = [
    'Truy cập toàn bộ HSK 1 đến HSK 6',
    'Flashcard không giới hạn mỗi ngày',
    'Hỏi đáp không giới hạn với AI',
    'Gửi bài viết & âm nói cho Giáo viên',
    'Mở khóa bảng xếp hạng & huy hiệu',
    'Tim (Hearts) không giới hạn',
  ]

  const CopyButton = ({ text, label }: { text: string; label: string }) => (
    <button
      onClick={() => copyToClipboard(text, label)}
      className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105 text-[10px] font-bold text-gray-500 dark:text-gray-300 flex-shrink-0"
      title="Sao chép"
    >
      {copied === label ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
      {copied === label ? 'Đã sao chép' : 'Sao chép'}
    </button>
  )

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white dark:bg-gray-950">
      <Sidebar />

      {/* ── Payment Modal ── */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-md md:max-w-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden">

            {/* Modal header */}
            <div className="bg-[#E63946] p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-10 -translate-y-10" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rotate-45 -translate-x-6 translate-y-6" />
              <div className="relative flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight">Nâng cấp tài khoản Pro</h3>
                  <p className="text-white/70 text-xs font-semibold mt-0.5">230.000đ / tháng</p>
                </div>
                <button
                  onClick={() => { setShowPaymentModal(false); setConfirmed(false) }}
                  className="p-2 rounded-md bg-white/20 hover:bg-white/30 text-white transition-all duration-200 hover:scale-105"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Success state */}
            {upgradeSuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-md bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-gray-900 dark:text-white">Kích hoạt Pro thành công!</h4>
                  <p className="text-gray-500 text-sm mt-1">Tài khoản của bạn đã được nâng cấp. Cảm ơn bạn đã ủng hộ HanziFlow! 🎉</p>
                </div>
                <button
                  onClick={() => { setShowPaymentModal(false); setUpgradeSuccess(false) }}
                  className="w-full h-12 bg-[#E63946] hover:bg-red-700 text-white font-bold rounded-md transition-all duration-200 hover:scale-105"
                >
                  Bắt đầu học ngay →
                </button>
              </div>
            ) : pendingTx ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-md bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center mx-auto">
                  <div className="w-6 h-6 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-gray-900 dark:text-white">Đang đối soát thanh toán</h4>
                  <p className="text-gray-500 text-sm mt-1">Yêu cầu nâng cấp Pro của bạn đang được hệ thống đối soát.</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 text-left space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-400">Nội dung CK:</span>
                    <span className="text-gray-900 dark:text-white font-mono tracking-wider font-bold bg-amber-100/50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">{pendingTx.code}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-400">Số tiền:</span>
                    <span className="text-gray-900 dark:text-white font-bold">230.000đ</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-400">Trạng thái:</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider text-[10px]">Đang đối soát (PENDING)</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-100 dark:border-blue-900 text-left">
                  <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold leading-relaxed">
                    Hệ thống sẽ đối soát tự động và kích hoạt gói Pro của bạn sau 2-5 phút kể từ khi nhận được tiền. Bạn có thể đóng cửa sổ này.
                  </p>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full h-12 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-md transition-all duration-200 hover:scale-105"
                >
                  Đồng ý & Đóng cửa sổ
                </button>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: QR Code Card Showcase */}
                  <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/40 rounded-lg p-5 border border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                      Quét mã chuyển khoản
                    </p>
                    <div className="relative overflow-hidden rounded-lg bg-white p-2 border border-gray-200 dark:border-gray-700 hover:scale-[1.02] transition-all duration-300">
                      <img
                        src="/momo-qr.jpg"
                        alt="MoMo QR Nguyễn Tấn Nhã"
                        className="w-56 h-auto object-contain rounded-md"
                      />
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-xs font-black text-gray-800 dark:text-gray-200">
                        NGUYỄN TẤN NHÃ
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-1">
                        Hỗ trợ MoMo & Mọi ứng dụng Ngân hàng
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Information & Confirmation */}
                  <div className="flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                        Thông tin chuyển khoản
                      </p>

                      {/* Name */}
                      <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800/30">
                        <span className="text-[11px] font-semibold text-gray-400 flex-shrink-0">Tên người nhận</span>
                        <span className="text-[11px] font-bold text-gray-900 dark:text-white truncate">NGUYỄN TẤN NHÃ</span>
                      </div>

                      {/* MB Bank */}
                      <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800/30">
                        <span className="text-[11px] font-semibold text-gray-400 flex-shrink-0">MB Bank (STK)</span>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[11px] font-bold text-gray-900 dark:text-white truncate">0937219976</span>
                          <CopyButton text="0937219976" label="bank_stk" />
                        </div>
                      </div>

                      {/* MoMo */}
                      <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800/30">
                        <span className="text-[11px] font-semibold text-gray-400 flex-shrink-0">Ví MoMo</span>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[11px] font-bold text-gray-900 dark:text-white truncate">0937219976</span>
                          <CopyButton text="0937219976" label="momo_phone" />
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800/30">
                        <span className="text-[11px] font-semibold text-gray-400 flex-shrink-0">Số tiền</span>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[11px] font-bold text-gray-900 dark:text-white">230.000đ</span>
                          <CopyButton text="230000" label="amount" />
                        </div>
                      </div>

                      {/* Transfer message */}
                      <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                        <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-400 flex-shrink-0">Nội dung CK</span>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 font-mono tracking-wider truncate">
                            {getTransferContent()}
                          </span>
                          <CopyButton text={getTransferContent()} label="content" />
                        </div>
                      </div>
                    </div>

                    {/* Instruction Alert */}
                    <div className="flex items-start gap-2 p-2.5 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-100 dark:border-blue-900">
                      <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold leading-relaxed">
                        Vui lòng mở ứng dụng MoMo, quét mã QR hoặc nhập thông tin chuyển khoản thủ công. Sau khi hoàn tất chuyển khoản thành công, vui lòng bấm nút bên dưới để hệ thống kích hoạt Pro lập tức.
                      </p>
                    </div>

                    {/* Confirmation Checkbox */}
                    <label className={`flex items-start gap-2.5 p-2.5 rounded-md border cursor-pointer transition-all duration-200 select-none ${
                      confirmed
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}>
                      <div className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-all duration-200 ${
                        confirmed ? 'bg-emerald-500 border-emerald-500' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500'
                      }`}>
                        {confirmed && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                      </div>
                      <input type="checkbox" className="sr-only" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />
                      <span className={`text-[10.5px] font-bold leading-tight ${confirmed ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-500 dark:text-gray-400'}`}>
                        Tôi xác nhận đã chuyển khoản <span className="font-extrabold">230.000đ</span> với đúng nội dung trên.
                      </span>
                    </label>

                    {/* Buttons */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => { setShowPaymentModal(false); setConfirmed(false) }}
                        className="px-3 h-10 rounded-md border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105"
                      >
                        Đóng
                      </button>
                      <button
                        onClick={handleUpgrade}
                        disabled={!confirmed || submitting}
                        className={`flex-1 h-10 rounded-md text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all duration-200 ${
                          confirmed && !submitting
                            ? 'bg-[#E63946] hover:bg-red-700 hover:scale-105 cursor-pointer'
                            : 'bg-gray-300 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {submitting ? (
                          <span className="flex items-center gap-1.5">
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Đang kích hoạt...
                          </span>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5" />
                            Kích hoạt Pro ngay
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full">
        <div className="space-y-8 animate-in fade-in duration-300">

          {/* Header */}
          <div className="text-center max-w-xl mx-auto">
            <p className="text-xs font-bold text-[#E63946] uppercase tracking-widest mb-2">Nâng cấp tài khoản</p>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Chọn gói học phù hợp
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Mở khóa toàn bộ HSK 1–6, AI không giới hạn và nhiều hơn nữa.
            </p>
          </div>

          {/* Pending Banner */}
          {pendingTx && (
            <div className="max-w-3xl mx-auto p-4 bg-amber-50/50 dark:bg-amber-950/10 rounded-lg border-2 border-amber-300/60 dark:border-amber-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-amber-500/10 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Info className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Yêu cầu nâng cấp gói Pro đang được xử lý</p>
                  <p className="text-[10.5px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5">
                    Hệ thống đang đối soát giao dịch chuyển khoản (Nội dung: <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-100/40 dark:bg-amber-950/40 px-1 py-0.5 rounded">{pendingTx.code}</span>).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-md transition-all duration-200 hover:scale-105 animate-in fade-in"
              >
                Xem chi tiết
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3">
              <div className="w-8 h-8 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Đang kiểm tra gói...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

              {/* Free Plan */}
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Gói hiện tại</p>
                    <h3 className="font-extrabold text-gray-900 dark:text-white text-xl">Miễn phí</h3>
                    <p className="text-gray-400 text-xs mt-0.5">Thích hợp cho người mới bắt đầu học thử.</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-gray-900 dark:text-white">0đ</span>
                    <span className="text-gray-400 text-xs font-semibold">/ vĩnh viễn</span>
                  </div>
                  <ul className="space-y-2.5 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                    {freeFeatures.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
                        <div className="w-5 h-5 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-gray-500" strokeWidth={2.5} />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {subscription === 'free' ? (
                  <div className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-400 rounded-md font-bold text-xs text-center">
                    Gói hiện tại của bạn
                  </div>
                ) : (
                  <button
                    onClick={handleDowngrade}
                    disabled={submitting}
                    className="w-full py-3 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 text-gray-600 dark:text-gray-300 rounded-md font-bold text-xs transition-all duration-200 hover:scale-[1.02]"
                  >
                    {submitting ? 'Đang xử lý...' : 'Hủy gói Pro (về Free)'}
                  </button>
                )}
              </div>

              {/* Pro Plan */}
              <div className="bg-[#E63946] rounded-lg p-6 flex flex-col justify-between space-y-6 relative overflow-hidden group cursor-default transition-all duration-300 hover:scale-[1.01]">
                {/* Geometric decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-10 -translate-y-10" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rotate-45 -translate-x-8 translate-y-8" />

                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Được yêu thích nhất</p>
                      <h3 className="font-extrabold text-white text-xl flex items-center gap-2">
                        <Crown className="w-5 h-5 text-amber-300" /> Pro
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">230.000đ</span>
                    <span className="text-white/60 text-xs font-semibold">/ tháng</span>
                  </div>

                  <ul className="space-y-2.5 pt-4 border-t-2 border-white/20">
                    {proFeatures.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-white/90">
                        <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative">
                  {subscription === 'pro' ? (
                    <div className="w-full py-3.5 bg-white/20 text-white rounded-md font-bold text-xs text-center flex items-center justify-center gap-2">
                      <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                      Bạn đang dùng Pro ✓
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      disabled={submitting}
                      className="w-full h-14 bg-white text-[#E63946] hover:bg-gray-100 rounded-md font-extrabold text-sm transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      Nâng cấp Pro ngay
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Payment methods info */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-[#E63946] flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">MoMo</p>
                  <p className="text-[10px] text-gray-400 font-semibold">0937219976</p>
                </div>
              </div>
              <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-gray-700" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">MB Bank</p>
                  <p className="text-[10px] text-gray-400 font-semibold">STK: 0937219976</p>
                </div>
              </div>
              <div className="sm:ml-auto text-[10px] text-gray-400 font-semibold leading-relaxed">
                Hỗ trợ 2 phương thức thanh toán.<br />
                Kích hoạt ngay sau khi xác nhận.
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
