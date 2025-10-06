'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

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
  { type: 'insurance_contract', label: '📄 Contrat Assurance', required: false }, // ✅ NON REQUIS
  { type: 'proof_address', label: '🏠 Justificatif Domicile', required: false },
  { type: 'bank_statement', label: '🏦 Relevé Bancaire', required: false },
  { type: 'additional', label: '📎 Documents Additionnels', required: false }
];

export default function ClientPortalUpload({ token, initialDocuments }: ClientPortalUploadProps) {
  const [documents, setDocuments] = useState<DocumentData[]>(initialDocuments);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [signature, setSignature] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fonctions de signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignature(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature('');
  };

  // Gestionnaires tactiles pour mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    ctx.stroke();

    // Capturer la signature
    const dataURL = canvas.toDataURL();
    setSignature(dataURL);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(false);
  };

  // Initialisation du canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajuster la taille du canvas
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    // Configuration du style de dessin
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = window.innerWidth < 768 ? 3 : 2; // Plus épais sur mobile
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const handleSignDocument = async () => {
    // Vérification plus robuste de la signature
    if (!signature || signature.trim() === '' || signature === 'data:image/png;base64,') {
      alert('❌ Signature requise\n\nVeuillez dessiner votre signature dans la zone prévue à cet effet avant de valider.');
      return;
    }

    // Vérifier si la signature contient réellement du contenu (pas juste un canvas vide)
    if (signature.length < 100) { // Une signature valide devrait avoir plus de 100 caractères en base64
      alert('❌ Signature incomplète\n\nVotre signature semble incomplète. Veuillez dessiner une signature plus détaillée.');
      return;
    }

    try {
      const response = await fetch('/api/client/save-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          signature: signature,
          caseId: token // Utiliser le token comme ID temporaire
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Document signé avec succès ! Votre dossier est maintenant complet.');
        setShowSignature(false);
      } else {
        alert('❌ Erreur lors de la signature: ' + result.error);
      }
    } catch (error) {
      console.error('Erreur signature:', error);
      alert('❌ Erreur lors de la signature');
    }
  };

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
                  // Afficher la section signature
                  setShowSignature(true);
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

      {/* Section de signature */}
      {showSignature && (
        <div style={{
          marginTop: '30px',
          padding: window.innerWidth < 768 ? '20px' : '30px',
          backgroundColor: '#f0fdf4',
          borderRadius: '12px',
          border: '2px solid #10b981'
        }}>
          <h3 style={{
            margin: '0 0 20px 0',
            color: '#166534',
            fontSize: window.innerWidth < 768 ? '20px' : '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textAlign: window.innerWidth < 768 ? 'center' : 'left'
          }}>
            ✍️ Signature Électronique
          </h3>

          <p style={{
            margin: '0 0 20px 0',
            color: '#166534',
            fontSize: window.innerWidth < 768 ? '16px' : '14px',
            textAlign: window.innerWidth < 768 ? 'center' : 'left'
          }}>
            {window.innerWidth < 768
              ? 'Dessinez votre signature pour finaliser votre dossier'
              : 'Veuillez signer dans la zone ci-dessous pour finaliser votre dossier.'
            }
          </p>

          <div style={{
            border: '2px dashed #10b981',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            marginBottom: '20px',
            backgroundColor: 'white'
          }}>
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                border: '1px solid #10b981',
                borderRadius: '4px',
                cursor: 'crosshair',
                width: '100%',
                height: 'clamp(150px, 25vw, 200px)',
                backgroundColor: 'white',
                touchAction: 'none',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none'
              }}
            />
            <p style={{
              margin: '10px 0 0 0',
              fontSize: window.innerWidth < 768 ? '16px' : '14px',
              color: '#166534',
              fontWeight: window.innerWidth < 768 ? 'bold' : 'normal'
            }}>
              {window.innerWidth < 768
                ? '📱 Dessinez votre signature avec votre doigt'
                : 'Signez ici avec votre souris ou votre doigt'
              }
            </p>

            {/* Instructions supplémentaires pour mobile */}
            {window.innerWidth < 768 && (
              <div style={{
                margin: '15px 0',
                padding: '10px',
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#92400e'
              }}>
                💡 <strong>Conseil :</strong> Tenez votre téléphone horizontalement pour plus de confort
              </div>
            )}
          </div>

          <div style={{
            display: 'flex',
            flexDirection: window.innerWidth < 768 ? 'column' : 'row',
            gap: '15px',
            justifyContent: 'center'
          }}>
            <button
              onClick={clearSignature}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: window.innerWidth < 768 ? '16px' : '14px',
                cursor: 'pointer',
                minHeight: '48px' // Meilleur pour mobile
              }}
            >
              🗑️ {window.innerWidth < 768 ? 'Recommencer' : 'Effacer'}
            </button>
            <button
              onClick={() => setShowSignature(false)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: window.innerWidth < 768 ? '16px' : '14px',
                cursor: 'pointer',
                minHeight: '48px'
              }}
            >
              ❌ Annuler
            </button>
            <button
              onClick={handleSignDocument}
              disabled={!signature}
              style={{
                padding: '12px 24px',
                backgroundColor: signature ? '#10b981' : '#d1d5db',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: window.innerWidth < 768 ? '16px' : '14px',
                cursor: signature ? 'pointer' : 'not-allowed',
                minHeight: '48px',
                fontWeight: 'bold'
              }}
            >
              ✅ {window.innerWidth < 768 ? 'Valider' : 'Valider la signature'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
