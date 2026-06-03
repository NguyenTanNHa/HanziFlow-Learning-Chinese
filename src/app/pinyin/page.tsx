// src/app/pinyin/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/sidebar'
import {
  Volume2,
  BookOpen,
  HelpCircle,
  Play,
  RefreshCw,
  Info,
  Check,
  X,
  Layers,
  Music,
  ArrowRight,
  Sparkles
} from 'lucide-react'

// Tone vowel replacement charts
const toneVowels: Record<string, string[]> = {
  'a': ['a', 'ā', 'á', 'ǎ', 'à'],
  'o': ['o', 'ō', 'ó', 'ǒ', 'ò'],
  'e': ['e', 'ē', 'é', 'ě', 'è'],
  'i': ['i', 'ī', 'í', 'ǐ', 'ì'],
  'u': ['u', 'ū', 'ú', 'ǔ', 'ù'],
  'ü': ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ'],
  'v': ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ']
}

// Add tone mark to raw pinyin syllable
const addToneToSyllable = (syllable: string, tone: number): string => {
  if (tone < 1 || tone > 4) return syllable
  
  let text = syllable
  let markIdx = -1
  
  if (text.includes('a')) {
    markIdx = text.indexOf('a')
  } else if (text.includes('o')) {
    markIdx = text.indexOf('o')
  } else if (text.includes('e')) {
    markIdx = text.indexOf('e')
  } else if (text.includes('ui')) {
    markIdx = text.indexOf('i', text.indexOf('ui'))
  } else if (text.includes('iu')) {
    markIdx = text.indexOf('u', text.indexOf('iu'))
  } else {
    for (let i = 0; i < text.length; i++) {
      if (['i', 'u', 'ü', 'v'].includes(text[i])) {
        markIdx = i
        break
      }
    }
  }
  
  if (markIdx !== -1) {
    const vowel = text[markIdx]
    const replacement = toneVowels[vowel]?.[tone] || vowel
    return text.substring(0, markIdx) + replacement + text.substring(markIdx + 1)
  }
  return text
}

interface InitialItem {
  char: string
  category: string
  desc: string
  example: string
  examplePinyin: string
  exampleVi: string
}

interface FinalItem {
  char: string
  category: 'simple' | 'compound' | 'nasal'
  desc: string
  example: string
  examplePinyin: string
  exampleVi: string
}

// Data structures
const initialsData: InitialItem[] = [
  { char: 'b', category: 'Âm môi (Labials)', desc: "Giống 'p' trong tiếng Việt nhưng nhẹ hơn và không bật hơi (VD: 'ba' đọc gần giống 'pa').", example: '爸', examplePinyin: 'bà', exampleVi: 'Bố' },
  { char: 'p', category: 'Âm môi (Labials)', desc: "Giống 'p' tiếng Việt nhưng phải bật hơi mạnh (mím môi rồi thổi hơi mạnh ra).", example: '婆', examplePinyin: 'pó', exampleVi: 'Bà ngoại' },
  { char: 'm', category: 'Âm môi (Labials)', desc: "Phát âm hoàn toàn giống 'm' trong tiếng Việt.", example: '妈', examplePinyin: 'mā', exampleVi: 'Mẹ' },
  { char: 'f', category: 'Âm môi - răng (Labiodentals)', desc: "Phát âm hoàn toàn giống 'ph' trong tiếng Việt.", example: '飞', examplePinyin: 'fēi', exampleVi: 'Bay' },
  { char: 'd', category: 'Âm đầu lưỡi (Alveolars)', desc: "Giống 't' trong tiếng Việt nhưng không bật hơi (VD: 'da' đọc gần giống 'ta').", example: '大', examplePinyin: 'dà', exampleVi: 'To lớn' },
  { char: 't', category: 'Âm đầu lưỡi (Alveolars)', desc: "Giống 't' nhưng uốn nhẹ đầu lưỡi chạm răng trên rồi rụt nhanh bật hơi mạnh.", example: '天', examplePinyin: 'tiān', exampleVi: 'Trời' },
  { char: 'n', category: 'Âm đầu lưỡi (Alveolars)', desc: "Phát âm giống hệt 'n' trong tiếng Việt.", example: '你', examplePinyin: 'nǐ', exampleVi: 'Bạn' },
  { char: 'l', category: 'Âm đầu lưỡi (Alveolars)', desc: "Phát âm giống hệt 'l' trong tiếng Việt.", example: '路', examplePinyin: 'lù', exampleVi: 'Đường đi' },
  { char: 'g', category: 'Âm cuống lưỡi (Velars)', desc: "Giống 'c/k' trong tiếng Việt nhưng không bật hơi (VD: 'ge' đọc giống 'cơ').", example: '歌', examplePinyin: 'gē', exampleVi: 'Bài hát' },
  { char: 'k', category: 'Âm cuống lưỡi (Velars)', desc: "Giống âm 'kh' tiếng Việt nhưng bật hơi mạnh thoát ra từ cuống họng.", example: '裤', examplePinyin: 'kù', exampleVi: 'Cái quần' },
  { char: 'h', category: 'Âm cuống lưỡi (Velars)', desc: "Phát âm nhẹ nhàng giữa âm 'h' và 'kh' của tiếng Việt.", example: '好', examplePinyin: 'hǎo', exampleVi: 'Tốt, đẹp' },
  { char: 'j', category: 'Âm mặt lưỡi (Palatals)', desc: "Giống âm 'ch' tiếng Việt nhưng dẹt môi và lưỡi áp sát vòm miệng.", example: '鸡', examplePinyin: 'jī', exampleVi: 'Con gà' },
  { char: 'q', category: 'Âm mặt lưỡi (Palatals)', desc: "Giống 'j' bật hơi thật mạnh qua kẽ răng (dẹt môi, thổi hơi mạnh).", example: '七', examplePinyin: 'qī', exampleVi: 'Số bảy' },
  { char: 'x', category: 'Âm mặt lưỡi (Palatals)', desc: "Giống 'x' tiếng Việt nhưng phát âm dẹt môi và hơi đẩy nhẹ.", example: '稀', examplePinyin: 'xī', exampleVi: 'Thưa thớt' },
  { char: 'zh', category: 'Âm uốn lưỡi (Retroflexes)', desc: "Đọc như 'tr' tiếng Việt uốn lưỡi sâu nhưng không bật hơi.", example: '猪', examplePinyin: 'zhū', exampleVi: 'Con heo' },
  { char: 'ch', category: 'Âm uốn lưỡi (Retroflexes)', desc: "Giống 'zh' uốn lưỡi sâu nhưng phải bật hơi thật mạnh thoát ra.", example: '车', examplePinyin: 'chē', exampleVi: 'Xe cộ' },
  { char: 'sh', category: 'Âm uốn lưỡi (Retroflexes)', desc: "Đọc uốn lưỡi như âm 's' nặng của tiếng Việt.", example: '书', examplePinyin: 'shū', exampleVi: 'Sách' },
  { char: 'r', category: 'Âm uốn lưỡi (Retroflexes)', desc: "Đọc gần giống 'r' tiếng Việt uốn lưỡi nhưng không rung mạnh môi và lưỡi.", example: '热', examplePinyin: 'rè', exampleVi: 'Nóng' },
  { char: 'z', category: 'Âm đầu lưỡi trước (Dental sibilants)', desc: "Khép răng, đầu lưỡi thẳng chạm mặt sau răng trên, đọc như 'ts/ch' không bật hơi.", example: '字', examplePinyin: 'zì', exampleVi: 'Chữ viết' },
  { char: 'c', category: 'Âm đầu lưỡi trước (Dental sibilants)', desc: "Giống 'z' nhưng đầu lưỡi lùi nhẹ hơi thổi mạnh ra qua kẽ răng.", example: '词', examplePinyin: 'cí', exampleVi: 'Từ vựng' },
  { char: 's', category: 'Âm đầu lưỡi trước (Dental sibilants)', desc: "Đọc như âm 'x' tiếng Việt thẳng lưỡi (không uốn lưỡi).", example: '四', examplePinyin: 'sì', exampleVi: 'Số bốn' },
  { char: 'y', category: 'Bán nguyên âm (Semi-vowels)', desc: "Âm đệm phụ cho nguyên âm 'i' (phát âm nhẹ như 'd/gi' miền Nam).", example: '衣', examplePinyin: 'yī', exampleVi: 'Quần áo' },
  { char: 'w', category: 'Bán nguyên âm (Semi-vowels)', desc: "Âm đệm phụ cho nguyên âm 'u' (phát âm tròn môi gần giống 'o/u').", example: '五', examplePinyin: 'wǔ', exampleVi: 'Số năm' }
]

