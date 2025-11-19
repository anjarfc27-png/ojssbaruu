import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'

async function ensureUser(email: string, username: string, first_name: string, last_name: string) {
  const { data: existing } = await supabaseAdmin
    .from('user_accounts')
    .select('id')
    .eq('email', email)
    .single()

  if (existing?.id) return existing.id

  const { data: inserted } = await supabaseAdmin
    .from('user_accounts')
    .insert({ email, username, first_name, last_name, password: 'password' })
    .select('id')
    .single()
  return inserted?.id
}

async function ensureRole(user_id: string, role_name: string) {
  const { data: existing } = await supabaseAdmin
    .from('user_account_roles')
    .select('user_id, role_name')
    .eq('user_id', user_id)
    .eq('role_name', role_name)
    .single()
  if (existing) return true
  await supabaseAdmin
    .from('user_account_roles')
    .insert({ user_id, role_name })
  return true
}

export async function GET(request: NextRequest, { params }: { params: Promise<{}> }) {
  const users = [
    { email: 'admin@example.com', username: 'admin', first_name: 'Site', last_name: 'Admin', roles: ['Site admin'] },
    { email: 'editor@example.com', username: 'editor', first_name: 'Main', last_name: 'Editor', roles: ['Section editor'] },
    { email: 'author@example.com', username: 'author', first_name: 'Primary', last_name: 'Author', roles: ['Author'] },
    { email: 'reviewer@example.com', username: 'reviewer', first_name: 'Chief', last_name: 'Reviewer', roles: ['Reviewer'] },
  ]

  const results: Record<string, any> = {}

  for (const u of users) {
    const id = await ensureUser(u.email, u.username, u.first_name, u.last_name)
    if (!id) {
      results[u.email] = { ok: false }
      continue
    }
    for (const r of u.roles) {
      await ensureRole(id, r)
    }
    results[u.email] = { ok: true, id }
  }

  return NextResponse.json({ ok: true, results })
}