'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';

interface CaseData {
  id: string;
  case_number: string;
  secure_token: string;
  status: string;
  insurance_company: string;
  policy_number: string;
  client_name: string;
  client_email: string;
}

export default function SignaturePage() {
  const params = useParams();
  const token = params.token as string;
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [signature, setSignature] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function loadCaseData() {
      try {
        const response = await fetch(`/api/client/finalize-case?token=${token}`);
        const data = await response.json();
        
        if (data.success) {
          setCaseData(data.case);
          setCurrentStep(data.case.status === 'signed' ? 3 : 2);
        }
      } catch (error) {
        console.error('Erreur chargement dossier:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCaseData();
  }, [token]);

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

  const handleSignDocument = async () => {
    if (!signature || !caseData) {
      alert('Veuillez signer le document avant de continuer');
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
          caseId: caseData.id
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setCurrentStep(3);
        alert('✅ Document signé avec succès !');
      } else {
        alert('❌ Erreur lors de la signature: ' + result.error);
      }
    } catch (error) {
      console.error('Erreur signature:', error);
      alert('❌ Erreur lors de la signature');
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            🔒 Chargement de votre session sécurisée...
          </p>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '20px'
      }}>
        <div style={{ 
          maxWidth: '400px', 
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <h2 style={{ margin: '0 0 15px 0', fontSize: '24px', color: '#dc2626' }}>
            Session Invalide
          </h2>
          <p style={{ margin: '0 0 20px 0', color: '#6b7280' }}>
            Le lien de signature que vous avez utilisé n'est pas valide ou a expiré.
          </p>
          <p style={{ margin: '0', fontSize: '14px', color: '#9ca3af' }}>
            Veuillez contacter votre conseiller pour obtenir un nouveau lien.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header sécurisé */}
      <div style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e2e8f0',
        padding: '20px 0'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#3b82f6' 
            }}>
              🔒 eSignPro
            </div>
            <div style={{ 
              padding: '4px 12px', 
              backgroundColor: '#dcfce7', 
              color: '#166534',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              ✅ SESSION SÉCURISÉE
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold', color: '#1f2937' }}>
              {caseData.client_name}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Dossier: {caseData.case_number}
            </div>
          </div>
        </div>
      </div>

      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '40px 20px'
      }}>
        {currentStep === 2 && (
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ 
              margin: '0 0 20px 0', 
              fontSize: '24px', 
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              ✍️ Signature Électronique
            </h2>

            <p style={{ 
              margin: '0 0 20px 0', 
              color: '#6b7280' 
            }}>
              Veuillez signer dans la zone ci-dessous avec votre souris ou votre doigt sur mobile.
            </p>

            <div style={{ 
              border: '2px dashed #cbd5e1',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{ 
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  cursor: 'crosshair',
                  maxWidth: '100%',
                  backgroundColor: 'white'
                }}
              />
              <p style={{ 
                margin: '10px 0 0 0', 
                fontSize: '14px', 
                color: '#6b7280' 
              }}>
                Signez ici
              </p>
            </div>

            <div style={{ 
              display: 'flex', 
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
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                🗑️ Effacer
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
                  fontSize: '14px',
                  cursor: signature ? 'pointer' : 'not-allowed'
                }}
              >
                ✅ Valider la signature
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
            <h2 style={{ 
              margin: '0 0 15px 0', 
              fontSize: '28px', 
              color: '#10b981' 
            }}>
              Signature Terminée !
            </h2>
            <p style={{ 
              margin: '0 0 30px 0', 
              color: '#6b7280',
              fontSize: '16px'
            }}>
              Votre document a été signé avec succès.
            </p>
            
            <div style={{ 
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '30px'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '10px',
                marginBottom: '10px'
              }}>
                <span style={{ fontSize: '20px' }}>✅</span>
                <strong style={{ color: '#166534' }}>
                  Dossier finalisé
                </strong>
              </div>
              <p style={{ margin: '0', color: '#166534' }}>
                Votre dossier sera automatiquement transmis à votre assureur dans les prochaines heures.
              </p>
            </div>

            <p style={{ 
              margin: '0', 
              fontSize: '14px', 
              color: '#9ca3af' 
            }}>
              Vous recevrez une confirmation par email une fois le traitement terminé.
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
