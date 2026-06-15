import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { authService } from './auth.service'
import { useToast, Toast } from '../components/ui/Toast'

// Schéma Étape 1 : Email uniquement
const step1Schema = yup.object({
  email: yup.string().email('Adresse email invalide').required('L\'email est requis'),
})

// Schéma Étape 2 : Code OTP uniquement
const step2Schema = yup.object({
  otp: yup.string().length(6, 'Le code doit contenir 6 chiffres').required('Code OTP requis'),
})

// Schéma Étape 3 : Nouveau mot de passe
const step3Schema = yup.object({
  password: yup
    .string()
    .min(6, '6 caractères minimum')
    .max(72, 'Mot de passe trop long')
    .required('Nouveau mot de passe requis'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Les mots de passe ne correspondent pas')
    .required('Confirmation requise'),
})

type Step1Data = yup.InferType<typeof step1Schema>
type Step2Data = yup.InferType<typeof step2Schema>
type Step3Data = yup.InferType<typeof step3Schema>

const STORAGE_KEY = 'forgot_password_wizard_state'

type PersistedState = {
  step: number
  email: string
  otpVerified: boolean
}

function readState(): PersistedState | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<PersistedState>

    return {
      step: parsed.step === 2 || parsed.step === 3 ? parsed.step : 1,
      email: parsed.email ?? '',
      otpVerified: parsed.otpVerified ?? false,
    }
  } catch {
    return null
  }
}

function saveState(state: PersistedState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function clearState() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}

