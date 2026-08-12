import { supabase, comparePassword } from '@/app/lib/supabase'

export async function POST(request: Request) {
  try {
    const { nickname, password } = await request.json()

    if (!nickname || !password) {
      return Response.json({ error: '닉네임과 비밀번호를 입력하세요' }, { status: 400 })
    }

    // 사용자 찾기
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('nickname', nickname)
      .single()

    if (error || !user) {
      return Response.json({ error: '존재하지 않는 닉네임입니다' }, { status: 401 })
    }

    // 비밀번호 확인
    const passwordMatch = await comparePassword(password, user.password)
    if (!passwordMatch) {
      return Response.json({ error: '비밀번호가 틀렸습니다' }, { status: 401 })
    }

    // 승인 여부 확인
    if (!user.approved) {
      return Response.json({ error: '관리자 승인 대기 중입니다' }, { status: 403 })
    }

    // 비밀번호 제외하고 반환
    const { password: _, ...userWithoutPassword } = user

    return Response.json({ success: true, user: userWithoutPassword })
  } catch (err) {
    return Response.json({ error: '서버 오류' }, { status: 500 })
  }
}
