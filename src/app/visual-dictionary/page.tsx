// src/app/visual-dictionary/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/sidebar'
import {
  Volume2,
  Image as ImageIcon,
  HelpCircle,
  Play,
  RotateCcw,
  Check,
  X,
  BookOpen,
  ArrowRight,
  Eye,
  EyeOff,
  Award,
  Sparkles
} from 'lucide-react'

interface VocabItem {
  id: string
  zh: string
  pinyin: string
  vi: string
  category: string
  imageUrl: string
}

// Visual dictionary dataset
const dictionaryData: VocabItem[] = [
  // Động vật
  { id: 'a1', zh: '虎', pinyin: 'hǔ', vi: 'Con hổ', category: 'animals', imageUrl: 'https://images.unsplash.com/photo-1508817628294-5a453fa0b8fb?w=400&auto=format&fit=crop' },
  { id: 'a2', zh: '猫', pinyin: 'māo', vi: 'Con mèo', category: 'animals', imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop' },
  { id: 'a3', zh: '狗', pinyin: 'gǒu', vi: 'Con chó', category: 'animals', imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&auto=format&fit=crop' },
  { id: 'a4', zh: '熊猫', pinyin: 'xióngmāo', vi: 'Gấu trúc', category: 'animals', imageUrl: 'https://images.unsplash.com/photo-1509565842125-96d294a9b57d?w=400&auto=format&fit=crop' },
  { id: 'a5', zh: '龙', pinyin: 'lóng', vi: 'Con rồng', category: 'animals', imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&auto=format&fit=crop' },
  { id: 'a6', zh: '兔子', pinyin: 'tùzi', vi: 'Con thỏ', category: 'animals', imageUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&auto=format&fit=crop' },
  { id: 'a7', zh: '狮子', pinyin: 'shīzi', vi: 'Sư tử', category: 'animals', imageUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=400&auto=format&fit=crop' },
  { id: 'a8', zh: '大象', pinyin: 'dàxiàng', vi: 'Con voi', category: 'animals', imageUrl: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=400&auto=format&fit=crop' },

  // Thực phẩm & Trái cây
  { id: 'f1', zh: '苹果', pinyin: 'píngguǒ', vi: 'Quả táo', category: 'food', imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop' },
  { id: 'f2', zh: '香蕉', pinyin: 'xiāngjiāo', vi: 'Quả chuối', category: 'food', imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop' },
  { id: 'f3', zh: '西瓜', pinyin: 'xīguā', vi: 'Dưa hấu', category: 'food', imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&auto=format&fit=crop' },
  { id: 'f4', zh: '奶茶', pinyin: 'nǎichá', vi: 'Trà sữa', category: 'food', imageUrl: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=400&auto=format&fit=crop' },
  { id: 'f5', zh: '米饭', pinyin: 'mǐfàn', vi: 'Cơm', category: 'food', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop' },
  { id: 'f6', zh: '面条', pinyin: 'miàntiáo', vi: 'Mì sợi', category: 'food', imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&auto=format&fit=crop' },
  { id: 'f7', zh: '咖啡', pinyin: 'kāfēi', vi: 'Cà phê', category: 'food', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&auto=format&fit=crop' },
  { id: 'f8', zh: '面包', pinyin: 'miànbāo', vi: 'Bánh mì', category: 'food', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop' },

  // Đồ gia dụng
  { id: 'h1', zh: '手机', pinyin: 'shǒujī', vi: 'Điện thoại', category: 'household', imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop' },
  { id: 'h2', zh: '电脑', pinyin: 'diànnǎo', vi: 'Máy tính', category: 'household', imageUrl: 'https://images.unsplash.com/photo-1496181130204-755241544e35?w=400&auto=format&fit=crop' },
  { id: 'h3', zh: '书', pinyin: 'shū', vi: 'Sách', category: 'household', imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop' },
  { id: 'h4', zh: '床', pinyin: 'chuáng', vi: 'Cái giường', category: 'household', imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&auto=format&fit=crop' },
  { id: 'h5', zh: '桌子', pinyin: 'zhuōzi', vi: 'Cái bàn', category: 'household', imageUrl: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=400&auto=format&fit=crop' },
  { id: 'h6', zh: '椅子', pinyin: 'yǐzi', vi: 'Cái ghế', category: 'household', imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&auto=format&fit=crop' },
  { id: 'h7', zh: '电视', pinyin: 'diànshì', vi: 'Tivi', category: 'household', imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&auto=format&fit=crop' },
  { id: 'h8', zh: '钟表', pinyin: 'zhōngbiǎo', vi: 'Đồng hồ', category: 'household', imageUrl: 'https://images.unsplash.com/photo-1563861826100-9cb868fdba1e?w=400&auto=format&fit=crop' },

  // Phương tiện
  { id: 't1', zh: '汽车', pinyin: 'qìchē', vi: 'Ô tô', category: 'transport', imageUrl: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&auto=format&fit=crop' },
  { id: 't2', zh: '自行车', pinyin: 'zìxíngchē', vi: 'Xe đạp', category: 'transport', imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&auto=format&fit=crop' },
  { id: 't3', zh: '飞机', pinyin: 'fēijī', vi: 'Máy bay', category: 'transport', imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&auto=format&fit=crop' },
  { id: 't4', zh: '火车', pinyin: 'huǒchē', vi: 'Tàu hỏa', category: 'transport', imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&auto=format&fit=crop' },
  { id: 't5', zh: '船', pinyin: 'chuán', vi: 'Tàu thuyền', category: 'transport', imageUrl: 'https://images.unsplash.com/photo-1505244208262-bd30d3641533?w=400&auto=format&fit=crop' },
  { id: 't6', zh: '摩托车', pinyin: 'mótuōchē', vi: 'Xe máy', category: 'transport', imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&auto=format&fit=crop' },
  { id: 't7', zh: '公共汽车', pinyin: 'gōnggòng qìchē', vi: 'Xe buýt', category: 'transport', imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&auto=format&fit=crop' },
  { id: 't8', zh: '地铁', pinyin: 'dìtiě', vi: 'Tàu điện ngầm', category: 'transport', imageUrl: 'https://images.unsplash.com/photo-1551641506-ee5bf4cb45f1?w=400&auto=format&fit=crop' }
]

const categories = [
  { id: 'all', name: 'Tất cả', emoji: '📚' },
  { id: 'animals', name: 'Động vật', emoji: '🐼' },
  { id: 'food', name: 'Thực phẩm', emoji: '🍎' },
  { id: 'household', name: 'Đồ gia dụng', emoji: '🏠' },
  { id: 'transport', name: 'Phương tiện', emoji: '🚗' }
]

export default function VisualDictionary() {
  const [activeTab, setActiveTab] = useState<'dictionary' | 'quiz'>('dictionary')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false)
  const [playingItem, setPlayingItem] = useState<string | null>(null)
  
  // Flip states for review cards
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({})

  // Quiz States
  const [quizScore, setQuizScore] = useState(0)
  const [quizTotal, setQuizTotal] = useState(0)
  const [quizMode, setQuizMode] = useState<'word-to-image' | 'image-to-word'>('word-to-image')
  const [quizChecked, setQuizChecked] = useState(false)
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null)
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState<{
    correctAnswer: VocabItem
    options: VocabItem[]
    type: 'word-to-image' | 'image-to-word'
  } | null>(null)

  const speak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    setPlayingItem(text)
    
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.8 // slightly slower

    const voices = window.speechSynthesis.getVoices()
    const zhVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('ZH'))
    if (zhVoice) {
      utterance.voice = zhVoice
    }
    
    utterance.onend = () => setPlayingItem(null)
    utterance.onerror = () => setPlayingItem(null)
    window.speechSynthesis.speak(utterance)
  }

  // Generate a quiz question
  const generateQuizQuestion = () => {
    if (dictionaryData.length < 4) return
    
    const randomType = Math.random() > 0.5 ? 'word-to-image' : 'image-to-word'
    setQuizMode(randomType)

    // Select a correct answer
    const correctAnswer = dictionaryData[Math.floor(Math.random() * dictionaryData.length)]
    
    // Choose 3 distinct distractors from the same category or overall
    const distractorsSet = new Set<VocabItem>()
    distractorsSet.add(correctAnswer)

    const sameCategoryVocabs = dictionaryData.filter(v => v.category === correctAnswer.category && v.id !== correctAnswer.id)
    
    while (distractorsSet.size < 4) {
      if (sameCategoryVocabs.length >= 3 && Math.random() > 0.3) {
        // Prefer same-category distractors for harder difficulty
        const randomDist = sameCategoryVocabs[Math.floor(Math.random() * sameCategoryVocabs.length)]
        distractorsSet.add(randomDist)
      } else {
        const randomDist = dictionaryData[Math.floor(Math.random() * dictionaryData.length)]
        distractorsSet.add(randomDist)
      }
    }

    const options = Array.from(distractorsSet).sort(() => Math.random() - 0.5)

    setCurrentQuizQuestion({
      correctAnswer,
      options,
      type: randomType
    })
    setSelectedOptionIdx(null)
    setQuizChecked(false)
    setQuizFeedback(null)

    // Proactively speak if word-to-image
    if (randomType === 'word-to-image') {
      setTimeout(() => speak(correctAnswer.zh), 200)
    }
  }

  const handleCheckQuiz = (idx: number) => {
    if (!currentQuizQuestion || quizChecked) return
    setSelectedOptionIdx(idx)
    setQuizChecked(true)
    
    const selectedItem = currentQuizQuestion.options[idx]
    const isCorrect = selectedItem.id === currentQuizQuestion.correctAnswer.id
    
    setQuizFeedback(isCorrect ? 'correct' : 'wrong')
    setQuizTotal(prev => prev + 1)
    if (isCorrect) {
      setQuizScore(prev => prev + 1)
    }
    
    // Always speak correct answer word sound on answer reveal
    speak(currentQuizQuestion.correctAnswer.zh)
  }

  const toggleFlip = (cardId: string) => {
    setFlippedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }))
  }

  // Filter dictionary items
  const filteredData = selectedCategory === 'all' 
    ? dictionaryData 
    : dictionaryData.filter(item => item.category === selectedCategory)

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#faf9f6] dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Header Section */}
          <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3" />
            
            <div className="relative z-10 space-y-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full text-white">
                <Sparkles className="w-3.5 h-3.5" /> Ghi nhớ trực quan
              </span>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">Từ điển Hình ảnh Trung - Việt</h1>
              <p className="text-white/80 text-xs md:text-sm max-w-xl font-semibold leading-relaxed">
                Học từ vựng tiếng Trung kết hợp hình ảnh trực quan tăng khả năng lưu trữ ký ức lên tới 65%. Hỗ trợ chế độ tự kiểm tra và trắc nghiệm hình ảnh đa chiều.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-250 dark:border-slate-800 gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            <button
              onClick={() => setActiveTab('dictionary')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all whitespace-nowrap border-b-2 ${
                activeTab === 'dictionary'
                  ? 'border-rose-500 text-rose-500 bg-rose-50/20 dark:bg-rose-950/10'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Tra cứu Từ điển
            </button>
            <button
              onClick={() => {
                setActiveTab('quiz')
                if (!currentQuizQuestion) {
                  generateQuizQuestion()
                }
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all whitespace-nowrap border-b-2 ${
                activeTab === 'quiz'
                  ? 'border-rose-500 text-rose-500 bg-rose-50/20 dark:bg-rose-950/10'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Trắc nghiệm hình ảnh
            </button>
          </div>

          {/* TAB: DICTIONARY VIEW */}
          {activeTab === 'dictionary' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Category Filter Chips & Modes toggles */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Category Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {categories.map(cat => {
                    const isSelected = selectedCategory === cat.id
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
                        }`}
                      >
                        <span>{cat.emoji}</span>
                        <span>{cat.name}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Review Mode Toggle Switch */}
                <button
                  onClick={() => {
                    setIsReviewMode(!isReviewMode)
                    setFlippedCards({}) // Reset flips
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border flex items-center gap-2 self-start sm:self-auto ${
                    isReviewMode
                      ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {isReviewMode ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Chế độ Ôn tập (Đã ẩn chữ)
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Chế độ Học (Hiển thị chữ)
                    </>
                  )}
                </button>
              </div>

              {/* Grid of Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredData.map(item => {
                  const isPlaying = playingItem === item.zh
                  const isFlipped = flippedCards[item.id] || false

                  return (
                    <div
                      key={item.id}
                      className="h-[210px] w-full [perspective:1000px] cursor-pointer"
                      onClick={() => {
                        if (isReviewMode) {
                          toggleFlip(item.id)
                        } else {
                          speak(item.zh)
                        }
                      }}
                    >
                      {/* Inner Card Container for Flipping */}
                      <div className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
                        isReviewMode && isFlipped ? '[transform:rotateY(180deg)]' : ''
                      }`}>
                        
                        {/* Front Side: Normal Card or Image Only in Review Mode */}
                        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-3xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 shadow-xs overflow-hidden flex flex-col justify-between">
                          
                          {/* Image Container */}
                          <div className="relative w-full h-[130px] bg-slate-100 dark:bg-slate-950 overflow-hidden">
                            <img
                              src={item.imageUrl}
                              alt={item.vi}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                            {/* Category Badge */}
                            <span className="absolute top-2 left-2 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider bg-black/60 text-white rounded-md">
                              {categories.find(c => c.id === item.category)?.name}
                            </span>
                          </div>

                          {/* Text Info */}
                          <div className="p-3 flex items-center justify-between flex-1">
                            {!isReviewMode ? (
                              <div className="min-w-0 pr-1.5">
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-base font-black text-slate-800 dark:text-slate-150 font-sans truncate">{item.zh}</span>
                                  <span className="text-[10px] font-bold text-slate-400 truncate">{item.pinyin}</span>
                                </div>
                                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-450 truncate">{item.vi}</p>
                              </div>
                            ) : (
                              <div className="text-center w-full">
                                <span className="inline-block text-[9px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-full border border-rose-100/10">
                                  Click để lật thẻ
                                </span>
                              </div>
                            )}

                            {!isReviewMode && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation() // Don't trigger outer card click
                                  speak(item.zh)
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                                  isPlaying 
                                    ? 'bg-rose-500 text-white animate-pulse'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-rose-500 hover:text-white'
                                }`}
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                        </div>

                        {/* Back Side: Revealed Info (Only active in Review Mode) */}
                        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl bg-slate-900 dark:bg-slate-900 border border-slate-800/80 text-white p-4 flex flex-col items-center justify-between text-center shadow-md">
                          
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Đáp án từ vựng</span>

                          <div className="space-y-1">
                            <span className="block text-2xl font-black font-sans text-rose-450">{item.zh}</span>
                            <span className="block text-xs font-bold text-slate-350">{item.pinyin}</span>
                            <span className="block text-sm font-semibold text-slate-100">{item.vi}</span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              speak(item.zh)
                            }}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                              isPlaying ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-800 text-slate-300 hover:bg-rose-500 hover:text-white'
                            }`}
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>

                          <span className="text-[8px] text-slate-500 font-bold">Chạm để lật úp lại</span>
                        </div>

                      </div>
                    </div>
                  )
                })}
              </div>

            </div>
          )}

          {/* TAB: VISUAL QUIZ */}
          {activeTab === 'quiz' && (
            <div className="max-w-2xl mx-auto animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-850 rounded-3xl p-6 shadow-sm space-y-6">
                
                {/* Scoreboard and Quiz Title */}
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-rose-500" />
                      Luyện phản xạ hình ảnh
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-450 font-medium">Chọn câu trả lời đúng dựa trên liên tưởng hình ảnh.</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Điểm quiz</span>
                    <span className="text-base font-black text-rose-500">{quizScore}/{quizTotal}</span>
                  </div>
                </div>

                {currentQuizQuestion ? (
                  <div className="space-y-6">
                    
                    {/* Mode 1: WORD-TO-IMAGE (Given a Chinese word/audio, select the correct image) */}
                    {quizMode === 'word-to-image' && (
                      <div className="space-y-5">
                        
                        {/* Word display card & speaker */}
                        <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => speak(currentQuizQuestion.correctAnswer.zh)}
                            className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors shadow-xs"
                          >
                            <Volume2 className="w-5 h-5" />
                          </button>
                          
                          <div className="text-center">
                            <span className="block text-3xl font-black font-sans text-slate-800 dark:text-slate-150">
                              {currentQuizQuestion.correctAnswer.zh}
                            </span>
                            <span className="block text-xs font-bold text-slate-400 mt-1">
                              Phiên âm: {currentQuizQuestion.correctAnswer.pinyin}
                            </span>
                          </div>
                        </div>

                        <span className="block text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Chọn bức ảnh biểu diễn từ trên</span>

                        {/* Images options grid */}
                        <div className="grid grid-cols-2 gap-3">
                          {currentQuizQuestion.options.map((option, idx) => {
                            const isSelected = selectedOptionIdx === idx
                            const isCorrect = option.id === currentQuizQuestion.correctAnswer.id
                            
                            let overlayClass = 'border-slate-150 dark:border-slate-800 hover:border-rose-300'
                            
                            if (quizChecked) {
                              if (isCorrect) {
                                overlayClass = 'border-emerald-500 ring-2 ring-emerald-500'
                              } else if (isSelected) {
                                overlayClass = 'border-rose-500 ring-2 ring-rose-500'
                              } else {
                                overlayClass = 'opacity-30 border-slate-100 dark:border-slate-900'
                              }
                            } else if (isSelected) {
                              overlayClass = 'border-rose-500 ring-2 ring-rose-500'
                            }

                            return (
                              <button
                                key={option.id}
                                type="button"
                                disabled={quizChecked}
                                onClick={() => handleCheckQuiz(idx)}
                                className={`relative h-[120px] rounded-2xl overflow-hidden border-2 bg-slate-50 transition-all ${overlayClass}`}
                              >
                                <img
                                  src={option.imageUrl}
                                  alt="Option"
                                  className="w-full h-full object-cover"
                                />
                                {quizChecked && isCorrect && (
                                  <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                                    <span className="bg-emerald-500 text-white p-1 rounded-full"><Check className="w-5 h-5 stroke-[3]" /></span>
                                  </div>
                                )}
                                {quizChecked && isSelected && !isCorrect && (
                                  <div className="absolute inset-0 bg-rose-500/20 flex items-center justify-center">
                                    <span className="bg-rose-500 text-white p-1 rounded-full"><X className="w-5 h-5 stroke-[3]" /></span>
                                  </div>
                                )}
                              </button>
                            )
                          })}
                        </div>

                      </div>
                    )}

                    {/* Mode 2: IMAGE-TO-WORD (Given a picture, select the correct Chinese word) */}
                    {quizMode === 'image-to-word' && (
                      <div className="space-y-5">
                        
                        {/* Target Image display */}
                        <div className="max-w-xs mx-auto h-[160px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 relative">
                          <img
                            src={currentQuizQuestion.correctAnswer.imageUrl}
                            alt="Question Target"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-2 right-2 px-2.5 py-0.5 text-[8px] font-black uppercase bg-black/60 text-white rounded">
                            Chủ đề: {categories.find(c => c.id === currentQuizQuestion.correctAnswer.category)?.name}
                          </span>
                        </div>

                        <span className="block text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Chọn từ vựng tiếng Trung tương ứng</span>

                        {/* Words options grid */}
                        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                          {currentQuizQuestion.options.map((option, idx) => {
                            const isSelected = selectedOptionIdx === idx
                            const isCorrect = option.id === currentQuizQuestion.correctAnswer.id
                            
                            let btnClass = 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350'
                            
                            if (quizChecked) {
                              if (isCorrect) {
                                btnClass = 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 font-black'
                              } else if (isSelected) {
                                btnClass = 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 font-black'
                              } else {
                                btnClass = 'border-slate-100 dark:border-slate-900 opacity-40 text-slate-350'
                              }
                            } else if (isSelected) {
                              btnClass = 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-black shadow-xs'
                            }

                            return (
                              <button
                                key={option.id}
                                type="button"
                                disabled={quizChecked}
                                onClick={() => handleCheckQuiz(idx)}
                                className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${btnClass}`}
                              >
                                <span className="text-lg font-black font-sans">{option.zh}</span>
                                <span className="text-[10px] font-bold opacity-80">({option.pinyin})</span>
                                <span className="text-[10px] font-semibold opacity-70">{option.vi}</span>
                              </button>
                            )
                          })}
                        </div>

                      </div>
                    )}

                    {/* Footer Feedback & Controls */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      
                      {/* Feedback Text */}
                      <div>
                        {quizFeedback === 'correct' && (
                          <span className="flex items-center gap-1.5 text-xs font-black text-emerald-500">
                            <Check className="w-5 h-5 stroke-[3]" /> Đáp án chính xác! Xin chúc mừng!
                          </span>
                        )}
                        {quizFeedback === 'wrong' && (
                          <span className="flex items-center gap-1.5 text-xs font-black text-rose-500 leading-relaxed">
                            <X className="w-5 h-5 stroke-[3]" /> Đáp án sai. Đáp án đúng là "{currentQuizQuestion.correctAnswer.zh} ({currentQuizQuestion.correctAnswer.pinyin} - {currentQuizQuestion.correctAnswer.vi})".
                          </span>
                        )}
                      </div>

                      {/* Next button */}
                      {quizChecked && (
                        <button
                          type="button"
                          onClick={generateQuizQuestion}
                          className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-650 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
                        >
                          Câu tiếp theo <ArrowRight className="w-4 h-4" />
                        </button>
                      )}

                    </div>

                  </div>
                ) : (
                  <div className="text-center p-6">
                    <button
                      type="button"
                      onClick={generateQuizQuestion}
                      className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all"
                    >
                      Bắt đầu ôn tập trắc nghiệm
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
