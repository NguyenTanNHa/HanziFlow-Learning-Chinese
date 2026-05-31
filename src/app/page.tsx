// src/app/page.tsx
import Link from 'next/link'
import {
  Sparkles, Map, Bookmark, FileText, Headphones,
  Mic, ArrowRight, CheckCircle2,
  Star, Users, BookOpen, TrendingUp, Zap, Shield,
  RotateCcw, Volume2, PenLine, Target, Award, Clock
} from 'lucide-react'
import InteractiveFlashcardDemo from '@/components/InteractiveFlashcardDemo'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ══════════ NAVBAR ══════════ */}
      <header className="sticky top-0 z-50 bg-white border-b-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-[#E63946] flex items-center justify-center text-white font-extrabold text-lg">H</div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900">HanziFlow</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-500">
            <a href="#features" className="hover:text-[#E63946] transition-colors duration-200">Tính năng</a>
            <a href="#roadmap" className="hover:text-[#E63946] transition-colors duration-200">Lộ trình</a>
            <a href="#skills" className="hover:text-[#E63946] transition-colors duration-200">Kỹ năng</a>
            <a href="#testimonials" className="hover:text-[#E63946] transition-colors duration-200">Học viên</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-sm font-bold text-gray-500 hover:text-[#E63946] transition-colors duration-200">
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="px-5 h-10 flex items-center text-sm font-bold text-white bg-[#E63946] hover:bg-red-700 rounded-md transition-all duration-200 hover:scale-105"
            >
              Bắt đầu miễn phí
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════ HERO — Bold Red Block ══════════ */}
      <section className="relative bg-[#E63946] overflow-hidden">
        {/* Geometric decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-32 -translate-y-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-20 translate-y-20" />
        <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-white/5 rotate-45" />
        <div className="absolute top-16 left-1/3 w-20 h-20 bg-white/5 rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white/20 text-white font-bold text-xs uppercase tracking-wider mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              Nền tảng học tiếng Trung số 1 cho người Việt
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.05]">
              Học tiếng Trung<br />
              theo <span className="text-amber-300">lộ trình rõ ràng</span>,<br />
              từ HSK 1 đến HSK 6.
            </h1>

            <p className="mt-8 text-xl text-white/75 max-w-xl leading-relaxed">
              HanziFlow kết hợp khoa học ghi nhớ, lộ trình cá nhân hóa và luyện thi HSKK — chỉ 15 phút mỗi ngày.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="/register"
                id="hero-cta-primary"
                className="flex items-center gap-2 px-8 h-14 text-base font-bold text-[#E63946] bg-white hover:bg-gray-100 rounded-md transition-all duration-200 hover:scale-105 group"
              >
                Bắt đầu ngay hôm nay
                <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                id="hero-cta-secondary"
                className="flex items-center gap-2 px-8 h-14 text-base font-bold text-white border-4 border-white/50 hover:border-white hover:bg-white/15 rounded-md transition-all duration-200 hover:scale-105"
              >
                <BookOpen className="w-5 h-5" />
                Học tiếp bài của bạn
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold text-white/70">
              {['Không quảng cáo', 'Bản dịch chuẩn tiếng Việt', 'Đầy đủ 6 cấp HSK', 'Luyện thi HSKK'].map((t, i) => (
                <span key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white/90" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ STATS STRIP — Gray-100 Block ══════════ */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '6', label: 'Cấp độ HSK', color: 'text-[#E63946]' },
            { value: '3,000+', label: 'Từ vựng & Hán tự', color: 'text-amber-500' },
            { value: '200+', label: 'Điểm ngữ pháp', color: 'text-blue-600' },
            { value: '15 phút', label: 'Mỗi ngày là đủ', color: 'text-emerald-600' },
          ].map(stat => (
            <div key={stat.label}>
              <p className={`text-4xl font-extrabold ${stat.color} tracking-tight`}>{stat.value}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ FEATURES — White Block ══════════ */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-xs font-bold text-[#E63946] uppercase tracking-widest mb-3">Tính năng nổi bật</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              Phương pháp khoa học,<br />giao diện trực quan.
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl">
              Tích hợp mọi kỹ năng trong một hệ sinh thái học tập tối giản mà hiệu quả.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Map, iconBg: 'bg-[#E63946]', bg: 'bg-rose-50', title: 'Lộ trình cá nhân hóa', desc: 'Lộ trình 6 giai đoạn thích ứng theo năng lực, tự động gợi ý bài học tiếp theo phù hợp với trình độ hiện tại của bạn.' },
              { icon: RotateCcw, iconBg: 'bg-amber-500', bg: 'bg-amber-50', title: 'Flashcard SRS 3D', desc: 'Thuật toán Lặp lại ngắt quãng thông minh tối ưu thời gian ôn tập. Lật thẻ 3D mượt mà kèm phiên âm và nghĩa tiếng Việt.' },
              { icon: FileText, iconBg: 'bg-blue-600', bg: 'bg-blue-50', title: 'Ngữ pháp sinh động', desc: 'Công thức cấu trúc ngữ pháp trực quan kèm 3 ví dụ thực tế, có phiên âm và bản dịch. Bài luyện tập kiểm tra ngay.' },
              { icon: Headphones, iconBg: 'bg-indigo-600', bg: 'bg-indigo-50', title: 'Luyện nghe chuẩn HSK', desc: 'Bài nghe phân loại theo cấp độ với bản ghi âm bản ngữ. Bài tập trắc nghiệm và điền khuyết sau mỗi đoạn hội thoại.' },
              { icon: Mic, iconBg: 'bg-purple-600', bg: 'bg-purple-50', title: 'Luyện nói HSKK', desc: 'Mô phỏng bài thi HSKK với đồng hồ đếm ngược chuẩn. Ghi âm giọng nói, phát lại và tự đánh giá. Hỗ trợ 3 cấp HSKK.' },
              { icon: TrendingUp, iconBg: 'bg-emerald-600', bg: 'bg-emerald-50', title: 'Theo dõi tiến độ', desc: 'Dashboard tổng quan hiển thị streak, XP tích lũy, từ vựng đã học và tỉ lệ ghi nhớ. Báo cáo tuần chi tiết mỗi kỹ năng.' },
            ].map(feat => {
              const Icon = feat.icon
              return (
                <div key={feat.title} className={`${feat.bg} p-6 rounded-lg group cursor-default transition-all duration-200 hover:scale-[1.02]`}>
                  <div className={`w-14 h-14 rounded-md ${feat.iconBg} flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-110`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feat.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{feat.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════ ROADMAP — Gray-100 Block ══════════ */}
      <section id="roadmap" className="py-24 bg-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-xs font-bold text-[#E63946] uppercase tracking-widest mb-3">Lộ trình học tập</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              Từ sơ cấp đến cao cấp —<br />rõ ràng từng bước.
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl">
              Mỗi giai đoạn được thiết kế khoa học, tích lũy có hệ thống.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { hsk: 'HSK 1', stage: 'Giai đoạn 1', desc: '150 từ vựng thiết yếu, cấu trúc câu đơn giản. Nền tảng để bắt đầu giao tiếp hàng ngày.', vocab: 150, grammar: 15, bg: 'bg-[#E63946]' },
              { hsk: 'HSK 2', stage: 'Giai đoạn 2', desc: '300 từ vựng tích lũy, câu phủ định, câu hỏi, hội thoại giao tiếp cơ bản.', vocab: 300, grammar: 30, bg: 'bg-orange-500' },
              { hsk: 'HSK 3', stage: 'Giai đoạn 3', desc: '600 từ vựng, ngữ pháp trung cấp, câu phức. Đọc hiểu đoạn văn ngắn.', vocab: 600, grammar: 60, bg: 'bg-amber-500' },
              { hsk: 'HSK 4', stage: 'Giai đoạn 4', desc: '1,200 từ vựng, luyện viết luận, thảo luận ý kiến. Nghe hội thoại dài.', vocab: 1200, grammar: 100, bg: 'bg-lime-600' },
              { hsk: 'HSK 5', stage: 'Giai đoạn 5', desc: '2,500 từ vựng, ngữ pháp nâng cao, thành ngữ. Đọc báo chí và tài liệu chuyên ngành.', vocab: 2500, grammar: 150, bg: 'bg-blue-600' },
              { hsk: 'HSK 6', stage: 'Giai đoạn 6', desc: '5,000+ từ vựng, thành thạo toàn diện 4 kỹ năng. Đọc văn học, viết học thuật.', vocab: 5000, grammar: 200, bg: 'bg-purple-600' },
            ].map((item, i) => (
              <div key={item.hsk} className="bg-white rounded-lg p-5 flex items-center gap-5 group cursor-default transition-all duration-200 hover:scale-[1.01]">
                <div className={`${item.bg} w-16 h-16 rounded-md flex flex-col items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110`}>
                  <span className="text-white font-black text-sm">{item.hsk}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-sm text-gray-900">{item.hsk}</span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">· {item.stage}</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
                <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                  <div className="text-center">
                    <span className="block text-xl font-black text-gray-900">{item.vocab.toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Từ vựng</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-black text-gray-900">{item.grammar}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ngữ pháp</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FLASHCARD — White Block ══════════ */}
      <section id="skills" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-bold text-[#E63946] uppercase tracking-widest mb-3">Flashcard thông minh</p>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
                Ghi nhớ Hán tự<br /><span className="text-[#E63946]">lâu hơn 5 lần</span> với SRS.
              </h2>
              <p className="mt-5 text-lg text-gray-500 leading-relaxed">
                Thuật toán Spaced Repetition khoa học giúp bạn ôn tập đúng từ, đúng lúc — tránh lãng phí thời gian ôn những gì đã nhớ.
              </p>
              <div className="mt-8 space-y-3">
                {[
                  { icon: Volume2, color: 'bg-[#E63946]', text: 'Phát âm chuẩn bằng giọng bản ngữ' },
                  { icon: Zap, color: 'bg-amber-500', text: 'Hiệp ảnh ghi nhớ theo bộ thủ Hán tự' },
                  { icon: Shield, color: 'bg-blue-600', text: 'Bài kiểm tra 4 hình thức: chọn, điền, nghe, viết' },
                  { icon: Target, color: 'bg-emerald-600', text: 'Mục tiêu học từ mỗi ngày có thể tùy chỉnh' },
                ].map(item => {
                  const Icon = item.icon
                  return (
                    <div key={item.text} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-md ${item.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-600">{item.text}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <InteractiveFlashcardDemo />
          </div>
        </div>
      </section>

      {/* ══════════ HSKK SPEAKING — Bold Red Block ══════════ */}
      <section className="relative bg-[#E63946] overflow-hidden py-24">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-24 -translate-y-24" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-32 translate-y-32" />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rotate-12" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Visual card */}
            <div className="order-2 lg:order-1">
              <div className="bg-white/10 rounded-lg border-2 border-white/20 p-6">
                <div className="bg-white/10 rounded-md p-4 mb-4">
                  <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2">HSKK Trung cấp · Câu 2/3</p>
                  <p className="text-white font-bold text-base">请描述一下你的家庭成员。</p>
                  <p className="text-white/60 text-sm mt-1">Hãy miêu tả các thành viên trong gia đình bạn.</p>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 bg-white/10 rounded-md h-10 flex items-center px-4 gap-1">
                    {[4, 7, 5, 8, 6, 9, 5, 7, 4, 8, 6, 5, 7, 9, 6].map((h, i) => (
                      <div key={i} className="w-1 bg-white/60 rounded-full animate-pulse" style={{ height: `${h * 3}px`, animationDelay: `${i * 0.1}s` }} />
                    ))}
                    <span className="text-white/60 text-xs ml-2">00:18 / 02:00</span>
                  </div>
                  <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center">
                    <Mic className="w-5 h-5 text-[#E63946]" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {['Chuẩn bị: 15s', 'Trả lời: 2min', 'Hội thoại: 3s'].map(label => (
                    <div key={label} className="bg-white/10 rounded-md py-2.5 px-2">
                      <p className="text-white/80 text-[10px] font-bold">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="order-1 lg:order-2 text-white">
              <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">Luyện nói HSKK</p>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Tự tin nói tiếng Trung với bài thi HSKK mô phỏng thực tế.
              </h2>
              <p className="mt-5 text-white/75 text-lg leading-relaxed">
                Từ HSKK Sơ cấp đến Cao cấp — luyện tập với định dạng thi thực tế và đồng hồ chuẩn.
              </p>
              <div className="mt-6 space-y-3">
                {['Mô phỏng 3 cấp độ HSKK: Sơ, Trung, Cao cấp', 'Đồng hồ đếm ngược chuẩn bị và trả lời', 'Ghi âm và phát lại ngay trong trình duyệt', 'Câu hỏi mẫu phân loại theo chủ đề thi'].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-md bg-white/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-white/80 text-sm font-semibold">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/register" className="mt-8 inline-flex items-center gap-2 px-8 h-14 bg-white text-[#E63946] font-bold rounded-md text-sm hover:bg-gray-100 transition-all duration-200 hover:scale-105">
                Luyện HSKK ngay <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ PROGRESS TRACKING — Gray-100 Block ══════════ */}
      <section className="py-24 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-bold text-[#E63946] uppercase tracking-widest mb-3">Theo dõi tiến độ</p>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
                Biết chính xác bạn<br />đang ở đâu trên hành trình.
              </h2>
              <p className="mt-5 text-lg text-gray-500 leading-relaxed">
                Dashboard trực quan hiển thị streak, XP tích lũy, tiến độ từng kỹ năng và dự báo thời gian hoàn thành.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {[
                  { label: 'Streak học tập', value: '🔥 7 ngày', bg: 'bg-orange-50' },
                  { label: 'XP hôm nay', value: '⭐ 240 XP', bg: 'bg-amber-50' },
                  { label: 'Từ đã nhớ', value: '📚 423', bg: 'bg-blue-50' },
                  { label: 'Tỉ lệ đúng', value: '✅ 87%', bg: 'bg-emerald-50' },
                ].map(stat => (
                  <div key={stat.label} className={`${stat.bg} rounded-lg p-4 group cursor-default transition-all duration-200 hover:scale-[1.02]`}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="text-xl font-extrabold text-gray-900">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Tiến độ 7 ngày gần nhất</p>
              <div className="flex items-end gap-2 h-28 mb-3">
                {[40, 65, 50, 80, 70, 90, 75].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-full rounded-t-md bg-[#E63946]" style={{ height: `${h}%` }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-6">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                  <span key={d} className="flex-1 text-center">{d}</span>
                ))}
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Từ vựng', pct: 78, color: 'bg-[#E63946]' },
                  { label: 'Ngữ pháp', pct: 54, color: 'bg-amber-500' },
                  { label: 'Nghe & Nói', pct: 65, color: 'bg-blue-600' },
                ].map(bar => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-gray-600">{bar.label}</span>
                      <span className="text-[#E63946]">{bar.pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${bar.color} rounded-full`} style={{ width: `${bar.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ TESTIMONIALS — White Block ══════════ */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <p className="text-xs font-bold text-[#E63946] uppercase tracking-widest mb-3">Học viên nói gì</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              Kết quả thực tế từ<br />cộng đồng học viên.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Minh Châu', role: 'Sinh viên đại học', avatar: '👩‍🎓', stars: 5, text: 'Sau 3 tháng dùng HanziFlow, tôi đã vượt qua HSK 3 với điểm 285/300. Flashcard SRS thực sự hiệu quả hơn hẳn học theo kiểu truyền thống!' },
              { name: 'Đức Anh', role: 'Nhân viên công ty Trung Quốc', avatar: '👨‍💼', stars: 5, text: 'Lộ trình của HanziFlow rất rõ ràng, chỉ 15 phút mỗi ngày mà sau 2 tháng đã giao tiếp cơ bản được rồi.' },
              { name: 'Hương Giang', role: 'Chuẩn bị du học Đài Loan', avatar: '✈️', stars: 5, text: 'Phần luyện HSKK của app rất sát với thi thực tế. Tôi luyện tập mỗi ngày và cảm thấy tự tin hơn nhiều khi đến ngày thi chính thức.' },
            ].map(t => (
              <div key={t.name} className="bg-gray-100 rounded-lg p-6 group cursor-default transition-all duration-200 hover:scale-[1.02]">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t-2 border-gray-200">
                  <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center text-xl">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400 font-semibold">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA — Emerald Bold Block ══════════ */}
      <section className="relative bg-gray-900 overflow-hidden py-24">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/3 rounded-full translate-x-24 -translate-y-24" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/3 rotate-45 -translate-x-12 translate-y-12" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white/10 text-white font-bold text-xs uppercase tracking-wider mb-8">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Bắt đầu hôm nay — miễn phí hoàn toàn
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Sẵn sàng chinh phục<br /><span className="text-[#E63946]">tiếng Trung?</span>
          </h2>
          <p className="mt-6 text-lg text-white/60 leading-relaxed">
            Tham gia HanziFlow ngay hôm nay — không cần thẻ ngân hàng, không giới hạn thời gian dùng thử.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              id="footer-cta-register"
              className="flex items-center gap-2 px-10 h-14 text-base font-bold text-white bg-[#E63946] hover:bg-red-700 rounded-md transition-all duration-200 hover:scale-105 group"
            >
              Đăng ký miễn phí
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              id="footer-cta-login"
              className="flex items-center gap-2 px-10 h-14 text-base font-bold text-white border-4 border-white/30 hover:border-white/60 hover:bg-white/10 rounded-md transition-all duration-200 hover:scale-105"
            >
              Đã có tài khoản? →
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-bold text-white/40 uppercase tracking-wider">
            {['Không quảng cáo', 'Không cần cài app', 'Giao diện tiếng Việt', 'Cập nhật liên tục'].map((t, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="bg-gray-950 border-t-2 border-gray-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-[#E63946] flex items-center justify-center text-white font-extrabold text-base">H</div>
              <span className="font-extrabold text-lg text-white">HanziFlow</span>
            </div>
            <p className="text-xs text-gray-500 font-semibold text-center">
              © 2026 HanziFlow. Nền tảng học tiếng Trung cá nhân hóa từ HSK 1 đến HSK 6.
            </p>
            <div className="flex gap-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <Link href="/login" className="hover:text-[#E63946] transition-colors duration-200">Đăng nhập</Link>
              <Link href="/register" className="hover:text-[#E63946] transition-colors duration-200">Đăng ký</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
