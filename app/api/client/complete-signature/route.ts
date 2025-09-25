import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { EmailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const {
      token,
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
    let caseId = null
    if (supabaseAdmin) {
      try {
        // Récupérer le dossier par token
        const { data: caseData, error: caseError } = await supabaseAdmin
          .from('insurance_cases')
          .select('id')
          .eq('secure_token', token)
          .single()

        if (caseError) {
          console.log('❌ Dossier non trouvé en base, création simulée')
          caseId = 'simulated-case-id'
        } else {
          caseId = caseData.id
          
          // Mettre à jour le dossier avec la signature
          const { error: updateError } = await supabaseAdmin
            .from('insurance_cases')
            .update({
              signature_data: signatureData,
              status: 'signed',
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', caseId)

          if (updateError) {
            console.error('❌ Erreur mise à jour dossier:', updateError)
          } else {
            console.log('✅ Dossier mis à jour avec signature')
          }
        }

        // Sauvegarder le log de signature
        const { error: logError } = await supabaseAdmin
          .from('signature_logs')
          .insert([{
            case_id: caseId,
            signature_data: signatureData,
            ip_address: request.headers.get('x-forwarded-for') || 'unknown',
            user_agent: request.headers.get('user-agent') || 'unknown',
            timestamp: new Date().toISOString(),
            is_valid: true,
            validation_method: 'electronic'
          }])

        if (logError) {
          console.error('❌ Erreur sauvegarde log signature:', logError)
        } else {
          console.log('✅ Log de signature sauvegardé')
        }

        // Créer l'entrée pour le document final
        const { error: docError } = await supabaseAdmin
          .from('final_documents')
          .insert([{
            case_id: caseId,
            document_type: 'signed_termination',
            file_path: `/documents/final/${caseId}_signed.pdf`,
            generated_at: new Date().toISOString(),
            signature_included: true,
            download_count: 0
          }])

        if (docError) {
          console.error('❌ Erreur création document final:', docError)
        } else {
          console.log('✅ Document final créé')
        }

      } catch (dbError) {
        console.error('❌ Erreur base de données:', dbError)
      }
    }

    // 2. Envoyer email de confirmation au client
    try {
      const emailService = EmailService.getInstance()
      
      const confirmationResult = await emailService.sendEmail({
        to: clientEmail,
        subject: 'eSignPro - Signature confirmée avec succès',
        html: generateConfirmationEmailHTML({
          clientName,
          agentName,
          documentType,
          signatureTimestamp: signatureData.timestamp,
          token
        }),
        text: generateConfirmationEmailText({
          clientName,
          agentName,
          documentType,
          signatureTimestamp: signatureData.timestamp
        })
      })

      if (confirmationResult.success) {
        console.log('✅ Email de confirmation envoyé au client')
      } else {
        console.error('❌ Erreur envoi email client:', confirmationResult.error)
      }
    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError)
    }

    // 3. Envoyer notification à l'agent
    try {
      const emailService = EmailService.getInstance()
      
      const agentNotificationResult = await emailService.sendEmail({
        to: agentEmail,
        subject: `eSignPro - Signature complétée: ${clientName}`,
        html: generateAgentNotificationHTML({
          clientName,
          clientEmail,
          agentName,
          documentType,
          signatureTimestamp: signatureData.timestamp,
          token,
          caseId: caseId || token
        }),
        text: generateAgentNotificationText({
          clientName,
          clientEmail,
          documentType,
          signatureTimestamp: signatureData.timestamp
        })
      })

      if (agentNotificationResult.success) {
        console.log('✅ Notification envoyée à l\'agent')
      } else {
        console.error('❌ Erreur notification agent:', agentNotificationResult.error)
      }
    } catch (emailError) {
      console.error('❌ Erreur notification agent:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Signature finalisée avec succès',
      caseId,
      signatureTimestamp: signatureData.timestamp,
      documentUrl: `/api/client/download-document?token=${token}&clientId=${caseId || token}`
    })

  } catch (error) {
    console.error('❌ Erreur finalisation signature:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la finalisation de la signature'
    }, { status: 500 })
  }
}

