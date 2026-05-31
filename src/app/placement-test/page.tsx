// src/app/placement-test/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Brain, ArrowRight, Check, Award, Compass, RefreshCw } from 'lucide-react'

interface Question {
  questionText: string
  options: string[]
  correctAnswer: string
  level: number
}

const QUESTIONS: Question[] = [
  {
    questionText: 'Từ nào sau đây có nghĩa là "Chào bạn / Xin chào"?',
    options: ['谢谢 (xièxie)', '再见 (zàijiàn)', '你好 (nǐ hǎo)', '老师 (lǎoshī)'],
    correctAnswer: '你好 (nǐ hǎo)',
    level: 1
  },
  {
    questionText: 'Trong câu "这是我的苹果", từ "我的" (wǒ de) có nghĩa là gì?',
    options: ['Của tôi', 'Của bạn', 'Của cô ấy', 'Bác sĩ'],
    correctAnswer: 'Của tôi',
    level: 1
  },
  {
    questionText: 'Chữ Hán "生病" (shēngbìng) có nghĩa là gì?',
    options: ['Sinh nhật', 'Mệt mỏi', 'Ốm, bị bệnh', 'Khỏe mạnh'],
    correctAnswer: 'Ốm, bị bệnh',
    level: 2
  },
  {
    questionText: 'Từ trái nghĩa với "便宜" (piányi - rẻ) trong tiếng Trung là từ nào?',
    options: ['贵 (guì)', '晴 (qíng)', '阴 (yīn)', '雪 (xuě)'],
    correctAnswer: '贵 (guì)',
    level: 2
  },
  {
    questionText: 'Để viết câu so sánh "Tôi cao hơn bạn", câu nào sau đây là đúng ngữ pháp?',
    options: ['我比你高。 (Wǒ bǐ nǐ gāo)', '我你比高。 (Wǒ nǐ bǐ gāo)', '我高比你。 (Wǒ gāo bǐ nǐ)', '比我高你。 (Bǐ wǒ gāo nǐ)'],
    correctAnswer: '我比你高。 (Wǒ bǐ nǐ gāo)',
    level: 2
  },
  {
    questionText: 'Chữ Hán "汉语" (Hànyǔ) dịch sang tiếng Việt có nghĩa là gì?',
    options: ['Tiếng Anh', 'Tiếng Hàn Quốc', 'Tiếng Trung Quốc', 'Tiếng Nhật Bản'],
    correctAnswer: 'Tiếng Trung Quốc',
    level: 3
  },
  {
    questionText: 'Từ "打算" (dǎsuan) có nghĩa tiếng Việt là gì?',
    options: ['Dự định, kế hoạch', 'Tính toán số liệu', 'Đóng cửa, dọn dẹp', 'Tập thể dục'],
    correctAnswer: 'Dự định, kế hoạch',
    level: 3
  },
  {
    questionText: 'Cặp liên từ "虽然...但是..." (suīrán... dànshì...) có nghĩa là gì?',
    options: ['Nếu... thì...', 'Tuy... nhưng...', 'Bởi vì... cho nên...', 'Không những... mà còn...'],
    correctAnswer: 'Tuy... nhưng...',
    level: 3
  },
  {
    questionText: 'Từ "关键" (guānjiàn) trong tiếng Trung có nghĩa là gì?',
    options: ['Quan hệ', 'Mẫu chốt, then chốt', 'Khách quan', 'Đóng cửa'],
    correctAnswer: 'Mấu chốt, then chốt',
    level: 4
  },
  {
    questionText: 'Từ "Đóng cửa, phá sản, ngưng hoạt động" của một doanh nghiệp là?',
    options: ['招聘 (zhāopìn)', '顺利 (shùnlì)', '倒闭 (dǎobì)', '申请 (shēnqǐng)'],
    correctAnswer: '倒闭 (dǎobì)',
    level: 4
  }
]

