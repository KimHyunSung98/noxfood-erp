'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(stored))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-lime-50">
        <p className="text-gray-600">로딩 중...</p>
      </main>
    )
  }

  const isAdmin = user.role === 'super_admin' || user.role === 'admin'

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-lime-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 상단 바 */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-green-500 rounded-xl flex items-center justify-center text-white text-lg">
              🍳
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">녹스푸드 ERP</h1>
              <p className="text-sm text-gray-500">{user.nickname}님 환영합니다</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            로그아웃
          </button>
        </div>

        {/* 내 정보 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">👤 내 정보</h2>
          <div className="space-y-1 text-sm text-gray-600">
            <p>📌 권한: <span className="font-semibold text-gray-800">
              {user.role === 'super_admin' && '👑 최고 관리자'}
              {user.role === 'admin' && '🛡️ 관리자'}
              {user.role === 'employee' && user.job === 'butcher' && '🔪 도축업자'}
              {user.role === 'employee' && user.job === 'farmer' && '🌾 농부'}
              {user.role === 'employee' && user.job === 'chef' && '🍳 요리사'}
            </span></p>
            {user.job && <p>💼 직업: {user.job}</p>}
          </div>
        </div>

        {/* 관리자 메뉴 */}
        {isAdmin && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">🛠️ 관리자 메뉴</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* ✅ 활성화: 가입 승인 */}
              <button
                onClick={() => router.push('/admin/approve')}
                className="p-4 bg-lime-50 hover:bg-lime-100 rounded-xl text-left transition border border-lime-100"
              >
                <div className="text-2xl mb-1">✅</div>
                <div className="font-semibold text-gray-800">가입 승인</div>
                <div className="text-xs text-gray-500">대기 중인 가입 처리</div>
              </button>

              {/* ✅ 활성화: 의뢰 등록 */}
              <button
                onClick={() => router.push('/admin/orders')}
                className="p-4 bg-lime-50 hover:bg-lime-100 rounded-xl text-left transition border border-lime-100"
              >
                <div className="text-2xl mb-1">📦</div>
                <div className="font-semibold text-gray-800">의뢰 관리</div>
                <div className="text-xs text-gray-500">새 의뢰 등록 / 목록</div>
              </button>

              {/* ✅ 활성화: 음식 관리 */}
              <button
                onClick={() => router.push('/admin/foods')}
                className="p-4 bg-lime-50 hover:bg-lime-100 rounded-xl text-left transition border border-lime-100"
              >
                <div className="text-2xl mb-1">🍽️</div>
                <div className="font-semibold text-gray-800">음식 관리</div>
                <div className="text-xs text-gray-500">음식 추가 / 삭제</div>
              </button>

              <button
                onClick={() => alert('다음 단계에서 추가됩니다!')}
                className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-left opacity-50 cursor-not-allowed transition"
              >
                <div className="text-2xl mb-1">📜</div>
                <div className="font-semibold text-gray-800">거래 내역</div>
                <div className="text-xs text-gray-500">곧 추가됩니다</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
