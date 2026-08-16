import { supabase } from '@/app/lib/supabase'

export async function GET() {
  

  const { data, error } = await supabase
    .from('users')
    .select('id, nickname, role, job, approved, created_at, last_seen')
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
