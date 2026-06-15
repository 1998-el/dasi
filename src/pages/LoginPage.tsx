import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from './auth.service'
import { cn } from '../lib/utils'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

const loginSchema = yup.object({
  email: yup.string().email('Adresse email invalide').required('L\'email est requis'),
  password: yup.string().required('Le mot de passe est requis'),
})

type LoginFormData = yup.InferType<typeof loginSchema>

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [authError, setAuthError] = useState<string | null>(null)
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null)
    try {
      await login(data.email, data.password)
      const profile = await authService.getProfile()

      // Vérifie si l'utilisateur est en cours d'onboarding
      if (profile?.onboardingStatus && profile.onboardingStatus !== 'COMPLETED') {
        navigate('/register', {
          state: {
            message: 'Nous avons retrouvé votre progression. Continuez la finalisation de votre compte.',
            email: data.email, // Passe l'email pour pré-remplir le wizard
          },
        })
        return
      }

      navigate('/dashboard')
    } catch (e: any) {
      setAuthError(e.message || 'Erreur de connexion. Vérifiez vos identifiants.')
    }
  }

  return (
    <div className="flex h-screen w-full bg-slate-50">
      
      {/* Panneau Gauche : Identité Visuelle & Réassurance (Masqué sur mobile) */}
      <div className="hidden lg:flex lg:w-7/12 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden border-r border-slate-800">
        {/* Background Image & Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('public/logo/login.jpg')" }}
        />
        <div className="absolute inset-0 bg-slate-900/60" />
        
        {/* Center: Core Value Proposition */}
    

        {/* Bottom: Footer note */}
        <div className="relative z-10 text-xs text-slate-300">
          © {new Date().getFullYear()} Maatics Food. Tous droits réservés.
        </div>
      </div>

      {/* Panneau Droit : Formulaire de Connexion */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-6 sm:p-12">
        <Card className="w-full max-w-md border-none bg-transparent shadow-none">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-6">
              <img 
                src="/logo/logo.png" 
                alt="Logo RestoManager" 
                className="h-20 w-auto object-contain"
                onError={(e) => {
                  // Fallback si l'image ne charge pas
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
            
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 text-center lg:text-left">
              Connexion
            </CardTitle>
            <CardDescription className="text-slate-500 text-sm text-center lg:text-left">
              Saisissez vos identifiants pour accéder au back-office
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-transparent">
            
            {/* Message de succès après enregistrement */}
            {location.state?.message && !authError && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-sm flex items-start gap-2.5 text-xs font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{location.state.message}</span>
              </div>
            )}

            {/* Message d'information (ex: après redirection du register) */}
            {location.state?.info && !authError && (
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-sm flex items-start gap-2.5 text-xs font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{location.state.info}</span>
              </div>
            )}

            {/* Alerte Erreur Globale API */}
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-sm flex items-start gap-2.5 text-xs font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Champ Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                Adresse email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nom@etablissement.com"
                className={cn(
                  "focus-visible:ring-orange-500/30 focus-visible:border-orange-500 h-10 rounded-sm text-sm",
                  errors.email && "border-red-300 focus-visible:ring-red-500/20 focus-visible:border-red-500"
                )}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs font-medium text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Champ Mot de Passe */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                  Mot de passe
                </Label>
                <Link to="/forgot-password" className="text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={cn(
                  "focus-visible:ring-orange-500/30 focus-visible:border-orange-500 h-10 rounded-sm text-sm",
                  errors.password && "border-red-300 focus-visible:ring-red-500/20 focus-visible:border-red-500"
                )}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs font-medium text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Bouton de Soumission */}
            <Button 
              type="submit" 
              className="w-full h-10 rounded-sm bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm transition-colors mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authentification...
                </span>
              ) : (
                'Se connecter au tableau de bord'
              )}
            </Button>
          </form>

          <div className="text-center mt-8">
            <p className="text-sm text-slate-500 font-medium">
              Vous n'avez pas encore de compte ?{' '}
              <Link to="/register" className="text-orange-600 font-semibold hover:text-orange-700 hover:underline transition-all">
                Créer un établissement
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}