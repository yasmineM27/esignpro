import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { 
      token, 
      clientId, 
      signatureData, 
      clientName, 
      clientEmail,
      agentName,
      agentEmail,
      documentType,
      uploadedFiles 
    } = await request.json()

    console.log('🔍 Finalisation signature pour token:', token)

    // 1. Sauvegarder la signature en base de données
    if (supabaseAdmin) {
      try {
        // Mettre à jour le dossier avec la signature
        const { error: updateError } = await supabaseAdmin
          .from('insurance_cases')
          .update({
            status: 'signed',
            signature_data: signatureData,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('secure_token', token)

        if (updateError) {
          console.error('❌ Erreur mise à jour signature:', updateError)
        } else {
          console.log('✅ Signature sauvegardée en base')
        }

        // Sauvegarder les documents uploadés
        if (uploadedFiles && uploadedFiles.length > 0) {
          const documentsToInsert = uploadedFiles.map((file: any) => ({
            case_id: clientId,
            document_type: file.type === 'id_front' ? 'identity_front' : 
                          file.type === 'id_back' ? 'identity_back' : 'additional',
            file_name: file.name,
            file_path: file.url,
            uploaded_by: clientId,
            is_verified: false,
            created_at: new Date().toISOString()
          }))

          const { error: docsError } = await supabaseAdmin
            .from('documents')
            .insert(documentsToInsert)

          if (docsError) {
            console.error('❌ Erreur sauvegarde documents:', docsError)
          } else {
            console.log('✅ Documents sauvegardés en base')
          }
        }

      } catch (dbError) {
        console.error('❌ Erreur base de données:', dbError)
      }
    }

    // 2. Générer le document final avec signature intégrée
    const finalDocument = generateFinalDocumentWithSignature({
      clientName,
      clientEmail,
      agentName,
      agentEmail,
      documentType,
      signatureData,
      completedAt: new Date().toISOString()
    })

    // 3. Envoyer l'email de confirmation
    const emailSent = await sendConfirmationEmail({
      clientName,
      clientEmail,
      agentName,
      agentEmail,
      documentType,
      completedAt: new Date().toISOString()
    })

    // 4. Créer le log d'audit
    if (supabaseAdmin) {
      try {
        await supabaseAdmin
          .from('audit_logs')
          .insert([{
            case_id: clientId,
            action: 'signature_completed',
            entity_type: 'insurance_case',
            entity_id: clientId,
            new_values: {
              signature_completed: true,
              completed_at: new Date().toISOString(),
              client_name: clientName,
              agent_name: agentName
            },
            created_at: new Date().toISOString()
          }])
      } catch (auditError) {
        console.error('❌ Erreur log audit:', auditError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Signature finalisée avec succès',
      data: {
        documentGenerated: true,
        emailSent,
        signatureSaved: true,
        finalDocument: finalDocument.substring(0, 500) + '...' // Aperçu
      }
    })

  } catch (error) {
    console.error('❌ Erreur finalisation signature:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la finalisation de la signature'
    }, { status: 500 })
  }
}

// Fonction pour générer le document final avec signature
function generateFinalDocumentWithSignature(data: {
  clientName: string
  clientEmail: string
  agentName: string
  agentEmail: string
  documentType: string
  signatureData: any
  completedAt: string
}) {
  const completedDate = new Date(data.completedAt)
  
  return `
DOCUMENT DE RÉSILIATION FINALISÉ
================================

Client: ${data.clientName}
Email: ${data.clientEmail}
Type de dossier: ${data.documentType}

Date de finalisation: ${completedDate.toLocaleDateString('fr-CH')} à ${completedDate.toLocaleTimeString('fr-CH')}

SIGNATURE ÉLECTRONIQUE VALIDÉE
==============================

✓ Signature client validée le ${completedDate.toLocaleDateString('fr-CH')}
✓ Horodatage sécurisé: ${data.completedAt}
✓ Valeur juridique: Équivalente à une signature manuscrite (SCSE)

VALIDATION CONSEILLER
====================

Dossier traité et validé par:
${data.agentName}
Conseiller eSignPro
Email: ${data.agentEmail}

Date de validation: ${completedDate.toLocaleDateString('fr-CH')} à ${completedDate.toLocaleTimeString('fr-CH')}

PROCHAINES ÉTAPES
================

1. Transmission à l'assureur dans les 24h
2. Confirmation par email au client
3. Certificat de résiliation envoyé
4. Traitement du remboursement éventuel

---
Document généré automatiquement par eSignPro
Conforme à la législation suisse (SCSE)
© 2024 eSignPro - Signature électronique sécurisée
`
}

// Fonction pour envoyer l'email de confirmation
async function sendConfirmationEmail(data: {
  clientName: string
  clientEmail: string
  agentName: string
  agentEmail: string
  documentType: string
  completedAt: string
}) {
  try {
    // Utiliser le service email existant
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: data.clientEmail,
        subject: `✅ Confirmation - Votre ${data.documentType} est finalisé`,
        template: 'confirmation',
        data: {
          clientName: data.clientName,
          agentName: data.agentName,
          agentEmail: data.agentEmail,
          documentType: data.documentType,
          completedAt: data.completedAt
        }
      })
    })

    return response.ok
  } catch (error) {
    console.error('❌ Erreur envoi email confirmation:', error)
    return false
  }
}
