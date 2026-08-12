import { supabase } from '@/app/lib/supabase'

// 음식 목록 조회
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('foods')
      .select('id, name, created_at')
      .order('name', { ascending: true })

    if (error) {
      return Response.json({ error: '조회 실패' }, { status: 500 })
    }

    return Response.json({ success: true, foods: data })
  } catch (err) {
    return Response.json({ error: '서버 오류' }, { status: 500 })
  }
}

// 음식 추가
export async function POST(request: Request) {
  try {
    const { name, createdBy } = await request.json()

    if (!name || !createdBy) {
      return Response.json({ error: '필수 정보 누락' }, { status: 400 })
    }

    // 1) 권한 체크
    const { data: user } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', createdBy)
      .single()

    if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
      return Response.json({ error: '추가 권한이 없습니다' }, { status: 403 })
    }

    // 2) 중복 확인
    const { data: existing } = await supabase
      .from('foods')
      .select('id')
      .eq('name', name.trim())
      .maybeSingle()

    if (existing) {
      return Response.json({ error: '이미 존재하는 음식입니다' }, { status: 400 })
    }

    // 3) 추가
    const { data, error } = await supabase
      .from('foods')
      .insert([{ name: name.trim() }])
      .select()

    if (error) {
      return Response.json({ error: '추가 실패' }, { status: 500 })
    }

    return Response.json({ success: true, food: data[0] })
  } catch (err) {
    return Response.json({ error: '서버 오류' }, { status: 500 })
  }
}
