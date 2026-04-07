'use client'

import { useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import FormFieldInput from '@/components/form-field-input'

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dayNumber: number
  date: string
  onSuccess: (song: { id: string; title: string; audioUrl: string }) => void
}

type Status = 'idle' | 'uploading' | 'success' | 'error'

const VALID_TYPES = new Set([
  'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/aac', 'audio/x-m4a',
])
const MAX_BYTES = 100 * 1024 * 1024

function validateFile(file: File): string | null {
  if (!VALID_TYPES.has(file.type)) return 'Only MP3, WAV, M4A, and AAC files are accepted.'
  if (file.size > MAX_BYTES) return `File is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is 100MB.`
  return null
}

export default function UploadDialog({
  open, onOpenChange, dayNumber, date, onSuccess,
}: UploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file,         setFile]         = useState<File | null>(null)
  const [title,        setTitle]        = useState('')
  const [progress,     setProgress]     = useState(0)
  const [status,       setStatus]       = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [isDragging,   setIsDragging]   = useState(false)

  function pickFile(f: File) {
    const err = validateFile(f)
    if (err) { setErrorMessage(err); return }
    setErrorMessage('')
    setFile(f)
  }

  async function handleUpload() {
    if (!file) return
    const err = validateFile(file)
    if (err) { setErrorMessage(err); return }

    setStatus('uploading')
    setProgress(0)
    setErrorMessage('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? '')
    formData.append('folder', 'februwriters')
    formData.append('resource_type', 'video')

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`

    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const res = JSON.parse(xhr.responseText)
        const audioUrl = res.secure_url as string
        const id       = res.public_id  as string
        const songTitle = title.trim() || `${date.replace(/\s/g, '')}_Day${dayNumber}`
        setStatus('success')
        onSuccess({ id, title: songTitle, audioUrl })
      } else {
        let msg = 'Upload failed.'
        try { msg = JSON.parse(xhr.responseText)?.error?.message ?? msg } catch { /* ignore */ }
        setErrorMessage(msg)
        setStatus('error')
      }
    }

    xhr.onerror = () => {
      setErrorMessage('Network error. Check your connection and try again.')
      setStatus('error')
    }

    xhr.send(formData)
  }

  const isUploading = status === 'uploading'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-feb-slate-dark border-feb-slate-mid text-feb-linen sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-feb-linen">Submit day {dayNumber}</DialogTitle>
          <DialogDescription className="text-feb-bluegray">
            {date} · You can replace this until midnight.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Drop zone */}
          <div
            className={[
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              isDragging ? 'border-feb-gold' : 'border-feb-slate-mid hover:border-feb-gold',
            ].join(' ')}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              const f = e.dataTransfer.files[0]
              if (f) pickFile(f)
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,.m4a,.aac"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) pickFile(f)
                e.target.value = ''
              }}
            />
            {file ? (
              <>
                <p className="text-feb-linen text-sm font-medium">{file.name}</p>
                <p className="text-feb-bluegray text-xs mt-1">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </>
            ) : (
              <>
                <p className="text-feb-bluegray text-sm">Drop your audio file here or click to browse</p>
                <p className="text-feb-bluegray/50 text-xs mt-1">MP3, WAV, M4A, AAC · Max 100MB</p>
              </>
            )}
          </div>

          {/* Title */}
          <FormFieldInput
            label="Title"
            placeholder="Leave blank to use the default"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-feb-slate border-feb-slate-mid text-feb-linen placeholder:text-feb-bluegray/50 focus-visible:ring-feb-gold"
          />

          {/* Progress bar */}
          {isUploading && (
            <div className="space-y-1">
              <div className="w-full h-1 bg-feb-slate-mid rounded-full">
                <div
                  className="h-full bg-feb-gold rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-feb-bluegray text-xs text-right">{progress}%</p>
            </div>
          )}

          {/* Error */}
          {errorMessage && (
            <p className="text-red-400 text-xs">{errorMessage}</p>
          )}
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-feb-linen/80 hover:text-feb-linen text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="px-4 py-2 rounded-md bg-feb-gold text-feb-slate text-sm font-medium hover:bg-feb-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading…' : 'Submit'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
