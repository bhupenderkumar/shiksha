import { useState, useRef } from 'react'
import { Button } from './button'
import { Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploaderProps {
  label?: string
  accept?: string
  multiple?: boolean
  maxSize?: number // in MB
  onChange?: (files: File[]) => void
  currentFile?: string
  className?: string
}

export function FileUploader({
  label,
  accept,
  multiple = false,
  maxSize = 5,
  onChange,
  currentFile,
  className
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    const validFiles = selectedFiles.filter(file => {
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File size should not exceed ${maxSize}MB`)
        return false
      }
      return true
    })

    setFiles(validFiles)
    onChange?.(validFiles)
    setError('')
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const droppedFiles = Array.from(event.dataTransfer.files)
    const validFiles = droppedFiles.filter(file => {
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File size should not exceed ${maxSize}MB`)
        return false
      }
      return true
    })

    setFiles(validFiles)
    onChange?.(validFiles)
    setError('')
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onChange?.(newFiles)
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer",
          className
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
        />
        <div className="space-y-2">
          <Upload className="mx-auto h-8 w-8 text-gray-400" />
          <div className="text-sm text-gray-600">
            <span className="font-medium text-primary">Click to upload</span> or drag and drop
          </div>
          {accept && (
            <p className="text-xs text-gray-500">
              Allowed files: {accept.split(',').join(', ')}
            </p>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {(files.length > 0 || currentFile) && (
        <div className="mt-4 space-y-2">
          {currentFile && (
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700 truncate">{currentFile}</span>
            </div>
          )}
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <span className="text-sm text-gray-700 truncate">{file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(index)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 