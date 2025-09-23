import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for browser/client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database types
export interface User {
  id: string
  auth_user_id?: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  role: 'admin' | 'agent' | 'client'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Agent {
  id: string
  user_id: string
  agent_code: string
  department?: string
  supervisor_id?: string
  is_supervisor: boolean
  created_at: string
  updated_at: string
  user?: User
}

export interface Client {
  id: string
  user_id: string
  client_number?: string
  date_of_birth?: string
  address_line1?: string
  address_line2?: string
  city?: string
  postal_code?: string
  country: string
  created_at: string
  updated_at: string
  user?: User
}

export interface InsuranceCase {
  id: string
  case_number: string
  client_id: string
  agent_id?: string
  insurance_type: string
  insurance_company?: string
  policy_number?: string
  status: 'draft' | 'pending_documents' | 'documents_uploaded' | 'pending_signature' | 'signed' | 'completed' | 'cancelled'
  title: string
  description?: string
  priority: number
  estimated_completion_date?: string
  actual_completion_date?: string
  secure_token?: string
  token_expires_at?: string
  created_at: string
  updated_at: string
  client?: Client
  agent?: Agent
  documents?: Document[]
  signatures?: Signature[]
}

export interface Document {
  id: string
  case_id: string
  uploaded_by?: string
  document_type: 'identity_front' | 'identity_back' | 'insurance_document' | 'signature' | 'additional'
  file_name: string
  file_path: string
  file_size?: number
  mime_type?: string
  is_verified: boolean
  verified_by?: string
  verified_at?: string
  created_at: string
  updated_at: string
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body_html: string
  body_text?: string
  template_type: string
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface EmailLog {
  id: string
  case_id?: string
  template_id?: string
  recipient_email: string
  sender_email: string
  subject: string
  body_html?: string
  body_text?: string
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced'
  external_id?: string
  sent_at?: string
  delivered_at?: string
  error_message?: string
  created_at: string
}

export interface Signature {
  id: string
  case_id: string
  signer_id?: string
  signature_data: string
  ip_address?: string
  user_agent?: string
  signed_at: string
  is_valid: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  case_id?: string
  type: 'email' | 'sms' | 'system'
  title: string
  message: string
  is_read: boolean
  read_at?: string
  created_at: string
}

export interface AuditLog {
  id: string
  user_id?: string
  case_id?: string
  action: string
  entity_type: string
  entity_id?: string
  old_values?: any
  new_values?: any
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface SystemSetting {
  id: string
  key: string
  value?: string
  description?: string
  is_encrypted: boolean
  updated_by?: string
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  active_cases: number
  pending_documents: number
  completed_cases: number
  total_clients: number
  total_agents: number
  emails_sent_month: number
}

// Helper functions
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  return data
}

export const getCaseByToken = async (token: string): Promise<InsuranceCase | null> => {
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
    .eq('secure_token', token)
    .single()

  if (error) {
    console.error('Error fetching case by token:', error)
    return null
  }

  return data
}

export const getDashboardStats = async (): Promise<DashboardStats | null> => {
  const { data, error } = await supabaseAdmin
    .from('dashboard_stats')
    .select('*')
    .single()

  if (error) {
    console.error('Error fetching dashboard stats:', error)
    return null
  }

  return data
}

export const createAuditLog = async (logData: Partial<AuditLog>) => {
  const { error } = await supabaseAdmin
    .from('audit_logs')
    .insert([logData])

  if (error) {
    console.error('Error creating audit log:', error)
  }
}

export const generateSecureToken = (): string => {
  return 'secure-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
