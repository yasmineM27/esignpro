import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Check if token exists in insurance_cases
    const { data, error } = await supabaseAdmin
      .from('insurance_cases')
      .select('id, case_number, secure_token, status, client_id')
      .eq('secure_token', token)
      .single()

    if (error) {
      return NextResponse.json({
        exists: false,
        error: error.message,
        token: token
      })
    }

    return NextResponse.json({
      exists: true,
      case: {
        id: data.id,
        case_number: data.case_number,
        status: data.status,
        client_id: data.client_id
      },
      token: token
    })

  } catch (error) {
    console.error('Check token error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}