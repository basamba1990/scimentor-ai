import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card'
import { Button } from './Button'
import { extractNotebookContent, uploadNotebook, analyzeNotebook, saveAnalysis } from '@/lib/api'
import { Upload, AlertCircle, CheckCircle } from 'lucide-react'
import type { AnalysisFeedback } from '@/lib/api'

interface NotebookUploaderProps {
  userId: string
  onAnalysisComplete: (analysis: any) => void
}

export function NotebookUploader({ userId, onAnalysisComplete }: NotebookUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
      setSuccess(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      setFile(droppedFile)
      setError(null)
      setSuccess(null)
    }
  }

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const startTime = Date.now()

      const notebookContent = await extractNotebookContent(file)

      const uploadResult = await uploadNotebook(file, userId)

      const feedback = await analyzeNotebook(notebookContent, userId)

      const processingTime = Date.now() - startTime

      const analysis = await saveAnalysis(userId, uploadResult.path, feedback, processingTime)

      setSuccess('Analysis completed successfully!')
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      onAnalysisComplete({
        id: analysis.id,
        feedback,
        processingTime,
        filename: file.name,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Analyze Notebook</CardTitle>
        <CardDescription>Upload a Jupyter notebook for AI-powered scientific analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">Drag and drop your notebook here</p>
          <p className="text-xs text-muted-foreground">or click to browse</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".ipynb"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {file && (
          <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
            <span className="text-sm font-medium truncate">{file.name}</span>
            <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg text-destructive">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg text-green-700">
            <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{success}</p>
          </div>
        )}

        <Button
          onClick={handleAnalyze}
          disabled={!file || loading}
          loading={loading}
          className="w-full"
        >
          {loading ? 'Analyzing...' : 'Upload & Analyze'}
        </Button>
      </CardContent>
    </Card>
  )
}
