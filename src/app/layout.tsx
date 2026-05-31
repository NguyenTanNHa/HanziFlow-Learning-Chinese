// src/app/layout.tsx
import type { Metadata } from "next"
import { Be_Vietnam_Pro } from "next/font/google"
import "./globals.css"

// Be Vietnam Pro: geometric, bold, designed natively for Vietnamese
// Looks nearly identical to Outfit but with full Vietnamese diacritic support
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  variable: "--font-be-vietnam",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "HanziFlow - Lộ trình Học Tiếng Trung HSK & HSKK Cá Nhân Hóa",
  description: "HanziFlow giúp bạn làm chủ tiếng Trung từ HSK 1-2 tới HSK 5-6, luyện nói HSKK phản xạ nhanh, ôn tập từ vựng Spaced Repetition thông minh và giải bài tập ngữ pháp thực tế.",
  keywords: ["học tiếng Trung", "học hsk", "luyện thi hskk", "hanziflow", "flashcard tiếng Trung", "spaced repetition"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans selection:bg-red-100 selection:text-red-900">
        {children}
      </body>
    </html>
  )
}
