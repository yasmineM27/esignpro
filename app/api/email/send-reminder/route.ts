import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email'
import { supabaseAdmin, createAuditLog } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { caseId } = await request.json()

    if (!caseId) {
      return NextResponse.json({ error: 'Case ID is required' }, { status: 400 })
    }

    // Get the insurance case with related data
    const { data: insuranceCase, error: caseError } = await supabaseAdmin
      .from('insurance_cases')
      .select(`
        *,
        client:clients(*,
          user:users(*)
        ),
        agent:agents(*,
          user:users(*)
        )
      `)
      .eq('id', caseId)
      .single()

    if (caseError || !insuranceCase) {
      return NextResponse.json({ error: 'Insurance case not found' }, { status: 404 })
    }

    if (!insuranceCase.secure_token) {
      return NextResponse.json({ error: 'No secure token found for this case' }, { status: 400 })
    }

    // Check if token is still valid
    if (insuranceCase.token_expires_at && new Date() > new Date(insuranceCase.token_expires_at)) {
      return NextResponse.json({ error: 'Secure token has expired' }, { status: 400 })
    }

    // Send reminder email
    const result = await emailService.sendDocumentReminder(insuranceCase)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Create audit log
    await createAuditLog({
      case_id: caseId,
      action: 'SEND_REMINDER',
      entity_type: 'email',
      new_values: {
        recipient: insuranceCase.client?.user?.email,
        message_id: result.messageId
      }
    })

    return NextResponse.json({
      success: true,
      messageId: result.messageId
    })

  } catch (error) {
    console.error('Send reminder error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