export function ForgotPasswordPage() {
  const persisted = readState()
  const [step, setStep] = useState<number>(persisted?.step ?? 1)
  const [email, setEmail] = useState<string>(persisted?.email ?? '')
  const [otpCode, setOtpCode] = useState<string>('')
  const [otpVerified, setOtpVerified] = useState<boolean>(persisted?.otpVerified ?? false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const navigate = useNavigate()
  const { toast, showSuccess, showError } = useToast()

  const form1 = useForm<Step1Data>({
    resolver: yupResolver(step1Schema),
    defaultValues: {
      email: persisted?.email ?? '',
    },
  })

  const form2 = useForm<Step2Data>({
    resolver: yupResolver(step2Schema),
  })

  const form3 = useForm<Step3Data>({
    resolver: yupResolver(step3Schema),
  })

  // Persistance de l'état
  useEffect(() => {
    saveState({ step, email, otpVerified })
  }, [step, email, otpVerified])

  // Étape 1 : Demander le code OTP
  const handleRequestCode = async (data: Step1Data) => {
    setIsLoading(true)
    setError(null)

    try {
      await authService.requestPasswordReset({ email: data.email })
      setEmail(data.email)
      setStep(2)
      showSuccess('Un code de vérification a été envoyé à votre adresse email.')
    } catch (e: any) {
      const msg = e?.message ?? 'Impossible de lancer la réinitialisation'
      setError(msg)
      showError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  // Étape 2 : Vérifier le code OTP
  const handleVerifyOtp = async (data: Step2Data) => {
    setIsLoading(true)
    setError(null)

    try {
      await authService.verifyOtp({ email, otp: data.otp })
      setOtpCode(data.otp)
      setOtpVerified(true)
      setStep(3)
      showSuccess('Code vérifié. Vous pouvez maintenant choisir un nouveau mot de passe.')
    } catch (e: any) {
      const msg = e?.message ?? 'Code OTP invalide ou expiré'
      setError(msg)
      showError(msg)
      form2.setValue('otp', '')
    } finally {
      setIsLoading(false)
    }
  }

  // Renvoyer un nouveau code OTP
  const handleResendCode = async () => {
    if (!email) return

    setIsResending(true)
    setError(null)

    try {
      await authService.resendPasswordResetCode({ email })
      showSuccess('Un nouveau code de vérification a été envoyé.')
      form2.setValue('otp', '')
    } catch (e: any) {
      const msg = e?.message ?? 'Impossible de renvoyer le code'
      setError(msg)
      showError(msg)
    } finally {
      setIsResending(false)
    }
  }

  // Étape 3 : Réinitialiser le mot de passe
  const handleResetPassword = async (data: Step3Data) => {
    setIsLoading(true)
    setError(null)

    try {
      await authService.resetPassword({
        email,
        otp: otpCode,
        password: data.password,
      })

      clearState()
      showSuccess('Mot de passe réinitialisé avec succès.')
      navigate('/login', {
        state: {
          message: 'Mot de passe réinitialisé. Connectez-vous avec votre nouveau mot de passe.',
        },
      })
    } catch (e: any) {
      const msg = e?.message ?? 'Réinitialisation échouée'
      setError(msg)
      showError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full bg-slate-50">
      <div className="fixed top-4 right-4 z-50">
        {toast && <Toast toast={toast} />}
      </div>

      {/* Panneau Gauche : Identité Visuelle (Masqué sur mobile) */}
      <div className="hidden lg:flex lg:w-7/12 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden border-r border-slate-800">
        {/* Background Image & Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/logo/login.jpg')" }}
        />
        <div className="absolute inset-0 bg-slate-900/60" />
        
        {/* Center: Navigation rapide */}
        <div className="relative z-10">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-orange-500 transition-colors group"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Retour à la connexion
          </Link>
        </div>

        {/* Bottom: Footer note */}
        <div className="relative z-10 text-xs text-slate-300">
          © {new Date().getFullYear()} Maatics Food. Tous droits réservés.
        </div>
      </div>

      {/* Panneau Droit : Wizard de Récupération */}
      <div className="w-full lg:w-5/12 flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Logo visible sur Mobile uniquement */}
          <div className="lg:hidden flex justify-center mb-8">
            <img 
              src="/logo/logo.png" 
              alt="Logo" 
              className="h-24 w-auto object-contain" 
            />
          </div>

          {/* Logo Desktop */}
          <div className="hidden lg:flex items-center justify-center mb-6">
            <img 
              src="/logo/logo.png" 
              alt="Logo Maatics" 
              className="h-20 w-auto object-contain"
            />
          </div>

          {/* Indicateur d'étapes */}
          <div className="mb-10 flex items-center justify-between px-2">
            {[
              { id: 1, label: 'Email', icon: Mail },
              { id: 2, label: 'Code OTP', icon: ShieldCheck },
              { id: 3, label: 'Mot de passe', icon: LockKeyhole },
            ].map((item, index) => (
              <div key={item.id} className="flex items-center flex-1 last:flex-none">
                <div
                  className={cn(
                    'flex flex-col items-center gap-2 transition-all duration-500',
                    step >= item.id ? 'text-orange-600' : 'text-slate-300',
                  )}
                >
                  <div
                    className={cn(
                      'h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all duration-500',
                      step === item.id
                        ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-200'
                        : step > item.id
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'bg-white border-slate-200',
                    )}
                  >
                    {step > item.id ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <item.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-center whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
                {index < 2 && (
                  <div
                    className={cn(
                      'h-[2px] flex-1 mx-2 -mt-6 transition-all duration-700',
                      step > item.id ? 'bg-emerald-500' : 'bg-slate-200',
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          <Card className="border-none bg-transparent shadow-none rounded-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight text-center lg:text-left uppercase">
              {step === 1 && 'Mot de passe oublié'}
              {step === 2 && 'Vérification du code'}
              {step === 3 && 'Nouveau mot de passe'}
            </CardTitle>
            <CardDescription className="text-slate-500 text-sm text-center lg:text-left font-medium">
              {step === 1 && 'Saisissez votre email pour recevoir un code de réinitialisation.'}
              {step === 2 && `Nous avons envoyé un code de sécurité à ${email}`}
              {step === 3 && 'Choisissez un mot de passe sécurisé.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 px-0">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-sm flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Étape 1 : Email */}
            {step === 1 && (
              <form
                onSubmit={form1.handleSubmit(handleRequestCode)}
                className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500"
              >
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Adresse email</Label>
                  <Input
                    type="email"
                    placeholder="nom@etablissement.com"
                    className={cn(
                      'focus-visible:ring-orange-500/30 focus-visible:border-orange-500 h-10 rounded-sm text-sm',
                      form1.formState.errors.email &&
                        'border-red-300 focus-visible:ring-red-500/20 focus-visible:border-red-500',
                    )}
                    {...form1.register('email')}
                  />
                  {form1.formState.errors.email && (
                    <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {form1.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 rounded-sm bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm uppercase tracking-widest transition-all mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? 'Envoi du code...' : 'Envoyer le code'}
                </Button>
              </form>
            )}

            {/* Étape 2 : Vérification OTP */}
            {step === 2 && (
              <form
                onSubmit={form2.handleSubmit(handleVerifyOtp)}
                className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500"
              >
                <div className="rounded-sm border border-orange-100 bg-orange-50/50 px-3 py-2.5 text-xs text-slate-600">
                  <div className="font-bold text-orange-800 uppercase text-[10px] mb-0.5 tracking-wider">Compte ciblé</div>
                  <div>{email}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Code de vérification</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    maxLength={6}
                    className={cn(
                      'text-center tracking-[0.7em] focus-visible:ring-orange-500/30 focus-visible:border-orange-500 h-12 rounded-sm text-sm',
                      form2.formState.errors.otp &&
                        'border-red-300 focus-visible:ring-red-500/20 focus-visible:border-red-500',
                    )}
                    {...form2.register('otp', {
                      onChange: (e) => {
                        // Supprime tout ce qui n'est pas un chiffre
                        e.target.value = e.target.value.replace(/[^0-9]/g, '');
                      }
                    })}
                  />
                  {form2.formState.errors.otp && (
                    <p className="text-[10px] text-red-500 font-bold flex items-center justify-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {form2.formState.errors.otp.message}
                    </p>
                  )}
                </div>

                <p className="text-xs text-slate-500 leading-relaxed text-center">
                  Vous n'avez pas reçu le code ?
                  <button
                    type="button"
                    className="ml-1 text-orange-600 font-bold hover:text-orange-700 hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={handleResendCode}
                    disabled={isLoading || isResending}
                  >
                    {isResending ? 'Renvoi...' : 'Renvoyer le code'}
                  </button>
                </p>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-sm h-11 font-black uppercase text-[10px] tracking-widest border-slate-200"
                  >
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    className="flex-[2] bg-orange-600 hover:bg-orange-700 h-11 rounded-sm font-black uppercase text-[10px] tracking-widest text-white flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Vérification...' : 'Vérifier le code'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}

            {/* Étape 3 : Nouveau mot de passe */}
            {step === 3 && (
              <form
                onSubmit={form3.handleSubmit(handleResetPassword)}
                className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500"
              >
                <div className="rounded-sm border border-emerald-100 bg-emerald-50/50 px-3 py-2 text-xs text-emerald-800">
                  <div className="font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 mb-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Code vérifié
                  </div>
                  <div className="opacity-80 font-medium">Email : {email}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">Nouveau mot de passe</Label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className={cn(
                        'pl-10 focus-visible:ring-orange-500/30 focus-visible:border-orange-500 h-10 rounded-sm text-sm',
                        form3.formState.errors.password &&
                          'border-red-300 focus-visible:ring-red-500/20 focus-visible:border-red-500',
                      )}
                      {...form3.register('password')}
                    />
                  </div>
                  {form3.formState.errors.password && (
                    <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {form3.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">Confirmer le mot de passe</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className={cn(
                      'focus-visible:ring-orange-500/30 focus-visible:border-orange-500 h-10 rounded-sm text-sm',
                      form3.formState.errors.confirmPassword &&
                        'border-red-300 focus-visible:ring-red-500/20 focus-visible:border-red-500',
                    )}
                    {...form3.register('confirmPassword')}
                  />
                  {form3.formState.errors.confirmPassword && (
                    <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {form3.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1 rounded-sm h-11 font-black uppercase text-[10px] tracking-widest border-slate-200"
                  >
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    className="flex-[2] bg-slate-900 hover:bg-black h-11 rounded-sm font-black uppercase text-[10px] tracking-widest text-white flex items-center justify-center gap-2 shadow-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Réinitialisation...' : 'Réinitialiser'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Footer de support */}
        <div className="mt-10 pt-10 border-t border-slate-100 w-full">
          <div className="flex justify-center gap-6">
            <button className="text-[10px] text-slate-400 hover:text-orange-600 font-black uppercase tracking-widest transition-colors">Support Technique</button>
            <button className="text-[10px] text-slate-400 hover:text-orange-600 font-black uppercase tracking-widest transition-colors">Confidentialité</button>
          </div>
          
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] text-center mt-6">
            © {new Date().getFullYear()} Maatics Food
          </p>
        </div>

        </div>
      </div>
    </div>
  )
}