export default function PlacementTest() {
  const router = useRouter()
  const [step, setStep] = useState<'welcome' | 'testing' | 'finished'>('welcome')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAns, setSelectedAns] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [recommendedLevel, setRecommendedLevel] = useState<number>(1)

  const handleStart = () => {
    setScore(0)
    setCurrentIdx(0)
    setSelectedAns(null)
    setStep('testing')
  }

  const handleSelectAnswer = (option: string) => {
    if (selectedAns !== null) return
    setSelectedAns(option)
    const isCorrect = option === QUESTIONS[currentIdx].correctAnswer
    if (isCorrect) {
      setScore(prev => prev + 1)
    }

    setTimeout(() => {
      if (currentIdx < QUESTIONS.length - 1) {
        setCurrentIdx(prev => prev + 1)
        setSelectedAns(null)
      } else {
        // Evaluate level and submit scores
        const finalScore = score + (isCorrect ? 1 : 0)
        handleSubmitResults(finalScore)
      }
    }, 1000)
  }

  const handleSubmitResults = async (finalScore: number) => {
    setStep('finished')
    setSubmitting(true)
 
    try {
      const res = await fetch('/api/placement-test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: finalScore,
          totalQuestions: QUESTIONS.length
        })
      })

      if (res.ok) {
        const data = await res.json()
        setRecommendedLevel(data.recommendedLevel)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmLevel = () => {
    router.push('/dashboard')
    router.refresh()
  }

  return (
    // Forced bright background to look like a clean white paper quiz sheet
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#faf9f6] px-4 py-12 select-none">
      {/* Brand logo header */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-rose-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-rose-300/35">
          H
        </div>
        <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-rose-500 to-orange-400 bg-clip-text text-transparent">
          HanziFlow
        </span>
      </div>

      {step === 'welcome' && (
        /* WELCOME CARD */
        <div className="w-full max-w-xl bg-white border border-rose-100/40 rounded-[2.5rem] p-8 md:p-10 shadow-xl space-y-6 text-center animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100/10">
            <Compass className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-800">Kiểm tra Trình độ Đầu vào</h1>
            <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Hãy hoàn thành 10 câu hỏi nhanh để HanziFlow xác định trình độ và đề xuất lộ trình học HSK phù hợp nhất với bạn.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-55 text-left text-xs font-semibold text-slate-600 space-y-3">
            <p className="flex items-start gap-2">
              <span className="text-rose-500">✓</span>
              <span>10 câu trắc nghiệm nhanh bao gồm Ngữ pháp, Từ vựng, Đọc hiểu.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-rose-500">✓</span>
              <span>Cấp độ tăng dần từ HSK 1 đến HSK 4.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-rose-500">✓</span>
              <span>Thời gian làm bài ước lượng: 3 - 5 phút.</span>
            </p>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 bg-gradient-to-r from-rose-500 to-orange-400 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/20 hover:shadow-rose-500/35 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 group"
          >
            Bắt đầu kiểm tra
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {step === 'testing' && (
        /* TESTING SCREEN */
        <div className="w-full max-w-xl bg-white border border-rose-100/40 rounded-[2.5rem] p-6 md:p-8 shadow-xl space-y-6 animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400">
            <span>Bài kiểm tra đầu vào (Placement Test)</span>
            <span className="text-rose-500">Câu {currentIdx + 1} / {QUESTIONS.length}</span>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-rose-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / QUESTIONS.length) * 100}%` }}
            />
          </div>

          <div className="py-6 text-center space-y-3">
            <span className="inline-block text-[9px] font-extrabold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md uppercase tracking-wider">Trình độ câu hỏi: HSK {QUESTIONS[currentIdx].level}</span>
            <h2 className="text-lg md:text-xl font-black text-slate-800 leading-snug">
              {QUESTIONS[currentIdx].questionText}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {QUESTIONS[currentIdx].options.map((option, idx) => {
              const isSelected = selectedAns === option
              const isCorrect = option === QUESTIONS[currentIdx].correctAnswer
              const hasChosen = selectedAns !== null

              let buttonStyle = 'bg-slate-50 hover:bg-rose-50/50 border-slate-200 text-slate-800'
              let checkIcon = null

              if (hasChosen) {
                if (isCorrect) {
                  buttonStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-600 font-extrabold'
                  checkIcon = <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                } else if (isSelected) {
                  buttonStyle = 'bg-rose-500/10 border-rose-500 text-rose-600 font-extrabold'
                  checkIcon = <span className="text-rose-500 shrink-0">✗</span>
                } else {
                  buttonStyle = 'opacity-30 border-slate-200 text-slate-450'
                }
              }

              return (
                <button
                  key={idx}
                  disabled={hasChosen}
                  onClick={() => handleSelectAnswer(option)}
                  className={`w-full p-4 border text-left text-sm font-bold rounded-2xl flex justify-between items-center transition-all duration-200 ${buttonStyle}`}
                >
                  <span className="leading-relaxed">{option}</span>
                  {checkIcon}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {step === 'finished' && (
        /* FINISHED SCREEN */
        <div className="w-full max-w-xl bg-white border border-rose-100/40 rounded-[2.5rem] p-8 md:p-10 shadow-xl space-y-6 text-center animate-in zoom-in duration-300">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto border border-amber-100/10">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-800">Đã hoàn thành đánh giá!</h1>
            <p className="text-sm text-slate-400">
              Cảm ơn bạn đã nỗ lực làm bài. Hệ thống đã đánh giá và phân loại lộ trình học phù hợp.
            </p>
          </div>

          {submitting ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
              <p className="text-xs font-bold text-slate-400">Đang lưu kết quả và tính toán trình độ...</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kết quả của bạn</span>
                  <span className="text-3xl font-black text-slate-800">{score} / {QUESTIONS.length}</span>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lộ trình đề xuất</span>
                  <span className="text-3xl font-black text-rose-500">HSK {recommendedLevel}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100/10 text-xs leading-relaxed text-slate-550">
                💡 **Gợi ý học tập:** HanziFlow đã cấu hình hệ thống Dashboard của bạn để ưu tiên hiển thị các bài học và từ vựng thuộc **Giai đoạn HSK {recommendedLevel}**. Bạn có thể điều chỉnh trình độ này bất cứ lúc nào trong cài đặt Hồ sơ cá nhân.
              </div>

              <button
                onClick={handleConfirmLevel}
                className="w-full py-4 bg-gradient-to-r from-rose-500 to-orange-400 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/20 hover:shadow-rose-500/35 transition-all hover:scale-[1.01] flex items-center justify-center gap-1.5"
              >
                Bắt đầu học ngay với HSK {recommendedLevel}
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
