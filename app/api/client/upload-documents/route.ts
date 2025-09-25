import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const token = formData.get('token') as string
    const clientId = formData.get('clientId') as string
    const documentType = formData.get('documentType') as string || 'identity'

    if (!files.length || !token || !clientId) {
      return NextResponse.json({
        success: false,
        error: 'Fichiers, token et clientId requis'
      }, { status: 400 })
    }

    console.log('📤 Upload de documents pour token:', token)
    console.log('📁 Nombre de fichiers:', files.length)

    const uploadedFiles = []
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'clients', clientId)

    // Créer le dossier s'il n'existe pas
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Traiter chaque fichier
    for (const file of files) {
      try {
        // Validation du fichier
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
          console.error(`❌ Fichier trop volumineux: ${file.name}`)
          continue
        }

        // Types de fichiers autorisés
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
        if (!allowedTypes.includes(file.type)) {
          console.error(`❌ Type de fichier non autorisé: ${file.type}`)
          continue
        }

        // Générer un nom de fichier unique
        const timestamp = Date.now()
        const fileExtension = file.name.split('.').pop()
        const fileName = `${documentType}_${timestamp}.${fileExtension}`
        const filePath = join(uploadDir, fileName)
        const relativePath = `/uploads/clients/${clientId}/${fileName}`

        // Sauvegarder le fichier physiquement
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        console.log('✅ Fichier sauvegardé:', relativePath)

        // Déterminer le type de document
        let docType = 'additional'
        if (file.name.toLowerCase().includes('recto') || file.name.toLowerCase().includes('front')) {
          docType = 'identity_front'
        } else if (file.name.toLowerCase().includes('verso') || file.name.toLowerCase().includes('back')) {
          docType = 'identity_back'
        } else if (documentType === 'identity') {
          docType = uploadedFiles.length === 0 ? 'identity_front' : 'identity_back'
        }

        const uploadedFile = {
          id: `file_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          originalName: file.name,
          fileName: fileName,
          filePath: relativePath,
          fileSize: file.size,
          mimeType: file.type,
          documentType: docType,
          uploadedAt: new Date().toISOString()
        }

        uploadedFiles.push(uploadedFile)

        // Sauvegarder en base de données si Supabase est disponible
        if (supabaseAdmin) {
          try {
            // Récupérer l'ID du dossier
            const { data: caseData, error: caseError } = await supabaseAdmin
              .from('insurance_cases')
              .select('id, client_id')
              .eq('secure_token', token)
              .single()

            if (!caseError && caseData) {
              // Insérer le document en base
              const { error: insertError } = await supabaseAdmin
                .from('client_documents')
                .insert([{
                  case_id: caseData.id,
                  document_type: docType,
                  file_name: file.name,
                  file_path: relativePath,
                  file_size: file.size,
                  mime_type: file.type,
                  uploaded_by: caseData.client_id,
                  is_verified: false
                }])

              if (insertError) {
                console.error('❌ Erreur sauvegarde BDD:', insertError)
              } else {
                console.log('✅ Document sauvegardé en BDD')
              }
            }
          } catch (dbError) {
            console.error('❌ Erreur base de données:', dbError)
          }
        }

      } catch (fileError) {
        console.error(`❌ Erreur traitement fichier ${file.name}:`, fileError)
      }
    }

    // Mettre à jour le statut du dossier
    if (supabaseAdmin && uploadedFiles.length > 0) {
      try {
        const { error: updateError } = await supabaseAdmin
          .from('insurance_cases')
          .update({
            status: 'documents_uploaded',
            updated_at: new Date().toISOString()
          })
          .eq('secure_token', token)

        if (updateError) {
          console.error('❌ Erreur mise à jour statut:', updateError)
        } else {
          console.log('✅ Statut dossier mis à jour')
        }
      } catch (updateError) {
        console.error('❌ Erreur mise à jour:', updateError)
      }
    }

    return NextResponse.json({
      success: true,
      message: `${uploadedFiles.length} fichier(s) uploadé(s) avec succès`,
      uploadedFiles,
      totalFiles: uploadedFiles.length
    })

  } catch (error) {
    console.error('❌ Erreur upload documents:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'upload des documents'
    }, { status: 500 })
  }
}

// API pour récupérer les documents d'un client
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

    console.log('📋 Récupération documents pour token:', token)

    let documents = []

    // Récupérer depuis la base de données
    if (supabaseAdmin) {
      try {
        const { data: caseData, error: caseError } = await supabaseAdmin
          .from('insurance_cases')
          .select('id')
          .eq('secure_token', token)
          .single()

        if (!caseError && caseData) {
          const { data: documentsData, error: docsError } = await supabaseAdmin
            .from('client_documents')
            .select('*')
            .eq('case_id', caseData.id)
            .order('created_at', { ascending: false })

          if (!docsError && documentsData) {
            documents = documentsData.map(doc => ({
              id: doc.id,
              name: doc.file_name,
              fileName: doc.file_name,
              filePath: doc.file_path,
              fileSize: doc.file_size,
              mimeType: doc.mime_type,
              documentType: doc.document_type,
              isVerified: doc.is_verified,
              uploadedAt: doc.created_at
            }))
          }
        }
      } catch (dbError) {
        console.error('❌ Erreur récupération documents:', dbError)
      }
    }

    return NextResponse.json({
      success: true,
      documents,
      totalDocuments: documents.length
    })

  } catch (error) {
    console.error('❌ Erreur récupération documents:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des documents'
    }, { status: 500 })
  }
}
