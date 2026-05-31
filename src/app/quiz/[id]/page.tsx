// src/app/quiz/[id]/page.tsx
'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/sidebar'
import { Award, CheckCircle, ChevronLeft, ChevronRight, HelpCircle, ArrowLeft, RotateCcw, Heart, Zap, Bookmark } from 'lucide-react'
import BaoBaoMascot from '@/components/mascot'

interface Question {
  id: string
  questionText: string
  questionType: string
  options: string[] // Parsed as array
  correctAnswer: string
}

interface QuizData {
  id: string
  title: string
  description: string
  questions: Question[]
}

interface WordBubble {
  id: string
  text: string
  used: boolean
}

export default function QuizRunner({ params }: { params: Promise<{ id: string }> }) {
  const { id: quizId } = use(params)
  const router = useRouter()
  
  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  
  // User profile and hearts state
  const [hearts, setHearts] = useState<number>(5)
  const [subscription, setSubscription] = useState<string>('free')

  // Quiz progress states
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Duolingo Check/Continue loop states
  const [checked, setChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [mascotState, setMascotState] = useState<'neutral' | 'correct' | 'wrong' | 'exhausted'>('neutral')

  // Sentence Builder states
  const [assembledWords, setAssembledWords] = useState<{ id: string; text: string }[]>([])
  const [wordPool, setWordPool] = useState<WordBubble[]>([])
  
  // Results states
  const [score, setScore] = useState(0)
  const [maxScore, setMaxScore] = useState(0)
  const [recommendation, setRecommendation] = useState('')
  const [xpAwarded, setXpAwarded] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  // Fetch quiz details on mount
  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await fetch(`/api/quizzes/${quizId}/submit`)
        if (res.ok) {
          const data = await res.json()
          setQuiz(data.quiz)
        }
      } catch (err) {
        console.error('Error fetching quiz:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchQuiz()
  }, [quizId])

  // Fetch hearts on mount
  const fetchHearts = async () => {
    try {
      const res = await fetch('/api/profile/hearts')
      if (res.ok) {
        const data = await res.json()
        setHearts(data.hearts)
        setSubscription(data.subscription)
        if (data.hearts <= 0 && data.subscription !== 'pro') {
          setMascotState('exhausted')
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchHearts()
  }, [])

  // Segment Chinese text into word bubbles for Sentence Builder
  const splitChineseIntoBubbles = (correct: string, options: string[]): string[] => {
    const cleanCorrect = correct.replace(/[\u3002\uff1f\uff0c\uff01\u3001\uff1b\uff1a\u201c\u201d]/g, '').trim()
    
    // Basic HSK 1-3 dictionary grouping
    const commonWords = [
      '爸爸', '妈妈', '老师', '学生', '医生', '谢谢', '再见', '喜欢', '学习', '汉语', 
      '虽然', 'base', '但是', '所以', '因为', '觉得', '苹果', '咖啡', '手机', '上学', '出门', 
      '北京人', '留学生', '家庭主妇', '大学生', '努力', '北京', '季节', '夏天', '冬天', 
      '下雪', '秋天', '河内', '喜欢'
    ]
    
    let temp = cleanCorrect
    const result: string[] = []
    
    while (temp.length > 0) {
      let matched = false
      for (const word of commonWords) {
        if (temp.startsWith(word)) {
          result.push(word)
          temp = temp.substring(word.length)
          matched = true
          break
        }
      }
      if (!matched) {
        result.push(temp[0])
        temp = temp.substring(1)
      }
    }
    
    // Add distractors from incorrect options
    const distractors: string[] = []
    options.forEach(opt => {
      if (opt === correct) return
      const cleanOpt = opt.replace(/[\u3002\uff1f\uff0c\uff01\u3001\uff1b\uff1a\u201c\u201d]/g, '').trim()
      for (const char of cleanOpt) {
        if (!result.includes(char) && !distractors.includes(char) && !/[\u3002\uff1f\uff0c\uff01\u3001\uff1b\uff1a\u201c\u201d]/g.test(char)) {
          distractors.push(char)
        }
      }
    })
    
    // Shuffle the pool of character segments
    return [...result, ...distractors.slice(0, 3)].sort(() => Math.random() - 0.5)
  }

  // Effect to initialize word pool when question changes
  useEffect(() => {
    if (!quiz) return
    const q = quiz.questions[currentIdx]
    if (!q) return

    const isBuilder = q.questionType === 'grammar' && /[\u4e00-\u9fa5]/.test(q.correctAnswer)
    
    if (isBuilder) {
      const pool = splitChineseIntoBubbles(q.correctAnswer, q.options)
      setWordPool(pool.map((w, index) => ({ id: `${w}-${index}`, text: w, used: false })))
      setAssembledWords([])
    } else {
      setWordPool([])
      setAssembledWords([])
    }
    
    setChecked(false)
    setIsCorrect(false)
    setMascotState(hearts <= 0 && subscription !== 'pro' ? 'exhausted' : 'neutral')
  }, [currentIdx, quiz])

  // TTS browser pronunciation helper
  const speakChinese = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'zh-CN'
      u.rate = 0.85
      window.speechSynthesis.speak(u)
    }
  }

  const handleSelectOption = (option: string) => {
    if (isSubmitted || checked) return
    const q = quiz?.questions[currentIdx]
    if (!q) return
    setSelectedAnswers(prev => ({ ...prev, [q.id]: option }))
  }

  const handleWordClick = (id: string, text: string) => {
    if (checked) return
    speakChinese(text)
    setWordPool(prev => prev.map(item => item.id === id ? { ...item, used: true } : item))
    setAssembledWords(prev => [...prev, { id, text }])
  }

  const handleUndoWord = (id: string) => {
    if (checked) return
    setWordPool(prev => prev.map(item => item.id === id ? { ...item, used: false } : item))
    setAssembledWords(prev => prev.filter(item => item.id !== id))
  }

  const handleClearSentence = () => {
    if (checked) return
    setWordPool(prev => prev.map(item => ({ ...item, used: false })))
    setAssembledWords([])
  }

  // Grade the answer instantly & handle hearts decrement
  const handleCheckAnswer = async () => {
    const q = quiz?.questions[currentIdx]
    if (!q) return
    
    const isBuilder = q.questionType === 'grammar' && /[\u4e00-\u9fa5]/.test(q.correctAnswer)

    let answerText = ""
    if (isBuilder) {
      const cleanAssembled = assembledWords.map(w => w.text).join('')
      const cleanCorrect = q.correctAnswer.replace(/[\u3002\uff1f\uff0c\uff01\u3001\uff1b\uff1a\u201c\u201d]/g, '').trim()
      
      if (cleanAssembled === cleanCorrect) {
        answerText = q.correctAnswer
      } else {
        answerText = cleanAssembled
      }
    } else {
      answerText = selectedAnswers[q.id] || ""
    }

    setSelectedAnswers(prev => ({ ...prev, [q.id]: answerText }))

    const correct = answerText === q.correctAnswer
    setIsCorrect(correct)
    setChecked(true)

    if (correct) {
      setMascotState('correct')
    } else {
      setMascotState('wrong')
      
      // Deduct Life Heart
      if (subscription !== 'pro') {
        try {
          const res = await fetch('/api/profile/hearts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'decrement' })
          })
          if (res.ok) {
            const data = await res.json()
            setHearts(data.hearts)
            if (data.hearts <= 0) {
              setMascotState('exhausted')
            }
          }
        } catch (err) {
          console.error(err)
        }
      }
    }
  }

  const handleContinue = () => {
    if (!quiz) return
    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx(prev => prev + 1)
    } else {
      handleSubmitQuiz()
    }
  }

  const handleSubmitQuiz = async () => {
    if (!quiz || submitting) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: selectedAnswers }),
      })

      if (res.ok) {
        const data = await res.json()
        setScore(data.score)
        setMaxScore(data.maxScore)
        setRecommendation(data.recommendation)
        setXpAwarded(data.pointsAwarded)
        setIsSubmitted(true)
      }
    } catch (err) {
      console.error('Quiz submission error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetakeQuiz = () => {
    setSelectedAnswers({})
    setIsSubmitted(false)
    setCurrentIdx(0)
    setScore(0)
    setRecommendation('')
    setXpAwarded(0)
    setChecked(false)
    setIsCorrect(false)
    setMascotState('neutral')
    fetchHearts()
  }

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-[#faf9f6] dark:bg-slate-950">
        <Sidebar />
        <main className="flex-1 flex flex-col items-center justify-center h-full min-h-[60vh] gap-3">
          <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-bold text-slate-400 animate-pulse">Đang tải đề kiểm tra...</p>
        </main>
      </div>
    )
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-[#faf9f6] dark:bg-slate-950">
        <Sidebar />
        <main className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <p className="text-slate-505 font-bold mb-4">Không tìm thấy bài kiểm tra này hoặc không có câu hỏi.</p>
          <button onClick={() => router.push('/roadmap')} className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold">
            Quay về Lộ trình
          </button>
        </main>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentIdx]
  if (!currentQuestion) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-[#faf9f6] dark:bg-slate-950">
        <Sidebar />
        <main className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <p className="text-slate-505 font-bold mb-4">Lỗi tải câu hỏi.</p>
          <button onClick={() => router.push('/roadmap')} className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold">
            Quay về Lộ trình
          </button>
        </main>
      </div>
    )
  }

  const isSentenceBuilder = currentQuestion.questionType === 'grammar' && /[\u4e00-\u9fa5]/.test(currentQuestion.correctAnswer)
  const isLastQuestion = currentIdx === quiz.questions.length - 1
  const isQuestionAnswered = isSentenceBuilder 
    ? assembledWords.length > 0 
    : selectedAnswers[currentQuestion.id] !== undefined

  // Translate HSK question types
  const translateType = (type: string) => {
    const map: Record<string, string> = {
      vocabulary: 'Từ vựng',
      grammar: 'Ngữ pháp',
      listening: 'Nghe hiểu',
      reading: 'Luyện đọc',
    }
    return map[type] || type
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#faf9f6] dark:bg-slate-950">
      <Sidebar />

      {/* Out of Hearts Modal Overlay */}
      {hearts <= 0 && subscription !== 'pro' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-rose-100/50 dark:border-slate-800 rounded-[2.5rem] p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative animate-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-100/10 flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-850 dark:text-white">Bạn đã hết Tim! 🥺</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Đừng lo lắng! Luyện tập từ vựng cũ giúp củng cố trí nhớ và nạp lại Tim sinh mệnh để tiếp tục các bài học mới. Hoặc nâng cấp lên gói Pro để mở khóa Tim vô hạn.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => router.push('/vocabulary')}
                className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bookmark className="w-4 h-4 fill-white" />
                Luyện tập hồi tim (Ôn Flashcard)
              </button>
              <button
                onClick={() => router.push('/upgrade')}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                Nâng cấp lên Pro (Tim vô hạn)
              </button>
              <button
                onClick={() => router.push('/roadmap')}
                className="w-full py-3.5 bg-slate-100 dark:bg-slate-850 hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-all cursor-pointer"
              >
                Quay lại lộ trình
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 p-4 md:p-8 max-w-3xl mx-auto w-full">
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Top Header stats info */}
          <div className="flex items-center justify-between pb-2 border-b border-rose-100/30 dark:border-slate-850">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
              Thoát thi
            </button>
            
            <div className="flex items-center gap-4">
              {/* Hearts status count inside top navbar */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-100/10 text-xs font-bold">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span>{subscription === 'pro' ? 'VÔ HẠN TIM' : `${hearts} TIM`}</span>
              </div>
              <span className="text-[10px] font-extrabold text-slate-400 border border-slate-150 dark:border-slate-800 px-2.5 py-1 rounded bg-slate-50 dark:bg-slate-900">
                QUIZ KIỂM TRA
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-xl font-extrabold text-slate-850 dark:text-slate-100 tracking-tight">{quiz.title}</h1>
            <p className="text-slate-450 dark:text-slate-500 text-xs mt-0.5">{quiz.description}</p>
          </div>

          {!isSubmitted ? (
            /* --- ACTIVE QUIZ RUNNER --- */
            <div className="space-y-6">
              {/* Question progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                  <span>Tiến trình kiểm tra</span>
                  <span className="font-bold text-rose-500">{currentIdx + 1} / {quiz.questions.length}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-350"
                    style={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Layout for Question + Mascot Bao Bao Side-by-Side */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                
                {/* Dynamic Mascot panel */}
                <div className="md:col-span-1 flex justify-center bg-white dark:bg-slate-900 border border-rose-100/20 dark:border-slate-800/80 rounded-3xl p-4 shadow-sm">
                  <BaoBaoMascot state={mascotState} size={90} />
                </div>

                {/* Main Question details */}
                <div className="md:col-span-3 bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-6 min-h-[260px] flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="inline-block text-[9px] font-extrabold text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded border border-rose-100/10 uppercase">
                        PHẦN: {translateType(currentQuestion.questionType)}
                      </span>
                    </div>

                    <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                      {currentQuestion.questionText}
                    </h2>

                    {/* Sentence Builder Interaction */}
                    {isSentenceBuilder ? (
                      <div className="space-y-4 pt-2">
                        {/* Selected Words slots */}
                        <div className="p-3.5 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl min-h-[56px] flex flex-wrap gap-2 items-center bg-slate-50/50 dark:bg-slate-950">
                          {assembledWords.length === 0 ? (
                            <span className="text-slate-400 dark:text-slate-655 text-xs italic">
                              Chạm các mảnh từ bên dưới để xếp câu hoàn chỉnh...
                            </span>
                          ) : (
                            assembledWords.map((word) => (
                              <button
                                key={word.id}
                                disabled={checked}
                                onClick={() => handleUndoWord(word.id)}
                                className="px-3 py-1.5 bg-rose-500 text-white rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
                              >
                                {word.text}
                              </button>
                            ))
                          )}

                          {assembledWords.length > 0 && !checked && (
                            <button
                              onClick={handleClearSentence}
                              className="ml-auto text-[10px] font-extrabold text-slate-400 hover:text-rose-500 transition-colors uppercase cursor-pointer"
                            >
                              Xóa hết
                            </button>
                          )}
                        </div>

                        {/* Words Pool bubbles */}
                        <div className="flex flex-wrap gap-2.5 pt-2 justify-center">
                          {wordPool.map((word) => (
                            <button
                              key={word.id}
                              disabled={word.used || checked}
                              onClick={() => handleWordClick(word.id, word.text)}
                              className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all shadow-sm ${
                                word.used
                                  ? 'bg-slate-100 dark:bg-slate-850 text-transparent border-transparent select-none cursor-default shadow-none opacity-20'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-755 dark:text-slate-300 hover:border-rose-400 dark:hover:border-rose-800 active:scale-95 cursor-pointer'
                              }`}
                            >
                              {word.text}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Traditional Multiple Choice options */
                      <div className="grid grid-cols-1 gap-2.5 pt-2">
                        {currentQuestion.options.map((opt) => {
                          const isSelected = selectedAnswers[currentQuestion.id] === opt
                          return (
                            <button
                              key={opt}
                              type="button"
                              disabled={checked}
                              onClick={() => handleSelectOption(opt)}
                              className={`w-full p-3.5 text-left border rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450'
                                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-650 dark:text-slate-400'
                              }`}
                            >
                              <span>{opt}</span>
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                                isSelected
                                  ? 'border-rose-500 bg-rose-500 text-white'
                                  : 'border-slate-300 dark:border-slate-700'
                              }`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Duolingo style Bottom Feedback Banner */}
              {checked ? (
                <div className={`p-5 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom duration-250 ${
                  isCorrect
                    ? 'bg-emerald-500/10 border-emerald-500/20 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450'
                    : 'bg-rose-500/10 border-rose-500/20 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl leading-none">
                      {isCorrect ? '🎉' : '🥺'}
                    </span>
                    <div className="text-left">
                      <p className="font-extrabold text-sm">{isCorrect ? 'Chính xác! Làm tốt lắm.' : 'Chưa chính xác.'}</p>
                      {!isCorrect && (
                        <p className="text-xs font-semibold mt-1">
                          Đáp án đúng: <code className="bg-white/40 dark:bg-black/30 px-1.5 py-0.5 rounded font-mono font-bold">{currentQuestion.correctAnswer}</code>
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleContinue}
                    className={`px-8 py-3 rounded-2xl text-xs font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer ${
                      isCorrect ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'
                    }`}
                  >
                    {isLastQuestion ? 'Xem kết quả' : 'Tiếp tục'}
                  </button>
                </div>
              ) : (
                /* Pre-check button layout */
                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx(prev => prev - 1)}
                    className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <ChevronLeft className="w-4.5 h-4.5" />
                    Câu trước
                  </button>

                  <button
                    type="button"
                    disabled={!isQuestionAnswered}
                    onClick={handleCheckAnswer}
                    className="px-8 py-3 bg-rose-500 disabled:opacity-40 text-white rounded-2xl text-xs font-bold hover:bg-rose-600 transition-all flex items-center gap-1.5 shadow-md shadow-rose-500/10 cursor-pointer"
                  >
                    Kiểm tra
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* --- RESULTS REPORT SCREEN --- */
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              <div className="bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 p-8 rounded-3xl shadow-sm text-center space-y-6">
                <div className="inline-flex p-4 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 animate-bounce">
                  <CheckCircle className="w-12 h-12" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Bài thi đã hoàn tất!</h2>
                  <p className="text-xs text-slate-400">Kết quả thi được tính điểm tự động.</p>
                </div>

                {/* Score counters */}
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-slate-950 border border-rose-100/10">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">ĐIỂM SỐ ĐẠT</span>
                    <span className="block text-2xl font-black text-rose-500 mt-1">{score} / {maxScore}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-slate-950 border border-emerald-100/10">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">XP NHẬN ĐƯỢC</span>
                    <span className="block text-2xl font-black text-emerald-500 mt-1">+{xpAwarded} XP</span>
                  </div>
                </div>

                {/* AI / Simple Recommendations Panel */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-left space-y-1">
                  <span className="block text-[8px] font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                    <Award className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Gợi ý ôn tập từ giáo viên
                  </span>
                  <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed">
                    {recommendation}
                  </p>
                </div>

                {/* Result buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleRetakeQuiz}
                    className="flex-1 py-3 bg-white dark:bg-slate-900 border border-rose-250 dark:border-rose-900 text-rose-500 font-bold rounded-2xl text-xs hover:bg-rose-50/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Thi lại bài này
                  </button>
                  <button
                    onClick={() => router.push('/roadmap')}
                    className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-2xl text-xs hover:bg-rose-600 shadow-md shadow-rose-500/10 transition-colors cursor-pointer"
                  >
                    Quay lại Lộ trình
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
