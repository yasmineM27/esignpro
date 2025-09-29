'use client'

import { useState, useEffect } from 'react'

interface SimpleClientPortalProps {
  token: string
}

interface ClientData {
  firstName: string
  lastName: string
  email: string
  caseNumber: string
}

export function SimpleClientPortal({ token }: SimpleClientPortalProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [documentsByType, setDocumentsByType] = useState<{[key: string]: any[]}>({
    identity_front: [],
    identity_back: [],
    insurance_contract: [],
    proof_address: [],
    bank_statement: [],
    additional: []
  })

  useEffect(() => {
    loadClientData()
  }, [token])

  const loadClientData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/client/get-case-data?token=${token}`)
      const data = await response.json()

      if (data.success) {
        setClientData({
          firstName: data.client.firstName,
          lastName: data.client.lastName,
          email: data.client.email,
          caseNumber: data.caseNumber
        })
      } else {
        setError(data.error || 'Erreur lors du chargement des données')
      }
    } catch (err) {
      console.error('Erreur chargement données:', err)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentUploaded = (documentType: string, files: any[]) => {
    setDocumentsByType(prev => ({
      ...prev,
      [documentType]: [...(prev[documentType] || []), ...files]
    }))
    console.log(`✅ Document ${documentType} uploadé:`, files)
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Chargement de votre espace client...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #fef2f2 0%, #fce7e7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          width: '100%',
          margin: '0 16px'
        }}>
          <div style={{ color: '#dc2626', textAlign: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Erreur</h2>
            <p style={{ marginBottom: '16px' }}>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                background: '#dc2626',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        {/* En-tête */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>
                Portail Client - Upload Documents
              </h1>
              <p style={{ color: '#6b7280', margin: 0 }}>
                {clientData ? `Bonjour ${clientData.firstName} ${clientData.lastName}` : 'Veuillez uploader vos documents séparément par type'}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', color: '#9ca3af' }}>Dossier:</div>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                background: '#f3f4f6',
                padding: '4px 8px',
                borderRadius: '4px'
              }}>
                {clientData?.caseNumber || token.substring(0, 12) + '...'}
              </div>
            </div>
          </div>
        </div>

        {/* Indicateur de progression */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Étape 2/5 - Upload Documents</h2>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              {Object.values(documentsByType).flat().length} documents uploadés
            </div>
          </div>
          <div style={{
            width: '100%',
            background: '#e5e7eb',
            borderRadius: '9999px',
            height: '8px'
          }}>
            <div style={{
              background: '#3b82f6',
              height: '8px',
              borderRadius: '9999px',
              width: '40%'
            }}></div>
          </div>
        </div>

        {/* Section Upload Documents */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#1f2937' }}>
            📁 Upload de Documents Séparés
          </h2>
          
          <div style={{ display: 'grid', gap: '24px' }}>
            {/* Documents Obligatoires */}
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#dc2626',
                borderBottom: '2px solid #fecaca',
                paddingBottom: '8px',
                marginBottom: '16px'
              }}>
                📋 Documents Obligatoires
              </h3>
              
              <div style={{ display: 'grid', gap: '16px' }}>
                <DocumentUploadSection
                  title="🆔 Carte d'Identité - RECTO"
                  description="Uploadez la face avant de votre carte d'identité"
                  documentType="identity_front"
                  required={true}
                  token={token}
                  onUploadComplete={(files) => handleDocumentUploaded('identity_front', files)}
                  existingFiles={documentsByType.identity_front || []}
                />

                <DocumentUploadSection
                  title="🆔 Carte d'Identité - VERSO"
                  description="Uploadez la face arrière de votre carte d'identité"
                  documentType="identity_back"
                  required={true}
                  token={token}
                  onUploadComplete={(files) => handleDocumentUploaded('identity_back', files)}
                  existingFiles={documentsByType.identity_back || []}
                />

                <DocumentUploadSection
                  title="📄 Contrat d'Assurance"
                  description="Uploadez votre contrat d'assurance (PDF ou images) - Optionnel"
                  documentType="insurance_contract"
                  required={false}
                  token={token}
                  onUploadComplete={(files) => handleDocumentUploaded('insurance_contract', files)}
                  existingFiles={documentsByType.insurance_contract || []}
                />
              </div>
            </div>

            {/* Documents Optionnels */}
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#2563eb',
                borderBottom: '2px solid #bfdbfe',
                paddingBottom: '8px',
                marginBottom: '16px'
              }}>
                📎 Documents Optionnels
              </h3>
              
              <div style={{ display: 'grid', gap: '16px' }}>
                <DocumentUploadSection
                  title="🏠 Justificatif de Domicile"
                  description="Facture, quittance de loyer, etc. (optionnel)"
                  documentType="proof_address"
                  required={false}
                  token={token}
                  onUploadComplete={(files) => handleDocumentUploaded('proof_address', files)}
                  existingFiles={documentsByType.proof_address || []}
                />

                <DocumentUploadSection
                  title="🏦 Relevé Bancaire"
                  description="Relevé de compte récent (optionnel)"
                  documentType="bank_statement"
                  required={false}
                  token={token}
                  onUploadComplete={(files) => handleDocumentUploaded('bank_statement', files)}
                  existingFiles={documentsByType.bank_statement || []}
                />
              </div>
            </div>
          </div>

          {/* Résumé */}
          <div style={{
            marginTop: '32px',
            padding: '16px',
            background: '#f9fafb',
            borderRadius: '8px'
          }}>
            <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>📊 Résumé des Documents</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '14px' }}>
              {Object.entries(documentsByType).map(([type, files]) => (
                <div key={type} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ textTransform: 'capitalize' }}>{type.replace('_', ' ')}:</span>
                  <span style={{ 
                    color: files.length > 0 ? '#059669' : '#9ca3af',
                    fontWeight: files.length > 0 ? '600' : 'normal'
                  }}>
                    {files.length} fichier{files.length !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
            <button style={{
              padding: '8px 24px',
              background: '#6b7280',
              color: 'white',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer'
            }}>
              ← Étape Précédente
            </button>
            <button 
              style={{
                padding: '8px 24px',
                background: (!documentsByType.identity_front?.length || !documentsByType.identity_back?.length || !documentsByType.insurance_contract?.length) ? '#d1d5db' : '#3b82f6',
                color: 'white',
                borderRadius: '4px',
                border: 'none',
                cursor: (!documentsByType.identity_front?.length || !documentsByType.identity_back?.length || !documentsByType.insurance_contract?.length) ? 'not-allowed' : 'pointer'
              }}
              disabled={!documentsByType.identity_front?.length || !documentsByType.identity_back?.length}
            >
              Étape Suivante →
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// Composant simple pour l'upload de documents
function DocumentUploadSection({ 
  title, 
  description, 
  documentType, 
  required, 
  token, 
  onUploadComplete, 
  existingFiles 
}: {
  title: string
  description: string
  documentType: string
  required: boolean
  token: string
  onUploadComplete: (files: any[]) => void
  existingFiles: any[]
}) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return

    setUploading(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('files', file)
      })
      formData.append('token', token)
      formData.append('clientId', token)
      formData.append('documentType', documentType)

      const response = await fetch('/api/client/upload-separated-documents', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        onUploadComplete(result.uploadedFiles || [])
        console.log(`✅ Upload réussi pour ${documentType}`)
      } else {
        console.error(`❌ Erreur upload ${documentType}:`, result.error)
      }
    } catch (error) {
      console.error(`❌ Erreur réseau ${documentType}:`, error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{
      border: `2px dashed ${dragOver ? '#3b82f6' : '#d1d5db'}`,
      borderRadius: '8px',
      padding: '24px',
      textAlign: 'center',
      background: dragOver ? '#f0f9ff' : '#fafafa',
      transition: 'all 0.2s'
    }}
    onDragOver={(e) => {
      e.preventDefault()
      setDragOver(true)
    }}
    onDragLeave={() => setDragOver(false)}
    onDrop={(e) => {
      e.preventDefault()
      setDragOver(false)
      handleFileUpload(e.dataTransfer.files)
    }}
    >
      <h4 style={{ margin: '0 0 8px 0', color: required ? '#dc2626' : '#2563eb' }}>{title}</h4>
      <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '14px' }}>{description}</p>
      
      <input
        type="file"
        accept="image/jpeg,image/png,image/jpg,application/pdf"
        multiple={documentType === 'insurance_contract'}
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        style={{ marginBottom: '16px' }}
        disabled={uploading}
      />
      
      {uploading && (
        <div style={{ color: '#3b82f6', fontSize: '14px' }}>
          📤 Upload en cours...
        </div>
      )}
      
      {existingFiles.length > 0 && (
        <div style={{ marginTop: '16px', fontSize: '14px', color: '#059669' }}>
          ✅ {existingFiles.length} fichier{existingFiles.length !== 1 ? 's' : ''} uploadé{existingFiles.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
