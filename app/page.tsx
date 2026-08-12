'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          🍳 녹스푸드 ERP
        </h1>
        <p className="text-center text-gray-500 mb-8">
          녹스푸드 생산 관리 시스템
        </p>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition"
          >
            로그인
          </button>
          <button
            onClick={() => router.push('/signup')}
            className="w-full bg-white hover:bg-gray-50 text-orange-500 font-semibold py-3 rounded-lg border-2 border-orange-500 transition"
          >
            회원가입
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          가입 후 관리자 승인이 필요합니다
        </p>
      </div>
    </main>
  )
}
