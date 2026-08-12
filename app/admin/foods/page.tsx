'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FoodsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [foods, setFoods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newFoodName, setNewFoodName] = useState('')
  const [submitting, setSubmitting] = useState(false)

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
    fetchFoods()
  }, [router])

  const fetchFoods = async () => {
    try {
      const res = await fetch('/api/foods')
      const data = await res.json()
      if (res.ok) {
        setFoods(data.foods || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFoodName.trim()) {
      alert('음식 이름을 입력하세요')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFoodName.trim(),
          createdBy: user.id,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setNewFoodName('')
        fetchFoods()
      } else {
        alert('실패: ' + data.error)
      }
    } catch (err) {
      alert('오류 발생')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (foodId: string, name: string) => {
    if (!confirm(`"${name}" 음식을 삭제하시겠습니까?`)) return

    try {
      const res = await fetch(`/api/foods/${foodId}?requesterId=${user.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      if (res.ok) {
        fetchFoods()
      } else {
        alert('삭제 실패: ' + data.error)
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
      <div className="max-w-3xl mx-auto">
        {/* 상단 바 */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-green-500 rounded-xl flex items-center justify-center text-white text-lg">
              🍽️
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">음식 관리</h1>
              <p className="text-xs text-gray-500">총 {foods.length}개</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            ← 대시보드
          </button>
        </div>

        {/* 추가 폼 */}
        <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">➕ 새 음식 추가</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newFoodName}
              onChange={(e) => setNewFoodName(e.target.value)}
              placeholder="예: 김치찌개, 비빔밥, 불고기..."
              maxLength={50}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-600 hover:to-green-600 text-white rounded-xl font-semibold transition shadow-sm disabled:opacity-50"
            >
              {submitting ? '추가 중...' : '추가'}
            </button>
          </div>
        </form>

        {/* 목록 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            📋 등록된 음식
          </h2>

          {loading ? (
            <p className="text-gray-500 text-center py-8">불러오는 중...</p>
          ) : foods.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-2">🍽️</p>
              <p className="text-gray-500">등록된 음식이 없습니다</p>
              <p className="text-xs text-gray-400 mt-1">위에서 음식을 추가해보세요</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {foods.map(f => (
                <div
                  key={f.id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-lime-300 hover:shadow-sm transition group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-2xl">🍽️</span>
                      <span className="font-semibold text-gray-800 truncate">
                        {f.name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(f.id, f.name)}
                      className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