const finalsData: FinalItem[] = [
  // Simple
  { char: 'a', category: 'simple', desc: "Đọc như 'a' tiếng Việt nhưng há miệng rộng hơn.", example: '爸', examplePinyin: 'bà', exampleVi: 'Bố' },
  { char: 'o', category: 'simple', desc: "Đọc như 'ô' tiếng Việt, hơi có âm đệm 'u' ở trước (uô).", example: '波', examplePinyin: 'bō', exampleVi: 'Sóng' },
  { char: 'e', category: 'simple', desc: "Đọc giao thoa giữa 'ơ' và 'ưa' trong tiếng Việt.", example: '哥', examplePinyin: 'gē', exampleVi: 'Anh trai' },
  { char: 'i', category: 'simple', desc: "Đọc như 'i' tiếng Việt (khi đi sau zh, ch, sh, r, z, c, s đọc là âm 'ư').", example: '衣', examplePinyin: 'yī', exampleVi: 'Áo' },
  { char: 'u', category: 'simple', desc: "Đọc như 'u' trong tiếng Việt, chu tròn môi.", example: '路', examplePinyin: 'lù', exampleVi: 'Đường' },
  { char: 'ü', category: 'simple', desc: "Đọc âm 'i' nhưng giữ nguyên khẩu hình tròn môi âm 'u' (như 'uy').", example: '绿', examplePinyin: 'lǜ', exampleVi: 'Màu xanh' },
  // Compound
  { char: 'ai', category: 'compound', desc: "Phát âm giống hệt 'ai' tiếng Việt.", example: '买', examplePinyin: 'mǎi', exampleVi: 'Mua' },
  { char: 'ei', category: 'compound', desc: "Phát âm giống hệt 'ây' tiếng Việt.", example: '飞', examplePinyin: 'fēi', exampleVi: 'Bay' },
  { char: 'ui', category: 'compound', desc: "Đọc gần giống 'uây' (là cách viết gọn của uei).", example: '回', examplePinyin: 'huí', exampleVi: 'Về' },
  { char: 'ao', category: 'compound', desc: "Phát âm giống hệt 'ao' tiếng Việt.", example: '包', examplePinyin: 'bāo', exampleVi: 'Bao, túi' },
  { char: 'ou', category: 'compound', desc: "Phát âm giống hệt 'âu' tiếng Việt.", example: '口', examplePinyin: 'kǒu', exampleVi: 'Miệng' },
  { char: 'iu', category: 'compound', desc: "Đọc gần giống 'iêu' (là cách viết gọn của iou).", example: '六', examplePinyin: 'liù', exampleVi: 'Số sáu' },
  { char: 'ie', category: 'compound', desc: "Phát âm gần giống 'iê' tiếng Việt.", example: '姐', examplePinyin: 'jiě', exampleVi: 'Chị gái' },
  { char: 'üe', category: 'compound', desc: "Đọc âm 'ü' rồi chuyển nhanh sang 'e' (nghe như 'uyê').", example: '月', examplePinyin: 'yuè', exampleVi: 'Trăng' },
  { char: 'er', category: 'compound', desc: "Âm uốn lưỡi đặc biệt, đọc 'ơ' đồng thời cong lưỡi lên sát vòm họng.", example: '二', examplePinyin: 'èr', exampleVi: 'Số hai' },
  // Nasal
  { char: 'an', category: 'nasal', desc: "Phát âm giống hệt 'an' tiếng Việt.", example: '山', examplePinyin: 'shān', exampleVi: 'Núi' },
  { char: 'en', category: 'nasal', desc: "Phát âm giống hệt 'ân' tiếng Việt.", example: '人', examplePinyin: 'rén', exampleVi: 'Người' },
  { char: 'in', category: 'nasal', desc: "Phát âm giống hệt 'in' tiếng Việt.", example: '心', examplePinyin: 'xīn', exampleVi: 'Tim' },
  { char: 'un', category: 'nasal', desc: "Đọc gần giống 'uân' (viết gọn của uen).", example: '春', examplePinyin: 'chūn', exampleVi: 'Mùa xuân' },
  { char: 'ün', category: 'nasal', desc: "Phát âm gần giống 'uyn' trong tiếng Việt.", example: '云', examplePinyin: 'yún', exampleVi: 'Mây' },
  { char: 'ang', category: 'nasal', desc: "Phát âm giống hệt 'ang' tiếng Việt.", example: '胖', examplePinyin: 'pàng', exampleVi: 'Mập' },
  { char: 'eng', category: 'nasal', desc: "Phát âm giống hệt 'âng' tiếng Việt.", example: '风', examplePinyin: 'fēng', exampleVi: 'Gió' },
  { char: 'ing', category: 'nasal', desc: "Phát âm giống hệt 'inh' tiếng Việt.", example: '星', examplePinyin: 'xīng', exampleVi: 'Sao' },
  { char: 'ong', category: 'nasal', desc: "Phát âm giống hệt 'ung' tiếng Việt.", example: '红', examplePinyin: 'hóng', exampleVi: 'Màu đỏ' }
]

