// src/app/ai-assistant/page.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import Sidebar from '@/components/sidebar'
import { Brain, Send, Bot, User, Sparkles, Zap, RotateCcw, AlertTriangle, Volume2, Paperclip, X } from 'lucide-react'
import Link from 'next/link'

interface ChatMessage {
  sender: 'user' | 'bot'
  text: string
  chinese?: string
  pinyin?: string
  vietnamese?: string
  imageUrl?: string
  timestamp: Date
}

interface Suggestion {
  zh: string
  pinyin: string
  vi: string
}

export default function AIAssistant() {
  const welcomeMessage: ChatMessage = {
    sender: 'bot',
    text: 'Chào bạn! Tôi là trợ lý học tiếng Trung của bạn. Hôm nay bạn muốn nói chuyện về chủ đề gì? Chúng ta có thể chat bằng tiếng Trung, hoặc bạn cũng có thể đặt câu hỏi về từ vựng và ngữ pháp.',
    chinese: '你好！我是你的中文学习助手。今天想聊点什么？我们可以用中文聊天，或者你也可以向我提问语法和词汇问题。',
    pinyin: 'Nǐ hǎo! Wǒ shì nǐ de Zhōngwén xuéxí zhùshǒu. Jīntiān xiǎng liáo diǎn shénme? Wǒmen kěyǐ yòng Zhōngwén liáotiān, huòzhě nǐ yě kěyǐ xiàng wǒ tíwèn ngữ pháp hé từ vựng wèntí.',
    vietnamese: 'Chào bạn! Tôi là trợ lý học tiếng Trung của bạn. Hôm nay bạn muốn nói chuyện về chủ đề gì? Chúng ta có thể chat bằng tiếng Trung, hoặc bạn cũng có thể đặt câu hỏi về từ vựng và ngữ pháp.',
    timestamp: new Date()
  }

  const starterSuggestions: Suggestion[] = [
    { zh: "你好！今天我想聊聊我的日常生活。", pinyin: "Nǐ hǎo! Jīntiān wǒ xiǎng liáoliao wǒ de rìcháng shēnghuó.", vi: "Chào bạn! Hôm nay mình muốn nói chuyện về cuộc sống hàng ngày." },
    { zh: "你好！我想练习关于食物和吃喝的话题。", pinyin: "Nǐ hǎo! Wǒ xiǎng liànxí guānyú shíwù hé chīhē de huàtí.", vi: "Chào bạn! Mình muốn luyện tập về chủ đề thức ăn và ăn uống." },
    { zh: "你好！我们来聊聊兴趣爱好吧。", pinyin: "Nǐ hǎo! Wǒmen lái liáoliao xìngqù àihào ba.", vi: "Chào bạn! Chúng ta hãy nói chuyện về sở thích đi." }
  ]

  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage])
  const [suggestions, setSuggestions] = useState<Suggestion[]>(starterSuggestions)
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null) // Base64 string
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null) // Data URL preview
  const [imageType, setImageType] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch user profile on mount to check plan level
  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          setUserProfile(data.user)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chỉ chọn tệp tin hình ảnh!')
      return
    }

    if (file.size > 4 * 1024 * 1024) {
      alert('Kích thước ảnh quá lớn! Vui lòng chọn ảnh dưới 4MB.')
      return
    }

    setImageType(file.type)

    const reader = new FileReader()
    reader.onloadend = () => {
      const resultStr = reader.result as string
      setImagePreviewUrl(resultStr)
      const base64Data = resultStr.split(',')[1]
      setSelectedImage(base64Data)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreviewUrl(null)
    setImageType(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText
    if (!text.trim() && !imagePreviewUrl) return

    if (!textToSend) setInputText('')
    
    // Clear suggestions while loading to prevent multiple fast clicks
    setSuggestions([])

    const currentImgUrl = imagePreviewUrl || undefined
    const currentImgBase64 = selectedImage || undefined
    const currentImgType = imageType || undefined

    handleRemoveImage()

    const newUserMsg: ChatMessage = { 
      sender: 'user', 
      text: text || "Gửi hình ảnh đính kèm", 
      imageUrl: currentImgUrl,
      timestamp: new Date() 
    }
    setMessages(prev => [...prev, newUserMsg])
    setLoading(true)

    const updatedHistory = [...messages, newUserMsg]

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text || "Học viên gửi kèm hình ảnh.",
          image: currentImgBase64,
          imageType: currentImgType,
          history: updatedHistory.map(m => ({
            sender: m.sender,
            chinese: m.chinese || m.text,
            text: m.text
          }))
        })
      })

      if (res.ok) {
        const data = await res.json()
        
        if (data.limitReached) {
          setMessages(prev => [...prev, {
            sender: 'bot',
            text: data.replyChinese,
            chinese: data.replyChinese,
            pinyin: data.replyPinyin,
            vietnamese: data.replyVietnamese,
            timestamp: new Date()
          }])
          setSuggestions([])
        } else {
          setMessages(prev => [...prev, {
            sender: 'bot',
            text: data.replyChinese,
            chinese: data.replyChinese,
            pinyin: data.replyPinyin,
            vietnamese: data.replyVietnamese,
            timestamp: new Date()
          }])
          setSuggestions(data.suggestions || [])
        }
        // Refresh profile stats to update query usage counters if any
        fetchProfile()
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: '😞 Đã có lỗi xảy ra. Vui lòng thử lại sau.', timestamp: new Date() }])
        setSuggestions(starterSuggestions)
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: '😞 Lỗi kết nối mạng. Không thể gửi câu hỏi.', timestamp: new Date() }])
      setSuggestions(starterSuggestions)
    } finally {
      setLoading(false)
    }
  }

  const handleResetChat = () => {
    setMessages([welcomeMessage])
    setSuggestions(starterSuggestions)
  }

  // TTS helper for bot replies
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      const voices = window.speechSynthesis.getVoices()
      const zhVoice = voices.find(v => v.lang.startsWith('zh') || v.lang.includes('CN'))
      if (zhVoice) {
        utterance.voice = zhVoice
      }
      window.speechSynthesis.speak(utterance)
    }
  }

  // Parse custom bold markdown for fallback rendering (explanations)
  const renderMessageText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Process bold syntax (**text**)
      const parts = line.split(/\*\*([\s\S]*?)\*\*/g)
      const formattedLine = parts.map((part, i) => {
        if (i % 2 === 1) {
          return <strong key={i} className="font-extrabold text-rose-500 dark:text-rose-400">{part}</strong>
        }
        
        // Process inline code/pinyin (`pinyin`)
        const subParts = part.split(/`([\s\S]*?)`/g)
        return subParts.map((sub, j) => {
          if (j % 2 === 1) {
            return <code key={j} className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{sub}</code>
          }
          return sub
        })
      })

      return (
        <p key={idx} className="min-h-[1.2rem] leading-relaxed">
          {formattedLine}
        </p>
      )
    })
  }

  const chatLimitStr = userProfile?.subscription === 'pro' 
    ? 'Pro Plan (Vô hạn)' 
    : 'Free Plan (Tối đa 3 câu/ngày)'

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#faf9f6] dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full flex flex-col h-screen">
        {/* Top Header info */}
        <div className="flex items-center justify-between pb-4 border-b border-rose-100/30 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center border border-rose-100/10">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                Trợ lý Học tập AI
                <span className="text-[10px] font-extrabold text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full border border-amber-100/10">BETA</span>
              </h1>
              <p className="text-slate-400 dark:text-slate-500 text-xs">
                Gia sư hội thoại AI phản xạ 2 chiều tiếng Trung, Pinyin & gợi ý thông minh.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetChat}
              title="Làm mới hội thoại"
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-800 hover:text-rose-500 dark:hover:text-rose-400 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4.5 h-4.5" />
            </button>
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
              userProfile?.subscription === 'pro'
                ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/20'
                : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-800'
            }`}>
              {chatLimitStr}
            </span>
          </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto py-6 space-y-4 px-2">
          {messages.map((msg, index) => {
            const isBot = msg.sender === 'bot'
            return (
              <div key={index} className={`flex items-start gap-3.5 ${isBot ? '' : 'flex-row-reverse'}`}>
                {/* Avatar Icon */}
                <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border ${
                  isBot 
                    ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-500 border-rose-100/10' 
                    : 'bg-white dark:bg-slate-900 text-slate-600 border-slate-200 dark:border-slate-800'
                }`}>
                  {isBot ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                </div>

                {/* Bubble content */}
                <div className={`max-w-[80%] p-4 rounded-3xl shadow-sm border ${
                  isBot 
                    ? 'bg-white dark:bg-slate-900 border-rose-100/20 dark:border-slate-850 text-slate-800 dark:text-slate-100 rounded-tl-sm text-sm space-y-2' 
                    : 'bg-rose-500 text-white border-rose-600 rounded-tr-sm text-sm font-semibold'
                }`}>
                  {isBot ? (
                    msg.pinyin ? (
                      <div className="flex flex-col gap-1.5">
                        {/* Audio speaker button & Chinese characters */}
                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => msg.chinese && speakText(msg.chinese)}
                            className="p-1 rounded-md bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-500 transition-all mt-0.5 cursor-pointer"
                            title="Nghe phát âm"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <div className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                            {msg.chinese}
                          </div>
                        </div>

                        {/* Pinyin representation */}
                        {msg.pinyin && (
                          <div className="pl-7 text-xs font-mono font-medium text-slate-400 dark:text-slate-500 tracking-wide">
                            {msg.pinyin}
                          </div>
                        )}

                        {/* Vietnamese Translation */}
                        {msg.vietnamese && (
                          <div className="pl-7 pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 italic">
                            {msg.vietnamese}
                          </div>
                        )}
                      </div>
                    ) : (
                      renderMessageText(msg.text)
                    )
                  ) : (
                    <div className="space-y-2">
                      {msg.imageUrl && (
                        <div className="relative max-w-xs overflow-hidden rounded-2xl border border-rose-400/30 bg-black/10">
                          <img 
                            src={msg.imageUrl} 
                            alt="Ảnh đính kèm" 
                            className="max-h-48 object-contain rounded-2xl" 
                          />
                        </div>
                      )}
                      <div>{msg.text}</div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          {loading && (
            <div className="flex items-start gap-3.5">
              <div className="w-8.5 h-8.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center flex-shrink-0 shadow-sm border border-rose-100/10">
                <Bot className="w-4.5 h-4.5 animate-bounce" />
              </div>
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 text-slate-400 dark:text-slate-500 text-xs font-bold flex items-center gap-1.5 shadow-sm rounded-tl-sm">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
                AI Tutor đang soạn câu hỏi...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Quick Suggestions */}
        {suggestions.length > 0 && !loading && (
          <div className="py-3 px-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Gợi ý trả lời nhanh (Phản xạ tốt)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(sug.zh)}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-rose-400 dark:hover:border-rose-900/60 hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="font-bold text-slate-850 dark:text-slate-200 text-xs group-hover:text-rose-500 transition-colors">
                    {sug.zh}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1">
                    {sug.pinyin}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 italic mt-1 border-t border-slate-100/50 dark:border-slate-800/50 pt-1">
                    {sug.vi}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="pt-4 border-t border-rose-100/30 dark:border-slate-800/80 bg-[#faf9f6] dark:bg-slate-950 pb-2">
          {userProfile && userProfile.subscription === 'free' && (
            <div className="mb-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-200 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center justify-between gap-2 shadow-sm">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                Dùng thử Free: Lượt hỏi hôm nay còn lại: {Math.max(0, 3 - (userProfile.dailyMissions ? JSON.parse(userProfile.dailyMissions).aiChats || 0 : 0))}/3
              </span>
              <Link href="/upgrade" className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-extrabold uppercase transition-all shadow-sm flex items-center gap-1">
                <Zap className="w-3 h-3 fill-white" /> Lên Pro
              </Link>
            </div>
          )}

          {/* Floating Image Preview */}
          {imagePreviewUrl && (
            <div className="relative inline-block mb-3 p-1 bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800 rounded-2xl shadow-md animate-in slide-in-from-bottom duration-200">
              <img 
                src={imagePreviewUrl} 
                alt="Preview" 
                className="h-20 w-20 object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-1.5 -right-1.5 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-transform shadow cursor-pointer"
                title="Xóa ảnh"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="relative flex items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="absolute left-3.5 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors disabled:opacity-30 cursor-pointer"
              title="Đính kèm hình ảnh bài tập"
            >
              <Paperclip className="w-4.5 h-4.5" />
            </button>
            <input
              type="text"
              disabled={loading}
              placeholder="Nhập chữ Hán, pinyin hoặc đính kèm ảnh chụp để giải bài tập..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage()
              }}
              className="w-full pl-12 pr-12 py-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-slate-100 shadow-sm"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || (!inputText.trim() && !imagePreviewUrl)}
              className="absolute right-2.5 p-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600 active:scale-95 disabled:opacity-40 transition-all shadow-sm cursor-pointer"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
