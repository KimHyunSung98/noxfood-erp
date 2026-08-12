import { supabase } from '@/app/lib/supabase'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }  // ✅ Promise 명시
) {
  try {
    // ✅ await로 params 풀기
    const { id: orderId } = await params
    const url = new URL(request.url)
    const requesterId = url.searchParams.get('requesterId')

    if (!orderId || orderId === 'undefined') {
      return Response.json({ 
        error: `의뢰 ID 없음 (받은 값: ${orderId})` 
      }, { status: 400 })
    }

    if (!requesterId || requesterId === 'undefined') {
      return Response.json({ 
        error: `요청자 ID 없음` 
      }, { status: 400 })
    }

    // 1) 권한 체크
    const { data: requester } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', requesterId)
      .maybeSingle()

    if (!requester) {
      return Response.json({ error: '요청자 정보를 찾을 수 없습니다' }, { status: 403 })
    }

    if (requester.role !== 'super_admin' && requester.role !== 'admin') {
      return Response.json({ error: '삭제 권한이 없습니다' }, { status: 403 })
    }

    // 2) 의뢰 존재 확인
    const { data: order } = await supabase
      .from('orders')
      .select('id, food_name')
      .eq('id', orderId)
      .maybeSingle()

    if (!order) {
      return Response.json({ error: '의뢰를 찾을 수 없습니다' }, { status: 404 })
    }

    // 3) 삭제
    const { error: deleteErr } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)

    if (deleteErr) {
      return Response.json({ error: '삭제 실패: ' + deleteErr.message }, { status: 500 })
    }

    return Response.json({ success: true, deleted: order.food_name })
  } catch (err) {
    console.error('서버 오류:', err)
    return Response.json({ 
      error: '서버 오류: ' + (err as Error).message 
    }, { status: 500 })
  }
}
