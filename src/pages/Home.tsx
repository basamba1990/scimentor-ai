import { useState } from 'react'
import { Button } from '@/components/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card'
import { Input } from '@/components/Input'
import { Brain, Zap, Shield, BarChart3 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        toast.success('Inscription réussie ! Veuillez vérifier votre e-mail pour confirmer votre compte.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('Connexion réussie !')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">SciMentor AI</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Analyze your Jupyter notebooks with AI-powered scientific feedback
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">{isSignUp ? 'Créer un compte' : 'Se connecter'}</CardTitle>
              <CardDescription>
                {isSignUp ? 'Entrez votre e-mail et mot de passe pour vous inscrire.' : 'Entrez votre e-mail et mot de passe pour accéder à votre tableau de bord.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Chargement...' : isSignUp ? "S'inscrire" : 'Se connecter'}
                </Button>
              </form>
              <div className="mt-4 text-center text-sm">
                {isSignUp ? 'Vous avez déjà un compte ?' : 'Vous n\'avez pas de compte ?'}
                <Button
                  variant="link"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="p-0 ml-1 h-auto"
                >
                  {isSignUp ? 'Se connecter' : 'S\'inscrire'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Card>
            <CardHeader>
              <Brain className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Powered by GPT-4o-mini for scientific accuracy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Fast Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get detailed feedback in seconds
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your data is protected with encryption
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Detailed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Comprehensive feedback with suggestions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
