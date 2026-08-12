'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ApprovePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [pendingUsers, setPendingUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<{ [key: string]: string }>({})
  const [selectedRole, setSelectedRole] = useState<{ [key: string]: string }>({})

  // 모달 상태
  const [rejectModal, setRejectModal] = useState<{ open: boolean; userId: string | null }>({
    open: false,
    userId: null,
  })
  const [rejectReason, setRejectReason] = useState('')

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
    fetchPending()
  }, [router])

  const fetchPending = async () => {
    try {
      const res = await fetch('/api/approve')
      const data = await res.json()
      if (res.ok) {
        setPendingUsers(data.users || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId: string) => {
    const roleMode = selectedRole[userId] || 'admin'
    const job = selectedJob[userId]

    if (roleMode === 'employee' && !job) {
      alert('직원을 선택할 경우 직무를 지정해주세요')
      return
    }

    try {
      const res = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          role: 'employee',
          job: roleMode === 'employee' ? job : null,
          approverId: user.id,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        alert('✅ 승인 완료!')
        fetchPending()
      } else {
        alert('승인 실패: ' + data.error)
      }
    } catch (err) {
      alert('오류 발생')
    }
  }

  // 모달 열기
  const openRejectModal = (userId: string) => {
    setRejectModal({ open: true, userId })
    setRejectReason('')
  }

  // 모달 닫기
  const closeRejectModal = () => {
    setRejectModal({ open: false, userId: null })
    setRejectReason('')
  }

  // 모달에서 확정
  const confirmReject = async () => {
    if (!rejectModal.userId) return

    try {
      const res = await fetch('/api/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: rejectModal.userId,
          reason: rejectReason.trim() || null,
          rejecterId: user.id,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        alert('🚫 거절 처리되었습니다 (재가입 차단됨)')
        closeRejectModal()
        fetchPending()
      } else {
        alert('거절 실패: ' + data.error)
      }
    } catch (err) {
      alert('오류 발생')
    }
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-lime-50">
        <p className="text-gray-600">로딩 중...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-lime-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 상단 바 */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-green-500 rounded-xl flex items-center justify-center text-white text-lg">
              🥝
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">가입 승인 관리</h1>
              <p className="text-xs text-gray-500">
                {user.role === 'super_admin' ? '🦸 슈퍼관리자' : '🛡️ 관리자'} · {user.nickname}
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            ← 대시보드
          </button>
        </div>

        {/* 안내 박스 */}
        <div className="bg-lime-50 border border-lime-200 rounded-xl p-4 mb-4 text-sm text-gray-700">
          💡 <strong>승인 안내</strong>: 직원을 선택하면 직무를 지정할 수 있어요. 
          직무는 나중에 다른 직무로 변경 가능합니다 (농부 → 도축업자 등).
        </div>

        {/* 대기 목록 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            👥 가입 대기 중 ({pendingUsers.length}명)
          </h2>

          {loading ? (
            <p className="text-gray-500 text-center py-8">불러오는 중...</p>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-2">🎉</p>
              <p className="text-gray-500">대기 중인 가입이 없습니다!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map((u) => (
                <div
                  key={u.id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-lime-300 transition"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {u.nickname.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-lg text-gray-800">{u.nickname}</p>
                      <p className="text-xs text-gray-500">
                        가입: {new Date(u.created_at).toLocaleString('ko-KR')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <select
                      value={selectedRole[u.id] || 'admin'}
                      onChange={(e) =>
                        setSelectedRole({ ...selectedRole, [u.id]: e.target.value })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                    >
                      <option value="admin">🛡️ 관리자</option>
                      <option value="employee">👷 직원 (직무 지정)</option>
                    </select>

                    {selectedRole[u.id] === 'employee' && (
                      <select
                        value={selectedJob[u.id] || ''}
                        onChange={(e) =>
                          setSelectedJob({ ...selectedJob, [u.id]: e.target.value })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                      >
                        <option value="">-- 직무 선택 --</option>
                        <option value="farmer">🌾 농부</option>
                        <option value="butcher">🔪 도축업자</option>
                        <option value="chef">🍳 요리사</option>
                      </select>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(u.id)}
                      className="flex-1 bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-600 hover:to-green-600 text-white py-2 rounded-lg text-sm font-semibold transition shadow-sm"
                    >
                      ✅ 승인
                    </button>
                    <button
                      onClick={() => openRejectModal(u.id)}
                      className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-2 rounded-lg text-sm font-semibold transition shadow-sm"
                    >
                      🚫 거절
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🚫 거절 사유 모달 */}
      {rejectModal.open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeRejectModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center text-white text-lg">
                🚫
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">가입 거절</h3>
                <p className="text-xs text-gray-500">거절된 닉네임은 재가입이 차단됩니다</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                거절 사유 <span className="text-gray-400 text-xs">(선택사항)</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="예: 부적절한 닉네임 / 중복 계정 / 기타 사유..."
                rows={4}
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {rejectReason.length} / 200
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={closeRejectModal}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
              >
                취소
              </button>
              <button
                onClick={confirmReject}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg text-sm font-semibold transition shadow-sm"
              >
                거절 확정
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
