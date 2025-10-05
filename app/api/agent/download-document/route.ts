import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { documentId, caseId, documentName } = await request.json();
    
    console.log('📥 Téléchargement document individuel:', { documentId, caseId, documentName });

    if (!documentId) {
      return NextResponse.json({
        success: false,
        error: 'ID du document requis'
      }, { status: 400 });
    }

    // Essayer de récupérer depuis generated_documents
    const { data: generatedDoc, error: genError } = await supabaseAdmin
      .from('generated_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (generatedDoc && !genError) {
      console.log('📄 Document généré trouvé:', generatedDoc.document_name);
      
      // Si c'est un PDF signé, retourner le PDF
      if (generatedDoc.signed_pdf_data) {
        try {
          const base64Data = generatedDoc.signed_pdf_data.replace(/^data:application\/pdf;base64,/, '');
          const pdfBuffer = Buffer.from(base64Data, 'base64');
          
          return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${generatedDoc.document_name}-signe.pdf"`,
              'Content-Length': pdfBuffer.length.toString()
            }
          });
        } catch (pdfError) {
          console.error('❌ Erreur traitement PDF:', pdfError);
        }
      }
      
      // Sinon, retourner le contenu texte
      if (generatedDoc.document_content) {
        const textBuffer = Buffer.from(generatedDoc.document_content, 'utf-8');
        
        return new NextResponse(textBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `attachment; filename="${generatedDoc.document_name}.txt"`,
            'Content-Length': textBuffer.length.toString()
          }
        });
      }
    }

    // Essayer de récupérer depuis client_documents
    const { data: clientDoc, error: clientError } = await supabaseAdmin
      .from('client_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (clientDoc && !clientError) {
      console.log('📄 Document client trouvé:', clientDoc.filename);
      
      // Si le document est stocké dans Supabase Storage
      if (clientDoc.storage_type === 'supabase' && clientDoc.filepath) {
        try {
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
              'Content-Type': clientDoc.mimetype || 'application/octet-stream',
              'Content-Disposition': `attachment; filename="${clientDoc.filename}"`,
              'Content-Length': buffer.length.toString()
            }
          });
        } catch (storageError) {
          console.error('❌ Erreur accès Supabase Storage:', storageError);
        }
      }
      
      // Fallback: créer un fichier d'information
      const infoContent = `Document: ${clientDoc.filename}
Type: ${clientDoc.documenttype}
Taille: ${clientDoc.filesize || 'N/A'} bytes
Date d'upload: ${clientDoc.uploaddate}
Statut: ${clientDoc.status}
Vérifié: ${clientDoc.is_verified ? 'Oui' : 'Non'}

Note: Le fichier original n'est pas accessible depuis cette interface.
Contactez l'administrateur pour accéder au fichier complet.`;

      const infoBuffer = Buffer.from(infoContent, 'utf-8');
      
      return new NextResponse(infoBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="${clientDoc.filename}-info.txt"`,
          'Content-Length': infoBuffer.length.toString()
        }
      });
    }

    // Document non trouvé
    console.log('❌ Document non trouvé:', documentId);
    return NextResponse.json({
      success: false,
      error: 'Document non trouvé'
    }, { status: 404 });

  } catch (error) {
    console.error('❌ Erreur téléchargement document:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du téléchargement du document'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    const caseId = searchParams.get('caseId');
    const documentName = searchParams.get('documentName');

    if (!documentId) {
      return NextResponse.json({
        success: false,
        error: 'ID du document requis'
      }, { status: 400 });
    }

    // Rediriger vers POST pour traitement uniforme
    return POST(request);
  } catch (error) {
    console.error('❌ Erreur GET:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}
