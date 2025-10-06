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
    instructions: "Assurez-vous que tous les détails sont lisibles. Formats acceptés: Images (JPG, PNG) ou PDF",
    maxFiles: 1,
    acceptedTypes: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
    icon: "🆔",
    required: true,
    color: "blue"
  },
  identity_back: {
    title: "Carte d'Identité - VERSO",
    description: "Face arrière de votre carte d'identité",
    instructions: "Vérifiez que l'adresse est visible. Formats acceptés: Images (JPG, PNG) ou PDF",
    maxFiles: 1,
    acceptedTypes: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
    icon: "🆔",
    required: true,
    color: "blue"
  },
  insurance_contract: {
    title: "Contrat d'Assurance",
    description: "Votre contrat d'assurance actuel (optionnel)",
    instructions: "Document PDF ou photo claire du contrat",
    maxFiles: 3,
    acceptedTypes: ["application/pdf", "image/jpeg", "image/png"],
    icon: "📄",
    required: false, // ✅ NON REQUIS
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
  clientId?: string
  token?: string
  useRealAPI?: boolean
}

export function SeparatedDocumentUploader({
  type,
  onFilesUploaded,
  uploadedFiles = [],
  clientId,
  token,
  useRealAPI = false
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
    try {
      // Validation: Nombre de fichiers
      if (files.length + newFiles.length > config.maxFiles) {
        toast({
          title: "Limite dépassée",
          description: `Vous ne pouvez uploader que ${config.maxFiles} fichier(s) maximum pour ${config.title}.`,
          variant: "destructive",
        })
        return
      }

      // Validation: Types de fichiers
      const invalidFiles = newFiles.filter((file) => {
        const isValidType = config.acceptedTypes.some(acceptedType => {
          // Support pour les types MIME et extensions
          return file.type === acceptedType ||
                 file.name.toLowerCase().endsWith(acceptedType.replace('image/', '.').replace('application/', '.'))
        })
        return !isValidType
      })

      if (invalidFiles.length > 0) {
        toast({
          title: "Type de fichier non supporté",
          description: `Types acceptés pour ${config.title}: ${config.acceptedTypes.map(t => {
            if (t.includes('/')) return t.split('/')[1].toUpperCase()
            return t.toUpperCase()
          }).join(", ")}`,
          variant: "destructive",
        })
        return
      }

      // Validation: Taille des fichiers
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

      // Validation: Fichiers vides
      const emptyFiles = newFiles.filter((file) => file.size === 0)
      if (emptyFiles.length > 0) {
        toast({
          title: "Fichier vide",
          description: "Impossible d'uploader des fichiers vides.",
          variant: "destructive",
        })
        return
      }

      // Créer les entrées d'upload
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

      // Uploader chaque fichier
      for (const uploadFile of uploadFiles) {
        const originalFile = newFiles.find((f) => f.name === uploadFile.name)
        if (originalFile) {
          if (useRealAPI && clientId && token) {
            await realUpload(uploadFile, originalFile)
          } else {
            await simulateUpload(uploadFile, originalFile)
          }
        }
      }

    } catch (error) {
      console.error('Erreur lors de la gestion des fichiers:', error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sélection des fichiers.",
        variant: "destructive",
      })
    }
  }

  const realUpload = async (uploadFile: UploadedFile, file: File) => {
    try {
      // Créer FormData pour l'upload
      const formData = new FormData()
      formData.append('files', file)
      formData.append('token', token!)
      formData.append('clientId', clientId!)
      formData.append('documentType', type)

      // Simuler le progress pendant l'upload
      const progressInterval = setInterval(() => {
        setFiles((prev) => prev.map((f) => {
          if (f.id === uploadFile.id && f.progress < 90) {
            return { ...f, progress: f.progress + 10 }
          }
          return f
        }))
      }, 200)

      // Faire l'upload réel
      const response = await fetch('/api/client/upload-separated-documents', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de l\'upload')
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Upload échoué')
      }

      // Marquer comme terminé avec les données du serveur
      const uploadedFileData = result.uploadedFiles[0] // Premier fichier uploadé
      setFiles((prev) =>
        prev.map((f) => (f.id === uploadFile.id ? {
          ...f,
          status: "completed",
          progress: 100,
          url: uploadedFileData.url
        } : f)),
      )

      // Mettre à jour la liste des fichiers uploadés
      setTimeout(() => {
        setFiles((currentFiles) => {
          const completedFiles = currentFiles.filter((f) => f.status === "completed")
          onFilesUploaded(completedFiles)
          return currentFiles
        })
      }, 100)

      toast({
        title: "Fichier uploadé",
        description: `${uploadFile.name} a été uploadé avec succès pour ${config.title}.`,
      })

    } catch (error) {
      console.error('Erreur lors de l\'upload réel:', error)

      setFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "error", progress: 0 } : f)))

      toast({
        title: "Erreur d'upload",
        description: error instanceof Error ? error.message : `Impossible d'uploader ${uploadFile.name}. Veuillez réessayer.`,
        variant: "destructive",
      })
    }
  }

  const simulateUpload = async (uploadFile: UploadedFile, file: File) => {
    try {
      // Simulation de l'upload avec progress bar
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        setFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f)))
      }

      // Créer l'URL du fichier
      const url = URL.createObjectURL(file)

      // Marquer le fichier comme terminé
      setFiles((prev) =>
        prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "completed", progress: 100, url } : f)),
      )

      // Mettre à jour la liste des fichiers uploadés
      setTimeout(() => {
        setFiles((currentFiles) => {
          const completedFiles = currentFiles.filter((f) => f.status === "completed")
          onFilesUploaded(completedFiles)
          return currentFiles
        })
      }, 100)

      toast({
        title: "Fichier uploadé",
        description: `${uploadFile.name} a été uploadé avec succès pour ${config.title}.`,
      })

    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)

      setFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "error", progress: 0 } : f)))

      toast({
        title: "Erreur d'upload",
        description: `Impossible d'uploader ${uploadFile.name}. Veuillez réessayer.`,
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
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    try {
      const droppedFiles = Array.from(e.dataTransfer.files)
      if (droppedFiles.length > 0) {
        handleFiles(droppedFiles)
      }
    } catch (error) {
      console.error('Erreur lors du drop:', error)
      toast({
        title: "Erreur",
        description: "Erreur lors du glisser-déposer. Utilisez le bouton de sélection.",
        variant: "destructive",
      })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFiles = Array.from(e.target.files)
        handleFiles(selectedFiles)
      }
      // Reset input value pour permettre de sélectionner le même fichier
      e.target.value = ''
    } catch (error) {
      console.error('Erreur lors de la sélection:', error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la sélection des fichiers. Veuillez réessayer.",
        variant: "destructive",
      })
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
