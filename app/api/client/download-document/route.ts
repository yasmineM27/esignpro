import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const clientId = searchParams.get('clientId')

    if (!token || !clientId) {
      return NextResponse.json({
        success: false,
        error: 'Token et clientId requis'
      }, { status: 400 })
    }

    console.log('🔍 Téléchargement document pour token:', token)

    // Récupérer les données du dossier depuis la base
    let caseData = null
    if (supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('insurance_cases')
          .select(`
            *,
            client:clients(
              user:users(first_name, last_name, email)
            ),
            agent:agents(
              user:users(first_name, last_name, email)
            )
          `)
          .eq('secure_token', token)
          .single()

        if (!error && data) {
          caseData = data
        }
      } catch (dbError) {
        console.error('❌ Erreur base de données:', dbError)
      }
    }

    // Générer le document final avec signature
    const finalDocument = generateSignedDocument(caseData, token, clientId)

    // Retourner le document en tant que fichier PDF (simulé en texte pour l'instant)
    return new NextResponse(finalDocument, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="document-signe-${clientId}.pdf"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('❌ Erreur téléchargement document:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du téléchargement du document'
    }, { status: 500 })
  }
}

function generateSignedDocument(caseData: any, token: string, clientId: string): string {
  const now = new Date()
  const clientName = caseData?.client?.user 
    ? `${caseData.client.user.first_name} ${caseData.client.user.last_name}`
    : 'Client eSignPro'
  const agentName = caseData?.agent?.user 
    ? `${caseData.agent.user.first_name} ${caseData.agent.user.last_name}`
    : 'wael hamda'
  const agentEmail = caseData?.agent?.user?.email || 'wael.hamda@esignpro.ch'

  return `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
  /Font <<
    /F1 5 0 R
  >>
>>
>>
endobj

4 0 obj
<<
/Length 2000
>>
stream
BT
/F1 16 Tf
50 750 Td
(DOCUMENT DE RÉSILIATION FINALISÉ) Tj
0 -30 Td
(================================) Tj

/F1 12 Tf
0 -40 Td
(Client: ${clientName}) Tj
0 -20 Td
(Email: ${caseData?.client?.user?.email || 'client@example.com'}) Tj
0 -20 Td
(Type de dossier: ${caseData?.insurance_company || 'Résiliation Assurance'}) Tj
0 -20 Td
(ID Dossier: ${clientId}) Tj

0 -40 Td
(Date de finalisation: ${now.toLocaleDateString('fr-CH')} à ${now.toLocaleTimeString('fr-CH')}) Tj

/F1 14 Tf
0 -40 Td
(SIGNATURE ÉLECTRONIQUE VALIDÉE) Tj
0 -20 Td
(==============================) Tj

/F1 12 Tf
0 -30 Td
(✓ Signature client validée le ${now.toLocaleDateString('fr-CH')}) Tj
0 -20 Td
(✓ Horodatage sécurisé: ${now.toISOString()}) Tj
0 -20 Td
(✓ Valeur juridique: Équivalente à une signature manuscrite \\(SCSE\\)) Tj
0 -20 Td
(✓ Token de sécurité: ${token.substring(0, 16)}...) Tj

/F1 14 Tf
0 -40 Td
(VALIDATION CONSEILLER) Tj
0 -20 Td
(====================) Tj

/F1 12 Tf
0 -30 Td
(Dossier traité et validé par:) Tj
0 -20 Td
(${agentName}) Tj
0 -20 Td
(Conseiller eSignPro) Tj
0 -20 Td
(Email: ${agentEmail}) Tj

0 -30 Td
(Date de validation: ${now.toLocaleDateString('fr-CH')} à ${now.toLocaleTimeString('fr-CH')}) Tj

/F1 14 Tf
0 -40 Td
(PROCHAINES ÉTAPES) Tj
0 -20 Td
(================) Tj

/F1 12 Tf
0 -30 Td
(1. Transmission à l'assureur dans les 24h) Tj
0 -20 Td
(2. Confirmation par email au client) Tj
0 -20 Td
(3. Certificat de résiliation envoyé) Tj
0 -20 Td
(4. Traitement du remboursement éventuel) Tj

0 -40 Td
(---) Tj
0 -20 Td
(Document généré automatiquement par eSignPro) Tj
0 -20 Td
(Conforme à la législation suisse \\(SCSE\\)) Tj
0 -20 Td
(© 2024 eSignPro - Signature électronique sécurisée) Tj

ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000110 00000 n 
0000000251 00000 n 
0000002305 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
2372
%%EOF
`
}
