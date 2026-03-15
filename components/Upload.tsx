import { CheckCircle2, ImageIcon, UploadIcon } from "lucide-react"
import React, { useState } from "react"
import { useOutletContext } from "react-router"
import {
  REDIRECT_DELAY_MS,
  PROGRESS_INTERVAL_MS,
  PROGRESS_STEP,
} from "../lib/constants"

interface UploadProps {
  onComplete?: (base64Data: string) => void
}

const Upload: React.FC<UploadProps> = ({ onComplete }) => {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [progress, setProgress] = useState(0)

  const { isSignedIn } = useOutletContext<AuthContext>()

  const processFile = (selectedFile: File) => {
    if (!isSignedIn) return

    const reader = new FileReader()
    reader.onload = () => {
      const base64Data = reader.result as string
      setFile(selectedFile)
      setProgress(0)

      const intervalId = window.setInterval(() => {
        setProgress((prev) => {
          const nextProgress = Math.min(prev + PROGRESS_STEP, 100)

          if (nextProgress >= 100) {
            window.clearInterval(intervalId)
            window.setTimeout(() => {
              onComplete?.(base64Data)
            }, REDIRECT_DELAY_MS)
          }

          return nextProgress
        })
      }, PROGRESS_INTERVAL_MS)
    }

    reader.readAsDataURL(selectedFile)
  }

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile || !isSignedIn) return
    processFile(selectedFile)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!isSignedIn) return
    setIsDragging(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    if (!isSignedIn) return

    const droppedFile = event.dataTransfer.files?.[0]
    if (!droppedFile) return
    processFile(droppedFile)
  }

  return (
    <div className="upload">
      {!file ? (
        <div
          className={`dropzone ${isDragging ? "is-dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="drop-input"
            accept=".jpg, .jpeg, .png"
            disabled={!isSignedIn}
            onChange={onChange}
          />

          <div className="drop-content">
            <div className="drop-icon">
              <UploadIcon size={20} />
            </div>

            <p>
              {isSignedIn
                ? "Click to upload or just drag and drop"
                : "Sign in or sign up with Puter to upload"}
            </p>

            <p className="help">Maximum file size is 50MB.</p>
          </div>
        </div>
      ) : (
        <div className="upload-status">
          <div className="status-content">
            <div className="status-icon">
              {progress === 100 ? (
                <CheckCircle2 className="check" />
              ) : (
                <ImageIcon className="image" />
              )}
            </div>

            <h3>{file.name}</h3>

            <div className="progress">
              <div className="bar" style={{ width: `${progress}%` }} />

              <p className="status-text">
                {progress < 100 ? "Analyzing floor plan..." : "Redirecting"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Upload
