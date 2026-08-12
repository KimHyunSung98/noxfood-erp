import { supabase } from '@/app/lib/supabase'

// 가입 승인 대기 목록 조회
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, nickname, role, job, approved, created_at')
      .eq('approved', false)
      .order('created_at', { ascending: false })

    if (error) {
      return Response.json({ error: '조회 실패' }, { status: 500 })
    }

    return Response.json({ success: true, users: data })
  } catch (err) {
    return Response.json({ error: '서버 오류' }, { status: 500 })
  }
}

// 가입 승인 처리
export async function POST(request: Request) {
  try {
    const { userId, role: requestedRole, job: requestedJob, approverId } = await request.json()

    // 1) 필수값 검증
    if (!userId || !approverId) {
      return Response.json({ error: '필수 정보 누락' }, { status: 400 })
    }

    // 2) 승인자 권한 확인 (super_admin 또는 admin만 승인 가능)
    const { data: approver, error: approverErr } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', approverId)
      .single()

    if (approverErr || !approver) {
      return Response.json({ error: '승인자 정보를 찾을 수 없습니다' }, { status: 403 })
    }

    if (approver.role !== 'super_admin' && approver.role !== 'admin') {
      return Response.json({ error: '승인 권한이 없습니다' }, { status: 403 })
    }

    // 3) 자기 자신 승인 방지
    if (userId === approverId) {
      return Response.json({ error: '자기 자신은 승인할 수 없습니다' }, { status: 400 })
    }

    // 4) role 강제 (super_admin은 부여 불가, employee만 허용)
    const allowedRoles = ['admin', 'employee']
    const finalRole = allowedRoles.includes(requestedRole) ? requestedRole : 'employee'

    // 5) job 검증 (employee일 때만, 화이트리스트)
    const allowedJobs = ['farmer', 'butcher', 'chef']
    const finalJob = finalRole === 'employee' && allowedJobs.includes(requestedJob)
      ? requestedJob
      : null

    // 6) 업데이트
    const { data, error } = await supabase
      .from('users')
      .update({
        role: finalRole,
        job: finalJob,
        approved: true,
        approved_by: approverId,
      })
      .eq('id', userId)
      .select()

    if (error) {
      return Response.json({ error: '승인 처리 실패' }, { status: 500 })
    }

    return Response.json({ success: true, user: data[0] })
  } catch (err) {
    return Response.json({ error: '서버 오류' }, { status: 500 })
  }
}
