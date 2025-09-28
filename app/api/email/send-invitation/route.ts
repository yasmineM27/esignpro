import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email'
import { getCaseByToken, supabaseAdmin, generateSecureToken, createAuditLog } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { caseId, clientEmail } = await request.json()

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

    // Generate secure token if not exists
    let secureToken = insuranceCase.secure_token
    console.log('Current secure_token for case', caseId, ':', secureToken)

    if (!secureToken) {
      secureToken = generateSecureToken()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + parseInt(process.env.SECURE_TOKEN_EXPIRY_HOURS || '168'))

      console.log('Generated new token:', secureToken, 'expires at:', expiresAt.toISOString())

      const { error: updateError } = await supabaseAdmin
        .from('insurance_cases')
        .update({
          secure_token: secureToken,
          token_expires_at: expiresAt.toISOString(),
          status: 'pending_documents'
        })
        .eq('id', caseId)

      if (updateError) {
        console.error('Failed to update case with secure token:', updateError)
        return NextResponse.json({ error: 'Failed to update case with secure token' }, { status: 500 })
      }

      console.log('Successfully updated case with token')
      insuranceCase.secure_token = secureToken
      insuranceCase.token_expires_at = expiresAt.toISOString()
    } else {
      console.log('Reusing existing token:', secureToken)
    }

    // Send invitation email
    const result = await emailService.sendClientInvitation(insuranceCase)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Create audit log
    await createAuditLog({
      case_id: caseId,
      action: 'SEND_INVITATION',
      entity_type: 'email',
      new_values: {
        recipient: clientEmail || insuranceCase.client?.user?.email,
        message_id: result.messageId
      }
    })

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      secureToken: secureToken
    })

  } catch (error) {
    console.error('Send invitation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
