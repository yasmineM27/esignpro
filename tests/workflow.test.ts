import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { supabaseAdmin, generateSecureToken } from '../lib/supabase'

describe('Complete Workflow Tests', () => {
  let testCaseId: string
  let testClientId: string
  let testAgentId: string
  let secureToken: string

  beforeAll(async () => {
    // Create test users
    const { data: clientUser } = await supabaseAdmin
      .from('users')
      .insert([{
        email: 'workflow-client@example.com',
        first_name: 'Workflow',
        last_name: 'Client',
        role: 'client'
      }])
      .select()
      .single()

    const { data: agentUser } = await supabaseAdmin
      .from('users')
      .insert([{
        email: 'workflow-agent@example.com',
        first_name: 'Workflow',
        last_name: 'Agent',
        role: 'agent'
      }])
      .select()
      .single()

    // Create client and agent
    const { data: client } = await supabaseAdmin
      .from('clients')
      .insert([{
        user_id: clientUser.id,
        client_number: 'WF-CLIENT-001'
      }])
      .select()
      .single()

    const { data: agent } = await supabaseAdmin
      .from('agents')
      .insert([{
        user_id: agentUser.id,
        agent_code: 'WF-AGENT-001'
      }])
      .select()
      .single()

    testClientId = client.id
    testAgentId = agent.id
    secureToken = generateSecureToken()
  })

  afterAll(async () => {
    // Clean up
    if (testCaseId) {
      await supabaseAdmin.from('signatures').delete().eq('case_id', testCaseId)
      await supabaseAdmin.from('documents').delete().eq('case_id', testCaseId)
      await supabaseAdmin.from('insurance_cases').delete().eq('id', testCaseId)
    }
    await supabaseAdmin.from('clients').delete().eq('id', testClientId)
    await supabaseAdmin.from('agents').delete().eq('id', testAgentId)
    await supabaseAdmin.from('users').delete().eq('email', 'workflow-client@example.com')
    await supabaseAdmin.from('users').delete().eq('email', 'workflow-agent@example.com')
  })

  it('should create insurance case', async () => {
    const { data: insuranceCase, error } = await supabaseAdmin
      .from('insurance_cases')
      .insert([{
        case_number: 'WF-CASE-001',
        client_id: testClientId,
        agent_id: testAgentId,
        insurance_type: 'auto',
        insurance_company: 'Test Insurance',
        policy_number: 'POL-TEST-001',
        title: 'Workflow Test Case',
        description: 'Test case for complete workflow',
        status: 'draft',
        secure_token: secureToken,
        token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }])
      .select()
      .single()

    expect(error).toBeNull()
    expect(insuranceCase).toBeDefined()
    expect(insuranceCase.case_number).toBe('WF-CASE-001')
    testCaseId = insuranceCase.id
  })

  it('should update case status to pending_documents', async () => {
    const { data, error } = await supabaseAdmin
      .from('insurance_cases')
      .update({ status: 'pending_documents' })
      .eq('id', testCaseId)
      .select()
      .single()

    expect(error).toBeNull()
    expect(data.status).toBe('pending_documents')
  })

  it('should upload identity documents', async () => {
    const documents = [
      {
        case_id: testCaseId,
        document_type: 'identity_front',
        file_name: 'id_front.jpg',
        file_path: 'test/id_front.jpg',
        file_size: 100000,
        mime_type: 'image/jpeg'
      },
      {
        case_id: testCaseId,
        document_type: 'identity_back',
        file_name: 'id_back.jpg',
        file_path: 'test/id_back.jpg',
        file_size: 95000,
        mime_type: 'image/jpeg'
      }
    ]

    const { data, error } = await supabaseAdmin
      .from('documents')
      .insert(documents)
      .select()

    expect(error).toBeNull()
    expect(data).toHaveLength(2)
  })

  it('should update case status to documents_uploaded', async () => {
    const { data, error } = await supabaseAdmin
      .from('insurance_cases')
      .update({ status: 'documents_uploaded' })
      .eq('id', testCaseId)
      .select()
      .single()

    expect(error).toBeNull()
    expect(data.status).toBe('documents_uploaded')
  })

  it('should verify documents', async () => {
    const { data, error } = await supabaseAdmin
      .from('documents')
      .update({ 
        is_verified: true,
        verified_at: new Date().toISOString()
      })
      .eq('case_id', testCaseId)
      .select()

    expect(error).toBeNull()
    expect(data.every(doc => doc.is_verified)).toBe(true)
  })

  it('should update case status to pending_signature', async () => {
    const { data, error } = await supabaseAdmin
      .from('insurance_cases')
      .update({ status: 'pending_signature' })
      .eq('id', testCaseId)
      .select()
      .single()

    expect(error).toBeNull()
    expect(data.status).toBe('pending_signature')
  })

  it('should create digital signature', async () => {
    const signatureData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

    const { data, error } = await supabaseAdmin
      .from('signatures')
      .insert([{
        case_id: testCaseId,
        signature_data: signatureData,
        ip_address: '192.168.1.100',
        user_agent: 'Test User Agent'
      }])
      .select()
      .single()

    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(data.signature_data).toBe(signatureData)
  })

  it('should update case status to signed', async () => {
    const { data, error } = await supabaseAdmin
      .from('insurance_cases')
      .update({ status: 'signed' })
      .eq('id', testCaseId)
      .select()
      .single()

    expect(error).toBeNull()
    expect(data.status).toBe('signed')
  })

  it('should complete the case', async () => {
    const { data, error } = await supabaseAdmin
      .from('insurance_cases')
      .update({ 
        status: 'completed',
        actual_completion_date: new Date().toISOString()
      })
      .eq('id', testCaseId)
      .select()
      .single()

    expect(error).toBeNull()
    expect(data.status).toBe('completed')
    expect(data.actual_completion_date).toBeDefined()
  })

  it('should retrieve case by secure token', async () => {
    const { data, error } = await supabaseAdmin
      .from('insurance_cases')
      .select(`
        *,
        client:clients(*,
          user:users(*)
        ),
        agent:agents(*,
          user:users(*)
        ),
        documents(*),
        signatures(*)
      `)
      .eq('secure_token', secureToken)
      .single()

    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(data.secure_token).toBe(secureToken)
    expect(data.client).toBeDefined()
    expect(data.agent).toBeDefined()
    expect(data.documents).toHaveLength(2)
    expect(data.signatures).toHaveLength(1)
  })

  it('should create audit logs for workflow steps', async () => {
    const auditLogs = [
      {
        case_id: testCaseId,
        action: 'CREATE_CASE',
        entity_type: 'insurance_case',
        entity_id: testCaseId,
        new_values: { status: 'draft' }
      },
      {
        case_id: testCaseId,
        action: 'UPLOAD_DOCUMENTS',
        entity_type: 'document',
        new_values: { document_count: 2 }
      },
      {
        case_id: testCaseId,
        action: 'SIGN_DOCUMENT',
        entity_type: 'signature',
        new_values: { signed: true }
      }
    ]

    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .insert(auditLogs)
      .select()

    expect(error).toBeNull()
    expect(data).toHaveLength(3)
  })

  it('should retrieve dashboard statistics', async () => {
    const { data, error } = await supabaseAdmin
      .from('dashboard_stats')
      .select('*')
      .single()

    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(typeof data.active_cases).toBe('number')
    expect(typeof data.completed_cases).toBe('number')
    expect(typeof data.total_clients).toBe('number')
    expect(typeof data.total_agents).toBe('number')
  })
})
