import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card'
import { Button } from './Button'
import { getAnalysisHistory, deleteAnalysis } from '@/lib/api'
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface AnalysisHistoryProps {
  userId: string
  onSelectAnalysis: (analysis: any) => void
}

export function AnalysisHistory({ userId, onSelectAnalysis }: AnalysisHistoryProps) {
  const [analyses, setAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  const pageSize = 10

  useEffect(() => {
    loadAnalyses()
  }, [userId, page])

  const loadAnalyses = async () => {
    setLoading(true)
    setError(null)

    try {
      const { analyses: data, total: count } = await getAnalysisHistory(
        userId,
        pageSize,
        page * pageSize
      )
      setAnalyses(data)
      setTotal(count)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (analysisId: string) => {
    if (!confirm('Are you sure you want to delete this analysis?')) return

    try {
      await deleteAnalysis(analysisId, userId)
      setAnalyses(analyses.filter((a) => a.id !== analysisId))
      setTotal(total - 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete analysis')
    }
  }

  const filteredAnalyses = analyses.filter(
    (a) =>
      a.notebook_path?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.feedback_data?.final_score?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(total / pageSize)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Analysis History</CardTitle>
        <CardDescription>View and manage your previous analyses</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          type="text"
          placeholder="Search analyses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {error && (
          <div className="p-3 bg-destructive/10 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : filteredAnalyses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {analyses.length === 0 ? 'No analyses yet' : 'No matching analyses'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAnalyses.map((analysis) => (
              <div
                key={analysis.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => onSelectAnalysis(analysis)}
                >
                  <p className="font-medium text-sm truncate">{analysis.notebook_path}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      Score: {analysis.feedback_data?.final_score}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(analysis.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
