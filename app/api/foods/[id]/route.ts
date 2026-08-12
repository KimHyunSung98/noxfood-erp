import { supabase } from '@/app/lib/supabase'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: foodId } = await params
    const url = new URL(request.url)
    const requesterId = url.searchParams.get('requesterId')

    if (!foodId || !requesterId) {
      return Response.json({ error: '필수 정보 누락' }, { status: 400 })
    }

    // 1) 권한 체크
    const { data: requester } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', requesterId)
      .maybeSingle()

    if (!requester || (requester.role !== 'super_admin' && requester.role !== 'admin')) {
      return Response.json({ error: '삭제 권한이 없습니다' }, { status: 403 })
    }

    // 2) 사용 중인 음식인지 확인 (orders 또는 food_recipes에서 참조)
    const { data: inOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('food_id', foodId)
      .limit(1)

    if (inOrders && inOrders.length > 0) {
      return Response.json({ 
        error: '의뢰에서 사용 중인 음식은 삭제할 수 없습니다' 
      }, { status: 400 })
    }

    const { data: inRecipes } = await supabase
      .from('food_recipes')
      .select('id')
      .eq('food_id', foodId)
      .limit(1)

    if (inRecipes && inRecipes.length > 0) {
      return Response.json({ 
        error: '레시피에서 사용 중인 음식은 삭제할 수 없습니다' 
      }, { status: 400 })
    }

    // 3) 삭제
    const { error: deleteErr } = await supabase
      .from('foods')
      .delete()
      .eq('id', foodId)

    if (deleteErr) {
      return Response.json({ error: '삭제 실패' }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ 
      error: '서버 오류: ' + (err as Error).message 
    }, { status: 500 })
  }
}
