'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  nickname: string
  role: string
  job: string | null
  approved: boolean
  created_at: string
  last_seen: string | null
}

type Blocked = {
  id: string
  nickname: string
  reason: string | null
  blocked_at: string
}

type TabType = 'all' | 'admin' | 'employee' | 'pending'

export default function UsersPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [blocked, setBlocked] = useState<Blocked[]>([])
  const [tab, setTab] = useState<TabType>('all')
  const [showBlocked, setShowBlocked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) {
      router.push('/login')
      return
    }
    const u = JSON.parse(stored)
    if (u.role !== 'super_admin' && u.role !== 'admin') {
      alert('관리자만 접근 가능합니다')
      router.push('/dashboard')
      return
    }
    setUser(u)
    loadData()
  }, [router])

  const loadData = async () => {
    setLoading(true)
    const [usersRes, blockedRes] = await Promise.all([
      fetch('/api/users'),
      fetch('/api/blocked'),
    ])
    const usersData = await usersRes.json()
    const blockedData = await blockedRes.json()
    setUsers(usersData || [])
    setBlocked(blockedData || [])
    setLoading(false)
  }

  const deleteUser = async (id: string, nickname: string) => {
    if (!confirm(`'${nickname}' 사용자를 정말 삭제하시겠습니까?`)) return

    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
    const data = await res.json()

    if (!res.ok) {
      alert(data.error || '삭제 실패')
      return
    }
    alert('삭제되었습니다')
    loadData()
  }

  const unblock = async (id: string, nickname: string) => {
    if (!confirm(`'${nickname}' 차단 해제하시겠습니까?`)) return

    const res = await fetch(`/api/blocked/${id}`, { method: 'DELETE' })
    const data = await res.json()

    if (!res.ok) {
      alert(data.error || '해제 실패')
      return
    }
    alert('차단 해제되었습니다')
    loadData()
  }

  const isOnline = (lastSeen: string | null) => {
    if (!lastSeen) return false
    const diff = Date.now() - new Date(lastSeen).getTime()
    return diff < 5 * 60 * 1000
  }

  const filteredUsers = users.filter((u) => {
    if (tab === 'all') return true
    if (tab === 'admin') return u.role === 'admin' || u.role === 'super_admin'
    if (tab === 'employee') return u.role === 'employee'
    if (tab === 'pending') return u.role === 'pending'
    return true
  })

  const counts = {
    all: users.length,
    admin: users.filter((u) => u.role === 'admin' || u.role === 'super_admin').length,
    employee: users.filter((u) => u.role === 'employee').length,
    pending: users.filter((u) => u.role === 'pending').length,
  }

  const onlineCount = users.filter((u) => isOnline(u.last_seen) && u.approved).length

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-lime-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">👥 사용자 관리</h1>
            <p className="text-gray-500 mt-1">
              🟢 온라인 {onlineCount}명 · 전체 {users.length}명 · 대기 {counts.pending}명
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
          >
            ← 대시보드
          </button>
        </div>

        {/* 탭 */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'all', label: '전체' },
            { key: 'admin', label: '관리자' },
            { key: 'employee', label: '직원' },
            { key: 'pending', label: '대기' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as TabType)}
              className={`px-4 py-2 rounded-xl font-medium transition ${
                tab === t.key
                  ? 'bg-gradient-to-br from-lime-400 to-green-500 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {t.label} ({counts[t.key as keyof typeof counts]})
            </button>
          ))}
        </div>

        {/* 사용자 목록 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          {loading ? (
            <p className="text-center text-gray-400 py-8">로딩 중...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center text-gray-400 py-8">해당 사용자가 없습니다</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-500 text-sm border-b border-gray-200">
                    <th className="pb-3 px-2">닉네임</th>
                    <th className="pb-3 px-2">역할</th>
                    <th className="pb-3 px-2">직무</th>
                    <th className="pb-3 px-2">상태</th>
                    <th className="pb-3 px-2">가입일</th>
                    <th className="pb-3 px-2">접속</th>
                    <th className="pb-3 px-2 text-right">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium text-gray-800">{u.nickname}</td>
                      <td className="py-3 px-2">
                        {u.role === 'super_admin' && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            🦸 슈퍼
                          </span>
                        )}
                        {u.role === 'admin' && (
                          <span className="px-2 py-1 bg-lime-100 text-lime-700 rounded-full text-xs font-semibold">
                            관리자
                          </span>
                        )}
                        {u.role === 'employee' && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                            직원
                          </span>
                        )}
                        {u.role === 'pending' && (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                            대기
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-gray-600 text-sm">
                        {u.job === 'farmer' && '🌾 농부'}
                        {u.job === 'butcher' && '🔪 도축'}
                        {u.job === 'chef' && '👨‍🍳 요리'}
                        {!u.job && '-'}
                      </td>
                      <td className="py-3 px-2">
                        {u.approved ? (
                          <span className="text-xs text-lime-600">✓ 활성</span>
                        ) : (
                          <span className="text-xs text-amber-600">⏳ 대기</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-xs text-gray-500">
                        {new Date(u.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="py-3 px-2">
                        {isOnline(u.last_seen) ? (
                          <span className="flex items-center gap-1 text-xs">
                            <span className="w-2 h-2 bg-lime-500 rounded-full animate-pulse"></span>
                            <span className="text-lime-700">온라인</span>
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">오프라인</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {u.role === 'super_admin' ? (
                          <span className="text-xs text-gray-400">🔒 보호</span>
                        ) : (
                          <button
                            onClick={() => deleteUser(u.id, u.nickname)}
                            className="px-3 py-1 bg-gradient-to-br from-gray-500 to-gray-600 text-white text-xs rounded-lg hover:opacity-90"
                          >
                            🗑 삭제
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 차단 목록 토글 */}
        <button
          onClick={() => setShowBlocked(!showBlocked)}
          className="w-full bg-white rounded-2xl shadow-sm p-4 mb-3 flex items-center justify-between hover:bg-gray-50"
        >
          <span className="font-semibold text-gray-700">
            🚫 차단 목록 ({blocked.length}명)
          </span>
          <span className="text-gray-400">{showBlocked ? '▲' : '▼'}</span>
        </button>

        {showBlocked && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            {blocked.length === 0 ? (
              <p className="text-center text-gray-400 py-4">차단된 사용자가 없습니다</p>
            ) : (
              <div className="space-y-2">
                {blocked.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{b.nickname}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        사유: {b.reason || '없음'} ·{' '}
                        {new Date(b.blocked_at).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                    <button
                      onClick={() => unblock(b.id, b.nickname)}
                      className="px-3 py-1 bg-gradient-to-br from-lime-400 to-green-500 text-white text-xs rounded-lg hover:opacity-90"
                    >
                      ✓ 해제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
