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

async function ensureOJSRole(user_id: string, role_name: string) {
  // Cari journal default
  const { data: journal } = await supabaseAdmin
    .from('journals')
    .select('id')
    .eq('path', 'default-journal')
    .single()
  
  if (!journal) {
    console.error('Journal default tidak ditemukan')
    return false
  }

  // Cari user group berdasarkan nama role - sesuaikan dengan role_id OJS yang benar
  let roleId = 1; // Default Site admin
  
  switch (role_name) {
    case 'Site admin':
      roleId = 1;
      break;
    case 'Manager':
      roleId = 16;
      break;
    case 'Section editor':
      roleId = 17; // Section editor
      break;
    case 'Editor':
      roleId = 17; // Editor di OJS 3.x adalah Section editor
      break;
    case 'Copyeditor':
      roleId = 9;
      break;
    case 'Proofreader':
      roleId = 11;
      break;
    case 'Layout Editor':
      roleId = 10;
      break;
    case 'Author':
      roleId = 65536;
      break;
    case 'Reviewer':
      roleId = 4096;
      break;
    case 'Reader':
      roleId = 1048576;
      break;
    case 'Subscription manager':
      roleId = 2097152;
      break;
  }

  // Cari user group berdasarkan role_id
  const { data: userGroup } = await supabaseAdmin
    .from('user_groups')
    .select('id')
    .eq('context_id', journal.id)
    .eq('role_id', roleId)
    .single()

  if (!userGroup) {
    console.error('User group tidak ditemukan untuk role:', role_name, 'role_id:', roleId, 'journal:', journal.id)
    return false
  }

  // Cek apakah user sudah ada di user_user_groups
  const { data: existing } = await supabaseAdmin
    .from('user_user_groups')
    .select('user_id')
    .eq('user_id', user_id)
    .eq('user_group_id', userGroup.id)
    .single()

  if (existing) return true

  // Insert ke user_user_groups
  const { error } = await supabaseAdmin
    .from('user_user_groups')
    .insert({ 
      user_id, 
      user_group_id: userGroup.id 
    })

  if (error) {
    console.error('Error inserting user_user_groups:', error)
    return false
  }

  return true
}

export async function GET(request: NextRequest, { params }: { params: Promise<{}> }) {
  try {
    const users = [
      { email: 'admin@example.com', username: 'admin', first_name: 'Site', last_name: 'Admin', roles: ['Site admin'] },
      { email: 'editor@example.com', username: 'editor', first_name: 'Main', last_name: 'Editor', roles: ['Section editor'] },
      { email: 'author@example.com', username: 'author', first_name: 'Primary', last_name: 'Author', roles: ['Author'] },
      { email: 'reviewer@example.com', username: 'reviewer', first_name: 'Chief', last_name: 'Reviewer', roles: ['Reviewer'] },
      { email: 'manager@test.com', username: 'manager-test', first_name: 'Journal', last_name: 'Manager', roles: ['Manager'] },
      { email: 'copyeditor@test.com', username: 'copyeditor-test', first_name: 'Copy', last_name: 'Editor', roles: ['Copyeditor'] },
      { email: 'proofreader@test.com', username: 'proofreader-test', first_name: 'Proof', last_name: 'Reader', roles: ['Proofreader'] },
      { email: 'layout-editor@test.com', username: 'layout-editor', first_name: 'Layout', last_name: 'Editor', roles: ['Layout Editor'] },
      { email: 'subscription-manager@test.com', username: 'subscription-manager', first_name: 'Subscription', last_name: 'Manager', roles: ['Subscription manager'] },
      { email: 'reader@test.com', username: 'reader-test', first_name: 'Site', last_name: 'Reader', roles: ['Reader'] },
    ]

    const results: Record<string, any> = {}

    for (const u of users) {
      const id = await ensureUser(u.email, u.username, u.first_name, u.last_name)
      if (!id) {
        results[u.email] = { ok: false, error: 'Failed to create user' }
        continue
      }
      
      for (const r of u.roles) {
        const success = await ensureOJSRole(id, r)
        if (!success) {
          results[u.email] = { ok: false, error: `Failed to assign role: ${r}` }
          continue
        }
      }
      
      results[u.email] = { ok: true, id }
    }

    return NextResponse.json({ ok: true, results })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        ok: false,
        error: message
      },
      { status: 500 }
    );
  }
}