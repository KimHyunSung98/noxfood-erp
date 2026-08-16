'use client'

import { useEffect } from 'react'

export default function Heartbeat() {
  useEffect(() => {
    const send = async () => {
      const stored = localStorage.getItem('user')
      if (!stored) return

      try {
        const u = JSON.parse(stored)
        await fetch('/api/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nickname: u.nickname }),
        })
      } catch {
        // 실패해도 무시
      }
    }

    send()
    const interval = setInterval(send, 60000) // 1분마다

    return () => clearInterval(interval)
  }, [])

  return null
}
