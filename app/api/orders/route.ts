import { supabase } from '@/app/lib/supabase'

// 의뢰 목록 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // '대기', '진행중', '완료' 등

    let query = supabase
      .from('orders')
      .select(`
        id,
        food_id,
        food_name,
        quantity,
        unit,
        location,
        status,
        created_at,
        created_by
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return Response.json({ error: '조회 실패' }, { status: 500 })
    }

    return Response.json({ success: true, orders: data })
  } catch (err) {
    return Response.json({ error: '서버 오류' }, { status: 500 })
  }
}

// 의뢰 생성
export async function POST(request: Request) {
  try {
    const { foodId, foodName, quantity, unit, location, createdBy } = await request.json()

    // 1) 필수값 검증
    if (!foodId || !foodName || !quantity || !location) {
      return Response.json({ error: '필수 정보를 입력하세요' }, { status: 400 })
    }

    if (quantity <= 0) {
      return Response.json({ error: '수량은 0보다 커야 합니다' }, { status: 400 })
    }

    // 2) 생성자 권한 체크
    const { data: creator } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', createdBy)
      .single()

    if (!creator || (creator.role !== 'super_admin' && creator.role !== 'admin')) {
      return Response.json({ error: '의뢰 생성 권한이 없습니다' }, { status: 403 })
    }

    // 3) 음식 존재 확인
    const { data: food } = await supabase
      .from('foods')
      .select('id, name')
      .eq('id', foodId)
      .single()

    if (!food) {
      return Response.json({ error: '존재하지 않는 음식입니다' }, { status: 404 })
    }

    // 4) 저장
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        food_id: foodId,
        food_name: foodName,
        quantity: Number(quantity),
        unit: unit || '통',
        location,
        status: '대기',
        created_by: createdBy,
      }])
      .select()

    if (error) {
      console.error('Order insert error:', error)
      return Response.json({ error: '의뢰 생성 실패' }, { status: 500 })
    }

    return Response.json({ success: true, order: data[0] })
  } catch (err) {
    console.error(err)
    return Response.json({ error: '서버 오류' }, { status: 500 })
  }
}
