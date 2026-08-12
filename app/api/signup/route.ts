import { supabase, hashPassword } from '@/app/lib/supabase'

export async function POST(request: Request) {
  try {
    const { nickname, password } = await request.json()

    if (!nickname || !password) {
      return Response.json({ error: '닉네임과 비밀번호를 입력하세요' }, { status: 400 })
    }

    // ✅ 차단된 닉네임 체크
    const { data: blocked } = await supabase
      .from('blocked_nicknames')
      .select('id')
      .eq('nickname', nickname)
      .maybeSingle()

    if (blocked) {
      return Response.json({ error: '가입이 제한된 닉네임입니다' }, { status: 403 })
    }

    // 닉네임 중복 확인
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('nickname', nickname)
      .maybeSingle()

    if (existing) {
      return Response.json({ error: '이미 존재하는 닉네임입니다' }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)
    const isSuperAdmin = nickname === '관리자'
    const role = isSuperAdmin ? 'super_admin' : 'pending'
    const approved = isSuperAdmin

    const { data, error } = await supabase
      .from('users')
      .insert([{ nickname, password: hashedPassword, role, approved }])
      .select()

    if (error) {
      return Response.json({ error: '가입 처리 중 오류 발생' }, { status: 500 })
    }

    return Response.json({ success: true, user: data[0] })
  } catch (err) {
    return Response.json({ error: '서버 오류' }, { status: 500 })
  }
}
