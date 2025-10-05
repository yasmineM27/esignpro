interface EmailTemplateData {
  clientName: string
  portalLink: string
  documentContent: string
  agentName?: string
  companyName?: string
}

export function generateClientEmailTemplate(data: EmailTemplateData & {
  expiryDate?: string
  documentType?: string
}): { subject: string; html: string; text: string } {
  const {
    clientName,
    portalLink,
    documentContent,
    agentName = "wael hamda",
    companyName = "eSignPro",
    expiryDate,
    documentType = "dossier de résiliation"
  } = data

  // Calculer la date d'expiration dynamique (7 jours par défaut)
  const defaultExpiryDate = new Date()
  defaultExpiryDate.setDate(defaultExpiryDate.getDate() + 7)
  const finalExpiryDate = expiryDate || defaultExpiryDate.toLocaleDateString('fr-CH')

  const subject = "eSignPro - Signature Électronique Sécurisée"

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>eSignPro - Signature Électronique Sécurisée</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #f8f9fa;
        }
        .container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { 
            background: #2c3e50; 
            color: white; 
            padding: 30px; 
            text-align: center; 
        }
        .logo { 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            margin-bottom: 20px; 
        }
        .logo-shield {
            width: 40px;
            height: 40px;
            background: #e74c3c;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            position: relative;
        }
        .logo-shield::before {
            content: '+';
            color: white;
            font-size: 20px;
            font-weight: bold;
        }
        .logo-shield::after {
            content: '✓';
            color: white;
            font-size: 16px;
            position: absolute;
            bottom: 2px;
            right: 2px;
        }
        .logo-text {
            font-size: 28px;
            font-weight: 300;
            color: white;
            letter-spacing: -0.5px;
        }
        .content { padding: 30px; }
        .greeting { font-size: 18px; margin-bottom: 20px; }
        .card { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
            border-left: 4px solid #e74c3c; 
        }
        .button { 
            display: inline-block; 
            background: #e74c3c; 
            color: white; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600; 
            margin: 20px 0;
            text-align: center;
        }
        .button:hover { background: #c0392b; }
        .steps { 
            background: #fff3cd; 
            padding: 20px; 
            border-radius: 8px; 
            border: 1px solid #ffeaa7; 
            margin: 20px 0; 
        }
        .step-item {
            margin: 8px 0;
            padding-left: 20px;
            position: relative;
        }
        .step-item::before {
            content: counter(step-counter);
            counter-increment: step-counter;
            position: absolute;
            left: 0;
            top: 0;
            background: #e74c3c;
            color: white;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
        }
        .steps ol {
            counter-reset: step-counter;
            list-style: none;
            padding: 0;
        }
        .security { 
            background: #e8f5e8; 
            padding: 20px; 
            border-radius: 8px; 
            border: 1px solid #4caf50; 
            margin: 20px 0; 
        }
        .footer { 
            text-align: center; 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #e5e7eb; 
            color: #6b7280; 
            font-size: 14px; 
        }
        .link-info {
            background: #f0f0f0;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <div class="logo-shield"></div>
                <div class="logo-text">esignpro</div>
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 400;">Signature Électronique Sécurisée</h1>
        </div>
        
        <div class="content">
            <div class="greeting">Bonjour ${clientName.includes(' ') ? clientName.split(' ')[0] : clientName},</div>

            <p>Votre conseiller <strong>${agentName}</strong> vous invite à finaliser la signature électronique de vos documents via notre plateforme sécurisée.</p>

            <div class="card">
                <h3 style="margin-top: 0; color: #e74c3c;">•Documents préparés pour signature</h3>
                <p>Vos documents ont été soigneusement préparés par votre conseiller et sont maintenant prêts pour la signature électronique. Une seule signature validera l'ensemble de vos documents.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${portalLink}" class="button">Accéder à la signature sécurisée</a>
            </div>

            <div class="link-info">
                <strong>Lien personnel et sécurisé - Expire le ${finalExpiryDate}</strong>
            </div>
            
            <div class="security">
                <h3 style="margin-top: 0; color: #2e7d32;">Sécurité garantie</h3>
                <p>Votre signature électronique a la même valeur juridique qu'une signature manuscrite selon la législation suisse (SCSE).</p>

                <h4 style="color: #1976d2; margin-bottom: 10px;">Processus de signature simplifié :</h4>
                <div class="steps">
                    <ol>
                        <li class="step-item">Cliquez sur le bouton de signature sécurisée</li>
                        <li class="step-item">Vérifiez et consultez vos documents</li>
                        <li class="step-item">Procédez à votre signature électronique</li>
                        <li class="step-item">Recevez la confirmation de signature</li>
                    </ol>
                </div>
            </div>
            
            <p style="margin-top: 30px;">Cordialement,</p>
            <p style="font-weight: 600; margin-bottom: 5px;">${agentName}</p>
            <p style="color: #666; font-size: 14px; margin-top: 0;">Votre conseiller - eSignPro</p>

            <p style="color: #999; font-size: 12px; margin-top: 15px;">
                Envoyé le ${new Date().toLocaleDateString('fr-CH')}
            </p>
        </div>

        <div class="footer">
            <p><strong>eSignPro</strong> - Signature Électronique Sécurisée</p>
            <p style="font-size: 12px;">Envoyé le 18.08.2025</p>
        </div>
    </div>
</body>
</html>
  `

  const text = `
eSignPro - Signature Électronique Sécurisée

Bonjour ${clientName.split(' ')[0]},

Votre conseiller ${agentName} vous invite à finaliser la signature électronique de vos documents via notre plateforme sécurisée.

•Documents préparés pour signature
Vos documents ont été soigneusement préparés par votre conseiller et sont maintenant prêts pour la signature électronique. Une seule signature validera l'ensemble de vos documents.

Accéder à la signature sécurisée: ${portalLink}

Lien personnel et sécurisé - Expire le ${finalExpiryDate}

Sécurité garantie
Votre signature électronique a la même valeur juridique qu'une signature manuscrite selon la législation suisse (SCSE).

Processus de signature simplifié :
1. Cliquez sur le bouton de signature sécurisée
2. Vérifiez et consultez vos documents
3. Procédez à votre signature électronique
4. Recevez la confirmation de signature

Cordialement,
${agentName}
Votre conseiller - eSignPro

Envoyé le ${new Date().toLocaleDateString('fr-CH')}
  `

  return { subject, html, text }
}

export function generateAgentNotificationTemplate(data: {
  clientName: string
  clientEmail: string
  clientId: string
}): { subject: string; html: string; text: string } {
  const { clientName, clientEmail, clientId } = data

  const subject = `Nouveau dossier créé - ${clientName} (${clientId})`

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notification Agent</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f0fdf4; padding: 20px; border-radius: 0 0 8px 8px; }
        .info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h2>📋 Nouveau Dossier Créé</h2>
    </div>
    
    <div class="content">
        <div class="info">
            <h3>Informations du dossier :</h3>
            <p><strong>Client :</strong> ${clientName}</p>
            <p><strong>Email :</strong> ${clientEmail}</p>
            <p><strong>ID Dossier :</strong> ${clientId}</p>
            <p><strong>Statut :</strong> En attente de documents client</p>
        </div>
        
        <p>Le client a reçu un email avec le lien vers son portail pour compléter son dossier.</p>
    </div>
</body>
</html>
  `

  const text = `
Nouveau dossier créé

Client : ${clientName}
Email : ${clientEmail}
ID Dossier : ${clientId}
Statut : En attente de documents client

Le client a reçu un email avec le lien vers son portail pour compléter son dossier.
  `

  return { subject, html, text }
}
