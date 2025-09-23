import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { recipientEmail, subject, message } = await request.json()

    if (!recipientEmail || !subject || !message) {
      return NextResponse.json(
        { error: 'Recipient email, subject, and message are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Send test email
    const result = await emailService.sendTestEmail(recipientEmail, subject, message)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: 'Test email sent successfully'
    })

  } catch (error) {
    console.error('Send test email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
