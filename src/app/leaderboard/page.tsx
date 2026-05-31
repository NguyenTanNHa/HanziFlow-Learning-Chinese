// src/app/leaderboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/sidebar'
import { Trophy, Medal, Flame, Star, Award, RefreshCw } from 'lucide-react'

interface LeaderboardUser {
  id: string
  name: string
  points: number
  streak: number
  hskLevel: number
  subscription: string
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchLeaderboard = async () => {
    try {
      setRefreshing(true)
      const res = await fetch('/api/leaderboard')
      if (res.ok) {
        const data = await res.json()
        setLeaderboard(data.leaderboard || [])
        setCurrentUserRank(data.currentUserRank || null)
      }
    } catch (e) {
      console.error('Error fetching leaderboard:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  // Partition into podium and list
  const podiumUsers = leaderboard.slice(0, 3)
  const listUsers = leaderboard.slice(3)

  // Order podium: 2nd, 1st, 3rd for visual balance
  const orderedPodium = []
  if (podiumUsers[1]) orderedPodium.push({ user: podiumUsers[1], rank: 2 })
  if (podiumUsers[0]) orderedPodium.push({ user: podiumUsers[0], rank: 1 })
  if (podiumUsers[2]) orderedPodium.push({ user: podiumUsers[2], rank: 3 })

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-amber-500 text-white border-amber-600 shadow-amber-500/20'
    if (rank === 2) return 'bg-slate-350 text-slate-800 border-slate-400 shadow-slate-400/20'
    return 'bg-amber-700 text-white border-amber-800 shadow-amber-800/20'
  }

  const getPodiumCardStyle = (rank: number) => {
    if (rank === 1) return 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/10 scale-105 shadow-md shadow-amber-500/5 -translate-y-2'
    if (rank === 2) return 'border-slate-300 bg-slate-50/40 dark:bg-slate-900/10'
    return 'border-orange-300 bg-orange-50/40 dark:bg-orange-950/10'
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#faf9f6] dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <Trophy className="w-8 h-8 text-amber-500 fill-amber-500" />
                Bảng xếp hạng học viên
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Thi đua cùng những học viên xuất sắc nhất trên HanziFlow toàn cầu.
              </p>
            </div>
            
            <button 
              onClick={fetchLeaderboard}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-rose-100/40 bg-white hover:bg-rose-50 text-slate-650 hover:text-rose-500 transition-colors disabled:opacity-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
              <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-bold text-slate-400 animate-pulse">Đang tải bảng xếp hạng...</p>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Current User Rank Callout */}
              {currentUserRank !== null && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-400 text-white font-bold text-xs flex justify-between items-center shadow-lg shadow-rose-500/10">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                    <span>Thứ hạng hiện tại của bạn: Hạng {currentUserRank}</span>
                  </div>
                  <span className="bg-white/25 px-3 py-1 rounded-full border border-white/20">
                    Cố gắng thăng hạng nhé!
                  </span>
                </div>
              )}

              {/* Podium display */}
              {podiumUsers.length > 0 && (
                <div className="grid grid-cols-3 gap-4 items-end pt-6 pb-2 max-w-2xl mx-auto">
                  {orderedPodium.map(({ user, rank }) => (
                    <div 
                      key={user.id} 
                      className={`border rounded-3xl p-4 flex flex-col items-center text-center space-y-2 relative transition-all duration-300 ${getPodiumCardStyle(rank)}`}
                    >
                      {/* Rank Indicator Badge */}
                      <div className={`w-7 h-7 rounded-full border flex items-center justify-center font-black text-xs absolute -top-3.5 left-1/2 -translate-x-1/2 shadow-md ${getRankBadgeColor(rank)}`}>
                        {rank}
                      </div>

                      {/* Avatar placeholder */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-200 to-orange-200 dark:from-rose-800 dark:to-orange-850 flex items-center justify-center font-black text-base text-rose-600 dark:text-rose-350 shadow-sm border border-white dark:border-slate-800">
                        {user.name ? user.name[0].toUpperCase() : 'U'}
                      </div>

                      <div className="space-y-0.5">
                        <span className="block font-black text-slate-800 dark:text-slate-100 text-xs truncate max-w-[85px]">{user.name}</span>
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[8px] font-bold text-slate-500 uppercase">
                          HSK {user.hskLevel}
                        </span>
                      </div>

                      <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 w-full flex flex-col items-center">
                        <span className="block text-xs font-black text-rose-500">{user.points}</span>
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">XP</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Leaderboard Table List */}
              <div className="bg-white dark:bg-slate-900 border border-rose-100/30 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50/50 dark:bg-slate-850 border-b border-rose-100/20 dark:border-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-wider grid grid-cols-12 gap-2">
                  <span className="col-span-2 text-center">Thứ hạng</span>
                  <span className="col-span-5">Học viên</span>
                  <span className="col-span-2 text-center">Mục tiêu</span>
                  <span className="col-span-3 text-right">Điểm số (XP)</span>
                </div>

                <div className="divide-y divide-rose-100/10 dark:divide-slate-800/50">
                  {leaderboard.map((item, idx) => {
                    const rank = idx + 1
                    return (
                      <div 
                        key={item.id}
                        className="p-4 grid grid-cols-12 gap-2 items-center text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors"
                      >
                        {/* Rank */}
                        <div className="col-span-2 flex justify-center">
                          {rank <= 3 ? (
                            <Medal className={`w-5 h-5 ${
                              rank === 1 ? 'text-amber-500 fill-amber-500' :
                              rank === 2 ? 'text-slate-400 fill-slate-400' :
                              'text-amber-700 fill-amber-750'
                            }`} />
                          ) : (
                            <span className="font-bold text-slate-400 text-xs">#{rank}</span>
                          )}
                        </div>

                        {/* Name and streak */}
                        <div className="col-span-5 flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 flex items-center justify-center font-bold text-slate-500 text-xs">
                            {item.name ? item.name[0].toUpperCase() : 'U'}
                          </div>
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs truncate max-w-[150px]">{item.name}</span>
                            {item.streak > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] text-orange-500 font-semibold">
                                <Flame className="w-3 h-3 fill-orange-500" /> {item.streak} ngày
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Level */}
                        <div className="col-span-2 text-center">
                          <span className="bg-rose-50 dark:bg-rose-950/20 text-rose-500 px-2 py-0.5 rounded text-[9px] font-bold border border-rose-100/30">
                            HSK {item.hskLevel}
                          </span>
                        </div>

                        {/* Points */}
                        <div className="col-span-3 text-right flex flex-col justify-center items-end">
                          <span className="font-black text-slate-850 dark:text-slate-100 flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            {item.points}
                          </span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">XP</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  )
}
