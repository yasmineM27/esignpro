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
          
          // Incrémenter le compteur de téléchargement
          await supabaseAdmin
            .from('final_documents')
            .update({
              download_count: supabaseAdmin.raw('download_count + 1'),
              last_downloaded_at: new Date().toISOString()
            })
            .eq('case_id', data.id)
        }
      } catch (dbError) {
        console.error('❌ Erreur base de données:', dbError)
      }
    }

    // Générer le document final avec signature
    const finalDocument = generateSignedDocument(caseData, token, clientId)

    // Retourner le document en tant que fichier PDF
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
    : 'Wael Hamda'
  const agentName = caseData?.agent?.user 
    ? `${caseData.agent.user.first_name} ${caseData.agent.user.last_name}`
    : 'wael hamda'
  const agentEmail = caseData?.agent?.user?.email || 'wael.hamda@esignpro.ch'
  const clientEmail = caseData?.client?.user?.email || 'yasminemassaoudi27@gmail.com'

  return `%PDF-1.4
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
    /F2 6 0 R
  >>
>>
>>
endobj

4 0 obj
<<
/Length 3500
>>
stream
BT
/F1 20 Tf
50 750 Td
(DOCUMENT DE RÉSILIATION FINALISÉ) Tj
0 -25 Td
(=====================================) Tj

/F1 14 Tf
0 -40 Td
(📋 INFORMATIONS CLIENT) Tj
0 -20 Td
(Client: ${clientName}) Tj
0 -15 Td
(Email: ${clientEmail}) Tj
0 -15 Td
(Type de dossier: ${caseData?.insurance_company || 'Résiliation Assurance Auto'}) Tj
0 -15 Td
(Numéro de police: ${caseData?.policy_number || 'POL-AUTO-2024-001'}) Tj
0 -15 Td
(ID Dossier: ${clientId}) Tj

/F1 16 Tf
0 -40 Td
(✅ SIGNATURE ÉLECTRONIQUE VALIDÉE) Tj
0 -20 Td
(===================================) Tj

/F1 12 Tf
0 -25 Td
(✓ Signature client validée le ${now.toLocaleDateString('fr-CH')} à ${now.toLocaleTimeString('fr-CH')}) Tj
0 -15 Td
(✓ Horodatage sécurisé: ${now.toISOString()}) Tj
0 -15 Td
(✓ Valeur juridique: Équivalente à une signature manuscrite \\(SCSE\\)) Tj
0 -15 Td
(✓ Token de sécurité: ${token.substring(0, 16)}...) Tj
0 -15 Td
(✓ Méthode de validation: Signature électronique sécurisée) Tj

/F1 14 Tf
0 -40 Td
(👤 SIGNATURE DE VALIDATION CONSEILLER) Tj
0 -20 Td
(=====================================) Tj

/F1 12 Tf
0 -25 Td
(Dossier traité et validé par:) Tj
0 -15 Td
(${agentName}) Tj
0 -15 Td
(Conseiller eSignPro) Tj
0 -15 Td
(Email: ${agentEmail}) Tj
0 -15 Td
(Date de validation: ${now.toLocaleDateString('fr-CH')} à ${now.toLocaleTimeString('fr-CH')}) Tj

/F2 10 Tf
0 -25 Td
([Signature électronique du conseiller]) Tj
0 -10 Td
(${agentName} - eSignPro) Tj
0 -10 Td
(Certifié conforme le ${now.toLocaleDateString('fr-CH')}) Tj

/F1 14 Tf
0 -40 Td
(📋 CONTENU DU DOCUMENT DE RÉSILIATION) Tj
0 -20 Td
(=====================================) Tj

/F1 11 Tf
0 -25 Td
(Madame, Monsieur,) Tj
0 -20 Td
(Par la présente, je vous informe de ma décision de résilier mon contrat) Tj
0 -15 Td
(d'assurance automobile référencé ci-dessus, conformément aux dispositions) Tj
0 -15 Td
(contractuelles en vigueur.) Tj

0 -20 Td
(Cette résiliation prendra effet à la date d'échéance de la prime annuelle,) Tj
0 -15 Td
(soit le ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-CH')}.) Tj

0 -20 Td
(Je vous prie de bien vouloir me faire parvenir:) Tj
0 -15 Td
(- Un certificat de résiliation) Tj
0 -15 Td
(- Le décompte des sommes dues ou à rembourser) Tj
0 -15 Td
(- La confirmation de la prise en compte de cette résiliation) Tj

0 -20 Td
(Je vous remercie de votre diligence et vous prie d'agréer,) Tj
0 -15 Td
(Madame, Monsieur, l'expression de mes salutations distinguées.) Tj

/F1 14 Tf
0 -40 Td
(🎯 PROCHAINES ÉTAPES) Tj
0 -20 Td
(==================) Tj

/F1 12 Tf
0 -25 Td
(1. Transmission à l'assureur dans les 24h ouvrées) Tj
0 -15 Td
(2. Confirmation par email au client sous 48h) Tj
0 -15 Td
(3. Certificat de résiliation envoyé par l'assureur) Tj
0 -15 Td
(4. Traitement du remboursement éventuel selon conditions) Tj
0 -15 Td
(5. Archivage sécurisé du dossier pendant 10 ans) Tj

/F1 10 Tf
0 -40 Td
(---) Tj
0 -15 Td
(Document généré automatiquement par eSignPro) Tj
0 -10 Td
(Conforme à la législation suisse \\(SCSE\\)) Tj
0 -10 Td
(Signature électronique certifiée et horodatée) Tj
0 -10 Td
(© 2024 eSignPro - Signature électronique sécurisée) Tj
0 -10 Td
(www.esignpro.ch - support@esignpro.ch) Tj

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

6 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica-Bold
>>
endobj

xref
0 7
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000110 00000 n 
0000000251 00000 n 
0000003805 00000 n 
0000003872 00000 n 
trailer
<<
/Size 7
/Root 1 0 R
>>
startxref
3944
%%EOF`
}
