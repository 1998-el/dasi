import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { DashboardLayout } from '../components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Globe, Loader2, Save, Settings, AlertCircle, Phone, Mail, User } from 'lucide-react'
import { authService } from './auth.service'
import { useAuth } from '../context/AuthContext'
import { useToast, Toast } from '../components/ui/Toast'
import { cn } from '../lib/utils'

// ------------------------------------------------
// 1. TYPES
// ------------------------------------------------
type SettingsTab = 'general' | 'account'

interface EstablishmentConfig {
  name: string
  email: string
  phone: string
  address: string
  currency: 'XAF' | 'EUR'
  taxRate: number
}

interface AccountConfig {
  firstName: string
  lastName: string
  email: string
  phone: string
}

// ------------------------------------------------
// 2. CONSTANTES
// ------------------------------------------------

// ------------------------------------------------
// 3. COMPOSANTS UI
// ------------------------------------------------
const SettingsSidebar = ({ activeTab, onTabChange, businessConfig }: { 
  activeTab: SettingsTab
  onTabChange: (tab: SettingsTab) => void
  businessConfig: any
}) => {
  const items: { id: SettingsTab; label: string; icon: any; description: string }[] = [
    { id: 'account', label: 'Mon Compte', icon: User, description: 'Infos personnelles' }
  ].filter(Boolean) as { id: SettingsTab; label: string; icon: any; description: string }[]

  return (
    <div className="lg:w-72 space-y-1 shrink-0">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={cn(
            "w-full flex items-start gap-3 px-4 py-3 rounded-sm transition-all text-left",
            activeTab === item.id 
              ? "bg-orange-50 border-l-4 border-orange-500" 
              : "hover:bg-slate-50 border-l-4 border-transparent"
          )}
        >
          <item.icon className={cn(
            "h-5 w-5 mt-0.5 transition-colors",
            activeTab === item.id ? "text-orange-600" : "text-slate-400 group-hover:text-slate-600"
          )} />
          <div>
            <p className={cn(
              "text-sm font-bold transition-colors",
              activeTab === item.id ? "text-orange-900" : "text-slate-700"
            )}>
              {item.label}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

const FormSection = ({ title, icon: Icon, children }: { 
  title: string
  icon?: any
  children: React.ReactNode 
}) => (
  <Card className="rounded-sm border-slate-200">
    {title && (
      <CardHeader className="border-b border-slate-100 bg-slate-50/30">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700">
          {Icon && <Icon className="h-4 w-4 text-orange-500" />}
          {title}
        </CardTitle>
      </CardHeader>
    )}
    <CardContent className="pt-6">
      {children}
    </CardContent>
  </Card>
)

const FormField = ({ label, icon: Icon, children, error }: {
  label: string
  icon?: any
  children: React.ReactNode
  error?: string
}) => (
  <div className="space-y-1.5">
    <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </Label>
    {children}
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
        <AlertCircle className="h-3 w-3" />
        {error}
      </p>
    )}
  </div>
)

