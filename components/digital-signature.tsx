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

    // Set drawing styles
    ctx.strokeStyle = "#1f2937"
    ctx.lineWidth = 2
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
      toast({
        title: "Signature requise",
        description: "Veuillez signer avant de confirmer.",
        variant: "destructive",
      })
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    // Convert canvas to data URL
    const signatureDataUrl = canvas.toDataURL("image/png")
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

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const touch = e.touches[0]
    const mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    })
    canvasRef.current?.dispatchEvent(mouseEvent)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const touch = e.touches[0]
    const mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    })
    canvasRef.current?.dispatchEvent(mouseEvent)
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const mouseEvent = new MouseEvent("mouseup", {})
    canvasRef.current?.dispatchEvent(mouseEvent)
  }

  return (
    <div className="space-y-6">
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Déclaration :</strong> En signant ci-dessous, je confirme que toutes les informations fournies sont
          exactes et que je souhaite procéder à la résiliation de mes contrats d'assurance selon les termes indiqués
          dans le document.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Signature de {clientName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className={`w-full h-48 border-2 rounded-lg cursor-crosshair ${
                isConfirmed ? "border-green-300 bg-green-50" : "border-gray-300 bg-white hover:border-gray-400"
              }`}
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
                <p className="text-gray-400 text-sm">Signez ici avec votre souris ou votre doigt</p>
              </div>
            )}
            {isConfirmed && (
              <div className="absolute top-2 right-2">
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Confirmée
                </div>
              </div>
            )}
          </div>

          {!isConfirmed && (
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={clearSignature}
                disabled={!hasSignature}
                className="flex items-center gap-2 bg-transparent"
              >
                <RotateCcw className="h-4 w-4" />
                Effacer
              </Button>

              <Button
                onClick={confirmSignature}
                disabled={!hasSignature}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Confirmer la Signature
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
