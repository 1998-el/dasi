import { useMemo, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate, Link } from 'react-router-dom'
import { 
  User, Store, ShieldCheck, 
  ArrowRight, CheckCircle2, ChevronLeft, MapPin, 
  Sparkles, AlertCircle, ChevronDown
} from 'lucide-react'
import { CountryDialModal } from '../components/CountryDialModal'
import { cn } from '../lib/utils'
import { AuthCommercialPanel } from '../components/AuthCommercialPanel'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { authService } from './auth.service'
import { useToast, Toast } from '../components/ui/Toast'



// --- Schemas de Validation ---
const step1Schema = yup.object({
  firstName: yup.string().trim().required('Prénom requis'),
  lastName: yup.string().trim().required('Nom requis'),
  email: yup.string().email('Email invalide').required('Email requis'),
  password: yup
    .string()
    .min(6, '6 caractères minimum')
    .max(72, 'Mot de passe trop long')
    .required('Mot de passe requis'),
  phone: yup
    .string()
    .trim()
    .required('Téléphone requis')
    .matches(/^\+?[0-9]{7,15}$/, 'Numéro invalide (ex: +237...)'),
  businessType: yup.string().oneOf(['RESTAURANT', 'RETAIL', 'PHARMACY']).required('Secteur requis'),
})

const step2Schema = yup.object({
  otp: yup.string().length(6, 'Le code doit contenir 6 chiffres').required('Code requis'),
})

const step3Schema = yup.object({
  tenantName: yup.string().trim().required("Nom de l'établissement requis"),
  tenantAddress: yup.string().trim().min(5, 'Adresse trop courte').required('Adresse requise'),
  tenantPhone: yup
    .string()
    .trim()
    .required('Téléphone requis')
    .matches(/^\+?[0-9]{7,15}$/, 'Numéro invalide (ex: +237...)'),
  tenantEmail: yup.string().email('Email invalide').required('Email requis'),
})

// --- Data des adresses au Cameroun ---
const CAMEROON_ADDRESSES = [
  // Yaoundé
  "Bastos, Yaoundé, Cameroun", "Mvan, Yaoundé, Cameroun", "Essos, Yaoundé, Cameroun", "Tsinga, Yaoundé, Cameroun", 
  "Odza, Yaoundé, Cameroun", "Ngousso, Yaoundé, Cameroun", "Mendong, Yaoundé, Cameroun", "Emana, Yaoundé, Cameroun", 
  "Simbock, Yaoundé, Cameroun", "Biyem-Assi, Yaoundé, Cameroun", "Etoudi, Yaoundé, Cameroun", "Elig-Effa, Yaoundé, Cameroun", 
  "Melen, Yaoundé, Cameroun", "Ekounou, Yaoundé, Cameroun", "Santa Barbara, Yaoundé, Cameroun",
  // Douala
  "Akwa, Douala, Cameroun", "Bonanjo, Douala, Cameroun", "Bali, Douala, Cameroun", "Bonapriso, Douala, Cameroun", 
  "Deido, Douala, Cameroun", "New Bell, Douala, Cameroun", "Logbessou, Douala, Cameroun", "Bonamoussadi, Douala, Cameroun", 
  "Kotto, Douala, Cameroun", "Bépanda, Douala, Cameroun", "Ndog-passi, Douala, Cameroun", "Logpom, Douala, Cameroun", 
  "Nyalla, Douala, Cameroun", "Makepe, Douala, Cameroun", "Yassa, Douala, Cameroun",
  // Bafoussam
  "Tamdja, Bafoussam, Cameroun", "Djeleng, Bafoussam, Cameroun", "Kouékong, Bafoussam, Cameroun", 
  "Banengo, Bafoussam, Cameroun", "Bamendzi, Bafoussam, Cameroun", "Kamkop, Bafoussam, Cameroun",
  // Garoua
  "Roumde Adjia, Garoua, Cameroun", "Yelwa, Garoua, Cameroun", "Plateau, Garoua, Cameroun", 
  "Lainde, Garoua, Cameroun", "Marouare, Garoua, Cameroun",
  // Maroua
  "Domayo, Maroua, Cameroun", "Kakatare, Maroua, Cameroun", "Harde, Maroua, Cameroun", "Pitoare, Maroua, Cameroun",
  // Bamenda
  "Commercial Avenue, Bamenda, Cameroun", "Azire, Bamenda, Cameroun", "Nkwen, Bamenda, Cameroun", "Bamendankwe, Bamenda, Cameroun",
  // Kribi
  "Akwa-Nord, Kribi, Cameroun", "Bwang-Manga, Kribi, Cameroun", "Mpangou, Kribi, Cameroun",
  // Limbé
  "Down Beach, Limbé, Cameroun", "Mile 4, Limbé, Cameroun", "Bota, Limbé, Cameroun",
  // Ngaoundéré
  "Baladji, Ngaoundéré, Cameroun", "Dang, Ngaoundéré, Cameroun", "Joli Soir, Ngaoundéré, Cameroun"
];

