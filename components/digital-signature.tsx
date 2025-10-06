"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PenTool, RotateCcw, Check, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DigitalSignatureProps {
  clientName: string
  onSignatureComplete: (signatureData: { signature: string; timestamp: string }) => void
  signatureData?: { signature: string; timestamp: string }
}

export function DigitalSignature({ clientName, onSignatureComplete, signatureData }: DigitalSignatureProps) {
  const { toast } = useToast()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(!!signatureData)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Set drawing styles - adjust for mobile
    ctx.strokeStyle = "#1f2937"
    ctx.lineWidth = window.innerWidth < 768 ? 3 : 2 // Plus épais sur mobile
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // Load existing signature if available
    if (signatureData) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height)
        setHasSignature(true)
      }
      img.src = signatureData.signature
    }
  }, [signatureData])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isConfirmed) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isConfirmed) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSignature(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    if (isConfirmed) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const confirmSignature = () => {
    if (!hasSignature) {
      // Toast pour desktop
      toast({
        title: "❌ Signature requise",
        description: "Veuillez dessiner votre signature dans la zone prévue à cet effet.",
        variant: "destructive",
      })

      // Alert pour mobile (plus visible)
      if (window.innerWidth < 768) {
        alert("❌ SIGNATURE REQUISE\n\n📱 Veuillez dessiner votre signature avec votre doigt dans la zone prévue à cet effet avant de valider.");
      }
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    // Vérifier si le canvas contient réellement du contenu
    const signatureDataUrl = canvas.toDataURL("image/png")

    // Créer un canvas vide pour comparaison
    const emptyCanvas = document.createElement('canvas')
    emptyCanvas.width = canvas.width
    emptyCanvas.height = canvas.height
    const emptyDataUrl = emptyCanvas.toDataURL("image/png")

    if (signatureDataUrl.length < 100 || signatureDataUrl === emptyDataUrl) {
      // Toast pour desktop
      toast({
        title: "❌ Signature incomplète",
        description: "Votre signature semble incomplète. Veuillez dessiner une signature plus détaillée.",
        variant: "destructive",
      })

      // Alert pour mobile (plus visible)
      if (window.innerWidth < 768) {
        alert("❌ SIGNATURE INCOMPLÈTE\n\n📱 Votre signature semble trop simple ou incomplète.\n\nVeuillez dessiner une signature plus détaillée avec votre doigt.");
      }
      return
    }

    // Convert canvas to data URL
    const timestamp = new Date().toISOString()

    setIsConfirmed(true)
    onSignatureComplete({
      signature: signatureDataUrl,
      timestamp,
    })

    toast({
      title: "Signature confirmée",
      description: "Votre signature a été enregistrée avec succès.",
    })
  }

  // Touch events for mobile - Gestion directe pour meilleure compatibilité
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isConfirmed) return

    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    const touch = e.touches[0]
    const rect = canvas.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isConfirmed || !isDrawing) return

    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    const touch = e.touches[0]
    const rect = canvas.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSignature(true)
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isConfirmed) return

    e.preventDefault()
    setIsDrawing(false)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Alert responsive */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
        <AlertDescription className="text-blue-800 text-sm sm:text-base">
          <strong>Déclaration :</strong> En signant ci-dessous, je confirme que toutes les informations fournies sont
          exactes et que je souhaite procéder à la résiliation de mes contrats d'assurance selon les termes indiqués
          dans le document.
        </AlertDescription>
      </Alert>

      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <PenTool className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="truncate">Signature de {clientName}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Instructions mobile */}
          <div className="block sm:hidden bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              📱 <strong>Sur mobile :</strong> Utilisez votre doigt pour dessiner votre signature dans la zone ci-dessous
            </p>
          </div>

          <div className="relative">
            <canvas
              ref={canvasRef}
              className={`w-full border-2 rounded-lg touch-none ${
                isConfirmed ? "border-green-300 bg-green-50" : "border-gray-300 bg-white hover:border-gray-400"
              }`}
              style={{
                height: 'clamp(150px, 25vw, 200px)', // Hauteur responsive
                touchAction: 'none',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                cursor: isConfirmed ? 'default' : 'crosshair'
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
            {!hasSignature && !isConfirmed && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-gray-400 text-xs sm:text-sm text-center px-4">
                  <span className="hidden sm:inline">Signez ici avec votre souris ou votre doigt</span>
                  <span className="sm:hidden">Dessinez votre signature avec votre doigt</span>
                </p>
              </div>
            )}
            {isConfirmed && (
              <div className="absolute top-2 right-2">
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  <span className="hidden sm:inline">Confirmée</span>
                  <span className="sm:hidden">✓</span>
                </div>
              </div>
            )}
          </div>

          {!isConfirmed && (
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
              <Button
                variant="outline"
                onClick={clearSignature}
                disabled={!hasSignature}
                className="flex items-center justify-center gap-2 bg-transparent order-2 sm:order-1"
                size="sm"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Effacer</span>
                <span className="sm:hidden">Recommencer</span>
              </Button>

              <Button
                onClick={confirmSignature}
                disabled={!hasSignature}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 order-1 sm:order-2"
                size="sm"
              >
                <Check className="h-4 w-4" />
                <span className="hidden sm:inline">Confirmer la Signature</span>
                <span className="sm:hidden">Valider</span>
              </Button>
            </div>
          )}

          {isConfirmed && signatureData && (
            <Alert className="border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Signature confirmée</strong> le {new Date(signatureData.timestamp).toLocaleString("fr-CH")}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="text-xs text-gray-500 space-y-1">
        <p>
          <strong>Note légale :</strong> Cette signature électronique a la même valeur juridique qu'une signature
          manuscrite selon la loi suisse sur la signature électronique (SCSE).
        </p>
        <p>
          En signant, vous acceptez que cette demande soit transmise électroniquement à votre compagnie d'assurance.
        </p>
      </div>
    </div>
  )
}
