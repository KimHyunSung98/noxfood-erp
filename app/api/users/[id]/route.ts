import { supabase } from '@/app/lib/supabase'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // 삭제 대상 조회
  const { data: target } = await supabase
    .from('users')
    .select('role, nickname')
    .eq('id', id)
    .maybeSingle()

  if (!target) {
    return Response.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 })
  }

  // 슈퍼관리자 삭제 방지
  if (target.role === 'super_admin') {
    return Response.json({ error: '슈퍼관리자는 삭제할 수 없습니다' }, { status: 403 })
  }

  const { error } = await supabase.from('users').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ success: true })
}
