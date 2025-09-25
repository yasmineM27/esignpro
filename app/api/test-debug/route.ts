import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const testType = searchParams.get('type') || 'all'

  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    testClientEmail: process.env.TEST_CLIENT_EMAIL,
    hasResendKey: !!process.env.RESEND_API_KEY,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    testType,
    availableApis: [
      '/api/generate-document',
      '/api/send-email', 
      '/api/email-preview',
      '/api/test-debug'
    ]
  }

  return NextResponse.json({
    success: true,
    debug: debugInfo,
    message: 'Debug info retrieved successfully'
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testType, data } = body

    let result: any = { success: false, error: 'Unknown test type' }

    switch (testType) {
      case 'client-form':
        // Test de validation des données client
        result = await testClientForm(data)
        break
        
      case 'email-generation':
        // Test de génération d'email
        result = await testEmailGeneration(data)
        break
        
      case 'agent-documents':
        // Test de récupération des documents agent
        result = await testAgentDocuments(data)
        break
        
      default:
        result = { success: false, error: `Test type '${testType}' not supported` }
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

async function testClientForm(data: any) {
  try {
    // Validation des champs requis
    const requiredFields = ['nom', 'prenom', 'email', 'dateNaissance']
    const missingFields = requiredFields.filter(field => !data[field])
    
    if (missingFields.length > 0) {
      return {
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        data: data
      }
    }

    // Simulation de génération de document
    const clientId = crypto.randomUUID()
    
    return {
      success: true,
      clientId,
      clientName: `${data.prenom} ${data.nom}`,
      documentGenerated: true,
      message: 'Client form validation successful'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Client form test failed'
    }
  }
}

async function testEmailGeneration(data: any) {
  try {
    const { clientEmail, clientName, clientId } = data
    
    if (!clientEmail || !clientName || !clientId) {
      return {
        success: false,
        error: 'Missing email generation parameters'
      }
    }

    // Simulation d'envoi d'email
    const emailSent = true // Toujours réussi en mode test
    const portalLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://esignpro.vercel.app'}/api/email-preview?clientName=${encodeURIComponent(clientName)}&clientId=${clientId}`

    return {
      success: emailSent,
      portalLink,
      emailSent: true,
      message: 'Email generation test successful'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Email generation test failed'
    }
  }
}

async function testAgentDocuments(data: any) {
  try {
    const { clientId } = data
    
    if (!clientId) {
      return {
        success: false,
        error: 'Missing client ID for document retrieval'
      }
    }

    // Simulation de récupération des documents
    const mockDocuments = [
      {
        id: 'doc_1',
        type: 'identity_front',
        filename: 'carte_identite_recto.jpg',
        uploadedAt: new Date().toISOString()
      },
      {
        id: 'doc_2', 
        type: 'identity_back',
        filename: 'carte_identite_verso.jpg',
        uploadedAt: new Date().toISOString()
      },
      {
        id: 'doc_3',
        type: 'insurance_contract',
        filename: 'contrat_assurance.pdf',
        uploadedAt: new Date().toISOString()
      }
    ]

    return {
      success: true,
      documents: mockDocuments,
      clientId,
      message: 'Agent documents test successful'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Agent documents test failed'
    }
  }
}
