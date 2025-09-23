"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileUploader } from "./file-uploader"
import { Upload, CheckCircle, AlertCircle, CreditCard } from "lucide-react"

interface IdentityUploaderProps {
  onFilesUploaded: (files: { front: string[], back: string[] }) => void
  uploadedFiles?: { front: string[], back: string[] }
}

export function IdentityUploader({ onFilesUploaded, uploadedFiles = { front: [], back: [] } }: IdentityUploaderProps) {
  const [frontFiles, setFrontFiles] = useState<string[]>(uploadedFiles.front)
  const [backFiles, setBackFiles] = useState<string[]>(uploadedFiles.back)

  const handleFrontUpload = (files: { id: string; name: string; type: string; url: string }[]) => {
    const fileUrls = files.map(f => f.url)
    setFrontFiles(fileUrls)
    onFilesUploaded({ front: fileUrls, back: backFiles })
  }

  const handleBackUpload = (files: { id: string; name: string; type: string; url: string }[]) => {
    const fileUrls = files.map(f => f.url)
    setBackFiles(fileUrls)
    onFilesUploaded({ front: frontFiles, back: fileUrls })
  }

  const isComplete = frontFiles.length > 0 && backFiles.length > 0

  return (
    <div className="space-y-6">
      {/* Instructions générales */}
      <Alert className="border-blue-200 bg-blue-50">
        <CreditCard className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Pièce d'identité requise :</strong> Veuillez télécharger une photo claire du RECTO et du VERSO de votre pièce d'identité 
          (carte d'identité, passeport ou permis de conduire). Les deux faces sont obligatoires.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload RECTO */}
        <Card className={`transition-all duration-200 ${frontFiles.length > 0 ? 'border-green-200 bg-green-50' : 'border-orange-200'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                frontFiles.length > 0 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
              }`}>
                {frontFiles.length > 0 ? <CheckCircle className="h-4 w-4" /> : '1'}
              </div>
              <Upload className={`h-5 w-5 ${frontFiles.length > 0 ? 'text-green-600' : 'text-orange-600'}`} />
              RECTO de la pièce d'identité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUploader
              type="identity_front"
              onFilesUploaded={handleFrontUpload}
              uploadedFiles={frontFiles}
              acceptedTypes={[".jpg", ".jpeg", ".png", ".pdf"]}
              maxFiles={1}
              description="Face avant de votre pièce d'identité"
              specificLabel="RECTO"
            />
          </CardContent>
        </Card>

        {/* Upload VERSO */}
        <Card className={`transition-all duration-200 ${backFiles.length > 0 ? 'border-green-200 bg-green-50' : 'border-purple-200'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                backFiles.length > 0 ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
              }`}>
                {backFiles.length > 0 ? <CheckCircle className="h-4 w-4" /> : '2'}
              </div>
              <Upload className={`h-5 w-5 ${backFiles.length > 0 ? 'text-green-600' : 'text-purple-600'}`} />
              VERSO de la pièce d'identité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUploader
              type="identity_back"
              onFilesUploaded={handleBackUpload}
              uploadedFiles={backFiles}
              acceptedTypes={[".jpg", ".jpeg", ".png", ".pdf"]}
              maxFiles={1}
              description="Face arrière de votre pièce d'identité"
              specificLabel="VERSO"
            />
          </CardContent>
        </Card>
      </div>

      {/* Status global */}
      {isComplete ? (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Pièce d'identité complète !</strong> Vous avez téléchargé le recto et le verso de votre pièce d'identité.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Upload incomplet :</strong> Veuillez télécharger les deux faces de votre pièce d'identité pour continuer.
            {frontFiles.length === 0 && backFiles.length === 0 && " (Recto et Verso manquants)"}
            {frontFiles.length === 0 && backFiles.length > 0 && " (Recto manquant)"}
            {frontFiles.length > 0 && backFiles.length === 0 && " (Verso manquant)"}
          </AlertDescription>
        </Alert>
      )}

      {/* Conseils pour une bonne photo */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-gray-800 mb-2">💡 Conseils pour une photo de qualité :</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Assurez-vous que le document est bien éclairé</li>
            <li>• Évitez les reflets et les ombres</li>
            <li>• Le texte doit être lisible et net</li>
            <li>• Cadrez bien le document (pas de parties coupées)</li>
            <li>• Formats acceptés : JPG, PNG, PDF (max 10MB par fichier)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
