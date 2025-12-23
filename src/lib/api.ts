import { supabase } from './supabase'

export interface NotebookCell {
  cell_type: 'code' | 'markdown'
  source: string[]
  metadata?: Record<string, any>
}

export interface NotebookContent {
  cells: NotebookCell[]
  metadata?: Record<string, any>
}

export interface FeedbackPoint {
  criterion: string
  cell_index: number
  severity: 'low' | 'medium' | 'high'
  comment: string
  suggestion: string
}

export interface AnalysisFeedback {
  global_evaluation: string
  feedback_points: FeedbackPoint[]
  final_score: string
}

export async function extractNotebookContent(file: File): Promise<NotebookContent> {
  if (!file.name.endsWith('.ipynb')) {
    throw new Error('File must be a Jupyter notebook (.ipynb)')
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size must be less than 5MB')
  }

  const text = await file.text()
  const notebook = JSON.parse(text)

  if (!notebook.cells || !Array.isArray(notebook.cells)) {
    throw new Error('Invalid Jupyter notebook format')
  }

  return notebook as NotebookContent
}

export async function uploadNotebook(
  file: File,
  userId: string
): Promise<{ path: string; url: string }> {
  const timestamp = Date.now()
  const filename = `${userId}/${timestamp}-${file.name}`

  const { data, error } = await supabase.storage
    .from('notebooks')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  const { data: urlData } = supabase.storage
    .from('notebooks')
    .getPublicUrl(data.path)

  return {
    path: data.path,
    url: urlData.publicUrl,
  }
}

export async function analyzeNotebook(
  notebookContent: NotebookContent,
  userId: string
): Promise<AnalysisFeedback> {
  const { data, error } = await supabase.functions.invoke('analyze-notebook', {
    body: {
      notebook_content: JSON.stringify(notebookContent),
      user_id: userId,
    },
  })

  if (error) {
    throw new Error(`Analysis failed: ${error.message}`)
  }

  return data as AnalysisFeedback
}

export async function saveAnalysis(
  userId: string,
  notebookPath: string,
  feedback: AnalysisFeedback,
  processingTimeMs: number
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('analyses')
    .insert({
      user_id: userId,
      notebook_path: notebookPath,
      feedback_data: feedback,
      processing_time_ms: processingTimeMs,
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to save analysis: ${error.message}`)
  }

  return { id: data.id }
}

export async function getAnalysisHistory(
  userId: string,
  limit: number = 50,
  offset: number = 0
) {
  const { data, error, count } = await supabase
    .from('analyses')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw new Error(`Failed to fetch history: ${error.message}`)
  }

  return { analyses: data || [], total: count || 0 }
}

export async function deleteAnalysis(analysisId: string, userId: string) {
  const { error } = await supabase
    .from('analyses')
    .delete()
    .eq('id', analysisId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to delete analysis: ${error.message}`)
  }
}
