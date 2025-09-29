import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import ExcelJS from 'exceljs';

/**
 * API pour exporter les statistiques en Excel
 * GET: Génère un fichier Excel avec toutes les statistiques
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '30');

    console.log('📊 Export statistiques Excel:', { period });

    // Calculer la date de début
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // Récupérer les données
    const [casesResult, signaturesResult, documentsResult, clientsResult] = await Promise.all([
      // Dossiers
      supabaseAdmin
        .from('insurance_cases')
        .select('*')
        .gte('created_at', startDate.toISOString()),
      
      // Signatures
      supabaseAdmin
        .from('signatures')
        .select('*')
        .gte('created_at', startDate.toISOString()),
      
      // Documents générés
      supabaseAdmin
        .from('generated_documents')
        .select('*')
        .gte('created_at', startDate.toISOString()),
      
      // Clients
      supabaseAdmin
        .from('clients')
        .select(`
          *,
          users (
            first_name,
            last_name,
            email,
            phone
          )
        `)
    ]);

    const cases = casesResult.data || [];
    const signatures = signaturesResult.data || [];
    const documents = documentsResult.data || [];
    const clients = clientsResult.data || [];

    // Créer le workbook Excel
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'eSignPro';
    workbook.created = new Date();

    // Feuille 1: Vue d'ensemble
    const overviewSheet = workbook.addWorksheet('Vue d\'ensemble');
    overviewSheet.columns = [
      { header: 'Métrique', key: 'metric', width: 30 },
      { header: 'Valeur', key: 'value', width: 20 }
    ];

    overviewSheet.addRows([
      { metric: 'Période', value: `${period} derniers jours` },
      { metric: 'Date de génération', value: new Date().toLocaleString('fr-CH') },
      { metric: '', value: '' },
      { metric: 'DOSSIERS', value: '' },
      { metric: 'Total dossiers', value: cases.length },
      { metric: 'Dossiers complétés', value: cases.filter(c => c.status === 'completed').length },
      { metric: 'Dossiers en attente', value: cases.filter(c => c.status === 'pending').length },
      { metric: '', value: '' },
      { metric: 'SIGNATURES', value: '' },
      { metric: 'Total signatures', value: signatures.length },
      { metric: 'Signatures validées', value: signatures.filter(s => s.is_validated).length },
      { metric: '', value: '' },
      { metric: 'DOCUMENTS', value: '' },
      { metric: 'Total documents générés', value: documents.length },
      { metric: 'Documents signés', value: documents.filter(d => d.is_signed).length },
      { metric: '', value: '' },
      { metric: 'CLIENTS', value: '' },
      { metric: 'Total clients', value: clients.length }
    ]);

    // Style de l'en-tête
    overviewSheet.getRow(1).font = { bold: true, size: 12 };
    overviewSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE74C3C' }
    };

    // Feuille 2: Dossiers
    const casesSheet = workbook.addWorksheet('Dossiers');
    casesSheet.columns = [
      { header: 'N° Dossier', key: 'case_number', width: 20 },
      { header: 'Statut', key: 'status', width: 15 },
      { header: 'Compagnie', key: 'insurance_company', width: 25 },
      { header: 'Type de police', key: 'policy_type', width: 20 },
      { header: 'N° Police', key: 'policy_number', width: 20 },
      { header: 'Date création', key: 'created_at', width: 20 },
      { header: 'Date mise à jour', key: 'updated_at', width: 20 }
    ];

    cases.forEach(c => {
      casesSheet.addRow({
        case_number: c.case_number,
        status: c.status,
        insurance_company: c.insurance_company,
        policy_type: c.policy_type,
        policy_number: c.policy_number,
        created_at: new Date(c.created_at).toLocaleString('fr-CH'),
        updated_at: new Date(c.updated_at).toLocaleString('fr-CH')
      });
    });

    casesSheet.getRow(1).font = { bold: true };
    casesSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE74C3C' }
    };

    // Feuille 3: Signatures
    const signaturesSheet = workbook.addWorksheet('Signatures');
    signaturesSheet.columns = [
      { header: 'ID Signature', key: 'id', width: 40 },
      { header: 'ID Dossier', key: 'case_id', width: 40 },
      { header: 'Validée', key: 'is_validated', width: 15 },
      { header: 'Date création', key: 'created_at', width: 20 }
    ];

    signatures.forEach(s => {
      signaturesSheet.addRow({
        id: s.id,
        case_id: s.case_id,
        is_validated: s.is_validated ? 'Oui' : 'Non',
        created_at: new Date(s.created_at).toLocaleString('fr-CH')
      });
    });

    signaturesSheet.getRow(1).font = { bold: true };
    signaturesSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE74C3C' }
    };

    // Feuille 4: Documents générés
    const documentsSheet = workbook.addWorksheet('Documents générés');
    documentsSheet.columns = [
      { header: 'Nom du document', key: 'document_name', width: 40 },
      { header: 'Template ID', key: 'template_id', width: 30 },
      { header: 'ID Dossier', key: 'case_id', width: 40 },
      { header: 'Signé', key: 'is_signed', width: 15 },
      { header: 'Date signature', key: 'signed_at', width: 20 },
      { header: 'Date création', key: 'created_at', width: 20 }
    ];

    documents.forEach(d => {
      documentsSheet.addRow({
        document_name: d.document_name,
        template_id: d.template_id,
        case_id: d.case_id,
        is_signed: d.is_signed ? 'Oui' : 'Non',
        signed_at: d.signed_at ? new Date(d.signed_at).toLocaleString('fr-CH') : 'N/A',
        created_at: new Date(d.created_at).toLocaleString('fr-CH')
      });
    });

    documentsSheet.getRow(1).font = { bold: true };
    documentsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE74C3C' }
    };

    // Feuille 5: Clients
    const clientsSheet = workbook.addWorksheet('Clients');
    clientsSheet.columns = [
      { header: 'Prénom', key: 'first_name', width: 20 },
      { header: 'Nom', key: 'last_name', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Téléphone', key: 'phone', width: 20 },
      { header: 'Date création', key: 'created_at', width: 20 }
    ];

    clients.forEach(c => {
      if (c.users) {
        clientsSheet.addRow({
          first_name: c.users.first_name,
          last_name: c.users.last_name,
          email: c.users.email,
          phone: c.users.phone || 'N/A',
          created_at: new Date(c.created_at).toLocaleString('fr-CH')
        });
      }
    });

    clientsSheet.getRow(1).font = { bold: true };
    clientsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE74C3C' }
    };

    // Générer le fichier Excel
    const buffer = await workbook.xlsx.writeBuffer();

    // Retourner le fichier
    const fileName = `eSignPro_Statistiques_${new Date().toISOString().split('T')[0]}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': buffer.length.toString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur export Excel:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'export Excel'
    }, { status: 500 });
  }
}

