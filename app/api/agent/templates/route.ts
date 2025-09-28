import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Templates prédéfinis pour différents types de documents
const PREDEFINED_TEMPLATES = [
  {
    id: 'template_resiliation_auto',
    name: 'Résiliation Assurance Auto',
    category: 'resiliation',
    description: 'Lettre de résiliation pour assurance automobile',
    variables: ['clientName', 'clientAddress', 'policyNumber', 'insuranceCompany', 'terminationDate', 'reason'],
    content: `
Objet : Résiliation de contrat d'assurance automobile

Madame, Monsieur,

Par la présente, je vous informe de ma décision de résilier mon contrat d'assurance automobile n° {{policyNumber}} souscrit auprès de {{insuranceCompany}}.

Titulaire du contrat : {{clientName}}
Adresse : {{clientAddress}}
Numéro de police : {{policyNumber}}

Cette résiliation prendra effet le {{terminationDate}}.

Motif de la résiliation : {{reason}}

Je vous prie de bien vouloir me faire parvenir un accusé de réception de cette demande ainsi que le décompte de régularisation.

Cordialement,

{{clientName}}
Date : {{currentDate}}
Signature : [SIGNATURE_PLACEHOLDER]
    `,
    isActive: true
  },
  {
    id: 'template_resiliation_habitation',
    name: 'Résiliation Assurance Habitation',
    category: 'resiliation',
    description: 'Lettre de résiliation pour assurance habitation',
    variables: ['clientName', 'clientAddress', 'policyNumber', 'insuranceCompany', 'terminationDate', 'reason'],
    content: `
Objet : Résiliation de contrat d'assurance habitation

Madame, Monsieur,

Je soussigné(e) {{clientName}}, vous notifie par la présente ma volonté de résilier mon contrat d'assurance habitation.

Références du contrat :
- Numéro de police : {{policyNumber}}
- Compagnie d'assurance : {{insuranceCompany}}
- Adresse assurée : {{clientAddress}}

Date de résiliation souhaitée : {{terminationDate}}
Motif : {{reason}}

Je vous demande de bien vouloir me confirmer la prise en compte de cette résiliation et de procéder au remboursement du trop-perçu le cas échéant.

Cordialement,

{{clientName}}
Date : {{currentDate}}
Signature : [SIGNATURE_PLACEHOLDER]
    `,
    isActive: true
  },
  {
    id: 'template_resiliation_sante',
    name: 'Résiliation Assurance Santé',
    category: 'resiliation',
    description: 'Lettre de résiliation pour assurance maladie/santé',
    variables: ['clientName', 'clientAddress', 'policyNumber', 'insuranceCompany', 'terminationDate', 'reason'],
    content: `
Objet : Résiliation de contrat d'assurance maladie complémentaire

Madame, Monsieur,

Par la présente lettre recommandée avec accusé de réception, je vous informe de ma décision de résilier mon contrat d'assurance maladie complémentaire.

Informations du contrat :
- Assuré : {{clientName}}
- Adresse : {{clientAddress}}
- Numéro d'adhérent : {{policyNumber}}
- Organisme : {{insuranceCompany}}

Date de résiliation : {{terminationDate}}
Motif de résiliation : {{reason}}

Conformément aux dispositions légales, je vous demande de me faire parvenir un accusé de réception de cette demande.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

{{clientName}}
Date : {{currentDate}}
Signature : [SIGNATURE_PLACEHOLDER]
    `,
    isActive: true
  },
  {
    id: 'template_avenant_modification',
    name: 'Avenant de Modification',
    category: 'avenant',
    description: 'Avenant pour modification de contrat',
    variables: ['clientName', 'clientAddress', 'policyNumber', 'insuranceCompany', 'modificationType', 'modificationDetails'],
    content: `
AVENANT N° {{avenantNumber}} AU CONTRAT D'ASSURANCE N° {{policyNumber}}

Entre :
{{insuranceCompany}}, ci-après dénommée "l'Assureur"

Et :
{{clientName}}
Domicilié(e) à : {{clientAddress}}
ci-après dénommé(e) "l'Assuré"

ARTICLE 1 - OBJET DE L'AVENANT
Le présent avenant a pour objet de modifier le contrat d'assurance susvisé comme suit :

Type de modification : {{modificationType}}
Détails : {{modificationDetails}}

ARTICLE 2 - PRISE D'EFFET
Les présentes modifications prennent effet le {{effectiveDate}}.

ARTICLE 3 - AUTRES DISPOSITIONS
Toutes les autres clauses du contrat initial demeurent inchangées.

Fait en double exemplaire,

L'Assuré                           L'Assureur
{{clientName}}                     {{insuranceCompany}}

Date : {{currentDate}}
Signature : [SIGNATURE_PLACEHOLDER]
    `,
    isActive: true
  },
  {
    id: 'template_declaration_sinistre',
    name: 'Déclaration de Sinistre',
    category: 'sinistre',
    description: 'Formulaire de déclaration de sinistre',
    variables: ['clientName', 'policyNumber', 'sinisterDate', 'sinisterTime', 'sinisterLocation', 'sinisterDescription', 'circumstances'],
    content: `
DÉCLARATION DE SINISTRE

INFORMATIONS DE L'ASSURÉ
Nom et prénom : {{clientName}}
Numéro de police : {{policyNumber}}

INFORMATIONS DU SINISTRE
Date du sinistre : {{sinisterDate}}
Heure approximative : {{sinisterTime}}
Lieu du sinistre : {{sinisterLocation}}

DESCRIPTION DU SINISTRE
{{sinisterDescription}}

CIRCONSTANCES
{{circumstances}}

TÉMOINS (si applicable)
Nom : ________________________
Téléphone : ___________________

Je certifie sur l'honneur l'exactitude des déclarations ci-dessus.

Fait le {{currentDate}}

Signature de l'assuré :
[SIGNATURE_PLACEHOLDER]
    `,
    isActive: true
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // resiliation, avenant, sinistre
    const active = searchParams.get('active') !== 'false';

    console.log('📋 Récupération templates:', { category, active });

    // Filtrer les templates selon les critères
    let templates = PREDEFINED_TEMPLATES;

    if (category) {
      templates = templates.filter(t => t.category === category);
    }

    if (active) {
      templates = templates.filter(t => t.isActive);
    }

    // Ajouter des métadonnées
    const templatesWithMeta = templates.map(template => ({
      ...template,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      usageCount: Math.floor(Math.random() * 100) + 1, // Simulé
      lastUsed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }));

    console.log(`✅ ${templatesWithMeta.length} templates récupérés`);

    return NextResponse.json({
      success: true,
      templates: templatesWithMeta,
      count: templatesWithMeta.length,
      categories: ['resiliation', 'avenant', 'sinistre']
    });

  } catch (error) {
    console.error('❌ Erreur API templates:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { templateIds, caseId, agentId, customVariables } = await request.json();

    console.log('📝 Génération documents:', { templateIds, caseId, agentId });

    if (!templateIds || !Array.isArray(templateIds) || templateIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'templateIds requis (array)'
      }, { status: 400 });
    }

    if (!caseId || !agentId) {
      return NextResponse.json({
        success: false,
        error: 'caseId et agentId requis'
      }, { status: 400 });
    }

    // Récupérer les données du dossier
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from('insurance_cases')
      .select(`
        id,
        case_number,
        insurance_company,
        insurance_type,
        policy_number,
        termination_date,
        reason_for_termination,
        clients!inner(
          users!inner(
            first_name,
            last_name,
            email,
            phone,
            address
          )
        )
      `)
      .eq('id', caseId)
      .single();

    if (caseError || !caseData) {
      console.error('❌ Dossier non trouvé:', caseError);
      return NextResponse.json({
        success: false,
        error: 'Dossier non trouvé'
      }, { status: 404 });
    }

    // Préparer les variables pour le remplissage
    const variables = {
      clientName: `${caseData.clients.users.first_name} ${caseData.clients.users.last_name}`,
      clientAddress: caseData.clients.users.address || 'Adresse non renseignée',
      clientEmail: caseData.clients.users.email,
      clientPhone: caseData.clients.users.phone || '',
      policyNumber: caseData.policy_number || 'N/A',
      insuranceCompany: caseData.insurance_company || 'N/A',
      insuranceType: caseData.insurance_type || 'N/A',
      terminationDate: caseData.termination_date || new Date().toISOString().split('T')[0],
      reason: caseData.reason_for_termination || 'Résiliation à l\'échéance',
      currentDate: new Date().toLocaleDateString('fr-CH'),
      caseNumber: caseData.case_number,
      avenantNumber: `AV-${Date.now()}`,
      effectiveDate: new Date().toISOString().split('T')[0],
      ...customVariables // Variables personnalisées de l'agent
    };

    // Générer les documents
    const generatedDocuments = [];

    for (const templateId of templateIds) {
      const template = PREDEFINED_TEMPLATES.find(t => t.id === templateId);
      
      if (!template) {
        console.warn(`⚠️ Template non trouvé: ${templateId}`);
        continue;
      }

      // Remplacer les variables dans le contenu
      let content = template.content;
      
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, String(value));
      }

      generatedDocuments.push({
        templateId: template.id,
        templateName: template.name,
        category: template.category,
        content: content,
        variables: variables,
        generatedAt: new Date().toISOString()
      });
    }

    // Sauvegarder dans la base (optionnel - pour l'historique)
    try {
      await supabaseAdmin
        .from('generated_documents')
        .insert(
          generatedDocuments.map(doc => ({
            case_id: caseId,
            template_id: doc.templateId,
            template_name: doc.templateName,
            content: doc.content,
            variables: doc.variables,
            generated_by: agentId,
            created_at: doc.generatedAt
          }))
        );
    } catch (saveError) {
      console.warn('⚠️ Erreur sauvegarde documents:', saveError);
      // Continue quand même
    }

    console.log(`✅ ${generatedDocuments.length} documents générés`);

    return NextResponse.json({
      success: true,
      documents: generatedDocuments,
      count: generatedDocuments.length,
      caseInfo: {
        caseNumber: caseData.case_number,
        clientName: variables.clientName,
        insuranceCompany: variables.insuranceCompany
      }
    });

  } catch (error) {
    console.error('❌ Erreur génération documents:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur lors de la génération'
    }, { status: 500 });
  }
}
