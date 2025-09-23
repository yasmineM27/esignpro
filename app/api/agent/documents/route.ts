import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const caseId = searchParams.get('caseId')

    if (!clientId && !caseId) {
      return NextResponse.json({
        success: false,
        error: 'Client ID or Case ID is required'
      }, { status: 400 })
    }

    // Simulation de récupération des documents depuis la base de données
    const mockDocuments = [
      {
        id: 'doc_' + Date.now() + '_1',
        clientId: clientId || 'unknown',
        type: 'identity_front',
        filename: 'carte_identite_recto.jpg',
        originalName: 'Carte d\'identité - Recto',
        size: 245760, // 240 KB
        mimeType: 'image/jpeg',
        uploadedAt: new Date(Date.now() - 3600000).toISOString(), // 1h ago
        status: 'uploaded',
        url: `/uploads/identity/${clientId}_front.jpg`
      },
      {
        id: 'doc_' + Date.now() + '_2',
        clientId: clientId || 'unknown',
        type: 'identity_back',
        filename: 'carte_identite_verso.jpg',
        originalName: 'Carte d\'identité - Verso',
        size: 238592, // 233 KB
        mimeType: 'image/jpeg',
        uploadedAt: new Date(Date.now() - 3500000).toISOString(), // 58min ago
        status: 'uploaded',
        url: `/uploads/identity/${clientId}_back.jpg`
      },
      {
        id: 'doc_' + Date.now() + '_3',
        clientId: clientId || 'unknown',
        type: 'insurance_contract',
        filename: 'contrat_assurance.pdf',
        originalName: 'Contrat d\'assurance actuel',
        size: 1048576, // 1 MB
        mimeType: 'application/pdf',
        uploadedAt: new Date(Date.now() - 3000000).toISOString(), // 50min ago
        status: 'uploaded',
        url: `/uploads/contracts/${clientId}_contract.pdf`
      },
      {
        id: 'doc_' + Date.now() + '_4',
        clientId: clientId || 'unknown',
        type: 'signature',
        filename: 'signature_electronique.png',
        originalName: 'Signature électronique',
        size: 15360, // 15 KB
        mimeType: 'image/png',
        uploadedAt: new Date(Date.now() - 1800000).toISOString(), // 30min ago
        status: 'signed',
        url: `/uploads/signatures/${clientId}_signature.png`,
        signatureData: {
          signedAt: new Date(Date.now() - 1800000).toISOString(),
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          deviceInfo: 'Desktop - Windows 10'
        }
      }
    ]

    // Statistiques du dossier
    const caseStats = {
      totalDocuments: mockDocuments.length,
      uploadedDocuments: mockDocuments.filter(doc => doc.status === 'uploaded').length,
      signedDocuments: mockDocuments.filter(doc => doc.status === 'signed').length,
      completionRate: Math.round((mockDocuments.filter(doc => doc.status === 'signed').length / mockDocuments.length) * 100),
      lastActivity: mockDocuments.reduce((latest, doc) => {
        const docDate = new Date(doc.uploadedAt)
        return docDate > latest ? docDate : latest
      }, new Date(0)).toISOString()
    }

    return NextResponse.json({
      success: true,
      documents: mockDocuments,
      stats: caseStats,
      clientId: clientId || 'unknown',
      caseId: caseId || 'unknown',
      retrievedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('[API] Error retrieving agent documents:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, clientId, documentId, data } = body

    switch (action) {
      case 'approve':
        return NextResponse.json({
          success: true,
          message: 'Document approuvé avec succès',
          documentId,
          approvedAt: new Date().toISOString(),
          approvedBy: 'agent_current'
        })

      case 'reject':
        return NextResponse.json({
          success: true,
          message: 'Document rejeté - demande de nouveau document envoyée',
          documentId,
          rejectedAt: new Date().toISOString(),
          rejectedBy: 'agent_current',
          reason: data?.reason || 'Document non conforme'
        })

      case 'archive':
        return NextResponse.json({
          success: true,
          message: 'Dossier archivé avec succès',
          clientId,
          archivedAt: new Date().toISOString(),
          archivedBy: 'agent_current'
        })

      case 'send_to_insurer':
        return NextResponse.json({
          success: true,
          message: 'Dossier envoyé à la compagnie d\'assurance',
          clientId,
          sentAt: new Date().toISOString(),
          sentBy: 'agent_current',
          insurerEmail: data?.insurerEmail || 'assurance@example.com'
        })

      default:
        return NextResponse.json({
          success: false,
          error: `Action '${action}' not supported`
        }, { status: 400 })
    }

  } catch (error) {
    console.error('[API] Error processing agent document action:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