// Génération de l'email de confirmation client
function generateConfirmationEmailHTML(data: {
  clientName: string
  agentName: string
  documentType: string
  signatureTimestamp: string
  token: string
}): string {
  const now = new Date()
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Signature Confirmée - eSignPro</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e74c3c;">eSignPro</h1>
            <h2 style="color: #2c3e50;">✅ Signature Confirmée avec Succès</h2>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #27ae60; margin-top: 0;">Bonjour ${data.clientName},</h3>
            <p>Votre signature électronique a été <strong>confirmée avec succès</strong> !</p>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h4 style="color: #2c3e50; margin-top: 0;">📋 Détails de votre dossier :</h4>
                <p><strong>Type de document :</strong> ${data.documentType}</p>
                <p><strong>Conseiller :</strong> ${data.agentName}</p>
                <p><strong>Date de signature :</strong> ${now.toLocaleDateString('fr-CH')} à ${now.toLocaleTimeString('fr-CH')}</p>
                <p><strong>Référence :</strong> ${data.token.substring(0, 8)}...</p>
            </div>
        </div>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: #27ae60; margin-top: 0;">🎉 Prochaines étapes :</h4>
            <ol style="color: #2c3e50;">
                <li>Votre dossier sera transmis à votre compagnie d'assurance dans les 24h</li>
                <li>Vous recevrez un certificat de résiliation par email</li>
                <li>Le remboursement éventuel sera traité selon les conditions</li>
            </ol>
        </div>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: #856404; margin-top: 0;">✍️ Signature de validation :</h4>
            <p style="margin: 0;"><strong>${data.agentName}</strong><br>
            Conseiller eSignPro<br>
            <small>Document validé et signé le ${now.toLocaleDateString('fr-CH')} à ${now.toLocaleTimeString('fr-CH')}</small></p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            <p><strong>eSignPro</strong> - Signature Électronique Sécurisée</p>
            <p>Conforme à la législation suisse (SCSE) - Valeur juridique garantie</p>
        </div>
    </div>
</body>
</html>`
}

function generateConfirmationEmailText(data: {
  clientName: string
  agentName: string
  documentType: string
  signatureTimestamp: string
}): string {
  const now = new Date()
  return `
eSignPro - Signature Confirmée avec Succès

Bonjour ${data.clientName},

Votre signature électronique a été confirmée avec succès !

Détails de votre dossier :
- Type de document : ${data.documentType}
- Conseiller : ${data.agentName}
- Date de signature : ${now.toLocaleDateString('fr-CH')} à ${now.toLocaleTimeString('fr-CH')}

Prochaines étapes :
1. Votre dossier sera transmis à votre compagnie d'assurance dans les 24h
2. Vous recevrez un certificat de résiliation par email
3. Le remboursement éventuel sera traité selon les conditions

Signature de validation :
${data.agentName}
Conseiller eSignPro
Document validé et signé le ${now.toLocaleDateString('fr-CH')} à ${now.toLocaleTimeString('fr-CH')}

---
eSignPro - Signature Électronique Sécurisée
Conforme à la législation suisse (SCSE)
`
}

function generateAgentNotificationHTML(data: {
  clientName: string
  clientEmail: string
  agentName: string
  documentType: string
  signatureTimestamp: string
  token: string
  caseId: string
}): string {
  const now = new Date()
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Signature Complétée - eSignPro Agent</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e74c3c;">eSignPro</h1>
            <h2 style="color: #2c3e50;">🎯 Signature Client Complétée</h2>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #2c3e50; margin-top: 0;">Bonjour ${data.agentName},</h3>
            <p>Le client <strong>${data.clientName}</strong> a complété sa signature électronique.</p>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h4 style="color: #2c3e50; margin-top: 0;">📋 Informations du dossier :</h4>
                <p><strong>Client :</strong> ${data.clientName}</p>
                <p><strong>Email :</strong> ${data.clientEmail}</p>
                <p><strong>Type :</strong> ${data.documentType}</p>
                <p><strong>ID Dossier :</strong> ${data.caseId}</p>
                <p><strong>Signé le :</strong> ${now.toLocaleDateString('fr-CH')} à ${now.toLocaleTimeString('fr-CH')}</p>
            </div>
        </div>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: #27ae60; margin-top: 0;">📥 Actions disponibles :</h4>
            <ul style="color: #2c3e50;">
                <li>Télécharger le document final signé depuis votre dashboard</li>
                <li>Transmettre le dossier à la compagnie d'assurance</li>
                <li>Archiver le dossier une fois traité</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            <p><strong>eSignPro</strong> - Dashboard Agent</p>
            <p>Notification automatique du système</p>
        </div>
    </div>
</body>
</html>`
}

function generateAgentNotificationText(data: {
  clientName: string
  clientEmail: string
  documentType: string
  signatureTimestamp: string
}): string {
  const now = new Date()
  return `
eSignPro - Signature Client Complétée

Le client ${data.clientName} a complété sa signature électronique.

Informations du dossier :
- Client : ${data.clientName}
- Email : ${data.clientEmail}
- Type : ${data.documentType}
- Signé le : ${now.toLocaleDateString('fr-CH')} à ${now.toLocaleTimeString('fr-CH')}

Actions disponibles :
- Télécharger le document final signé depuis votre dashboard
- Transmettre le dossier à la compagnie d'assurance
- Archiver le dossier une fois traité

---
eSignPro - Dashboard Agent
Notification automatique du système
`
}
