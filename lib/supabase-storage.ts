import { supabaseAdmin } from './supabase';

/**
 * Service pour gérer le stockage des fichiers dans Supabase Storage
 */

const BUCKET_NAME = 'client-documents';

/**
 * Initialiser le bucket s'il n'existe pas
 */
export async function initializeBucket() {
  try {
    // Vérifier si le bucket existe
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erreur liste buckets:', listError);
      return false;
    }

    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

    if (!bucketExists) {
      console.log('📦 Création du bucket:', BUCKET_NAME);
      const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'application/pdf',
          'image/heic',
          'image/heif'
        ]
      });

      if (createError) {
        console.error('❌ Erreur création bucket:', createError);
        return false;
      }

      console.log('✅ Bucket créé avec succès');
    } else {
      console.log('✅ Bucket existe déjà');
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur initialisation bucket:', error);
    return false;
  }
}

/**
 * Uploader un fichier vers Supabase Storage
 */
export async function uploadFileToStorage(
  file: File,
  clientId: string,
  documentType: string
): Promise<{ success: boolean; path?: string; url?: string; error?: string }> {
  try {
    // Initialiser le bucket
    await initializeBucket();

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 11);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${documentType}_${timestamp}_${randomId}.${fileExtension}`;
    const filePath = `${clientId}/${documentType}/${fileName}`;

    console.log('📤 Upload fichier vers Supabase Storage:', filePath);

    // Convertir le fichier en ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Uploader le fichier
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('❌ Erreur upload Supabase Storage:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Générer l'URL publique signée (valide 1 an)
    const { data: urlData } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 31536000); // 1 an en secondes

    console.log('✅ Fichier uploadé avec succès:', filePath);

    return {
      success: true,
      path: filePath,
      url: urlData?.signedUrl || ''
    };
  } catch (error) {
    console.error('❌ Erreur upload fichier:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * Uploader un buffer vers Supabase Storage
 */
export async function uploadBufferToStorage(
  buffer: Buffer,
  clientId: string,
  documentType: string,
  fileName: string,
  mimeType: string
): Promise<{ success: boolean; path?: string; url?: string; error?: string }> {
  try {
    // Initialiser le bucket
    await initializeBucket();

    const filePath = `${clientId}/${documentType}/${fileName}`;

    console.log('📤 Upload buffer vers Supabase Storage:', filePath);

    // Uploader le buffer
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: false
      });

    if (error) {
      console.error('❌ Erreur upload buffer:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Générer l'URL publique signée
    const { data: urlData } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 31536000);

    console.log('✅ Buffer uploadé avec succès:', filePath);

    return {
      success: true,
      path: filePath,
      url: urlData?.signedUrl || ''
    };
  } catch (error) {
    console.error('❌ Erreur upload buffer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * Télécharger un fichier depuis Supabase Storage
 */
export async function downloadFileFromStorage(
  filePath: string
): Promise<{ success: boolean; data?: Blob; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .download(filePath);

    if (error) {
      console.error('❌ Erreur téléchargement fichier:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('❌ Erreur téléchargement:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * Supprimer un fichier de Supabase Storage
 */
export async function deleteFileFromStorage(
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('❌ Erreur suppression fichier:', error);
      return {
        success: false,
        error: error.message
      };
    }

    console.log('✅ Fichier supprimé:', filePath);

    return {
      success: true
    };
  } catch (error) {
    console.error('❌ Erreur suppression:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * Obtenir l'URL signée d'un fichier
 */
export async function getSignedUrl(
  filePath: string,
  expiresIn: number = 3600 // 1 heure par défaut
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('❌ Erreur génération URL signée:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      url: data.signedUrl
    };
  } catch (error) {
    console.error('❌ Erreur URL signée:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * Lister tous les fichiers d'un client
 */
export async function listClientFiles(
  clientId: string
): Promise<{ success: boolean; files?: any[]; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .list(clientId, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('❌ Erreur liste fichiers:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      files: data
    };
  } catch (error) {
    console.error('❌ Erreur liste:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

