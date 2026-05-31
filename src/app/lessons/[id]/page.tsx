// src/app/lessons/[id]/page.tsx
'use client'

import { useState, useEffect, useRef, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/sidebar'
import {
  BookOpen,
  Volume2,
  FileText,
  Headphones,
  Mic,
  PenTool,
  CheckCircle,
  Eye,
  EyeOff,
  Square,
  ChevronRight,
  Award,
  ArrowLeft,
  VolumeX,
  Play,
  ArrowRight
} from 'lucide-react'

interface Vocabulary {
  id: string
  character: string
  pinyin: string
  meaningVi: string
  exampleZh: string
  exampleVi: string
}

interface Grammar {
  id: string
  title: string
  formula: string
  explanationVi: string
  example1Zh: string
  example1Vi: string
  example2Zh: string
  example2Vi: string
  example3Zh: string
  example3Vi: string
}

interface Listening {
  id: string
  title: string
  audioUrl: string
  transcriptZh: string
  pinyin: string
  meaningVi: string
  questions: string // JSON
}

interface Reading {
  id: string
  title: string
  contentZh: string
  translationVi: string
  questions: string // JSON
}

interface Speaking {
  id: string
  title: string
  prompt: string
  prepTime: number
  recordTime: number
}

interface Writing {
  id: string
  title: string
  prompt: string
  minWords: number
  checklist: string // JSON
}

interface LessonData {
  id: string
  title: string
  description: string
  level: number
  vocabularies: Vocabulary[]
  grammars: Grammar[]
  listening: Listening | null
  reading: Reading | null
  speaking: Speaking | null
  writing: Writing | null
  quizzes: { id: string; title: string }[]
}

export default function LessonDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: lessonId } = use(params)
  const router = useRouter()
  const [data, setData] = useState<LessonData | null>(null)
  const [isLessonCompleted, setIsLessonCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'vocab' | 'grammar' | 'listening' | 'reading' | 'speaking' | 'writing'>('vocab')

  // Award notifications
  const [awardXp, setAwardXp] = useState<number | null>(null)

  // Fetch lesson details
  useEffect(() => {
    async function fetchLesson() {
      try {
        const res = await fetch(`/api/lessons/${lessonId}`)
        if (res.ok) {
          const json = await res.json()
          setData(json.lesson)
          setIsLessonCompleted(json.isCompleted)
        }
      } catch (err) {
        console.error('Error fetching lesson:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLesson()
  }, [lessonId])

  // Complete lesson API call
  const handleCompleteLesson = async () => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}/complete`, { method: 'POST' })
      if (res.ok) {
        const resJson = await res.json()
        setIsLessonCompleted(true)
        setAwardXp(50)
        setTimeout(() => {
          setAwardXp(null)
          router.push('/roadmap')
        }, 2000)
      }
    } catch (err) {
      console.error('Error completing lesson:', err)
    }
  }

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

  // Sub-module components
  const VocabPanel = () => {
    if (!data?.vocabularies || data.vocabularies.length === 0) return <EmptyState text="Không có từ vựng nào cho bài học này." />
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.vocabularies.map((vocab) => (
            <div
              key={vocab.id}
              className="bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 p-5 rounded-3xl shadow-sm space-y-4 hover:shadow-md transition-shadow relative group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 font-sans tracking-tight">
                    {vocab.character}
                  </h3>
                  <p className="text-sm font-bold text-rose-500 mt-1">{vocab.pinyin}</p>
                </div>
                <button
                  onClick={() => speakChinese(vocab.character)}
                  className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-500 hover:scale-105 active:scale-95 transition-all"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              <div>
                <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Nghĩa tiếng Việt</span>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{vocab.meaningVi}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/20 dark:bg-slate-950 border border-rose-100/10 dark:border-slate-850 space-y-1">
                <span className="block text-[8px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Ví dụ</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans">{vocab.exampleZh}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{vocab.exampleVi}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const GrammarPanel = () => {
    if (!data?.grammars || data.grammars.length === 0) return <EmptyState text="Không có ngữ pháp nào cho bài học này." />
    return (
      <div className="space-y-6">
        {data.grammars.map((gram) => (
          <div
            key={gram.id}
            className="bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-4"
          >
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{gram.title}</h3>
              <span className="inline-block text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-md border border-amber-100/10 mt-1.5">
                {gram.formula}
              </span>
            </div>

            <div>
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Giải thích cấu trúc</span>
              <p className="text-xs text-slate-650 dark:text-slate-300 font-semibold leading-relaxed">
                {gram.explanationVi}
              </p>
            </div>

            <div className="space-y-2">
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Câu ví dụ</span>
              {[
                { zh: gram.example1Zh, vi: gram.example1Vi },
                { zh: gram.example2Zh, vi: gram.example2Vi },
                { zh: gram.example3Zh, vi: gram.example3Vi }
              ].map((ex, idx) => (
                <div key={idx} className="p-3.5 bg-rose-50/10 dark:bg-slate-950 border border-rose-100/10 dark:border-slate-850 rounded-2xl flex justify-between items-center">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 font-sans">{ex.zh}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-450">{ex.vi}</p>
                  </div>
                  <button
                    onClick={() => speakChinese(ex.zh)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const ListeningPanel = () => {
    const listen = data?.listening
    const [isPlaying, setIsPlaying] = useState(false)
    const [showTranscript, setShowTranscript] = useState(false)
    const [audioProgress, setAudioProgress] = useState(0)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    if (!listen) return <EmptyState text="Bài học này chưa cấu hình nội dung Luyện nghe." />

    // Mock Audio Player Simulation
    const handleTogglePlay = () => {
      if (isPlaying) {
        setIsPlaying(false)
        if (timerRef.current) clearInterval(timerRef.current)
      } else {
        setIsPlaying(true)
        // Speak transcript using TTS as mock audio or tick timer
        speakChinese(listen.transcriptZh)
        timerRef.current = setInterval(() => {
          setAudioProgress(prev => {
            if (prev >= 100) {
              setIsPlaying(false)
              if (timerRef.current) clearInterval(timerRef.current)
              return 0
            }
            return prev + 10
          })
        }, 1000)
      }
    }

    // Clean timer on unmount
    useEffect(() => {
      return () => {
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }, [])

    return (
      <div className="bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-black text-slate-850 dark:text-slate-100">{listen.title}</h2>
          <p className="text-slate-400 text-xs mt-0.5">Bấm phát âm thanh để nghe đoạn hội thoại ngắn.</p>
        </div>

        {/* Custom audio player block */}
        <div className="p-4 rounded-2xl bg-rose-50/30 dark:bg-slate-950 border border-rose-100/10 dark:border-slate-850 flex items-center gap-4">
          <button
            onClick={handleTogglePlay}
            className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors"
          >
            {isPlaying ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>
          
          <div className="flex-1 space-y-1">
            <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              {isPlaying ? 'ĐANG PHÁT AUDIO' : 'AUDIO CHỜ'}
            </span>
            <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${audioProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dictation / Transcript sheet */}
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-extrabold text-slate-500">Bản phụ đề ghi âm (Transcript)</h3>
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="text-xs font-bold text-rose-500 flex items-center gap-1 hover:underline"
            >
              {showTranscript ? (
                <>
                  <EyeOff className="w-4 h-4" /> Ẩn phụ đề
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" /> Hiện phụ đề
                </>
              )}
            </button>
          </div>

          {showTranscript ? (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 space-y-4 animate-in fade-in duration-200">
              <div>
                <span className="block text-[8px] font-bold text-slate-400 mb-1">CHỮ HÁN</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 font-sans leading-relaxed whitespace-pre-line">
                  {listen.transcriptZh}
                </p>
              </div>
              <div>
                <span className="block text-[8px] font-bold text-slate-400 mb-1">PINYIN</span>
                <p className="text-xs text-rose-500 font-semibold whitespace-pre-line leading-relaxed">
                  {listen.pinyin}
                </p>
              </div>
              <div>
                <span className="block text-[8px] font-bold text-slate-400 mb-1">DỊCH NGHĨA</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-pre-line leading-relaxed font-semibold">
                  {listen.meaningVi}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-28 border border-dashed border-rose-100/40 dark:border-slate-850 rounded-2xl flex items-center justify-center text-xs font-semibold text-slate-400">
              Phụ đề đã ẩn. Hãy tập chép chính tả những gì nghe được!
            </div>
          )}
        </div>
      </div>
    )
  }

  const ReadingPanel = () => {
    const read = data?.reading
    const [showTranslation, setShowTranslation] = useState(false)
    const [selectedTooltip, setSelectedTooltip] = useState<{ word: string; pinyin: string; mean: string } | null>(null)

    if (!read) return <EmptyState text="Bài học này chưa cấu hình nội dung Luyện đọc." />

    // Hover Glossary dictionary mapping for seeded readings
    const dictionary: Record<string, { pinyin: string; mean: string }> = {
      '王老师': { pinyin: 'Wáng lǎoshī', mean: 'Thầy giáo Vương' },
      '老师': { pinyin: 'lǎoshī', mean: 'Giáo viên, thầy cô' },
      '汉语': { pinyin: 'Hànyǔ', mean: 'Tiếng Trung' },
      '北京人': { pinyin: 'Běijīng rén', mean: 'Người Bắc Kinh' },
      '留学生': { pinyin: 'liúxuéshēng', mean: 'Du học sinh' },
      '小明': { pinyin: 'Xiǎo Míng', mean: 'Tiểu Minh (Tên riêng)' },
      '家庭主妇': { pinyin: 'jiātíng zhǔfù', mean: 'Nội trợ gia đình' },
      '大学生': { pinyin: 'dàxuéshēng', mean: 'Sinh viên đại học' },
      '努力': { pinyin: 'nǔlì', mean: 'Nỗ lực, chăm chỉ' },
      '北京': { pinyin: 'Běijīng', mean: 'Bắc Kinh' },
      '季节': { pinyin: 'jìjié', mean: 'Mùa trong năm' },
      '夏天': { pinyin: 'xiàtiān', mean: 'Mùa hè' },
      '冬天': { pinyin: 'dōngtiān', mean: 'Mùa đông' },
      '下雪': { pinyin: 'xiàxuě', mean: 'Tuyết rơi' },
      '秋ten': { pinyin: 'qiūtiān', mean: 'Mùa thu' },
      '秋天': { pinyin: 'qiūtiān', mean: 'Mùa thu' }
    }

    // Wrap hover-glossary keywords in reading content text
    const renderContentWithGlossary = (text: string) => {
      const words = Object.keys(dictionary)
      // Sort words by length descending to match longer strings first
      words.sort((a, b) => b.length - a.length)

      let parts: React.ReactNode[] = [text]

      words.forEach(word => {
        const nextParts: React.ReactNode[] = []
        parts.forEach(part => {
          if (typeof part === 'string') {
            const regex = new RegExp(`(${word})`, 'g')
            const splits = part.split(regex)
            splits.forEach((split, idx) => {
              if (split === word) {
                const dictEntry = dictionary[word]
                nextParts.push(
                  <span
                    key={`${word}-${idx}`}
                    onMouseEnter={() => setSelectedTooltip({ word, ...dictEntry })}
                    onMouseLeave={() => setSelectedTooltip(null)}
                    className="relative group cursor-help underline decoration-dotted decoration-rose-400 font-bold text-rose-600 dark:text-rose-400"
                  >
                    {word}
                  </span>
                )
              } else {
                nextParts.push(split)
              }
            })
          } else {
            nextParts.push(part)
          }
        })
        parts = nextParts
      })

      return parts
    }

    return (
      <div className="bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-6 relative">
        {/* Floating Glossary Tooltip */}
        {selectedTooltip && (
          <div className="absolute top-2 right-6 bg-slate-800 text-white dark:bg-slate-950 dark:text-slate-100 text-xs px-4 py-2.5 rounded-2xl shadow-lg border border-slate-700/60 z-20 animate-in fade-in duration-150">
            <span className="block text-[8px] font-black text-rose-400 tracking-wider">TỪ ĐIỂN NHANH</span>
            <p className="font-bold text-sm">{selectedTooltip.word}</p>
            <p className="text-rose-350 italic mt-0.5">{selectedTooltip.pinyin}</p>
            <p className="text-slate-300 font-semibold mt-1">{selectedTooltip.mean}</p>
          </div>
        )}

        <div>
          <h2 className="text-lg font-black text-slate-850 dark:text-slate-100">{read.title}</h2>
          <p className="text-slate-400 text-xs mt-0.5">Rê chuột vào các từ gạch chân màu đỏ để xem nghĩa nhanh.</p>
        </div>

        {/* Reading text block */}
        <div className="p-6 rounded-2xl bg-rose-50/10 dark:bg-slate-950 border border-rose-100/10 dark:border-slate-850">
          <p className="text-base sm:text-lg text-slate-800 dark:text-slate-200 leading-loose font-sans tracking-wide">
            {renderContentWithGlossary(read.contentZh)}
          </p>
        </div>

        {/* Translation reveal button */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-extrabold text-slate-500">Dịch nghĩa văn bản</h3>
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className="text-xs font-bold text-rose-500 flex items-center gap-1 hover:underline"
            >
              {showTranslation ? 'Ẩn bản dịch' : 'Xem bản dịch tiếng Việt'}
            </button>
          </div>

          {showTranslation && (
            <p className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-xs leading-relaxed text-slate-600 dark:text-slate-350 font-semibold animate-in fade-in duration-200">
              {read.translationVi}
            </p>
          )}
        </div>
      </div>
    )
  }

  const SpeakingPanel = () => {
    const speak = data?.speaking
    const [isRecording, setIsRecording] = useState(false)
    const [prepTimer, setPrepTimer] = useState<number | null>(null)
    const [recordTimer, setRecordTimer] = useState<number | null>(null)
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
    const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null)
    const [audioChunks, setAudioChunks] = useState<Blob[]>([])

    // Self-evaluation checklist ratings (1 to 5 stars)
    const [selfPron, setSelfPron] = useState(3)
    const [selfTone, setSelfTone] = useState(3)
    const [selfFluency, setSelfFluency] = useState(3)
    const [selfVocab, setSelfVocab] = useState(3)
    const [feedbackSaved, setFeedbackSaved] = useState(false)

    const prepTimerRef = useRef<NodeJS.Timeout | null>(null)
    const recordTimerRef = useRef<NodeJS.Timeout | null>(null)

    if (!speak) return <EmptyState text="Bài học này chưa cấu hình Luyện nói HSKK." />

    // Preparation countdown timer trigger
    const startPrepTimer = () => {
      setPrepTimer(speak.prepTime)
      prepTimerRef.current = setInterval(() => {
        setPrepTimer(prev => {
          if (prev !== null && prev <= 1) {
            clearInterval(prepTimerRef.current!)
            startRecording() // auto start recording when prep timer finishes
            return null
          }
          return prev !== null ? prev - 1 : null
        })
      }, 1000)
    }

    // Microphone Recording logic using browser mediaDevices
    const startRecording = async () => {
      setPrepTimer(null)
      setIsRecording(true)
      setAudioBlobUrl(null)
      setAudioChunks([])
      setRecordTimer(speak.recordTime)

      // Start record timer countdown
      recordTimerRef.current = setInterval(() => {
        setRecordTimer(prev => {
          if (prev !== null && prev <= 1) {
            stopRecording()
            return null
          }
          return prev !== null ? prev - 1 : null
        })
      }, 1000)

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const recorder = new MediaRecorder(stream)
        setMediaRecorder(recorder)

        const chunks: Blob[] = []
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data)
        }

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' })
          const blobUrl = URL.createObjectURL(blob)
          setAudioBlobUrl(blobUrl)
          // Stop all stream tracks to release microphone
          stream.getTracks().forEach(track => track.stop())
        }

        recorder.start()
      } catch (err) {
        console.warn('Microphone access denied or not supported. Using simulation mode.')
      }
    }

    const stopRecording = () => {
      setIsRecording(false)
      setRecordTimer(null)
      if (recordTimerRef.current) clearInterval(recordTimerRef.current)

      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop()
      } else {
        // Fallback simulation URL if mic access is missing
        setAudioBlobUrl('/audio/simulated_recording.mp3')
      }
    }

    const saveSelfEvaluation = () => {
      setFeedbackSaved(true)
      // Award XP
      setAwardXp(15)
      setTimeout(() => setAwardXp(null), 1500)
    }

    // Cleanup timers
    useEffect(() => {
      return () => {
        if (prepTimerRef.current) clearInterval(prepTimerRef.current)
        if (recordTimerRef.current) clearInterval(recordTimerRef.current)
      }
    }, [])

    return (
      <div className="bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-black text-slate-850 dark:text-slate-100">{speak.title}</h2>
          <p className="text-slate-400 text-xs mt-0.5">Luyện nói chuẩn HSKK với ghi âm mic trực tiếp trên trình duyệt.</p>
        </div>

        {/* Speak Prompt text */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 space-y-1">
          <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">CÂU HỎI HSKK</span>
          <p className="text-sm font-bold text-slate-850 dark:text-slate-150 whitespace-pre-line leading-relaxed">
            {speak.prompt}
          </p>
        </div>

        {/* Recorder interface wrapper */}
        <div className="flex flex-col items-center justify-center p-6 border border-rose-100/20 dark:border-slate-800/80 bg-rose-50/10 dark:bg-slate-950 rounded-2xl space-y-4 text-center">
          {/* Prep timer state */}
          {prepTimer !== null && (
            <div className="space-y-1 animate-pulse">
              <span className="block text-[10px] font-bold text-amber-500">GIỜ CHUẨN BỊ ĐẾM NGƯỢC</span>
              <span className="text-4xl font-black text-amber-600">{prepTimer} giây</span>
            </div>
          )}

          {/* Record timer state */}
          {recordTimer !== null && (
            <div className="space-y-1">
              <span className="block text-[10px] font-bold text-rose-500 flex items-center justify-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                ĐANG GHI ÂM...
              </span>
              <span className="text-4xl font-black text-rose-600">{recordTimer} giây</span>
            </div>
          )}

          {/* Trigger button */}
          {!isRecording && prepTimer === null ? (
            <button
              onClick={startPrepTimer}
              className="px-6 py-3.5 bg-rose-500 text-white rounded-2xl font-bold text-xs hover:bg-rose-600 shadow-md shadow-rose-500/10 hover:shadow-rose-500/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <Mic className="w-4.5 h-4.5" />
              Bắt đầu ghi âm
            </button>
          ) : isRecording ? (
            <button
              onClick={stopRecording}
              className="px-6 py-3.5 bg-slate-800 text-white dark:bg-slate-900 rounded-2xl font-bold text-xs hover:bg-slate-700 transition-all flex items-center gap-2"
            >
              <Square className="w-4.5 h-4.5" />
              Dừng ghi âm
            </button>
          ) : null}

          {/* Audio Playback for reviewed file */}
          {audioBlobUrl && (
            <div className="w-full max-w-sm space-y-2 pt-2 animate-in fade-in duration-200">
              <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">NGHE LẠI BÀI THỬ CỦA BẠN</span>
              <audio src={audioBlobUrl} controls className="w-full bg-[#faf9f6] rounded-xl" />
            </div>
          )}
        </div>

        {/* Self-evaluation Stars */}
        {audioBlobUrl && (
          <div className="p-5 rounded-2xl border border-rose-100/20 dark:border-slate-800/80 bg-rose-50/10 dark:bg-slate-950 space-y-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Bảng tự đánh giá kết quả</h3>
              {awardXp !== null && (
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-bounce">
                  +{awardXp} XP
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Phát âm (Pronunciation)', val: selfPron, setVal: setSelfPron },
                { name: 'Thanh điệu (Tone)', val: selfTone, setVal: setSelfTone },
                { name: 'Độ trôi chảy (Fluency)', val: selfFluency, setVal: setSelfFluency },
                { name: 'Từ vựng (Vocabulary)', val: selfVocab, setVal: setSelfVocab }
              ].map((rate, rIdx) => (
                <div key={rIdx} className="space-y-1">
                  <span className="block text-[10px] font-bold text-slate-450 dark:text-slate-400">{rate.name}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        disabled={feedbackSaved}
                        onClick={() => rate.setVal(star)}
                        className={`text-base leading-none transition-colors ${
                          star <= rate.val ? 'text-amber-500' : 'text-slate-200 dark:text-slate-800'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={saveSelfEvaluation}
              disabled={feedbackSaved}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                feedbackSaved
                  ? 'bg-slate-100 text-slate-450 dark:bg-slate-850 dark:text-slate-650 cursor-not-allowed'
                  : 'bg-rose-500 text-white hover:bg-rose-600'
              }`}
            >
              {feedbackSaved ? 'Đã lưu kết quả đánh giá' : 'Lưu kết quả tự đánh giá'}
            </button>
          </div>
        )}
      </div>
    )
  }

  const WritingPanel = () => {
    const write = data?.writing
    const [draftText, setDraftText] = useState('')
    const [wordCount, setWordCount] = useState(0)
    const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({})
    const [submitted, setSubmitted] = useState(false)

    if (!write) return <EmptyState text="Bài học này chưa cấu hình Luyện viết." />

    const checklist: string[] = JSON.parse(write.checklist)

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value
      setDraftText(val)
      // Count Chinese characters
      const cleaned = val.replace(/[^\u4e00-\u9fa5]/g, '')
      setWordCount(cleaned.length)
    }

    const toggleCheck = (idx: number) => {
      setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }))
    }

    const handleDraftSubmit = () => {
      setSubmitted(true)
      setAwardXp(20)
      setTimeout(() => setAwardXp(null), 1500)
    }

    return (
      <div className="bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-black text-slate-850 dark:text-slate-100">{write.title}</h2>
          <p className="text-slate-400 text-xs mt-0.5">Tập viết câu hoặc đoạn văn ngắn chữ Hán dựa theo đề bài yêu cầu.</p>
        </div>

        {/* Prompt */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 space-y-1">
          <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">ĐỀ BÀI VIẾT</span>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">
            {write.prompt}
          </p>
        </div>

        {/* Checklist checks */}
        <div className="space-y-2">
          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Tiêu chí kiểm tra bài viết</span>
          <div className="space-y-1.5">
            {checklist.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => toggleCheck(idx)}
                className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 hover:dark:text-slate-200 transition-colors w-full text-left font-medium"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                  checkedItems[idx]
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-slate-300 dark:border-slate-750'
                }`}>
                  {checkedItems[idx] && <CheckCircle className="w-3 h-3 fill-emerald-500 text-white" />}
                </div>
                <span>{item}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Draft text Area */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Bài viết nháp</span>
            <span className={`font-bold ${wordCount >= write.minWords ? 'text-green-500' : 'text-rose-500'}`}>
              Số chữ Hán: {wordCount} / tối thiểu {write.minWords}
            </span>
          </div>
          
          <textarea
            disabled={submitted}
            value={draftText}
            onChange={handleTextChange}
            placeholder="Nhập bài viết của bạn tại đây bằng chữ Hán..."
            rows={6}
            className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 dark:text-slate-100 text-xs font-semibold transition-all font-sans leading-relaxed"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-between items-center">
          {awardXp !== null && (
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-250 animate-bounce">
              +{awardXp} XP
            </span>
          )}
          
          <button
            type="button"
            disabled={submitted || wordCount < write.minWords}
            onClick={handleDraftSubmit}
            className="px-6 py-3 bg-rose-500 text-white text-xs font-bold rounded-2xl hover:bg-rose-600 transition-colors disabled:opacity-50 ml-auto shadow-sm"
          >
            {submitted ? 'Đã nộp bài viết nháp' : 'Nộp bài viết'}
          </button>
        </div>
      </div>
    )
  }

  const EmptyState = ({ text }: { text: string }) => (
    <div className="p-8 text-center bg-white dark:bg-slate-900 border rounded-3xl border-rose-100/20 text-xs text-slate-500 dark:text-slate-400 font-semibold">
      {text}
    </div>
  )

  const tabItems = [
    { id: 'vocab', name: 'Từ vựng', icon: BookOpen },
    { id: 'grammar', name: 'Ngữ pháp', icon: FileText },
    { id: 'listening', name: 'Nghe hiểu', icon: Headphones },
    { id: 'reading', name: 'Luyện đọc', icon: BookOpen },
    { id: 'speaking', name: 'Nói HSKK', icon: Mic },
    { id: 'writing', name: 'Luyện viết', icon: PenTool },
  ] as const

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#faf9f6] dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 animate-pulse">
              Đang chuẩn bị học liệu...
            </p>
          </div>
        ) : !data ? (
          <div className="text-center p-12">
            <p className="text-slate-500 font-bold mb-4">Không tìm thấy thông tin bài học.</p>
            <button onClick={() => router.push('/roadmap')} className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold">
              Trở lại Lộ trình
            </button>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300 relative">
            {/* Congratulations popup on complete */}
            {awardXp !== null && (
              <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-rose-500 text-white font-extrabold text-sm px-6 py-3 rounded-full shadow-lg border border-rose-450 animate-bounce flex items-center gap-2">
                <Award className="w-5 h-5 fill-white" />
                <span>Chúc mừng! Bạn đã nhận {awardXp} XP bài học!</span>
              </div>
            )}

            {/* Back Button and Progress Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button
                onClick={() => router.push('/roadmap')}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại lộ trình
              </button>

              {isLessonCompleted && (
                <span className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 rounded-full border border-emerald-150">
                  <CheckCircle className="w-4.5 h-4.5 stroke-[2.5]" />
                  ĐÃ HOÀN THÀNH BÀI NÀY
                </span>
              )}
            </div>

            {/* Lesson Title Banner */}
            <div>
              <span className="inline-block text-[9px] font-black text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded border border-rose-100/10">
                BÀI HỌC CẤP HSK {data.level}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 leading-tight mt-2.5">
                {data.title}
              </h1>
              <p className="text-slate-500 dark:text-slate-450 text-xs font-medium mt-1">
                {data.description}
              </p>
            </div>

            {/* Sub-nav horizontal scrollbar tabs */}
            <div className="border-b border-rose-100/40 dark:border-slate-800/60 flex gap-2 overflow-x-auto pb-1 select-none">
              {tabItems.map((tab) => {
                const isActive = activeTab === tab.id
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4.5 py-3 border-b-2 text-xs font-extrabold flex-shrink-0 transition-all ${
                      isActive
                        ? 'border-rose-500 text-rose-500'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.name}
                  </button>
                )
              })}
            </div>

            {/* Active Panel Render */}
            <div className="min-h-[300px]">
              {activeTab === 'vocab' && <VocabPanel />}
              {activeTab === 'grammar' && <GrammarPanel />}
              {activeTab === 'listening' && <ListeningPanel />}
              {activeTab === 'reading' && <ReadingPanel />}
              {activeTab === 'speaking' && <SpeakingPanel />}
              {activeTab === 'writing' && <WritingPanel />}
            </div>

            {/* Completion / Quiz actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-rose-100/20 dark:border-slate-850">
              {data.quizzes.length > 0 && (
                <div className="flex flex-col gap-1 items-start w-full sm:w-auto">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Bài kiểm tra đi kèm</span>
                  <Link
                    href={`/quiz/${data.quizzes[0].id}`}
                    className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:underline"
                  >
                    Vào thi: {data.quizzes[0].title}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              <button
                type="button"
                onClick={handleCompleteLesson}
                disabled={isLessonCompleted}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 ${
                  isLessonCompleted
                    ? 'bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-650 cursor-not-allowed border border-slate-200 dark:border-slate-800'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:-translate-y-0.5'
                }`}
              >
                <CheckCircle className="w-4.5 h-4.5" />
                {isLessonCompleted ? 'Đã hoàn thành bài học này' : 'Đánh dấu hoàn thành bài học'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
