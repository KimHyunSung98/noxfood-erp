import { supabase } from '@/app/lib/supabase'

export async function POST(request: Request) {
  try {
    const { userId, reason, rejecterId } = await request.json()

    if (!userId || !rejecterId) {
      return Response.json({ error: '필수 정보 누락' }, { status: 400 })
    }

    // 1) 권한 체크
    const { data: rejecter } = await supabase
      .from('users')
      .select('id, role, nickname')
      .eq('id', rejecterId)
      .single()

    if (!rejecter || (rejecter.role !== 'super_admin' && rejecter.role !== 'admin')) {
      return Response.json({ error: '거절 권한이 없습니다' }, { status: 403 })
    }

    // 2) 자기 자신 거절 방지
    if (userId === rejecterId) {
      return Response.json({ error: '자기 자신은 거절할 수 없습니다' }, { status: 400 })
    }

    // 3) 거절 대상 정보 가져오기
    const { data: targetUser } = await supabase
      .from('users')
      .select('nickname, role')
      .eq('id', userId)
      .single()

    if (!targetUser) {
      return Response.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 })
    }

    // 4) 슈퍼관리자 거절 방지
    if (targetUser.role === 'super_admin') {
      return Response.json({ error: '슈퍼관리자는 거절할 수 없습니다' }, { status: 403 })
    }

    // 5) blocked_nicknames에 저장
    const { error: blockErr } = await supabase
      .from('blocked_nicknames')
      .insert([{
        nickname: targetUser.nickname,
        reason: reason || '사유 없음',
        blocked_by: rejecterId,
      }])

    if (blockErr) {
      return Response.json({ error: '차단 처리 실패' }, { status: 500 })
    }

    // 6) users 테이블에서 삭제
    const { error: deleteErr } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (deleteErr) {
      return Response.json({ error: '삭제 처리 실패' }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: '서버 오류' }, { status: 500 })
  }
}
