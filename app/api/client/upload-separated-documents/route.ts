import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Configuration des types de documents
const DOCUMENT_TYPES = {
  identity_front: {
    name: 'Carte d\'Identité - RECTO',
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    maxSize: 10 * 1024 * 1024, // 10MB
    required: true
  },
  identity_back: {
    name: 'Carte d\'Identité - VERSO',
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    maxSize: 10 * 1024 * 1024,
    required: true
  },
  insurance_contract: {
    name: 'Contrat d\'Assurance',
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSize: 10 * 1024 * 1024,
    required: false
  },
  proof_address: {
    name: 'Justificatif de Domicile',
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSize: 10 * 1024 * 1024,
    required: false
  },
  bank_statement: {
    name: 'Relevé Bancaire',
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSize: 10 * 1024 * 1024,
    required: false
  },
  additional: {
    name: 'Documents Supplémentaires',
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSize: 10 * 1024 * 1024,
    required: false
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const token = formData.get('token') as string
    const clientId = formData.get('clientId') as string
    const documentType = formData.get('documentType') as string

    console.log('📤 Upload request:', { 
      filesCount: files.length, 
      token, 
      clientId, 
      documentType 
    })

    // Validation des paramètres requis
    if (!files.length || !token || !clientId || !documentType) {
      return NextResponse.json({
        success: false,
        error: 'Fichiers, token, clientId et documentType requis'
      }, { status: 400 })
    }

    // Validation du type de document
    if (!DOCUMENT_TYPES[documentType as keyof typeof DOCUMENT_TYPES]) {
      return NextResponse.json({
        success: false,
        error: 'Type de document non supporté'
      }, { status: 400 })
    }

    const docConfig = DOCUMENT_TYPES[documentType as keyof typeof DOCUMENT_TYPES]

    // Validation des fichiers
    for (const file of files) {
      // Vérifier le type MIME
      if (!docConfig.allowedTypes.includes(file.type)) {
        return NextResponse.json({
          success: false,
          error: `Type de fichier non supporté pour ${docConfig.name}. Types acceptés: ${docConfig.allowedTypes.join(', ')}`
        }, { status: 400 })
      }

      // Vérifier la taille
      if (file.size > docConfig.maxSize) {
        return NextResponse.json({
          success: false,
          error: `Fichier trop volumineux pour ${docConfig.name}. Taille maximum: ${docConfig.maxSize / (1024 * 1024)}MB`
        }, { status: 400 })
      }

      // Vérifier que le fichier n'est pas vide
      if (file.size === 0) {
        return NextResponse.json({
          success: false,
          error: 'Fichier vide détecté'
        }, { status: 400 })
      }
    }

    // Créer le dossier d'upload s'il n'existe pas
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'clients', clientId, documentType)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
      console.log('📁 Dossier créé:', uploadDir)
    }

    const uploadedFiles = []

    // Traiter chaque fichier
    for (const file of files) {
      try {
        // Générer un nom de fichier unique
        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substr(2, 9)
        const fileExtension = file.name.split('.').pop()
        const fileName = `${documentType}_${timestamp}_${randomId}.${fileExtension}`
        const filePath = join(uploadDir, fileName)
        const relativePath = `/uploads/clients/${clientId}/${documentType}/${fileName}`

        // Sauvegarder le fichier physiquement
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        console.log('✅ Fichier sauvegardé:', relativePath)

        // Enregistrer en base de données si Supabase est configuré
        let dbRecord = null
        if (supabaseAdmin) {
          try {
            const { data, error } = await supabaseAdmin
              .from('client_documents')
              .insert([{
                clientid: clientId,
                token: token,
                documenttype: documentType,
                filename: file.name,
                filepath: relativePath,
                filesize: file.size,
                mimetype: file.type,
                uploaddate: new Date().toISOString(),
                status: 'uploaded'
              }])
              .select()
              .single()

            if (error) {
              console.warn('⚠️ Erreur DB (fichier sauvegardé):', error)
            } else {
              dbRecord = data
              console.log('✅ Document enregistré en DB:', data.id)
            }
          } catch (dbError) {
            console.warn('⚠️ Erreur DB (fichier sauvegardé):', dbError)
          }
        }

        uploadedFiles.push({
          id: dbRecord?.id || randomId,
          name: file.name,
          type: documentType,
          url: relativePath,
          size: file.size,
          mimeType: file.type,
          uploadDate: new Date().toISOString(),
          documentTypeName: docConfig.name
        })

      } catch (fileError) {
        console.error('❌ Erreur traitement fichier:', file.name, fileError)
        return NextResponse.json({
          success: false,
          error: `Erreur lors du traitement du fichier ${file.name}`
        }, { status: 500 })
      }
    }

    console.log('🎉 Upload terminé:', uploadedFiles.length, 'fichiers')

    return NextResponse.json({
      success: true,
      message: `${uploadedFiles.length} fichier(s) uploadé(s) avec succès pour ${docConfig.name}`,
      uploadedFiles,
      documentType,
      documentTypeName: docConfig.name
    })

  } catch (error) {
    console.error('❌ Erreur upload:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur lors de l\'upload'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const token = searchParams.get('token')

    if (!clientId || !token) {
      return NextResponse.json({
        success: false,
        error: 'ClientId et token requis'
      }, { status: 400 })
    }

    // Récupérer les documents depuis la base de données
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('client_documents')
        .select('*')
        .eq('clientid', clientId)
        .eq('token', token)
        .order('uploaddate', { ascending: false })

      if (error) {
        console.error('❌ Erreur récupération documents:', error)
        return NextResponse.json({
          success: false,
          error: 'Erreur lors de la récupération des documents'
        }, { status: 500 })
      }

      // Organiser par type de document
      const documentsByType = data.reduce((acc, doc) => {
        if (!acc[doc.documenttype]) {
          acc[doc.documenttype] = []
        }
        acc[doc.documenttype].push(doc)
        return acc
      }, {} as Record<string, any[]>)

      return NextResponse.json({
        success: true,
        documents: data,
        documentsByType,
        totalCount: data.length
      })
    }

    return NextResponse.json({
      success: true,
      documents: [],
      documentsByType: {},
      totalCount: 0,
      message: 'Base de données non configurée'
    })

  } catch (error) {
    console.error('❌ Erreur récupération:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 })
  }
}
