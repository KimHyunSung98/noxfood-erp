import { supabase } from '@/app/lib/supabase'

export async function GET() {

  const { data, error } = await supabase
    .from('blocked_nicknames')
    .select('id, nickname, reason, blocked_at')
    .order('blocked_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