// ------------------------------------------------
// 4. PAGE PRINCIPALE
// ------------------------------------------------
export function SettingsPage() {
  const { i18n } = useTranslation()
  const { businessConfig } = useAuth()
  const { toast, showSuccess, showError } = useToast()
  const [activeTab, setActiveTab] = useState<SettingsTab>('account')
  const [isFetching, setIsFetching] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  const [establishment, setEstablishment] = useState<EstablishmentConfig>({
    name: '', email: '', phone: '', address: '', currency: 'XAF', taxRate: 19.25
  })
  const [account, setAccount] = useState<AccountConfig>({
    firstName: '', lastName: '', email: '', phone: ''
  })
  const [isChangingLanguage, setIsChangingLanguage] = useState(false)

  // --- Gestion langue ---
  const handleLanguageChange = async (lang: string) => {
    if (i18n.language === lang || isChangingLanguage) return
    setIsChangingLanguage(true)
    await i18n.changeLanguage(lang)
    setTimeout(() => setIsChangingLanguage(false), 600)
  }

  // --- Chargement ---
  const loadSettings = useCallback(async () => {
    setIsFetching(true)
    try {
      const profile = await authService.getProfile()
      
      if (profile?.tenant) {
        setEstablishment(prev => ({ ...prev, ...profile.tenant }))
      }

      if (profile?.user || profile) {
        const userData = profile?.user || profile
        setAccount(prev => ({
          firstName: userData.firstName || prev.firstName,
          lastName: userData.lastName || prev.lastName,
          email: userData.email || prev.email,
          phone: userData.phone || prev.phone
        }))
      }
    } catch (e: any) {
      showError("Impossible de charger les paramètres")
    } finally {
      setIsFetching(false)
    }
  }, [showError, businessConfig.type])

  useEffect(() => { loadSettings() }, [loadSettings])

  // --- Validation ---
  const validateGeneralTab = (): boolean => {
    const newErrors: Record<string, string> = {}
    return Object.keys(newErrors).length === 0
  }

  // --- Sauvegarde ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (activeTab === 'general' && !validateGeneralTab()) return
    
    setIsProcessing(true)
    try {
      switch (activeTab) {
        case 'general':
          await authService.completeEstablishment(establishment)
          break
        case 'account':
          await authService.updateProfile({
            firstName: account.firstName,
            lastName: account.lastName,
            email: account.email,
            phone: account.phone
          })
          break
      }
      showSuccess("Paramètres enregistrés avec succès")
      setHasChanges(false)
    } catch (e: any) {
      showError(e.message || "Erreur lors de l'enregistrement")
    } finally {
      setIsProcessing(false)
    }
  }

  // --- Blocage fermeture onglet ---
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges])

  // --- Loading ---
  if (isFetching) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
          <p className="text-sm text-slate-500">Chargement de la configuration...</p>
        </div>
      </DashboardLayout>
    )
  }

  // --- Rendu ---
  return (
    <DashboardLayout>
      <div className="fixed top-4 right-4 z-[100]">
        {toast && <Toast toast={toast} />}
      </div>

      {/* En-tête */}
      <div className="mb-8 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-50 rounded-sm">
            <Settings className="h-5 w-5 text-orange-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Configuration</h1>
        </div>
        <p className="text-sm text-slate-500 ml-12">
          Personnalisez les paramètres de votre établissement
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} businessConfig={businessConfig} />

        <div className="flex-1 max-w-2xl p-6 rounded-sm border border-slate-200 bg-white">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Compte */}
            {activeTab === 'account' && (
              <FormSection title="Informations du compte" icon={User}>
                <div className="space-y-5">
                  <FormField label="Langue de l'interface" icon={Globe}>
                    <div className="flex gap-2">
                      {['fr', 'en'].map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => handleLanguageChange(lang)}
                          disabled={isChangingLanguage}
                          className={cn(
                            "flex-1 h-10 rounded-sm border font-bold text-xs uppercase transition-all flex items-center justify-center gap-2",
                            i18n.language === lang 
                              ? "bg-orange-600 border-orange-600 text-white shadow-md" 
                              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50",
                            isChangingLanguage && i18n.language !== lang && "opacity-50"
                          )}
                        >
                          {isChangingLanguage && i18n.language === lang ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            lang === 'fr' ? 'Français' : 'English'
                          )}
                        </button>
                      ))}
                    </div>
                  </FormField>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField label="Prénom" icon={User}>
                      <Input 
                        value={account.firstName}
                        onChange={e => {
                          setAccount({...account, firstName: e.target.value})
                          setHasChanges(true)
                        }}
                        className="h-11 rounded-sm"
                        placeholder="Jean"
                      />
                    </FormField>
                    <FormField label="Nom" icon={User}>
                      <Input 
                        value={account.lastName}
                        onChange={e => {
                          setAccount({...account, lastName: e.target.value})
                          setHasChanges(true)
                        }}
                        className="h-11 rounded-sm"
                        placeholder="Dupont"
                      />
                    </FormField>
                  </div>

                  <FormField label="Email" icon={Mail}>
                    <Input 
                      type="email"
                      value={account.email}
                      onChange={e => {
                        setAccount({...account, email: e.target.value})
                        setHasChanges(true)
                      }}
                      className="h-11 rounded-sm"
                    />
                  </FormField>

                  <FormField label="Téléphone" icon={Phone}>
                    <Input 
                      value={account.phone}
                      onChange={e => {
                        setAccount({...account, phone: e.target.value})
                        setHasChanges(true)
                      }}
                      className="h-11 rounded-sm"
                    />
                  </FormField>
                </div>
              </FormSection>
            )}

            {/* Actions */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between gap-4">
                {hasChanges && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Modifications non enregistrées
                  </p>
                )}
                <Button 
                  type="submit" 
                  disabled={isProcessing}
                  className={cn(
                    "ml-auto h-11 px-8 rounded-sm font-bold text-xs uppercase tracking-wider flex items-center gap-2",
                    "bg-orange-600 hover:bg-orange-700 text-white"
                  )}
                >
                  {isProcessing ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Enregistrement...</>
                  ) : (
                    <><Save className="h-4 w-4" /> Sauvegarder</>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}