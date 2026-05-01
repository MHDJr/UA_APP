import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    // Check if ceo_reviewed column exists
    const { data: columns, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'tasks')
      .eq('column_name', 'ceo_reviewed')

    if (checkError) {
      console.error('Error checking column:', checkError)
      return NextResponse.json({ error: 'Failed to check column' }, { status: 500 })
    }

    // If column doesn't exist, add it
    if (!columns || columns.length === 0) {
      const { error: addError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE tasks ADD COLUMN IF NOT EXISTS ceo_reviewed BOOLEAN DEFAULT FALSE;'
      })

      if (addError) {
        console.error('Error adding column:', addError)
        return NextResponse.json({ error: 'Failed to add column' }, { status: 500 })
      }

      return NextResponse.json({ message: 'Column added successfully' })
    }

    return NextResponse.json({ message: 'Column already exists' })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 })
  }
}
