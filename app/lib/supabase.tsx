import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 비밀번호 해시
export async function hashPassword(password: string) {
  const bcrypt = (await import('bcryptjs')).default
  return await bcrypt.hash(password, 10)
}

// 비밀번호 비교
export async function comparePassword(password: string, hash: string) {
  const bcrypt = (await import('bcryptjs')).default
  return await bcrypt.compare(password, hash)
}
