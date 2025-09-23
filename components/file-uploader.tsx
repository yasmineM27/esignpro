"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FileUploaderProps {
  type?: "identity" | "insurance" | "identity_front" | "identity_back"
  onFilesUploaded: (files: { id: string; name: string; type: string; url: string }[]) => void
  uploadedFiles?: string[]
  acceptedTypes?: string[]
  maxFiles?: number
  description?: string
  instructions?: string
  specificLabel?: string // Pour spécifier "RECTO" ou "VERSO"
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  status: "uploading" | "completed" | "error"
  progress: number
}

export function FileUploader({
  type = "identity",
  onFilesUploaded,
  uploadedFiles = [],
  acceptedTypes = ["image/jpeg", "image/png", "application/pdf"],
  maxFiles = 2,
  description = "Téléchargez vos documents",
  instructions,
  specificLabel,
}: FileUploaderProps) {
  const { toast } = useToast()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const droppedFiles = Array.from(e.dataTransfer.files)
      handleFiles(droppedFiles)
    },
    [files, maxFiles],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || [])
      handleFiles(selectedFiles)
    },
    [files, maxFiles],
  )

  const handleFiles = async (newFiles: File[]) => {
    if (files.length + newFiles.length > maxFiles) {
      toast({
        title: "Limite dépassée",
        description: `Vous ne pouvez uploader que ${maxFiles} fichier(s) maximum.`,
        variant: "destructive",
      })
      return
    }

    // Validate file types
    const acceptedTypesArray = Array.isArray(acceptedTypes) ? acceptedTypes : [acceptedTypes]
    const invalidFiles = newFiles.filter((file) => {
      return !acceptedTypesArray.includes(file.type)
    })

    if (invalidFiles.length > 0) {
      toast({
        title: "Type de fichier non supporté",
        description: `Types acceptés: ${acceptedTypesArray.join(", ")}`,
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 10MB per file)
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

    // Create upload entries
    const uploadFiles: UploadedFile[] = newFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      url: "",
      status: "uploading",
      progress: 0,
    }))

    setFiles((prev) => [...prev, ...uploadFiles])

    // Simulate file upload
    for (const uploadFile of uploadFiles) {
      await simulateUpload(uploadFile, newFiles.find((f) => f.name === uploadFile.name)!)
    }
  }

  const simulateUpload = async (uploadFile: UploadedFile, file: File) => {
    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        setFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f)))
      }

      // Create a blob URL for the file (in a real app, you'd upload to a server)
      const url = URL.createObjectURL(file)

      setFiles((prev) =>
        prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "completed", progress: 100, url } : f)),
      )

      // Update parent component
      const completedFiles = files.filter((f) => f.status === "completed").map((f) => ({
        id: f.id,
        name: f.name,
        type: f.type,
        url: f.url
      }))
      completedFiles.push({
        id: uploadFile.id,
        name: uploadFile.name,
        type: uploadFile.type,
        url
      })
      onFilesUploaded(completedFiles)

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

    const completedFiles = updatedFiles.filter((f) => f.status === "completed").map((f) => ({
      id: f.id,
      name: f.name,
      type: f.type,
      url: f.url
    }))
    onFilesUploaded(completedFiles)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const completedFiles = files.filter((f) => f.status === "completed")
  const canUploadMore = completedFiles.length < maxFiles

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">{description}</p>

      {instructions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-blue-900 mb-2">📋 Instructions :</h4>
          <p className="text-sm text-blue-800">{instructions}</p>
        </div>
      )}

      {type === "identity" && !instructions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-blue-900 mb-2">📋 Instructions pour la pièce d'identité :</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • <strong>Fichier 1 :</strong> Photo du RECTO de votre pièce d'identité
            </li>
            <li>
              • <strong>Fichier 2 :</strong> Photo du VERSO de votre pièce d'identité
            </li>
            <li>• Assurez-vous que les photos sont nettes et lisibles</li>
            <li>• Formats acceptés : JPG, PNG ou PDF</li>
          </ul>
        </div>
      )}

      {canUploadMore && (
        <Card
          className={`border-2 border-dashed transition-colors ${
            isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Glissez vos fichiers ici</h3>
            <p className="text-sm text-gray-600 mb-4">ou cliquez pour sélectionner</p>
            <input
              type="file"
              multiple
              accept={Array.isArray(acceptedTypes) ? acceptedTypes.join(",") : acceptedTypes}
              onChange={handleFileSelect}
              className="hidden"
              id={`file-input-${type}`}
            />
            <Button variant="outline" onClick={() => document.getElementById(`file-input-${type}`)?.click()}>
              Sélectionner les fichiers
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              {Array.isArray(acceptedTypes) ? acceptedTypes.join(", ") : acceptedTypes} • Max {maxFiles} fichier(s) • 10MB max par fichier
            </p>
          </CardContent>
        </Card>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Fichiers uploadés</h4>
          {files.map((file) => (
            <Card key={file.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <File className="h-8 w-8 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {file.status === "uploading" && (
                    <div className="w-24">
                      <Progress value={file.progress} />
                    </div>
                  )}
                  {file.status === "completed" && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {file.status === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Status Messages */}
      {completedFiles.length >= maxFiles && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Tous les fichiers requis ont été uploadés avec succès.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
