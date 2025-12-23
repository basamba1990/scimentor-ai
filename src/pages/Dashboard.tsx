import { useState } from 'react'
import { Button } from '@/components/Button'
import { NotebookUploader } from '@/components/NotebookUploader'
import { FeedbackDisplay } from '@/components/FeedbackDisplay'
import { AnalysisHistory } from '@/components/AnalysisHistory'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { LogOut } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface DashboardProps {
  user: User
  onLogout: () => void
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload')
  const [currentFeedback, setCurrentFeedback] = useState<any | null>(null)

  const handleAnalysisComplete = (analysis: any) => {
    setCurrentFeedback(analysis)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">SciMentor AI</h1>
            <p className="text-sm text-muted-foreground">Welcome, {user.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-2 border-b border-border">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === 'upload'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Upload & Analyze
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                History
              </button>
            </div>

            {activeTab === 'upload' && (
              <NotebookUploader
                userId={user.id}
                onAnalysisComplete={handleAnalysisComplete}
              />
            )}

            {activeTab === 'history' && (
              <AnalysisHistory
                userId={user.id}
                onSelectAnalysis={(analysis) => {
                  setCurrentFeedback(analysis)
                  setActiveTab('upload')
                }}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            {currentFeedback ? (
              <FeedbackDisplay
                feedback={currentFeedback.feedback}
                filename={currentFeedback.filename}
                processingTime={currentFeedback.processingTime}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Analysis Selected</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Upload a notebook or select one from your history to view feedback
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
