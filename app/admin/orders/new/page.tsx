'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewOrderPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [foods, setFoods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    foodId: '',
    quantity: '',
    unit: '통',
    location: '',
  })

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
        if (data.foods?.length > 0) {
          setForm(prev => ({ ...prev, foodId: data.foods[0].id }))
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.foodId || !form.quantity || !form.location) {
      alert('모든 필드를 입력하세요')
      return
    }

    if (Number(form.quantity) <= 0) {
      alert('수량은 0보다 커야 합니다')
      return
    }

    const selectedFood = foods.find(f => f.id === form.foodId)

    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodId: form.foodId,
          foodName: selectedFood?.name || '',
          quantity: Number(form.quantity),
          unit: form.unit,
          location: form.location,
          createdBy: user.id,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        alert('✅ 의뢰가 생성되었습니다!')
        router.push('/admin/orders')
      } else {
        alert('실패: ' + data.error)
      }
    } catch (err) {
      alert('오류 발생')
    } finally {
      setSubmitting(false)
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
      <div className="max-w-2xl mx-auto">
        {/* 상단 바 */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-green-500 rounded-xl flex items-center justify-center text-white text-lg">
              📦
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">새 의뢰 생성</h1>
              <p className="text-xs text-gray-500">{user.nickname}</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/admin/orders')}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            ← 목록
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
          {/* 음식 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🍽️ 음식 선택
            </label>
            {loading ? (
              <p className="text-gray-400 text-sm">음식 목록 불러오는 중...</p>
            ) : foods.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                ⚠️ 등록된 음식이 없습니다. 먼저 음식을 등록해주세요.
              </div>
            ) : (
              <select
                value={form.foodId}
                onChange={(e) => setForm({ ...form, foodId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400"
              >
                {foods.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* 수량 + 단위 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📊 수량
              </label>
              <input
                type="number"
                min="1"
                step="0.1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="예: 100"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📏 단위
              </label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400"
              >
                <option value="통">통</option>
              </select>
            </div>
          </div>

          {/* 위치 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📍 전달 위치
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="예: 본사 3층 / A구역 / 창고"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
          </div>

          {/* 미리보기 */}
          {form.foodId && form.quantity && form.location && (
            <div className="bg-lime-50 border border-lime-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">📋 미리보기</p>
              <p className="text-gray-800">
                <strong>{foods.find(f => f.id === form.foodId)?.name}</strong>을(를) {' '}
                <strong>{form.quantity}{form.unit}</strong>만큼 {' '}
                <strong>{form.location}</strong>에 전달
              </p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => router.push('/admin/orders')}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting || foods.length === 0}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-600 hover:to-green-600 text-white rounded-xl font-semibold transition shadow-sm disabled:opacity-50"
            >
              {submitting ? '생성 중...' : '✅ 의뢰 생성'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
