import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{}> }) {
  try {
    // Cek apakah journal default sudah ada
    const { data: existingJournal } = await supabaseAdmin
      .from('journals')
      .select('id')
      .eq('path', 'default-journal')
      .single()

    if (existingJournal) {
      return NextResponse.json({ 
        ok: true, 
        message: 'Journal default sudah ada',
        journal_id: existingJournal.id 
      })
    }

    // Buat journal default
    const { data: journal, error: journalError } = await supabaseAdmin
      .from('journals')
      .insert({
        path: 'default-journal',
        enabled: 1,
        primary_locale: 'en_US',
        sequence: 1
      })
      .select('id')
      .single()

    if (journalError) {
      console.error('Error creating journal:', journalError)
      return NextResponse.json({ 
        ok: false, 
        error: 'Gagal membuat journal default',
        details: journalError.message 
      }, { status: 500 })
    }

    // Buat journal settings
    const { error: settingsError } = await supabaseAdmin
      .from('journal_settings')
      .insert([
        { journal_id: journal.id, locale: 'en_US', setting_name: 'name', setting_value: 'Default Journal', setting_type: 'string' },
        { journal_id: journal.id, locale: 'en_US', setting_name: 'description', setting_value: 'Default journal for testing', setting_type: 'string' },
        { journal_id: journal.id, locale: 'en_US', setting_name: 'abbreviation', setting_value: 'DJ', setting_type: 'string' }
      ])

    if (settingsError) {
      console.error('Error creating journal settings:', settingsError)
      // Tidak critical, lanjutkan
    }

    // Buat user groups untuk journal ini berdasarkan role_id OJS
    const userGroups = [
      { role_id: 1, context_id: journal.id, user_group_name: 'Site admin', is_default: 1 },
      { role_id: 16, context_id: journal.id, user_group_name: 'Manager', is_default: 1 },
      { role_id: 17, context_id: journal.id, user_group_name: 'Section editor', is_default: 1 },
      { role_id: 4096, context_id: journal.id, user_group_name: 'Reviewer', is_default: 1 },
      { role_id: 65536, context_id: journal.id, user_group_name: 'Author', is_default: 1 },
      { role_id: 1048576, context_id: journal.id, user_group_name: 'Reader', is_default: 1 },
      { role_id: 9, context_id: journal.id, user_group_name: 'Copyeditor', is_default: 1 },
      { role_id: 10, context_id: journal.id, user_group_name: 'Layout Editor', is_default: 1 },
      { role_id: 11, context_id: journal.id, user_group_name: 'Proofreader', is_default: 1 },
      { role_id: 2097152, context_id: journal.id, user_group_name: 'Subscription manager', is_default: 1 }
    ]

    const { error: userGroupError } = await supabaseAdmin
      .from('user_groups')
      .insert(userGroups)

    if (userGroupError) {
      console.error('Error creating user groups:', userGroupError)
      // Tidak critical, lanjutkan
    }

    return NextResponse.json({ 
      ok: true, 
      message: 'Journal default berhasil dibuat',
      journal_id: journal.id 
    })

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