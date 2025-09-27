'use client';

import { useState, useCallback } from 'react';

interface DocumentData {
  id: string;
  documenttype: string;
  filename: string;
  status: string;
  uploaddate: string;
}

interface ClientPortalUploadProps {
  token: string;
  initialDocuments: DocumentData[];
}

const DOCUMENT_TYPES = [
  { type: 'identity_front', label: '🆔 CIN Recto', required: true },
  { type: 'identity_back', label: '🆔 CIN Verso', required: true },
  { type: 'insurance_contract', label: '📄 Contrat Assurance', required: true },
  { type: 'proof_address', label: '🏠 Justificatif Domicile', required: false },
  { type: 'bank_statement', label: '🏦 Relevé Bancaire', required: false },
  { type: 'additional', label: '📎 Documents Additionnels', required: false }
];

export default function ClientPortalUpload({ token, initialDocuments }: ClientPortalUploadProps) {
  const [documents, setDocuments] = useState<DocumentData[]>(initialDocuments);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [dragOver, setDragOver] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (files: FileList, documentType: string) => {
    if (!files.length) return;

    setUploading(prev => ({ ...prev, [documentType]: true }));
    setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));

    try {
      const formData = new FormData();
      
      // Ajouter tous les fichiers
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      
      formData.append('token', token);
      formData.append('clientId', token); // Utiliser le token comme clientId
      formData.append('documentType', documentType);

      // Simuler le progrès
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [documentType]: Math.min((prev[documentType] || 0) + 10, 90)
        }));
      }, 200);

      const response = await fetch('/api/client/upload-separated-documents', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [documentType]: 100 }));

      const result = await response.json();

      if (result.success) {
        // Recharger les documents
        const documentsResponse = await fetch(`/api/client/upload-separated-documents?clientId=${token}&token=${token}`);
        const documentsData = await documentsResponse.json();
        
        if (documentsData.success) {
          setDocuments(documentsData.documents);
        }

        // Notification de succès
        alert(`✅ ${result.message}`);
      } else {
        alert(`❌ Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('❌ Erreur lors de l\'upload');
    } finally {
      setUploading(prev => ({ ...prev, [documentType]: false }));
      setTimeout(() => {
        setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
      }, 2000);
    }
  }, [token]);

  const handleDrop = useCallback((e: React.DragEvent, documentType: string) => {
    e.preventDefault();
    setDragOver(null);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files, documentType);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent, documentType: string) => {
    e.preventDefault();
    setDragOver(documentType);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  }, []);

  const getDocumentsForType = (type: string) => {
    return documents.filter(doc => doc.documenttype === type);
  };

  const isDocumentTypeComplete = (type: string) => {
    return getDocumentsForType(type).length > 0;
  };

  const getRequiredDocumentsCount = () => {
    return DOCUMENT_TYPES.filter(dt => dt.required).length;
  };

  const getCompletedRequiredDocumentsCount = () => {
    return DOCUMENT_TYPES.filter(dt => dt.required && isDocumentTypeComplete(dt.type)).length;
  };

  const allRequiredDocumentsUploaded = () => {
    return getCompletedRequiredDocumentsCount() === getRequiredDocumentsCount();
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Barre de progression globale */}
      <div style={{ 
        marginBottom: '30px', 
        padding: '20px', 
        backgroundColor: '#f1f5f9', 
        borderRadius: '8px' 
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#334155' }}>
          📊 Progression des documents requis
        </h3>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '15px' 
        }}>
          <div style={{ 
            flex: 1, 
            height: '8px', 
            backgroundColor: '#e2e8f0', 
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              height: '100%', 
              backgroundColor: allRequiredDocumentsUploaded() ? '#10b981' : '#3b82f6',
              width: `${(getCompletedRequiredDocumentsCount() / getRequiredDocumentsCount()) * 100}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
          <span style={{ 
            fontWeight: 'bold', 
            color: allRequiredDocumentsUploaded() ? '#10b981' : '#3b82f6'
          }}>
            {getCompletedRequiredDocumentsCount()}/{getRequiredDocumentsCount()}
          </span>
        </div>
        {allRequiredDocumentsUploaded() && (
          <p style={{ 
            margin: '10px 0 0 0', 
            color: '#10b981', 
            fontWeight: 'bold' 
          }}>
            ✅ Tous les documents requis ont été uploadés !
          </p>
        )}
      </div>

      {/* Sections d'upload par type */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        {DOCUMENT_TYPES.map((docType) => {
          const typeDocuments = getDocumentsForType(docType.type);
          const isComplete = isDocumentTypeComplete(docType.type);
          const isUploading = uploading[docType.type];
          const progress = uploadProgress[docType.type] || 0;
          const isDraggedOver = dragOver === docType.type;

          return (
            <div key={docType.type} style={{ 
              border: `2px ${isDraggedOver ? 'solid' : 'dashed'} ${
                isComplete ? '#10b981' : 
                isDraggedOver ? '#3b82f6' : 
                docType.required ? '#f59e0b' : '#cbd5e1'
              }`, 
              borderRadius: '12px',
              padding: '20px',
              backgroundColor: isDraggedOver ? '#f0f9ff' : isComplete ? '#f0fdf4' : '#fefefe',
              transition: 'all 0.3s ease'
            }}>
              {/* En-tête */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '15px'
              }}>
                <h4 style={{ 
                  margin: '0', 
                  color: '#334155',
                  fontSize: '16px'
                }}>
                  {docType.label}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {docType.required && (
                    <span style={{ 
                      fontSize: '12px', 
                      padding: '2px 8px', 
                      backgroundColor: '#fef3c7', 
                      color: '#92400e',
                      borderRadius: '12px',
                      fontWeight: 'bold'
                    }}>
                      REQUIS
                    </span>
                  )}
                  {isComplete ? (
                    <span style={{ color: '#10b981', fontSize: '24px' }}>✅</span>
                  ) : docType.required ? (
                    <span style={{ color: '#dc2626', fontSize: '24px' }}>❌</span>
                  ) : (
                    <span style={{ color: '#6b7280', fontSize: '24px' }}>⭕</span>
                  )}
                </div>
              </div>

              {/* Zone de drop */}
              <div
                onDrop={(e) => handleDrop(e, docType.type)}
                onDragOver={(e) => handleDragOver(e, docType.type)}
                onDragLeave={handleDragLeave}
                style={{ 
                  border: '1px dashed #cbd5e1', 
                  borderRadius: '8px', 
                  padding: '20px', 
                  textAlign: 'center',
                  backgroundColor: isDraggedOver ? '#dbeafe' : '#f8fafc',
                  cursor: 'pointer',
                  marginBottom: '15px'
                }}
              >
                {isUploading ? (
                  <div>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
                    <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
                      Upload en cours... {progress}%
                    </p>
                    <div style={{ 
                      width: '100%', 
                      height: '6px', 
                      backgroundColor: '#e2e8f0', 
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        height: '100%', 
                        backgroundColor: '#3b82f6',
                        width: `${progress}%`,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>📄</div>
                    <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
                      Glissez vos fichiers ici
                    </p>
                    <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#6b7280' }}>
                      ou cliquez pour sélectionner
                    </p>
                    <input 
                      type="file" 
                      multiple 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFileUpload(e.target.files, docType.type);
                        }
                      }}
                      style={{ 
                        padding: '8px 16px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Documents uploadés */}
              {typeDocuments.length > 0 && (
                <div>
                  <h5 style={{ 
                    margin: '0 0 10px 0', 
                    fontSize: '14px', 
                    color: '#6b7280' 
                  }}>
                    📎 Fichiers uploadés ({typeDocuments.length})
                  </h5>
                  {typeDocuments.map((doc) => (
                    <div key={doc.id} style={{ 
                      padding: '8px 12px', 
                      backgroundColor: '#f1f5f9',
                      borderRadius: '6px',
                      marginBottom: '8px',
                      fontSize: '14px'
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {doc.filename}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '12px' }}>
                        Uploadé le {new Date(doc.uploaddate).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions finales */}
      {allRequiredDocumentsUploaded() && (
        <div style={{
          textAlign: 'center',
          padding: '30px',
          backgroundColor: '#f0fdf4',
          borderRadius: '12px',
          border: '2px solid #10b981'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎉</div>
          <h3 style={{ margin: '0 0 15px 0', color: '#166534' }}>
            Félicitations ! Tous les documents requis ont été uploadés.
          </h3>
          <p style={{ margin: '0 0 20px 0', color: '#166534' }}>
            Vous pouvez maintenant finaliser votre dossier et procéder à la signature.
          </p>
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/client/finalize-case', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    token: token,
                    clientId: token
                  }),
                });

                const result = await response.json();

                if (result.success) {
                  alert('✅ ' + result.message);
                  // Rediriger vers la page de signature
                  window.location.href = `/secure-signature/${token}`;
                } else {
                  alert('❌ Erreur: ' + result.error);
                }
              } catch (error) {
                console.error('Erreur finalisation:', error);
                alert('❌ Erreur lors de la finalisation');
              }
            }}
            style={{
              padding: '15px 30px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ✅ Finaliser le dossier et signer
          </button>
        </div>
      )}
    </div>
  );
}
