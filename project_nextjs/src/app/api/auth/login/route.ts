import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

// Get user from user_accounts table (primary for login)
async function getUserFromAccounts(email: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_accounts')
      .select('id, username, email, password, first_name, last_name')
      .eq('email', email)
      .single()

    if (error) {
      console.error('Error fetching user from user_accounts:', error)
      return null
    }

    console.log('User data from user_accounts:', data)

    return data ? {
      user_id: data.id,
      username: data.username,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      password: data.password
    } : null
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error('Exception in getUserFromAccounts:', message);
    return null
  }
}

// Get roles from user_account_roles table
async function getRolesFromAccountRoles(userId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_account_roles')
      .select('role_name')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching roles from user_account_roles:', error)
      return []
    }

    console.log('Roles from user_account_roles:', data)

    // Map to our expected format
    return data.map(role => ({
      user_group_id: role.role_name,
      user_group_name: role.role_name,
      context_id: null,
      journal_name: 'Site',
      role_path: getRolePath(role.role_name)
    }))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error('Exception in getRolesFromAccountRoles:', message);
    return []
  }
}

function getRolePath(userGroupName: string): string {
  const rolePaths: Record<string, string> = {
    'Site admin': 'admin',
    'Manager': 'manager',
    'Editor': 'editor',
    'Section editor': 'editor', // Map Section editor ke editor path untuk OJS compatibility
    'Copyeditor': 'copyeditor',
    'Proofreader': 'proofreader',
    'Layout Editor': 'layout-editor',
    'Author': 'author',
    'Reviewer': 'reviewer',
    'Reader': 'reader',
    'Subscription manager': 'subscription-manager'
  }
  return rolePaths[userGroupName] || 'reader'
}

export async function POST(request: NextRequest, { params }: { params: Promise<{}> }) {
  try {
    let email, password
    
    try {
      const body = await request.json()
      email = body.email
      password = body.password
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError)
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      )
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('Login attempt for email:', email)

    // Get user from user_accounts table (primary source)
    const userData = await getUserFromAccounts(email)

    console.log('User data retrieved:', userData)

    if (!userData) {
      console.error('User not found for email:', email)
      return NextResponse.json(
        { error: 'Invalid credentials - user not found' },
        { status: 401 }
      )
    }

    // Simple password check against stored value (no hashing for now)
    // TODO: replace with secure hashing in production
    if (password !== userData.password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Get user roles from user_account_roles table
    const roles = await getRolesFromAccountRoles(userData.user_id)
    const uniqueRoles = Array.from(
      new Map(
        roles.map(r => [
          `${r.user_group_id}|${r.journal_name || ''}|${r.context_id || ''}`,
          r
        ])
      ).values()
    )

    const user = {
      id: userData.user_id,
      username: userData.username,
      email: userData.email,
      full_name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || undefined,
      roles: uniqueRoles
    }

    // Create session token (simple implementation)
    const sessionToken = Buffer.from(`${userData.user_id}:${Date.now()}`).toString('base64')

    const response = NextResponse.json({ user })

    // Set session cookie
    response.cookies.set('session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return response
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
