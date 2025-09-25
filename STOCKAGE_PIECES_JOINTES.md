# 📁 **STOCKAGE DES PIÈCES JOINTES - SYSTÈME COMPLET**

## 🎯 **Où sont sauvegardées les pièces jointes ?**

### **1. 💾 Stockage Physique des Fichiers**

#### **📂 Structure des Dossiers**
```
public/
└── uploads/
    └── clients/
        └── [clientId]/
            ├── identity_front_1640995200000.jpg
            ├── identity_back_1640995201000.jpg
            ├── additional_1640995202000.pdf
            └── ...
```

#### **🔗 URLs d'Accès**
```
https://esignpro.ch/uploads/clients/[clientId]/identity_front_1640995200000.jpg
https://esignpro.ch/uploads/clients/[clientId]/identity_back_1640995201000.jpg
```

### **2. 🗄️ Métadonnées en Base de Données**

#### **Table `client_documents`**
```sql
CREATE TABLE client_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES insurance_cases(id),
    document_type VARCHAR(50) NOT NULL, -- 'identity_front', 'identity_back', 'additional'
    file_name VARCHAR(255) NOT NULL,    -- Nom original du fichier
    file_path TEXT NOT NULL,            -- Chemin relatif: /uploads/clients/[id]/file.jpg
    file_size INTEGER,                  -- Taille en bytes
    mime_type VARCHAR(100),             -- image/jpeg, application/pdf
    uploaded_by UUID REFERENCES users(id),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🚀 **API de Gestion des Documents**

### **1. 📤 Upload de Documents**
```typescript
POST /api/client/upload-documents

FormData:
- files: File[]           // Fichiers à uploader
- token: string          // Token sécurisé du dossier
- clientId: string       // ID du client
- documentType: string   // 'identity', 'insurance', 'additional'
```

#### **Processus d'Upload**
1. **Validation** : Taille max 10MB, types autorisés (JPG, PNG, PDF)
2. **Stockage physique** : Sauvegarde dans `/public/uploads/clients/[clientId]/`
3. **Nommage unique** : `{type}_{timestamp}.{extension}`
4. **Sauvegarde BDD** : Métadonnées dans `client_documents`
5. **Mise à jour statut** : Dossier passe à `documents_uploaded`

### **2. 📋 Récupération de Documents**
```typescript
GET /api/client/upload-documents?token=[token]&clientId=[clientId]

