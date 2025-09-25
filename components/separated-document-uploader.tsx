"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react"

// Configuration des types de documents
const DOCUMENT_CONFIGS = {
  identity_front: {
    title: "Carte d'Identité - RECTO",
    description: "Face avant de votre carte d'identité",
    instructions: "Assurez-vous que tous les détails sont lisibles",
    maxFiles: 1,
    acceptedTypes: ["image/jpeg", "image/png", "image/jpg"],
    icon: "🆔",
    required: true,
    color: "blue"
  },
  identity_back: {
    title: "Carte d'Identité - VERSO", 
    description: "Face arrière de votre carte d'identité",
    instructions: "Vérifiez que l'adresse est visible",
    maxFiles: 1,
    acceptedTypes: ["image/jpeg", "image/png", "image/jpg"],
    icon: "🆔",
    required: true,
    color: "blue"
  },
  insurance_contract: {
    title: "Contrat d'Assurance",
    description: "Votre contrat d'assurance actuel",
    instructions: "Document PDF ou photo claire du contrat",
    maxFiles: 3,
    acceptedTypes: ["application/pdf", "image/jpeg", "image/png"],
    icon: "📄",
    required: true,
    color: "green"
  },
  proof_address: {
    title: "Justificatif de Domicile",
    description: "Facture récente (électricité, gaz, téléphone)",
    instructions: "Document de moins de 3 mois",
    maxFiles: 1,
    acceptedTypes: ["application/pdf", "image/jpeg", "image/png"],
    icon: "🏠",
    required: false,
    color: "orange"
  },
  bank_statement: {
    title: "Relevé Bancaire",
    description: "Relevé de compte pour remboursement",
    instructions: "Masquez les détails sensibles si nécessaire",
    maxFiles: 1,
    acceptedTypes: ["application/pdf", "image/jpeg", "image/png"],
    icon: "🏦",
    required: false,
    color: "purple"
  },
  additional: {
    title: "Documents Supplémentaires",
    description: "Autres documents utiles au dossier",
    instructions: "Tout document complémentaire",
    maxFiles: 5,
    acceptedTypes: ["application/pdf", "image/jpeg", "image/png"],
    icon: "📎",
    required: false,
    color: "gray"
  }
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  status: "uploading" | "completed" | "error"
  progress: number
  documentType: string
}

interface SeparatedDocumentUploaderProps {
  type: keyof typeof DOCUMENT_CONFIGS
  onFilesUploaded: (files: UploadedFile[]) => void
  uploadedFiles?: UploadedFile[]
}

