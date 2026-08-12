'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OrdersPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('전체')

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
    fetchOrders()
  }, [router])

  const fetchOrders = async () => {
    try {
      const url = statusFilter === '전체'
        ? '/api/orders'
        : `/api/orders?status=${encodeURIComponent(statusFilter)}`
      const res = await fetch(url)
      const data = await res.json()
      if (res.ok) {
        setOrders(data.orders || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchOrders()
  }, [statusFilter])

  const handleDelete = async (orderId: string, foodName: string) => {
  if (!confirm(`"${foodName}" 의뢰를 정말 삭제하시겠습니까?`)) return

  try {
    const res = await fetch(`/api/orders/${orderId}?requesterId=${user.id}`, {
      method: 'DELETE',
    })

    const data = await res.json()
    if (res.ok) {
      alert('🗑️ 삭제되었습니다')
      fetchOrders()
    } else {
      alert('삭제 실패: ' + data.error)
    }
  } catch (err) {
    alert('오류 발생')
  }
}

  const statusColor = (status: string) => {
    switch (status) {
      case '대기': return 'bg-amber-100 text-amber-700 border-amber-200'
      case '진행중': return 'bg-blue-100 text-blue-700 border-blue-200'
      case '완료': return 'bg-lime-100 text-lime-700 border-lime-200'
      case '취소': return 'bg-gray-100 text-gray-600 border-gray-200'
      default: return 'bg-gray-100 text-gray-600'
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
      <div className="max-w-5xl mx-auto">
        {/* 상단 바 */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-green-500 rounded-xl flex items-center justify-center text-white text-lg">
              📦
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">의뢰 관리</h1>
              <p className="text-xs text-gray-500">총 {orders.length}건</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              ← 대시보드
            </button>
            <button
              onClick={() => router.push('/admin/orders/new')}
              className="px-4 py-2 text-sm bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-600 hover:to-green-600 text-white rounded-lg font-semibold transition shadow-sm"
            >
              + 새 의뢰
            </button>
          </div>
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="flex gap-2 flex-wrap">
            {['전체', '대기', '진행중', '완료', '취소'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === s
                    ? 'bg-gradient-to-r from-lime-500 to-green-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* 목록 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {loading ? (
            <p className="text-gray-500 text-center py-8">불러오는 중...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-2">📭</p>
              <p className="text-gray-500">의뢰가 없습니다</p>
              <button
                onClick={() => router.push('/admin/orders/new')}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-lime-500 to-green-500 text-white rounded-lg text-sm font-semibold"
              >
                + 첫 의뢰 만들기
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(o => (
                <div
                  key={o.id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-lime-300 hover:shadow-sm transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-800">
                        {o.food_name}
                      </h3>
                      <p className="text-sm text-gray-500">📍 {o.location}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColor(o.status)}`}>
                      {o.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <p className="text-gray-600">
                      📊 수량: <strong className="text-gray-800">{o.quantity}{o.unit}</strong>
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-400">
                        {new Date(o.created_at).toLocaleString('ko-KR')}
                      </p>
                      <button
                        onClick={() => handleDelete(o.id, o.food_name)}
                        className="text-gray-400 hover:text-red-500 transition px-2 py-1 text-xs"
                        title="삭제"
                      >
                        🗑️
                      </button>
                    </div>
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
