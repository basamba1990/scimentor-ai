import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card'
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import type { AnalysisFeedback, FeedbackPoint } from '@/lib/api'

interface FeedbackDisplayProps {
  feedback: AnalysisFeedback
  filename: string
  processingTime: number
}

export function FeedbackDisplay({ feedback, filename, processingTime }: FeedbackDisplayProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="h-5 w-5 text-destructive" />
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'low':
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return null
    }
  }

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-destructive/10'
      case 'medium':
        return 'bg-yellow-500/10'
      case 'low':
        return 'bg-blue-500/10'
      default:
        return 'bg-muted'
    }
  }

  return (
    <div className="space-y-4 w-full">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>{filename}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{feedback.final_score}</div>
              <p className="text-xs text-muted-foreground">Final Score</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Global Evaluation</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feedback.global_evaluation}
            </p>
          </div>

          <div className="text-xs text-muted-foreground">
            Processing time: {(processingTime / 1000).toFixed(2)}s
          </div>
        </CardContent>
      </Card>

      {feedback.feedback_points && feedback.feedback_points.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Detailed Feedback</h3>
          {feedback.feedback_points.map((point: FeedbackPoint, index: number) => (
            <Card key={index} className={getSeverityBg(point.severity)}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(point.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{point.criterion}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-background/50">
                          Cell {point.cell_index}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{point.comment}</p>
                    </div>
                  </div>

                  <div className="ml-8 p-3 bg-background/50 rounded">
                    <p className="text-xs font-semibold mb-1">Suggestion:</p>
                    <p className="text-sm">{point.suggestion}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