export function SeparatedDocumentUploader({
  type,
  onFilesUploaded,
  uploadedFiles = []
}: SeparatedDocumentUploaderProps) {
  const { toast } = useToast()
  const [files, setFiles] = useState<UploadedFile[]>(uploadedFiles)
  const [isDragOver, setIsDragOver] = useState(false)

  const config = DOCUMENT_CONFIGS[type]
  const completedFiles = files.filter((f) => f.status === "completed")
  const canUploadMore = completedFiles.length < config.maxFiles

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        border: "border-blue-500",
        bg: "bg-blue-50",
        text: "text-blue-900",
        textLight: "text-blue-700",
        badge: "bg-blue-100 text-blue-800"
      },
      green: {
        border: "border-green-500",
        bg: "bg-green-50",
        text: "text-green-900",
        textLight: "text-green-700",
        badge: "bg-green-100 text-green-800"
      },
      orange: {
        border: "border-orange-500",
        bg: "bg-orange-50",
        text: "text-orange-900",
        textLight: "text-orange-700",
        badge: "bg-orange-100 text-orange-800"
      },
      purple: {
        border: "border-purple-500",
        bg: "bg-purple-50",
        text: "text-purple-900",
        textLight: "text-purple-700",
        badge: "bg-purple-100 text-purple-800"
      },
      gray: {
        border: "border-gray-500",
        bg: "bg-gray-50",
        text: "text-gray-900",
        textLight: "text-gray-700",
        badge: "bg-gray-100 text-gray-800"
      }
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const colorClasses = getColorClasses(config.color)

  const handleFiles = async (newFiles: File[]) => {
    if (files.length + newFiles.length > config.maxFiles) {
      toast({
        title: "Limite dépassée",
        description: `Vous ne pouvez uploader que ${config.maxFiles} fichier(s) maximum pour ${config.title}.`,
        variant: "destructive",
      })
      return
    }

    const invalidFiles = newFiles.filter((file) => {
      return !config.acceptedTypes.includes(file.type)
    })

    if (invalidFiles.length > 0) {
      toast({
        title: "Type de fichier non supporté",
        description: `Types acceptés pour ${config.title}: ${config.acceptedTypes.map(t => t.split('/')[1].toUpperCase()).join(", ")}`,
        variant: "destructive",
      })
      return
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    const oversizedFiles = newFiles.filter((file) => file.size > maxSize)

    if (oversizedFiles.length > 0) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximum par fichier est de 10MB.",
        variant: "destructive",
      })
      return
    }

    const uploadFiles: UploadedFile[] = newFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      url: "",
      status: "uploading",
      progress: 0,
      documentType: type
    }))

    setFiles((prev) => [...prev, ...uploadFiles])

    for (const uploadFile of uploadFiles) {
      await simulateUpload(uploadFile, newFiles.find((f) => f.name === uploadFile.name)!)
    }
  }

  const simulateUpload = async (uploadFile: UploadedFile, file: File) => {
    try {
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        setFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f)))
      }

      const url = URL.createObjectURL(file)

      setFiles((prev) =>
        prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "completed", progress: 100, url } : f)),
      )

      const updatedFiles = files.filter((f) => f.status === "completed").map((f) => f)
      updatedFiles.push({ ...uploadFile, status: "completed", progress: 100, url })
      onFilesUploaded(updatedFiles)

      toast({
        title: "Fichier uploadé",
        description: `${uploadFile.name} a été uploadé avec succès.`,
      })
    } catch (error) {
      setFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "error", progress: 0 } : f)))

      toast({
        title: "Erreur d'upload",
        description: `Impossible d'uploader ${uploadFile.name}.`,
        variant: "destructive",
      })
    }
  }

  const removeFile = (fileId: string) => {
    const fileToRemove = files.find((f) => f.id === fileId)
    if (fileToRemove?.url) {
      URL.revokeObjectURL(fileToRemove.url)
    }

    const updatedFiles = files.filter((f) => f.id !== fileId)
    setFiles(updatedFiles)

    const completedFiles = updatedFiles.filter((f) => f.status === "completed")
    onFilesUploaded(completedFiles)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      handleFiles(selectedFiles)
    }
  }

  return (
    <div className="space-y-4">
      {/* Document Type Header */}
      <div className={`border-l-4 ${colorClasses.border} pl-4 py-3 ${colorClasses.bg} rounded-r-lg`}>
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-2xl">{config.icon}</span>
          <h3 className={`font-semibold ${colorClasses.text}`}>{config.title}</h3>
          {config.required && (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
              Obligatoire
            </span>
          )}
        </div>
        <p className={`text-sm ${colorClasses.textLight} mb-1`}>{config.description}</p>
        {config.instructions && (
          <p className={`text-xs ${colorClasses.textLight} italic`}>💡 {config.instructions}</p>
        )}
        <div className={`text-xs ${colorClasses.textLight} mt-2 flex items-center space-x-4`}>
          <span>📁 Max: {config.maxFiles} fichier(s)</span>
          <span>📄 Types: {config.acceptedTypes.map(t => t.split('/')[1].toUpperCase()).join(", ")}</span>
          <span>📊 Uploadés: {completedFiles.length}/{config.maxFiles}</span>
        </div>
      </div>

      {/* Display uploaded files */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{config.icon}</span>
                  <FileText className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span className={`${colorClasses.badge} px-2 py-1 rounded-full`}>
                      {config.title}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {file.status === "uploading" && (
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{file.progress}%</span>
                  </div>
                )}
                {file.status === "completed" && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {file.status === "error" && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canUploadMore && (
        <Card
          className={`border-2 border-dashed transition-colors ${
            isDragOver ? `border-${config.color}-400 bg-${config.color}-50` : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-6 text-center">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-3xl">{config.icon}</span>
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Glissez votre {config.title.toLowerCase()} ici
            </h3>
            <p className="text-sm text-gray-600 mb-3">ou cliquez pour sélectionner</p>
            <input
              type="file"
              multiple={config.maxFiles > 1}
              accept={config.acceptedTypes.join(",")}
              onChange={handleFileSelect}
              className="hidden"
              id={`file-input-${type}`}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById(`file-input-${type}`)?.click()}
              className="mb-2"
            >
              Choisir {config.maxFiles > 1 ? 'les fichiers' : 'le fichier'}
            </Button>
            <p className="text-xs text-gray-500">
              {config.acceptedTypes.map(t => t.split('/')[1].toUpperCase()).join(", ")} • Max {formatFileSize(10 * 1024 * 1024)}
            </p>
          </CardContent>
        </Card>
      )}

      {!canUploadMore && (
        <div className={`text-center py-4 ${colorClasses.bg} rounded-lg border`}>
          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className={`text-sm font-medium ${colorClasses.text}`}>
            {config.title} - Tous les fichiers uploadés ✅
          </p>
        </div>
      )}
    </div>
  )
}