const WIZARD_STORAGE_KEY = 'register_wizard_state'

type PersistedWizardState = {
  step: number
  registrationData: { userId?: string; email?: string; businessType?: string }
  selectedDial: string
  otpDebugCode?: string | null
}

function readWizardState(): PersistedWizardState | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(WIZARD_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PersistedWizardState>

    return {
      step: [1, 2, 3].includes(parsed.step ?? 1) ? (parsed.step as number) : 1,
      registrationData: parsed.registrationData ?? {},
      selectedDial: parsed.selectedDial ?? '+237',
      otpDebugCode: parsed.otpDebugCode ?? null,
    }
  } catch {
    return null
  }
}

function clearWizardState() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(WIZARD_STORAGE_KEY)
}

export function RegisterPageWizard() {
  const persistedState = readWizardState()
  const [step, setStep] = useState<number>(persistedState?.step ?? 1)

  // Sync step avec l'état backend (onboardingStatus) dès que possible
  const syncStepFromProfile = async (token: string | null) => {
    try {
      console.log('[RegisterPageWizard] syncStepFromProfile token?', !!token)
      if (!token) return
      const current = await authService.getProfile()
      console.log('[RegisterPageWizard] profile onboardingStatus:', current?.onboardingStatus)
      const status = current?.onboardingStatus
      if (!status) {
        console.log('[RegisterPageWizard] profile returned no onboardingStatus')
        return
      }


      if (status === 'AWAITING_OTP') setStep(2)
      else if (status === 'PENDING_ESTABLISHMENT') setStep(3)
      else if (status === 'COMPLETED') {
        clearWizardState()
        navigate('/dashboard')
      }
      else setStep(1)
    } catch (e: any) { // Si la récupération du profil échoue pour une raison quelconque
      console.error('[RegisterPageWizard] syncStepFromProfile failed:', e);
      // Toute erreur lors de la synchronisation du profil signifie que le token est invalide
      // ou que l'utilisateur n'existe plus. On déconnecte et réinitialise le wizard.
      authService.logout(); // Nettoie le token, tenantId et auth_user du localStorage
      clearWizardState(); // Nettoie l'état persistant du wizard
      setStep(1); // Réinitialise le wizard à la première étape
    }
  }

  // au chargement: si token existe on aligne le step
  // (startOnboarding renvoie désormais accessToken)
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    console.log('[RegisterPageWizard] accessToken in localStorage?', !!token)
    void syncStepFromProfile(token)
  }, [])


  const [registrationData, setRegistrationData] = useState<{ userId?: string; email?: string; businessType?: string }>(
    persistedState?.registrationData ?? {},
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isResendingOtp, setIsResendingOtp] = useState(false)
  const [otpDebugCode, setOtpDebugCode] = useState<string | null>(persistedState?.otpDebugCode ?? null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  // Logique d'auto-suggestion pour l'adresse
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleAddressInputChange = (val: string) => {
    if (val.length < 2) {
      setAddressSuggestions([])
      return
    }
    const filtered = CAMEROON_ADDRESSES.filter(addr => addr.toLowerCase().includes(val.toLowerCase())).slice(0, 5)
    setAddressSuggestions(filtered)
    setShowSuggestions(true)
  }

  // Configuration des formulaires
  const form1 = useForm({ resolver: yupResolver(step1Schema) })
  const form2 = useForm({ resolver: yupResolver(step2Schema) })
  const form3 = useForm({ resolver: yupResolver(step3Schema) })

  // --- Handlers (Simulant les appels au AuthService) ---

  const { toast, showSuccess, showError } = useToast()

  const onStep1Submit = async (data: yup.InferType<typeof step1Schema>) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await authService.startOnboarding(data)
      setRegistrationData({ 
        userId: response.userId, 
        email: data.email,
        businessType: data.businessType 
      })
      setOtpDebugCode(response.otpDebugCode ?? null)
      showSuccess(
        response.otpDebugCode
          ? `Compte créé. Code OTP (mode dev): ${response.otpDebugCode}`
          : 'Compte créé : vérifiez votre email pour le code OTP.',
      )
      setStep(2)
    } catch (e: any) {
      const msg = e?.message ?? 'Échec de création du compte'
      showError(msg)
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }


  const onStep2Submit = async (data: yup.InferType<typeof step2Schema>) => {
    setIsLoading(true)
    setError(null)
    try {
      if (!registrationData.email) throw new Error('Email manquant')

      await authService.verifyOtp({
        email: registrationData.email,
        otp: data.otp,
      })

      showSuccess('Code OTP vérifié avec succès.')
      setStep(3)
    } catch (e: any) {
      const msg = e?.message ?? 'Vérification OTP échouée'
      showError(msg)
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const onResendOtp = async () => {
    setIsResendingOtp(true)
    setError(null)

    try {
      if (!registrationData.email) throw new Error('Email manquant')

      const response = await authService.resendOtp()
      setOtpDebugCode(response.otpDebugCode ?? null)

      if (response?.otpDeliveryMode === 'dev') {
        showSuccess(
          response.otpDebugCode
            ? `Nouveau code généré (mode dev): ${response.otpDebugCode}`
            : 'Nouveau code généré en mode dev.',
        )
      } else {
        showSuccess('Nouveau code OTP envoyé avec succès.')
      }
    } catch (e: any) {
      const msg = e?.message ?? 'Impossible de renvoyer le code OTP'
      showError(msg)
      setError(msg)
    } finally {
      setIsResendingOtp(false)
    }
  }


  const onStep3Submit = async (data: yup.InferType<typeof step3Schema>) => {
    setIsLoading(true)
    setError(null)
    try {
      if (!registrationData.userId) throw new Error('ID utilisateur manquant')

      await authService.completeEstablishment({
        ...data,
        businessType: registrationData.businessType || 'RESTAURANT',
      })

      showSuccess('Établissement configuré avec succès. Connectez-vous.')
      clearWizardState()
      authService.logout()
      navigate('/login', { state: { message: 'Compte configuré avec succès ! Connectez-vous.' } })
    } catch (e: any) {
      const msg = e?.message ?? "Échec de configuration du restaurant"
      showError(msg)
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }


type Country = { code: string; dial: string; name: string }

  const countries: Country[] = useMemo(
    () => [
      { code: 'CM', dial: '+237', name: 'Cameroun' },
      { code: 'FR', dial: '+33', name: 'France' },
      { code: 'SN', dial: '+221', name: 'Sénégal' },
      { code: 'CI', dial: '+225', name: 'Côte d’ivoire' },
      { code: 'GA', dial: '+241', name: 'Gabon' },
      { code: 'MG', dial: '+261', name: 'Madagascar' },
      { code: 'NE', dial: '+227', name: 'Niger' },
      { code: 'NG', dial: '+234', name: 'Nigeria' },
      { code: 'MA', dial: '+212', name: 'Maroc' },
      { code: 'TN', dial: '+216', name: 'Tunisie' },
    ],
    [],
  )

  // Logique pour le champ OTP à cases multiples
  const [otpArray, setOtpArray] = useState<string[]>(['', '', '', '', '', ''])

  // Synchronise les cases si un code de debug (dev mode) est reçu
  useEffect(() => {
    if (otpDebugCode && step === 2) {
      const digits = otpDebugCode.split('').slice(0, 6)
      const newArray = ['', '', '', '', '', '']
      digits.forEach((d, i) => newArray[i] = d)
      setOtpArray(newArray)
      form2.setValue('otp', digits.join(''), { shouldValidate: true })
    }
  }, [otpDebugCode, step, form2])

  const handleOtpChange = (index: number, value: string) => {
    // On ne garde que les chiffres
    const sanitized = value.replace(/[^0-9]/g, '')
    if (!sanitized && value !== '') return

    const newOtp = [...otpArray]

    // Gestion du "Coller" (si plus d'un chiffre est détecté)
    if (sanitized.length > 1) {
      const digits = sanitized.split('').slice(0, 6)
      const updatedArray = ['', '', '', '', '', '']
      digits.forEach((d, i) => updatedArray[i] = d)
      setOtpArray(updatedArray)
      form2.setValue('otp', updatedArray.join(''), { shouldValidate: true })
      const nextIdx = Math.min(digits.length, 5)
      document.getElementById(`otp-${nextIdx}`)?.focus()
      return
    }

    newOtp[index] = sanitized.slice(-1) // On ne garde que le dernier caractère saisi
    setOtpArray(newOtp)
    form2.setValue('otp', newOtp.join(''), { shouldValidate: true })

    // Auto-focus sur la case suivante
    if (sanitized && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const [selectedDial, setSelectedDial] = useState(persistedState?.selectedDial ?? '+237')
  const [countryModalOpen, setCountryModalOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const snapshot: PersistedWizardState = {
      step,
      registrationData,
      selectedDial,
      otpDebugCode,
    }

    window.localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(snapshot))
  }, [registrationData, selectedDial, step])

  const steps = [
    { id: 1, label: 'Compte', icon: User },
    { id: 2, label: 'Vérification', icon: ShieldCheck },
    { id: 3, label: 'Restaurant', icon: Store },
  ]

  return (
    <div className="flex h-screen w-full bg-slate-50">
       <div className="fixed top-4 right-4 z-50">
          {toast && <Toast toast={toast} />}
        </div>
    
      <AuthCommercialPanel backLink={{ to: '/login', label: 'Retour à la connexion' }} />
        


      <div className="w-full lg:w-5/12 flex items-center justify-center p-6 sm:p-12">
       
    {/* Section Logo - Visible à gauche sur Desktop */}
        {/* <div className="hidden lg:flex lg:w-2/5 flex-col items-center justify-center pt-24 shrink-0 border">
          <img 
            src="/logo/logo.png" 
            alt="Logo RestoManager" 
            className="w-full max-w-[300px] h-auto object-contain animate-in fade-in slide-in-from-left-12 duration-1000"
          />
          <div className="mt-8 text-center max-w-sm">

            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Simplifiez la gestion de votre établissement et concentrez-vous sur l'essentiel : l'expérience de vos clients.
            </p>
          </div>
        </div> */}
        
    

        <div className="flex-1 w-full max-w-3xl">
        

          {/* Logo visible sur Mobile uniquement */}
          <div className="lg:hidden flex justify-center mb-10">
            <img 
              src="/logo/logo.png" 
              alt="Logo" 
              className="h-24 w-auto object-contain" 
            />
          </div>

          {/* Stepper Header */}
          <div className="mb-8 flex justify-between items-center px-4">
            {steps.map((s, idx) => (
              <div key={s.id} className="flex items-center">
                <div className={cn(
                  "flex flex-col items-center gap-2 transition-all duration-500",
                  step >= s.id ? "text-orange-600" : "text-slate-300"
                )}>
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                    step === s.id ? "bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-200" : 
                    step > s.id ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-200"
                  )}>
                    {step > s.id ? <CheckCircle2 className="h-6 w-6" /> : <s.icon className="h-5 w-5" />}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider">{s.label}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={cn(
                    "h-[2px] w-12 sm:w-20 mx-2 -mt-6 transition-all duration-700",
                    step > s.id ? "bg-emerald-500" : "bg-slate-200"
                  )} />
                )}
              </div>
            ))}
          </div>

          <Card className="border-none bg-transparent shadow-none rounded-sm py-4 px-7">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">
              {step === 1 && "Création de votre compte"}
              {step === 2 && "Vérification de sécurité"}
              {step === 3 && (
                registrationData.businessType === 'PHARMACY' ? "Identité de votre officine" :
                registrationData.businessType === 'RETAIL' ? "Identité de votre boutique" :
                "Identité de votre établissement"
              )}
            </CardTitle>
            <CardDescription className="text-slate-500 text-sm">
              {step === 1 && "Commencez votre voyage avec RestoManager."}
              {step === 2 && `Nous avons envoyé un code à 6 chiffres à votre email.`}
              {step === 3 && "Dernière étape pour configurer votre espace de travail."}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-sm flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* ÉTAPE 1 : Identité Utilisateur */}
            {step === 1 && (
              <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Prénom</Label>
                    <Input {...form1.register('firstName')} placeholder="Jean" className="rounded-sm border-slate-200 h-10" />
                    {form1.formState.errors.firstName && <p className="text-[10px] text-red-500 font-bold">{form1.formState.errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Nom</Label>
                    <Input {...form1.register('lastName')} placeholder="Dupont" className="rounded-sm border-slate-200 h-10" />
                    {form1.formState.errors.lastName && <p className="text-[10px] text-red-500 font-bold">{form1.formState.errors.lastName.message}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Adresse Email</Label>
                  <Input type="email" {...form1.register('email')} placeholder="jean.dupont@resto.com" className="rounded-sm border-slate-200 h-10" />
                  {form1.formState.errors.email && <p className="text-[10px] text-red-500 font-bold">{form1.formState.errors.email.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Téléphone</Label>

                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="h-10 rounded-sm border border-slate-200 bg-slate-50 px-3 flex items-center font-bold text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                          onClick={() => setCountryModalOpen(true)}
                        >
                          {selectedDial}
                        </button>

                        <Input
                          {...form1.register('phone')}
                          placeholder="000 000 000"
                          className="rounded-sm border-slate-200 h-10"
                        />
                      </div>
                    </div>

                    <CountryDialModal
                      open={countryModalOpen}
                      title="Code pays"
                      countries={countries}
                      initialQuery=""
                      initialSelectedDial={selectedDial}
                      onClose={() => setCountryModalOpen(false)}
                      onSelect={({ dial }) => {
                        setSelectedDial(dial)
                        setCountryModalOpen(false)
                      }}
                    />

                    {form1.formState.errors.phone && (
                      <p className="text-[10px] text-red-500 font-bold">{form1.formState.errors.phone.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Mot de passe</Label>
                    <Input type="password" {...form1.register('password')} placeholder="••••••••" className="rounded-sm border-slate-200 h-10" />
                    {form1.formState.errors.password && <p className="text-[10px] text-red-500 font-bold">{form1.formState.errors.password.message}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Secteur d'activité</Label>
                  <div className="relative">
                    <select 
                      {...form1.register('businessType')}
                      className="w-full pl-3 pr-10 h-10 border border-slate-200 rounded-sm text-sm font-bold bg-white focus:outline-none focus:border-orange-500 appearance-none"
                      defaultValue="RESTAURANT"
                    >
                      <option value="RESTAURANT">Restaurant / Café / Bar</option>
                      <option value="RETAIL">Boutique / Commerce</option>
                      <option value="PHARMACY">Pharmacie / Officine</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                  {form1.formState.errors.businessType && <p className="text-[10px] text-red-500 font-bold">{form1.formState.errors.businessType.message}</p>}
                </div>

                <Button type="submit" disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-700 h-11 rounded-sm font-bold text-sm flex items-center justify-center gap-2 mt-4">
                  {isLoading ? "Traitement..." : "Continuer"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            )}

            {/* ÉTAPE 2 : Vérification OTP */}
            {step === 2 && (
              <form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-4">
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {otpArray.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => {
                          // Retour arrière : focus sur la case précédente
                          if (e.key === 'Backspace' && !otpArray[idx] && idx > 0) {
                            document.getElementById(`otp-${idx - 1}`)?.focus()
                          }
                        }}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-2xl font-black border border-slate-200 focus:border-orange-500 rounded-sm outline-none transition-all bg-white"
                        maxLength={idx === 0 ? 6 : 1} // Permet de coller sur la 1ère case
                      />
                    ))}
                    {/* Champ caché pour la validation react-hook-form */}
                    <input type="hidden" {...form2.register('otp')} />
                  </div>
                  {form2.formState.errors.otp && <p className="text-center text-xs text-red-500 font-bold">{form2.formState.errors.otp.message}</p>}
                  {/* {otpDebugCode && (
                    <div className="mx-auto max-w-sm rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs font-semibold text-amber-800">
                      Code OTP dev: <span className="tracking-[0.2em]">{otpDebugCode}</span>
                    </div>
                  )} */}
                  <p className="text-center text-xs text-slate-500">
                                        Vous n'avez pas reçu le code ?{' '}
                    <button
                      type="button"
                      className="text-orange-600 font-bold hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={onResendOtp}
                      disabled={isLoading || isResendingOtp}
                    >
                      {isResendingOtp ? 'Envoi...' : 'Renvoyer'}
                    </button>
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-sm h-11 font-bold border-slate-200">
                    Retour
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-[2] bg-orange-600 hover:bg-orange-700 h-11 rounded-sm font-bold text-sm">
                    {isLoading ? "Vérification..." : "Vérifier le code"}
                  </Button>
                </div>
              </form>
            )}

            {/* ÉTAPE 3 : Configuration Restaurant */}
            {step === 3 && (
              <form onSubmit={form3.handleSubmit(onStep3Submit)} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Nom de l'établissement</Label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input {...form3.register('tenantName')} className="pl-10 h-11 rounded-sm border-slate-200" placeholder="ex: Saveurs d'Afrique" />
                  </div>
                  {form3.formState.errors.tenantName && <p className="text-[10px] text-red-500 font-bold">{form3.formState.errors.tenantName.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Adresse Physique</Label>
                  <div className="relative group">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      {...form3.register('tenantAddress')} 
                      onChange={(e) => {
                        form3.register('tenantAddress').onChange(e);
                        handleAddressInputChange(e.target.value);
                      }}
                      autoComplete="off"
                      className="pl-10 h-11 rounded-sm border-slate-200" 
                      placeholder="Quartier, Ville, Pays" 
                    />
                    
                    {/* Liste des suggestions */}
                    {showSuggestions && addressSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-sm shadow-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                        {addressSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 hover:text-orange-700 transition-colors border-b border-slate-50 last:border-none flex items-center gap-2"
                            onClick={() => {
                              form3.setValue('tenantAddress', suggestion, { shouldValidate: true });
                              setAddressSuggestions([]);
                              setShowSuggestions(false);
                            }}
                          >
                            <MapPin className="h-3 w-3 opacity-40" />
                            <span className="font-medium">{suggestion}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Email Contact</Label>
                    <Input type="email" {...form3.register('tenantEmail')} className="h-10 rounded-sm border-slate-200" placeholder="contact@restaurant.com" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Téléphone Fixe/Pro</Label>
                    <Input {...form3.register('tenantPhone')} className="h-10 rounded-sm border-slate-200" placeholder="+237 ..." />
                    {form3.formState.errors.tenantPhone && (
                      <p className="text-[10px] text-red-500 font-bold">{form3.formState.errors.tenantPhone.message}</p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-sm flex items-start gap-3">
                  {/* <Sparkles className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" /> */}
                  <p className="text-[11px] text-orange-800 leading-relaxed font-medium">
                    Une fois validé, nous allons générer votre espace de travail personnalisé et configurer vos premiers accès.
                  </p>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-700 h-12 rounded-sm font-bold text-sm shadow-none mt-4">
                  {isLoading ? "Initialisation..." : "Terminer l'installation"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-2 text-center ">
          {/* <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
            © 2025 Maatics Food • innovation by you
          </p> */}
          <div className="flex justify-center gap-6">
            <button className="text-[10px] text-slate-400 hover:text-orange-600 font-bold transition-colors">Support Technique</button>
            <button className="text-[10px] text-slate-400 hover:text-orange-600 font-bold transition-colors">Confidentialité</button>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
