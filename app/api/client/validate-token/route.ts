import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Token manquant' 
      }, { status: 400 })
    }

    console.log('🔍 Validation token:', token)

    // Si Supabase n'est pas configuré, utiliser la validation mock
    if (!supabaseAdmin) {
      console.log('📝 Mode mock - Validation token basique')
      
      // Validation basique du format
      const isValidFormat = (
        /^[0-9a-f]{32}$/i.test(token) || // UUID sans tirets
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token) || // UUID avec tirets
        token.startsWith('SECURE_') || // Tokens SECURE_
        token.length >= 20 // Autres tokens longs
      )

      if (isValidFormat) {
        return NextResponse.json({
          valid: true,
          data: {
            clientName: "Client eSignPro",
            clientEmail: "client@example.com",
            agentName: "Wael Hamda",
            documentType: "Résiliation Assurance",
            status: "email_sent",
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        })
      } else {
        return NextResponse.json({ 
          valid: false, 
          error: 'Format de token invalide' 
        })
      }
    }

    // Rechercher le token dans la base de données
    const { data: insuranceCase, error } = await supabaseAdmin
      .from('insurance_cases')
      .select(`
        id,
        case_number,
        secure_token,
        expires_at,
        status,
        insurance_company,
        policy_number,
        client_id,
        clients!inner (
          id,
          users!inner (
            first_name,
            last_name,
            email
          )
        ),
        agents (
          users!inner (
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('secure_token', token)
      .single()

    if (error || !insuranceCase) {
      console.log('❌ Token non trouvé dans la base:', error?.message)
      return NextResponse.json({ 
        valid: false, 
        error: 'Token invalide ou expiré' 
      })
    }

    // Vérifier l'expiration
    const now = new Date()
    const expiresAt = new Date(insuranceCase.expires_at)
    
    if (now > expiresAt) {
      console.log('⏰ Token expiré:', expiresAt)
      return NextResponse.json({ 
        valid: false, 
        error: 'Token expiré',
        expired: true,
        expiresAt: expiresAt.toISOString()
      })
    }

    // Token valide - retourner les données
    const clientUser = insuranceCase.clients.users
    const agentUser = insuranceCase.agents?.users

    return NextResponse.json({
      valid: true,
      data: {
        caseId: insuranceCase.id,
        caseNumber: insuranceCase.case_number,
        clientName: `${clientUser.first_name} ${clientUser.last_name}`,
        clientEmail: clientUser.email,
        agentName: agentUser ? `${agentUser.first_name} ${agentUser.last_name}` : 'Agent eSignPro',
        agentEmail: agentUser?.email || 'support@esignpro.ch',
        documentType: insuranceCase.insurance_company || 'Document de résiliation',
        status: insuranceCase.status,
        expiresAt: insuranceCase.expires_at,
        createdAt: insuranceCase.created_at
      }
    })

  } catch (error) {
    console.error('❌ Erreur validation token:', error)
    return NextResponse.json({ 
      valid: false, 
      error: 'Erreur serveur lors de la validation' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Même logique que GET mais avec le token dans le body
  try {
    const { token } = await request.json()
    
    if (!token) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Token manquant' 
      }, { status: 400 })
    }

    // Rediriger vers la logique GET
    const url = new URL(request.url)
    url.searchParams.set('token', token)
    
    const getRequest = new NextRequest(url.toString(), {
      method: 'GET',
      headers: request.headers
    })
    
    return GET(getRequest)
    
  } catch (error) {
    console.error('❌ Erreur POST validation token:', error)
    return NextResponse.json({ 
      valid: false, 
      error: 'Erreur serveur' 
    }, { status: 500 })
  }
}