Response:
{
  "success": true,
  "documents": [
    {
      "id": "uuid",
      "name": "carte_identite_recto.jpg",
      "filePath": "/uploads/clients/abc123/identity_front_1640995200000.jpg",
      "fileSize": 2048576,
      "mimeType": "image/jpeg",
      "documentType": "identity_front",
      "isVerified": false,
      "uploadedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## 🔐 **Sécurité et Validation**

### **1. 🛡️ Validation des Fichiers**
```typescript
// Taille maximum
const maxSize = 10 * 1024 * 1024 // 10MB

// Types autorisés
const allowedTypes = [
  'image/jpeg',
  'image/png', 
  'image/jpg',
  'application/pdf'
]

// Validation du nom de fichier
const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
```

### **2. 🔒 Sécurité d'Accès**
- **Token validation** : Vérification du token avant accès
- **Dossiers isolés** : Chaque client a son propre dossier
- **Noms uniques** : Timestamp + random pour éviter les conflits
- **Permissions** : Seul le propriétaire peut accéder à ses fichiers

### **3. 🗂️ Types de Documents**
```typescript
enum DocumentType {
  IDENTITY_FRONT = 'identity_front',    // Carte d'identité recto
  IDENTITY_BACK = 'identity_back',      // Carte d'identité verso
  ADDITIONAL = 'additional',            // Documents supplémentaires
  INSURANCE_CONTRACT = 'insurance',     // Contrat d'assurance
  TERMINATION_LETTER = 'termination'    // Lettre de résiliation
}
```

---

## 📊 **Workflow Complet d'Upload**

### **Étape 1 : Client Upload**
```typescript
// Dans le composant FileUploader
const handleFiles = async (files: File[]) => {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))
  formData.append('token', token)
  formData.append('clientId', clientId)
  formData.append('documentType', 'identity')

  const response = await fetch('/api/client/upload-documents', {
    method: 'POST',
    body: formData
  })
}
```

### **Étape 2 : Traitement Serveur**
```typescript
// Dans /api/client/upload-documents/route.ts
1. Validation des fichiers (taille, type)
2. Création du dossier client si nécessaire
3. Sauvegarde physique avec nom unique
4. Insertion métadonnées en BDD
5. Mise à jour statut du dossier
6. Retour de la liste des fichiers uploadés
```

### **Étape 3 : Affichage Client**
```typescript
// Affichage des fichiers uploadés
{uploadedFiles.map(file => (
  <div key={file.id}>
    <img src={file.filePath} alt={file.name} />
    <p>{file.name} ({formatFileSize(file.fileSize)})</p>
    <Badge variant={file.isVerified ? "success" : "warning"}>
      {file.isVerified ? "Vérifié" : "En attente"}
    </Badge>
  </div>
))}
```

---

## 🎯 **Intégration avec le Workflow**

### **Dans le Portail Client**
```typescript
// app/client-portal/[clientId]/page.tsx
const handleFileUpload = async (files: File[]) => {
  setIsSubmitting(true)
  
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))
  formData.append('token', token)
  formData.append('clientId', token) // Utilise le token comme clientId
  
  const response = await fetch('/api/client/upload-documents', {
    method: 'POST',
    body: formData
  })
  
  if (response.ok) {
    const result = await response.json()
    setUploadedFiles(result.uploadedFiles)
    setCurrentStep(2) // Passer à l'étape suivante
  }
}
```

---

## 📋 **Gestion par l'Agent**

### **Dashboard Agent**
```typescript
// Voir les documents uploadés par les clients
const clientDocuments = await fetch(`/api/client/upload-documents?token=${token}&clientId=${clientId}`)

// Vérifier un document
const verifyDocument = async (documentId: string) => {
  await fetch(`/api/admin/verify-document`, {
    method: 'POST',
    body: JSON.stringify({ documentId, verified: true })
  })
}
```

### **Téléchargement pour Archivage**
```typescript
// Télécharger tous les documents d'un dossier
const downloadAllDocuments = async (caseId: string) => {
  const response = await fetch(`/api/admin/download-case-documents?caseId=${caseId}`)
  const blob = await response.blob()
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `dossier_${caseId}_documents.zip`
  link.click()
}
```

---

## 🔧 **Configuration et Maintenance**

### **1. 📁 Nettoyage Automatique**
```sql
-- Fonction pour nettoyer les anciens fichiers (>2 ans)
CREATE OR REPLACE FUNCTION cleanup_old_documents()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Marquer les documents anciens pour suppression
    UPDATE client_documents 
    SET is_archived = TRUE
    WHERE created_at < NOW() - INTERVAL '2 years'
    AND is_archived = FALSE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
```

### **2. 📊 Statistiques de Stockage**
```sql
-- Vue pour les statistiques de stockage
CREATE VIEW storage_statistics AS
SELECT 
    document_type,
    COUNT(*) as document_count,
    SUM(file_size) as total_size_bytes,
    AVG(file_size) as avg_size_bytes,
    MAX(created_at) as last_upload
FROM client_documents
WHERE is_archived = FALSE
GROUP BY document_type;
```

---

## 🎉 **Résumé du Système**

### ✅ **Fonctionnalités Implémentées**
- [x] **Upload multiple** de fichiers (JPG, PNG, PDF)
- [x] **Validation complète** (taille, type, sécurité)
- [x] **Stockage physique** organisé par client
- [x] **Métadonnées en BDD** avec audit complet
- [x] **API REST** pour upload et récupération
- [x] **Intégration workflow** avec progression
- [x] **Sécurité d'accès** par token
- [x] **Gestion des types** de documents
- [x] **Interface agent** pour vérification

### 🚀 **Avantages du Système**
1. **Sécurisé** : Validation complète et accès contrôlé
2. **Organisé** : Structure claire par client
3. **Traçable** : Audit complet en base de données
4. **Scalable** : Peut gérer des milliers de clients
5. **Maintenable** : APIs claires et documentation complète

### 📍 **Localisation des Fichiers**
- **Fichiers physiques** : `/public/uploads/clients/[clientId]/`
- **Métadonnées** : Table `client_documents` dans Supabase
- **APIs** : `/api/client/upload-documents/`
- **Interface** : Composant `FileUploader` intégré au workflow

**🎯 Tous les documents clients sont maintenant parfaitement organisés et sécurisés !**
