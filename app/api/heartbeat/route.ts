import { supabase } from '@/app/lib/supabase'

export async function POST(request: Request) {
  try {
    const { nickname } = await request.json()
    if (!nickname) {
      return Response.json({ error: 'nickname 필요' }, { status: 400 })
    }


    const { error } = await supabase
      .from('users')
      .update({ last_seen: new Date().toISOString() })
      .eq('nickname', nickname)

    if (error) return Response.json({ error: error.message }, { status: 500 })

    return Response.json({ success: true })
  } catch (e) {
    return Response.json({ error: '요청 처리 실패' }, { status: 400 })
  }
}