// Extended combiner finals that actually represent combinations
const combinerFinals = [
  'a', 'o', 'e', 'i', 'u', 'ü', 
  'ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 'üe', 'er',
  'an', 'en', 'in', 'un', 'ün', 'ang', 'eng', 'ing', 'ong',
  'ia', 'ian', 'iang', 'iao', 'iong', 'ua', 'uan', 'uang', 'uai', 'üan'
]

const validCombinations: Record<string, string[]> = {
  'b': ['a', 'o', 'e', 'i', 'u', 'ai', 'ei', 'ao', 'an', 'en', 'ang', 'eng', 'ie', 'ian', 'iao', 'ing'],
  'p': ['a', 'o', 'e', 'i', 'u', 'ai', 'ei', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ie', 'ian', 'iao', 'ing'],
  'm': ['a', 'o', 'e', 'i', 'u', 'ai', 'ei', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ie', 'ian', 'iao', 'ing', 'in'],
  'f': ['a', 'o', 'u', 'ei', 'ou', 'an', 'en', 'ang', 'eng'],
  'd': ['a', 'e', 'i', 'u', 'ai', 'ei', 'ui', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong', 'ia', 'ian', 'iao', 'iu', 'ing', 'ua', 'uan'],
  't': ['a', 'e', 'i', 'u', 'ai', 'ui', 'ao', 'ou', 'an', 'ang', 'eng', 'ong', 'ian', 'iao', 'ing', 'ua', 'uan'],
  'n': ['a', 'e', 'i', 'u', 'ü', 'ai', 'ei', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong', 'ian', 'iao', 'ie', 'iu', 'ing', 'üan', 'üe', 'uan'],
  'l': ['a', 'o', 'e', 'i', 'u', 'ü', 'ai', 'ei', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong', 'ia', 'ian', 'iang', 'iao', 'ie', 'iu', 'ing', 'üan', 'üe', 'uan'],
  'g': ['a', 'e', 'u', 'ai', 'ei', 'ui', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong', 'ua', 'uai', 'uan', 'uang'],
  'k': ['a', 'e', 'u', 'ai', 'ei', 'ui', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong', 'ua', 'uai', 'uan', 'uang'],
  'h': ['a', 'e', 'u', 'ai', 'ei', 'ui', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong', 'ua', 'uai', 'uan', 'uang'],
  'j': ['i', 'u', 'ü', 'ia', 'ian', 'iang', 'iao', 'ie', 'iu', 'ing', 'iong', 'üan', 'üe', 'ün'],
  'q': ['i', 'u', 'ü', 'ia', 'ian', 'iang', 'iao', 'ie', 'iu', 'ing', 'iong', 'üan', 'üe', 'ün'],
  'x': ['i', 'u', 'ü', 'ia', 'ian', 'iang', 'iao', 'ie', 'iu', 'ing', 'iong', 'üan', 'üe', 'ün'],
  'zh': ['a', 'e', 'i', 'u', 'ai', 'ei', 'ui', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong', 'ua', 'uai', 'uan', 'uang'],
  'ch': ['a', 'e', 'i', 'u', 'ai', 'ei', 'ui', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong', 'ua', 'uai', 'uan', 'uang'],
  'sh': ['a', 'e', 'i', 'u', 'ai', 'ei', 'ui', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ua', 'uai', 'uan', 'uang'],
  'r': ['e', 'i', 'u', 'ui', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong', 'ua', 'uan'],
  'z': ['a', 'e', 'i', 'u', 'ai', 'ei', 'ui', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong', 'ua', 'uan'],
  'c': ['a', 'e', 'i', 'u', 'ai', 'ei', 'ui', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong', 'ua', 'uan'],
  's': ['a', 'e', 'i', 'u', 'ai', 'ei', 'ui', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong', 'ua', 'uan'],
  'y': ['a', 'o', 'e', 'i', 'u', 'ü', 'ao', 'ou', 'an', 'in', 'ang', 'ing', 'ong', 'ian', 'iang', 'iao', 'ie', 'iu', 'üan', 'üe', 'ün'],
  'w': ['a', 'o', 'e', 'i', 'u', 'ai', 'ei', 'an', 'en', 'ang', 'eng'],
  '': ['a', 'o', 'e', 'ai', 'ei', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'er']
}

// Convert initial + final into written pinyin and voice text
const getSpelling = (initial: string, final: string) => {
  let written = initial + final
  let speakText = initial + final
  
  if (['j', 'q', 'x'].includes(initial)) {
    if (final === 'u' || final.startsWith('u')) {
      const resolvedFinal = final.replace('u', 'ü')
      speakText = initial + resolvedFinal
      written = initial + final
      return { written, speakText }
    }
    if (final === 'ü' || final.startsWith('ü')) {
      const writtenFinal = final.replace('ü', 'u')
      written = initial + writtenFinal
      speakText = initial + final
      return { written, speakText }
    }
  }
  
  if (!initial) {
    if (final === 'i') return { written: 'yi', speakText: 'yi' }
    if (final === 'u') return { written: 'wu', speakText: 'wu' }
    if (final === 'ü') return { written: 'yu', speakText: 'yu' }
    if (final.startsWith('i')) {
      if (final === 'in') return { written: 'yin', speakText: 'yin' }
      if (final === 'ing') return { written: 'ying', speakText: 'ying' }
      if (final === 'iu') return { written: 'you', speakText: 'you' }
      return { written: 'y' + final.slice(1), speakText: 'y' + final.slice(1) }
    }
    if (final.startsWith('u')) {
      if (final === 'ui') return { written: 'wei', speakText: 'wei' }
      if (final === 'un') return { written: 'wen', speakText: 'wen' }
      if (final === 'ueng') return { written: 'weng', speakText: 'weng' }
      return { written: 'w' + final.slice(1), speakText: 'w' + final.slice(1) }
    }
    if (final.startsWith('ü')) {
      if (final === 'ün') return { written: 'yun', speakText: 'yun' }
      return { written: 'yu' + final.slice(1), speakText: 'yu' + final.slice(1) }
    }
    return { written: final, speakText: final }
  }
  
  return { written, speakText }
}

export default function PinyinAlphabet() {
  const [activeTab, setActiveTab] = useState<'overview' | 'initials' | 'finals' | 'tones' | 'combiner' | 'quiz'>('overview')
  const [ttsSupported, setTtsSupported] = useState(true)
  const [hasVoice, setHasVoice] = useState(false)
  const [playingItem, setPlayingItem] = useState<string | null>(null)

  // Combiner state
  const [selectedInitial, setSelectedInitial] = useState<string>('b')
  const [selectedFinal, setSelectedFinal] = useState<string>('a')

  // Quiz state
  const [quizScore, setQuizScore] = useState(0)
  const [quizTotal, setQuizTotal] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState<{
    correctAnswer: string
    options: string[]
    speakText: string
  } | null>(null)
  const [userSelectedAnswer, setUserSelectedAnswer] = useState<string | null>(null)
  const [quizChecked, setQuizChecked] = useState<boolean>(false)
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const support = 'speechSynthesis' in window
      setTtsSupported(support)
      if (support) {
        window.speechSynthesis.getVoices()
        const checkVoices = () => {
          const voices = window.speechSynthesis.getVoices()
          const zh = voices.some(v => v.lang.includes('zh') || v.lang.includes('ZH'))
          setHasVoice(zh)
        }
        checkVoices()
        window.speechSynthesis.addEventListener('voiceschanged', checkVoices)
        return () => window.speechSynthesis.removeEventListener('voiceschanged', checkVoices)
      }
    }
  }, [])

  const speak = (text: string) => {
    if (!ttsSupported) return
    setPlayingItem(text)
    
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.75 // Slightly slower for beginners
    
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
  const generateQuestion = () => {
    // Pick a random initial and a valid final
    const initials = Object.keys(validCombinations)
    const randomInitial = initials[Math.floor(Math.random() * initials.length)]
    const validFinals = validCombinations[randomInitial]
    const randomFinal = validFinals[Math.floor(Math.random() * validFinals.length)]
    
    const { written, speakText } = getSpelling(randomInitial, randomFinal)
    const tone = Math.floor(Math.random() * 4) + 1 // Tones 1-4
    
    const correctPinyin = addToneToSyllable(written, tone)
    const speakPinyin = addToneToSyllable(speakText, tone)
    
    // Generate distractors with the same base syllable but different tones
    const optionsSet = new Set<string>()
    optionsSet.add(correctPinyin)
    
    // Distractor 1: same syllable, different tone
    const otherTones = [1, 2, 3, 4].filter(t => t !== tone)
    const otherTone = otherTones[Math.floor(Math.random() * otherTones.length)]
    optionsSet.add(addToneToSyllable(written, otherTone))
    
    // Distractor 2 & 3: pick other random valid combinations
    while (optionsSet.size < 4) {
      const rInit = initials[Math.floor(Math.random() * initials.length)]
      const rFin = validCombinations[rInit][Math.floor(Math.random() * validCombinations[rInit].length)]
      const rTone = Math.floor(Math.random() * 4) + 1
      const { written: rW } = getSpelling(rInit, rFin)
      optionsSet.add(addToneToSyllable(rW, rTone))
    }
    
    const options = Array.from(optionsSet).sort(() => Math.random() - 0.5)
    
    setCurrentQuestion({
      correctAnswer: correctPinyin,
      options,
      speakText: speakPinyin
    })
    setUserSelectedAnswer(null)
    setQuizChecked(false)
    setQuizFeedback(null)
    
    // Speak immediately
    setTimeout(() => speak(speakPinyin), 300)
  }

  const handleCheckQuiz = () => {
    if (!currentQuestion || !userSelectedAnswer) return
    setQuizChecked(true)
    const isCorrect = userSelectedAnswer === currentQuestion.correctAnswer
    setQuizFeedback(isCorrect ? 'correct' : 'wrong')
    setQuizTotal(prev => prev + 1)
    if (isCorrect) {
      setQuizScore(prev => prev + 1)
    }
  }

  // Handle active final adjustment if initial changes
  const handleInitialChange = (initial: string) => {
    setSelectedInitial(initial)
    const allowedFinals = validCombinations[initial]
    if (!allowedFinals.includes(selectedFinal)) {
      setSelectedFinal(allowedFinals[0])
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#faf9f6] dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Header Banner */}
          <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3" />
            <div className="absolute left-1/3 bottom-0 w-44 h-44 bg-white/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 space-y-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full text-white">
                <Sparkles className="w-3.5 h-3.5" /> Bắt đầu từ số 0
              </span>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">Bảng chữ cái tiếng Trung (Pinyin)</h1>
              <p className="text-white/80 text-xs md:text-sm max-w-xl font-medium">
                Pinyin (Bính âm) là hệ thống phiên âm La-tinh hóa giúp người nước ngoài phát âm tiếng Trung dễ dàng. Học chuẩn Pinyin là bước đệm cốt lõi trước khi vào bài khóa HSK!
              </p>
            </div>
          </div>

          {/* Browser Voice Warning */}
          {ttsSupported && !hasVoice && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex gap-3 text-amber-700 dark:text-amber-300">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] font-medium leading-relaxed">
                <p className="font-bold">Khuyến cáo thiết bị:</p>
                Trình duyệt của bạn đang dùng bộ đọc mặc định. Để nghe giọng đọc tiếng Trung bản xứ chuẩn xác nhất, chúng tôi khuyến nghị sử dụng **Google Chrome** hoặc **Safari** và đảm bảo đã cài đặt gói ngôn ngữ tiếng Trung.
              </div>
            </div>
          )}

          {/* Tabs Navigation */}
          <div className="flex overflow-x-auto pb-1 gap-1.5 scrollbar-none border-b border-gray-200 dark:border-slate-800">
            {[
              { id: 'overview', name: 'Tổng quan', icon: BookOpen },
              { id: 'initials', name: 'Thanh mẫu (Initials)', icon: Layers },
              { id: 'finals', name: 'Vận mẫu (Finals)', icon: Layers },
              { id: 'tones', name: 'Thanh điệu (Tones)', icon: Music },
              { id: 'combiner', name: 'Bảng Ghép Vần', icon: RefreshCw },
              { id: 'quiz', name: 'Trắc nghiệm nghe', icon: HelpCircle },
            ].map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any)
                    if (tab.id === 'quiz' && !currentQuestion) {
                      // Generate first question on tab enter
                      setTimeout(generateQuestion, 50)
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all whitespace-nowrap border-b-2 ${
                    isActive
                      ? 'border-rose-500 text-rose-500 bg-rose-50/30 dark:bg-rose-950/10'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div className="min-h-[40vh] transition-all">

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Left Column: Visual anatomy of Pinyin */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                      <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 mb-4">Cấu trúc một âm tiết Pinyin</h2>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                        Khác với tiếng Việt ghép chữ cái độc lập, tiếng Trung biểu diễn qua chữ Hán (chữ tượng hình). Để đọc chữ Hán đó, người ta dùng Pinyin gồm 3 phần ghép lại:
                      </p>

                      {/* Visual Formula */}
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                        
                        <div className="text-center p-4 bg-white dark:bg-slate-900 border dark:border-slate-850 rounded-xl shadow-xs min-w-[100px]">
                          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Thanh mẫu</span>
                          <span className="text-2xl font-black text-rose-500">n</span>
                          <span className="block text-[9px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">Âm đầu (Initials)</span>
                        </div>

                        <span className="text-xl font-bold text-slate-350">+</span>

                        <div className="text-center p-4 bg-white dark:bg-slate-900 border dark:border-slate-850 rounded-xl shadow-xs min-w-[100px]">
                          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Vận mẫu</span>
                          <span className="text-2xl font-black text-amber-500">i</span>
                          <span className="block text-[9px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">Vần chính (Finals)</span>
                        </div>

                        <span className="text-xl font-bold text-slate-350">+</span>

                        <div className="text-center p-4 bg-white dark:bg-slate-900 border dark:border-slate-850 rounded-xl shadow-xs min-w-[100px]">
                          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Thanh điệu</span>
                          <span className="text-2xl font-black text-emerald-500">ˇ</span>
                          <span className="block text-[9px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">Dấu giọng (Tones)</span>
                        </div>

                        <span className="text-xl font-bold text-slate-350">=</span>

                        <div className="text-center p-4 bg-rose-500 text-white rounded-xl shadow-md min-w-[110px] animate-pulse">
                          <span className="block text-[10px] text-white/80 font-bold uppercase tracking-wider mb-1">Âm tiết chuẩn</span>
                          <span className="text-2xl font-black">nǐ</span>
                          <span className="block text-[9px] text-white/90 mt-1 font-semibold">Nghĩa: Bạn (Nhĩ)</span>
                        </div>

                      </div>

                      <div className="mt-6 p-4 rounded-2xl bg-rose-50/30 dark:bg-rose-950/10 border border-rose-100/30 text-xs font-semibold text-slate-700 dark:text-slate-300 space-y-2">
                        <div className="flex gap-2">
                          <span className="text-rose-500">•</span>
                          <span><strong>Thanh mẫu:</strong> Có 21 thanh mẫu phụ âm (tương đương phụ âm đầu tiếng Việt).</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-amber-500">•</span>
                          <span><strong>Vận mẫu:</strong> Có 36 vận mẫu nguyên âm (tương đương phần vần tiếng Việt).</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-emerald-500">•</span>
                          <span><strong>Thanh điệu:</strong> Gồm 4 thanh điệu chính và 1 thanh nhẹ (tương đương thanh dấu tiếng Việt, làm thay đổi nghĩa hoàn toàn của từ).</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Key Rules */}
                  <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <Info className="w-5 h-5 text-rose-500" />
                      Quy tắc vàng cho người mới
                    </h3>
                    
                    <div className="space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl space-y-1">
                        <h4 className="text-rose-500 font-extrabold text-[11px]">1. Không đọc như tiếng Anh</h4>
                        <p className="leading-relaxed">Âm 'b' không phát âm là 'bê' mà là 'p' không bật hơi. Âm 'd' phát âm thành 't'.</p>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl space-y-1">
                        <h4 className="text-amber-500 font-extrabold text-[11px]">2. Quy tắc bật hơi (Aspirated)</h4>
                        <p className="leading-relaxed">Rất quan trọng! Cặp âm như B - P, D - T, J - Q phân biệt bằng việc có bật một luồng hơi mạnh từ miệng ra hay không.</p>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl space-y-1">
                        <h4 className="text-emerald-500 font-extrabold text-[11px]">3. Cao độ thanh điệu</h4>
                        <p className="leading-relaxed">Giọng tiếng Trung bay bổng và nhấn nhá mạnh. Cần phát âm đúng cao độ của 4 thanh điệu để tránh hiểu lầm ý nghĩa từ vựng.</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('initials')}
                      className="w-full mt-2 py-3 bg-rose-500 hover:bg-rose-600 transition-colors text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm"
                    >
                      Bắt đầu học Thanh mẫu <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* TAB: INITIALS (Thanh mẫu) */}
            {activeTab === 'initials' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Bảng 21 Thanh mẫu (Phụ âm đầu)</h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Bấm vào từng chữ để nghe phát âm mẫu và xem chú giải khẩu hình hơi.</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border dark:border-slate-800">
                    Mẹo: Môi khép chặt, bật hơi đúng lúc
                  </span>
                </div>

                {/* Grid grouped by category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from(new Set(initialsData.map(item => item.category))).map(cat => {
                    const filtered = initialsData.filter(item => item.category === cat)
                    return (
                      <div key={cat} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-850 rounded-3xl p-5 shadow-xs space-y-3.5">
                        <span className="inline-block text-[9px] font-black text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-3 py-1 rounded-full uppercase tracking-wider border border-rose-100/10">
                          {cat}
                        </span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {filtered.map(item => {
                            const isPlaying = playingItem === item.char
                            return (
                              <button
                                key={item.char}
                                onClick={() => speak(item.char)}
                                className={`p-4 rounded-2xl border text-left transition-all duration-200 relative group flex items-start justify-between ${
                                  isPlaying
                                    ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/10 shadow-xs'
                                    : 'border-slate-150 dark:border-slate-800/80 hover:border-rose-200 hover:bg-slate-50/50 dark:hover:bg-slate-900'
                                }`}
                              >
                                <div className="space-y-1.5 pr-2">
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-black text-slate-800 dark:text-slate-150">{item.char}</span>
                                    <span className="text-[10px] font-bold text-slate-400">({item.char === 'y' || item.char === 'w' ? 'âm phụ' : 'âm tiết'})</span>
                                  </div>
                                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {item.desc}
                                  </p>
                                  <div className="pt-1 flex items-center gap-1.5">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Ví dụ:</span>
                                    <span className="text-xs font-black text-rose-500 font-sans">{item.example}</span>
                                    <span className="text-[10px] text-slate-400 font-bold">({item.examplePinyin} - {item.exampleVi})</span>
                                  </div>
                                </div>
                                
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                                  isPlaying 
                                    ? 'bg-rose-500 text-white animate-pulse'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-rose-500 group-hover:text-white'
                                }`}>
                                  <Volume2 className="w-3.5 h-3.5" />
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* TAB: FINALS (Vận mẫu) */}
            {activeTab === 'finals' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Bảng 36 Vận mẫu (Nguyên âm & Vần)</h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Được chia thành Vận mẫu đơn, kép và mũi. Bấm để nghe khẩu hình âm.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Category Sections */}
                  {[
                    { id: 'simple', label: 'Vận mẫu đơn (Simple Finals)', color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20 border-rose-100/10' },
                    { id: 'compound', label: 'Vận mẫu kép (Compound Finals)', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-100/10' },
                    { id: 'nasal', label: 'Vận mẫu mũi (Nasal Finals)', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100/10' },
                  ].map(sec => {
                    const filtered = finalsData.filter(item => item.category === sec.id)
                    return (
                      <div key={sec.id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-850 rounded-3xl p-5 shadow-xs space-y-4">
                        <span className={`inline-block text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider border ${sec.color}`}>
                          {sec.label}
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {filtered.map(item => {
                            const isPlaying = playingItem === item.char
                            return (
                              <button
                                key={item.char}
                                onClick={() => speak(item.char)}
                                className={`p-4 rounded-2xl border text-left transition-all duration-200 relative group flex items-start justify-between ${
                                  isPlaying
                                    ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/10 shadow-xs'
                                    : 'border-slate-150 dark:border-slate-800/80 hover:border-rose-200 hover:bg-slate-50/50 dark:hover:bg-slate-900'
                                }`}
                              >
                                <div className="space-y-1.5 pr-2">
                                  <span className="text-lg font-black text-slate-800 dark:text-slate-150">{item.char}</span>
                                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {item.desc}
                                  </p>
                                  <div className="pt-0.5 flex items-center gap-1.5">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Ví dụ:</span>
                                    <span className="text-xs font-black text-rose-500 font-sans">{item.example}</span>
                                    <span className="text-[10px] text-slate-400 font-bold">({item.examplePinyin})</span>
                                  </div>
                                </div>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                                  isPlaying 
                                    ? 'bg-rose-500 text-white animate-pulse'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-rose-500 group-hover:text-white'
                                }`}>
                                  <Volume2 className="w-3.5 h-3.5" />
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* TAB: TONES (Thanh điệu) */}
            {activeTab === 'tones' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-850 rounded-3xl p-6 shadow-sm">
                  <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 mb-2">Hệ thống 4 Thanh điệu tiếng Trung</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl font-semibold mb-6">
                    Thanh điệu thay đổi toàn bộ ý nghĩa của từ. Ví dụ: từ mang phụ âm đầu 'm' và vần 'a' (`ma`) có thể mang 5 nghĩa khác nhau dựa vào 4 thanh chính (ā, á, ǎ, à) và thanh nhẹ.
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* SVG Tone Chart Visualizer */}
                    <div className="lg:col-span-2 flex flex-col justify-center items-center p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Đồ thị cao độ thanh điệu</span>
                      
                      <svg viewBox="0 0 200 150" className="w-full max-w-[200px] h-auto">
                        {/* Grid lines */}
                        <line x1="20" y1="20" x2="180" y2="20" stroke="#e2e8f0" strokeDasharray="3" strokeWidth="1" />
                        <line x1="20" y1="50" x2="180" y2="50" stroke="#e2e8f0" strokeDasharray="3" strokeWidth="1" />
                        <line x1="20" y1="80" x2="180" y2="80" stroke="#e2e8f0" strokeDasharray="3" strokeWidth="1" />
                        <line x1="20" y1="110" x2="180" y2="110" stroke="#e2e8f0" strokeDasharray="3" strokeWidth="1" />
                        <line x1="20" y1="140" x2="180" y2="140" stroke="#cbd5e1" strokeWidth="1.5" />

                        {/* Y-axis labels */}
                        <text x="5" y="24" fontSize="8" fontWeight="bold" fill="#94a3b8">5 (Cao)</text>
                        <text x="5" y="54" fontSize="8" fontWeight="bold" fill="#94a3b8">4</text>
                        <text x="5" y="84" fontSize="8" fontWeight="bold" fill="#94a3b8">3 (Trung)</text>
                        <text x="5" y="114" fontSize="8" fontWeight="bold" fill="#94a3b8">2</text>
                        <text x="5" y="144" fontSize="8" fontWeight="bold" fill="#94a3b8">1 (Thấp)</text>

                        {/* Tone 1 (ā) - High Flat (5-5) */}
                        <path d="M 40 20 L 160 20" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" fill="none" />
                        <text x="165" y="23" fontSize="8" fontWeight="black" fill="#f43f5e">T1</text>

                        {/* Tone 2 (á) - Rising (3-5) */}
                        <path d="M 40 80 Q 90 60 140 20" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" fill="none" />
                        <text x="145" y="25" fontSize="8" fontWeight="black" fill="#f59e0b">T2</text>

                        {/* Tone 3 (ǎ) - Dipping (2-1-4) */}
                        <path d="M 45 80 Q 90 150 140 50" stroke="#10b981" strokeWidth="3" strokeLinecap="round" fill="none" />
                        <text x="145" y="55" fontSize="8" fontWeight="black" fill="#10b981">T3</text>

                        {/* Tone 4 (à) - Falling (5-1) */}
                        <path d="M 40 20 L 140 140" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" fill="none" />
                        <text x="145" y="142" fontSize="8" fontWeight="black" fill="#3b82f6">T4</text>
                      </svg>
                      
                      <div className="mt-4 flex flex-wrap justify-center gap-2 text-[9px] font-bold text-slate-400">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Thanh 1</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Thanh 2</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Thanh 3</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Thanh 4</span>
                      </div>
                    </div>

                    {/* Interactive Tone Cards */}
                    <div className="lg:col-span-3 space-y-3">
                      {[
                        { num: 1, char: 'ā', name: 'Thanh 1 (Thanh ngang - High level)', level: '5-5', desc: 'Đọc cao, ngang bằng, kéo dài đều đều.', exWord: 'mā', translation: 'Mẹ (妈)', color: 'border-rose-100 hover:border-rose-300 dark:border-slate-800' },
                        { num: 2, char: 'á', name: 'Thanh 2 (Thanh sắc - Rising)', level: '3-5', desc: 'Đọc tăng dần từ trung bình lên cao (giống dấu sắc tiếng Việt).', exWord: 'má', translation: 'Cây đay (麻)', color: 'border-amber-100 hover:border-amber-300 dark:border-slate-800' },
                        { num: 3, char: 'ǎ', name: 'Thanh 3 (Thanh hỏi - Dipping)', level: '2-1-4', desc: 'Đọc hạ giọng xuống thấp rồi nâng nhẹ lên cao (giống dấu hỏi nhưng kéo dài).', exWord: 'mǎ', translation: 'Con ngựa (马)', color: 'border-emerald-100 hover:border-emerald-300 dark:border-slate-800' },
                        { num: 4, char: 'à', name: 'Thanh 4 (Thanh huyền - Falling)', level: '5-1', desc: 'Hạ giọng cực nhanh và dứt khoát từ cao nhất xuống thấp nhất (âm điệu quát dứt khoát).', exWord: 'mà', translation: 'Mắng chửi (骂)', color: 'border-blue-100 hover:border-blue-300 dark:border-slate-800' },
                        { num: 5, char: 'a', name: 'Thanh nhẹ (Neutral tone)', level: 'N/A', desc: 'Đọc cực kỳ ngắn, nhẹ, không nhấn giọng.', exWord: 'ma', translation: 'Không? (trợ từ hỏi 吗)', color: 'border-slate-100 hover:border-slate-300 dark:border-slate-800' }
                      ].map(tone => {
                        const isPlaying = playingItem === tone.exWord
                        return (
                          <button
                            key={tone.num}
                            onClick={() => speak(tone.exWord)}
                            className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between group bg-slate-50/30 dark:bg-slate-900/50 ${tone.color} ${
                              isPlaying ? 'ring-2 ring-rose-500' : ''
                            }`}
                          >
                            <div className="space-y-1 pr-4">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-700 dark:text-slate-300">
                                  {tone.num}
                                </span>
                                <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{tone.name}</h3>
                                <span className="text-[9px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase">Cao độ {tone.level}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                                {tone.desc}
                              </p>
                              <div className="flex items-baseline gap-1 pt-1.5 text-xs">
                                <span className="font-bold text-[10px] text-slate-400">Ví dụ:</span>
                                <span className="font-extrabold text-rose-500 font-sans">{tone.exWord}</span>
                                <span className="text-[10px] text-slate-400 font-semibold">({tone.translation})</span>
                              </div>
                            </div>

                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                              isPlaying
                                ? 'bg-rose-500 text-white animate-pulse'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-rose-500 group-hover:text-white'
                            }`}>
                              <Volume2 className="w-4 h-4" />
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SYLLABLE COMBINER (Bảng ghép vần) */}
            {activeTab === 'combiner' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-850 rounded-3xl p-6 shadow-sm space-y-6">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Công cụ tự động Ghép vần tương tác</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                      Chọn một Thanh mẫu (bên trái) và Vận mẫu (bên phải) để kiểm tra xem chúng có kết hợp được không. Nếu có, bấm vào từng âm tiết ở dưới để nghe phát âm cả 4 thanh điệu.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Left side: Selector grids */}
                    <div className="space-y-4">
                      
                      {/* Initial selector */}
                      <div className="space-y-2">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Bước 1: Chọn Thanh mẫu (Initials)</span>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.keys(validCombinations).map(init => {
                            const isSelected = selectedInitial === init
                            return (
                              <button
                                key={init}
                                type="button"
                                onClick={() => handleInitialChange(init)}
                                className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${
                                  isSelected
                                    ? 'bg-rose-500 text-white shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                                }`}
                              >
                                {init === '' ? 'Ø (Không)' : init}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Final selector */}
                      <div className="space-y-2">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Bước 2: Chọn Vận mẫu (Finals)</span>
                        <div className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                          {combinerFinals.map(fin => {
                            const isSelected = selectedFinal === fin
                            // Check if this final can combine with selected initial
                            const isAllowed = validCombinations[selectedInitial]?.includes(fin)
                            
                            return (
                              <button
                                key={fin}
                                type="button"
                                disabled={!isAllowed}
                                onClick={() => setSelectedFinal(fin)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  isSelected
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : isAllowed
                                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                                      : 'opacity-20 cursor-not-allowed bg-slate-50 dark:bg-slate-900 text-slate-300'
                                }`}
                              >
                                {fin}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                    </div>

                    {/* Right side: Results display */}
                    <div className="flex flex-col justify-between p-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl min-h-[220px]">
                      
                      <div className="space-y-4">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Âm tiết kết hợp được</span>
                        
                        {(() => {
                          const { written, speakText } = getSpelling(selectedInitial, selectedFinal)
                          const combinationText = selectedInitial === '' ? selectedFinal : `${selectedInitial} + ${selectedFinal}`
                          
                          return (
                            <div className="text-center space-y-4">
                              <div className="inline-block px-3 py-1 bg-rose-50 dark:bg-rose-950/20 border border-rose-100/10 rounded-full text-[10px] font-bold text-rose-500">
                                {combinationText}
                              </div>

                              <div className="space-y-1">
                                <span className="block text-4xl font-black text-slate-800 dark:text-white font-sans tracking-tight">
                                  {written}
                                </span>
                                {selectedInitial === 'j' || selectedInitial === 'q' || selectedInitial === 'x' ? (
                                  (selectedFinal === 'u' || selectedFinal.startsWith('u') || selectedFinal === 'ü' || selectedFinal.startsWith('ü')) && (
                                    <span className="inline-block text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded border border-amber-100/10 mt-1">
                                      Lưu ý chính tả: âm gốc 'ü' bỏ dấu hai chấm khi viết ghép thành 'u'
                                    </span>
                                  )
                                ) : null}
                              </div>

                              {/* Tone Options Card Grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                                {[1, 2, 3, 4].map(tone => {
                                  const tonedSpelling = addToneToSyllable(written, tone)
                                  const tonedVoice = addToneToSyllable(speakText, tone)
                                  const isPlaying = playingItem === tonedVoice
                                  
                                  return (
                                    <button
                                      key={tone}
                                      onClick={() => speak(tonedVoice)}
                                      className={`p-3.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                                        isPlaying
                                          ? 'bg-rose-500 border-rose-500 text-white'
                                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:text-slate-100 hover:scale-[1.03]'
                                      }`}
                                    >
                                      <span className="text-[9px] opacity-75 font-semibold">Thanh {tone}</span>
                                      <span className="text-lg font-black font-sans leading-none my-1">{tonedSpelling}</span>
                                      <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? 'text-white' : 'text-slate-450'}`} />
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })()}
                      </div>

                      <div className="text-center text-[10px] text-slate-400 font-semibold pt-4">
                        Mẹo: Nhấn vào các ô ở trên để nghe phát âm cụ thể theo từng dấu giọng.
                      </div>

                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* TAB: LISTEN QUIZ (Trắc nghiệm âm thanh) */}
            {activeTab === 'quiz' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-850 rounded-3xl p-6 shadow-sm max-w-2xl mx-auto space-y-6">
                  
                  {/* Scoreboard */}
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Luyện nghe Phản xạ Pinyin</h2>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Bấm loa để nghe, và chọn đáp án chính xác nhất mà bạn nghe được.</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Điểm số</span>
                      <span className="text-lg font-black text-rose-500">{quizScore}/{quizTotal}</span>
                    </div>
                  </div>

                  {/* Question Card */}
                  {currentQuestion ? (
                    <div className="space-y-6 py-2">
                      
                      {/* Audio Button */}
                      <div className="flex flex-col items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => speak(currentQuestion.speakText)}
                          className="w-16 h-16 rounded-full bg-rose-500 hover:bg-rose-600 active:scale-95 transition-all text-white flex items-center justify-center shadow-md animate-bounce group"
                          title="Nghe lại âm"
                        >
                          <Volume2 className="w-7 h-7 group-hover:scale-110 transition-transform" />
                        </button>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bấm để phát âm thanh</span>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                        {currentQuestion.options.map(opt => {
                          const isSelected = userSelectedAnswer === opt
                          const isCorrect = opt === currentQuestion.correctAnswer
                          
                          let btnClass = 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                          
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
                              key={opt}
                              type="button"
                              disabled={quizChecked}
                              onClick={() => setUserSelectedAnswer(opt)}
                              className={`p-4 rounded-2xl border text-center text-lg font-black font-sans transition-all flex items-center justify-center gap-2 ${btnClass}`}
                            >
                              {opt}
                              {quizChecked && isCorrect && <Check className="w-5 h-5 text-emerald-500 stroke-[3]" />}
                              {quizChecked && isSelected && !isCorrect && <X className="w-5 h-5 text-rose-500 stroke-[3]" />}
                            </button>
                          )
                        })}
                      </div>

                      {/* Controls and Feedback */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          {quizFeedback === 'correct' && (
                            <span className="flex items-center gap-1.5 text-xs font-black text-emerald-500">
                              <Check className="w-5 h-5 stroke-[3] animate-ping" /> Chính xác! Bạn nghe tốt đấy!
                            </span>
                          )}
                          {quizFeedback === 'wrong' && (
                            <span className="flex items-center gap-1.5 text-xs font-black text-rose-500">
                              <X className="w-5 h-5 stroke-[3]" /> Sai mất rồi! Đáp án đúng là "{currentQuestion.correctAnswer}".
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                          {!quizChecked ? (
                            <button
                              type="button"
                              disabled={!userSelectedAnswer}
                              onClick={handleCheckQuiz}
                              className="w-full sm:w-auto px-6 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all"
                            >
                              Kiểm tra kết quả
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={generateQuestion}
                              className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
                            >
                              Câu tiếp theo <ArrowRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <button
                        type="button"
                        onClick={generateQuestion}
                        className="px-6 py-3 bg-rose-500 text-white rounded-xl text-xs font-bold"
                      >
                        Bắt đầu câu hỏi đầu tiên
                      </button>
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>

        </div>
      </main>
    </div>
  )
}
