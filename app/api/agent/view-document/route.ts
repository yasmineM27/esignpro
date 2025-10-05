import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    const type = searchParams.get('type') || 'generated'; // 'generated' ou 'client'
    
    console.log('👁️ Visualisation document:', { documentId, type });

    if (!documentId) {
      return NextResponse.json({
        success: false,
        error: 'ID du document requis'
      }, { status: 400 });
    }

    if (type === 'generated') {
      // Récupérer depuis generated_documents
      const { data: generatedDoc, error: genError } = await supabaseAdmin
        .from('generated_documents')
        .select(`
          *,
          insurance_cases (
            case_number,
            clients (
              users (
                first_name,
                last_name,
                email
              )
            )
          )
        `)
        .eq('id', documentId)
        .single();

      if (genError || !generatedDoc) {
        console.error('❌ Document généré non trouvé:', genError);
        return NextResponse.json({
          success: false,
          error: 'Document généré non trouvé'
        }, { status: 404 });
      }

      // Si c'est un PDF signé, le retourner directement
      if (generatedDoc.signed_pdf_data) {
        try {
          const base64Data = generatedDoc.signed_pdf_data.replace(/^data:application\/pdf;base64,/, '');
          const pdfBuffer = Buffer.from(base64Data, 'base64');
          
          return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'inline', // Pour affichage dans le navigateur
              'Cache-Control': 'no-cache'
            }
          });
        } catch (pdfError) {
          console.error('❌ Erreur traitement PDF:', pdfError);
          return NextResponse.json({
            success: false,
            error: 'Erreur lors du traitement du PDF'
          }, { status: 500 });
        }
      }

      // Sinon, retourner les informations du document
      return NextResponse.json({
        success: true,
        data: {
          id: generatedDoc.id,
          name: generatedDoc.document_name,
          content: generatedDoc.document_content,
          template: generatedDoc.template_id,
          isSigned: generatedDoc.is_signed,
          signedAt: generatedDoc.signed_at,
          hasPdf: !!generatedDoc.signed_pdf_data,
          caseNumber: generatedDoc.insurance_cases?.case_number,
          clientName: generatedDoc.insurance_cases?.clients?.users
            ? `${generatedDoc.insurance_cases.clients.users.first_name} ${generatedDoc.insurance_cases.clients.users.last_name}`
            : 'N/A',
          createdAt: generatedDoc.created_at
        }
      });

    } else if (type === 'client') {
      // Récupérer depuis client_documents
      const { data: clientDoc, error: clientError } = await supabaseAdmin
        .from('client_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (clientError || !clientDoc) {
        console.error('❌ Document client non trouvé:', clientError);
        return NextResponse.json({
          success: false,
          error: 'Document client non trouvé'
        }, { status: 404 });
      }

      // Si le document est stocké dans Supabase Storage
      if (clientDoc.storage_type === 'supabase' && clientDoc.filepath) {
        try {
          // Pour les PDF, on peut essayer de les afficher directement
          if (clientDoc.mimetype === 'application/pdf') {
            const { data: fileData, error: downloadError } = await supabaseAdmin.storage
              .from('client-documents')
              .download(clientDoc.filepath);

            if (downloadError) {
              console.error('❌ Erreur téléchargement Supabase Storage:', downloadError);
              throw downloadError;
            }

            const buffer = Buffer.from(await fileData.arrayBuffer());
            
            return new NextResponse(buffer, {
              status: 200,
              headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline',
                'Cache-Control': 'no-cache'
              }
            });
          }

          // Pour les images, on peut aussi les afficher
          if (clientDoc.mimetype?.startsWith('image/')) {
            const { data: fileData, error: downloadError } = await supabaseAdmin.storage
              .from('client-documents')
              .download(clientDoc.filepath);

            if (downloadError) {
              console.error('❌ Erreur téléchargement image:', downloadError);
              throw downloadError;
            }

            const buffer = Buffer.from(await fileData.arrayBuffer());
            
            return new NextResponse(buffer, {
              status: 200,
              headers: {
                'Content-Type': clientDoc.mimetype,
                'Content-Disposition': 'inline',
                'Cache-Control': 'no-cache'
              }
            });
          }

        } catch (storageError) {
          console.error('❌ Erreur accès Supabase Storage:', storageError);
        }
      }

      // Retourner les informations du document client
      return NextResponse.json({
        success: true,
        data: {
          id: clientDoc.id,
          name: clientDoc.filename,
          type: clientDoc.documenttype,
          size: clientDoc.filesize,
          mimetype: clientDoc.mimetype,
          uploadDate: clientDoc.uploaddate,
          status: clientDoc.status,
          isVerified: clientDoc.is_verified,
          storageType: clientDoc.storage_type,
          filepath: clientDoc.filepath
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Type de document non supporté'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Erreur visualisation document:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la visualisation du document'
    }, { status: 500 });
  }
}
