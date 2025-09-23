import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { emailService } from '../lib/email'
import { supabaseAdmin } from '../lib/supabase'

describe('Email Service Tests', () => {
  let testCaseId: string
  let testClientId: string
  let testAgentId: string

  beforeAll(async () => {
    // Create test data
    const { data: testUser } = await supabaseAdmin
      .from('users')
      .insert([{
        email: 'test-client@example.com',
        first_name: 'Test',
        last_name: 'Client',
        role: 'client'
      }])
      .select()
      .single()

    const { data: testAgent } = await supabaseAdmin
      .from('users')
      .insert([{
        email: 'test-agent@example.com',
        first_name: 'Test',
        last_name: 'Agent',
        role: 'agent'
      }])
      .select()
      .single()

    const { data: client } = await supabaseAdmin
      .from('clients')
      .insert([{
        user_id: testUser.id,
        client_number: 'TEST-001'
      }])
      .select()
      .single()

    const { data: agent } = await supabaseAdmin
      .from('agents')
      .insert([{
        user_id: testAgent.id,
        agent_code: 'TEST-AG-001'
      }])
      .select()
      .single()

    const { data: insuranceCase } = await supabaseAdmin
      .from('insurance_cases')
      .insert([{
        case_number: 'TEST-CASE-001',
        client_id: client.id,
        agent_id: agent.id,
        insurance_type: 'auto',
        title: 'Test Case',
        status: 'draft',
        secure_token: 'test-token-123',
        token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }])
      .select()
      .single()

    testCaseId = insuranceCase.id
    testClientId = client.id
    testAgentId = agent.id
  })

  afterAll(async () => {
    // Clean up test data
    await supabaseAdmin.from('insurance_cases').delete().eq('id', testCaseId)
    await supabaseAdmin.from('clients').delete().eq('id', testClientId)
    await supabaseAdmin.from('agents').delete().eq('id', testAgentId)
    await supabaseAdmin.from('users').delete().eq('email', 'test-client@example.com')
    await supabaseAdmin.from('users').delete().eq('email', 'test-agent@example.com')
  })

  it('should send test email successfully', async () => {
    const result = await emailService.sendTestEmail(
      process.env.TEST_CLIENT_EMAIL || 'yasminemassoudi26@gmail.com',
      'Test Email - eSignPro',
      'Ceci est un email de test pour vérifier la configuration Resend.'
    )

    expect(result.success).toBe(true)
    expect(result.messageId).toBeDefined()
  }, 10000)

  it('should send client invitation email', async () => {
    // Get the test case with relations
    const { data: insuranceCase } = await supabaseAdmin
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
      .eq('id', testCaseId)
      .single()

    const result = await emailService.sendClientInvitation(insuranceCase)

    expect(result.success).toBe(true)
    expect(result.messageId).toBeDefined()
  }, 10000)

  it('should send document reminder email', async () => {
    // Get the test case with relations
    const { data: insuranceCase } = await supabaseAdmin
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
      .eq('id', testCaseId)
      .single()

    const result = await emailService.sendDocumentReminder(insuranceCase)

    expect(result.success).toBe(true)
    expect(result.messageId).toBeDefined()
  }, 10000)

  it('should send completion confirmation email', async () => {
    // Get the test case with relations
    const { data: insuranceCase } = await supabaseAdmin
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
      .eq('id', testCaseId)
      .single()

    const result = await emailService.sendCompletionConfirmation(insuranceCase)

    expect(result.success).toBe(true)
    expect(result.messageId).toBeDefined()
  }, 10000)

  it('should log emails in database', async () => {
    // Check if email logs were created
    const { data: emailLogs } = await supabaseAdmin
      .from('email_logs')
      .select('*')
      .eq('case_id', testCaseId)

    expect(emailLogs).toBeDefined()
    expect(emailLogs.length).toBeGreaterThan(0)
  })
})
