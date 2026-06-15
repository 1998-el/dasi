import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { DashboardLayout } from '../components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { 
  Store, 
  Clock, 
  Bell, 
  Globe, 
  Loader2,
  Save,
  Settings,
  Building2,
  Users,
  AlertCircle,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Clock4,
  Percent,
  UserCheck,
  Stethoscope
} from 'lucide-react'
import { authService } from './auth.service'
import { useAuth } from '../context/AuthContext'
import { useToast, Toast } from '../components/ui/Toast'
import { cn } from '../lib/utils'

// ============ TYPES ============
type SettingsTab = 'general' | 'business' | 'hr' | 'notifications'

interface EstablishmentConfig {
  name: string
  email: string
  phone: string
  address: string
  currency: 'XAF' | 'EUR'
  taxRate: number
}

interface HrConfig {
  overtimeThresholdPerWeek: number
  payDay: number
  socialSecurityRate: number
  enableAutoPayroll: boolean
}

interface RestaurantConfig {
  openingTime: string
  closingTime: string
  autoPrintTickets: boolean
  manualKitchenConfirmation: boolean
  acceptMobileMoney: boolean
  acceptCreditCard: boolean
}

// ============ DONNÉES STATIQUES ============
const CURRENCIES = [
  { value: 'XAF', label: 'FCFA (XAF)', symbol: 'FCFA' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' }
]

const PAY_DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

// ============ COMPOSANTS RÉUTILISABLES ============
const SettingsSidebar = ({ activeTab, onTabChange, businessConfig }: { 
  activeTab: SettingsTab
  onTabChange: (tab: SettingsTab) => void
  businessConfig: any
}) => {
  const items: { id: SettingsTab; label: string; icon: any; description: string }[] = [
    { id: 'general', label: 'Établissement', icon: Building2, description: 'Infos légales et fiscales' },
    { id: 'business', label: businessConfig.type === 'RESTAURANT' ? 'Restaurant' : (businessConfig.type === 'PHARMACY' ? 'Officine' : 'Boutique'), icon: businessConfig.type === 'PHARMACY' ? Stethoscope : Store, description: 'Service et workflow' },
    { id: 'hr', label: 'Ressources Humaines', icon: Users, description: 'Paie et règlements' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alertes et rappels' },
  ]

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

const ToggleSwitch = ({ label, description, checked, onChange }: { 
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}) => (
  <div className="flex items-center justify-between p-4 rounded-sm border border-slate-100 bg-white hover:border-orange-200 transition-all">
    <div className="space-y-0.5">
      <p className="text-sm font-medium text-slate-800">{label}</p>
      {description && (
        <p className="text-xs text-slate-400">{description}</p>
      )}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
        checked ? "bg-orange-600" : "bg-slate-200"
      )}
    >
      <span className={cn(
        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white transition duration-200",
        checked ? "translate-x-5" : "translate-x-0"
      )} />
    </button>
  </div>
)

// ============ COMPOSANT PRINCIPAL ============
export function SettingsPage() {
  const { i18n } = useTranslation()
  const { businessConfig } = useAuth()
  const { toast, showSuccess, showError } = useToast()
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [isFetching, setIsFetching] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  const [establishment, setEstablishment] = useState<EstablishmentConfig>({
    name: '', email: '', phone: '', address: '', currency: 'XAF', taxRate: 19.25
  })
  const [hrConfig, setHrConfig] = useState<HrConfig>({
    overtimeThresholdPerWeek: 40, payDay: 30, socialSecurityRate: 0.15, enableAutoPayroll: false
  })
  const [restaurantConfig, setRestaurantConfig] = useState<RestaurantConfig>({
    openingTime: '08:00', closingTime: '22:00', autoPrintTickets: true,
    manualKitchenConfirmation: false, acceptMobileMoney: true, acceptCreditCard: true
  })

  const [retailConfig, setRetailConfig] = useState({
    enableBarcodeScanning: true,
    loyaltyProgramEnabled: false,
    defaultPaymentMethod: 'CASH' as 'CASH' | 'CARD',
  });

  const [pharmacyConfig, setPharmacyConfig] = useState({
    requirePrescriptionValidation: true,
    enableFEFOByDefault: true,
    allowPartialDispensation: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({})

  const [isChangingLanguage, setIsChangingLanguage] = useState(false)
  const handleLanguageChange = async (lang: string) => {
    if (i18n.language === lang || isChangingLanguage) return
    setIsChangingLanguage(true)
    await i18n.changeLanguage(lang)
    setTimeout(() => setIsChangingLanguage(false), 600)
  }

  const loadSettings = useCallback(async () => {
    setIsFetching(true)
    try {
      const [profile, hrData] = await Promise.all([
        authService.getProfile(),
        authService.getHrConfig(),
        authService.getBusinessSettings(businessConfig.type) // Charger la config spécifique au métier
      ])
      
      if (profile?.tenant) {
        setEstablishment(prev => ({ ...prev, ...profile.tenant }))
      }
      // Charger les configs spécifiques au métier depuis le backend
      if (businessConfig.type === 'RESTAURANT' && hrData) { setRestaurantConfig(hrData); } 
      if (businessConfig.type === 'RETAIL' && hrData) { setRetailConfig(hrData); } 
      if (businessConfig.type === 'PHARMACY' && hrData) { setPharmacyConfig(hrData); } 

      if (hrData) {
        setHrConfig(prev => ({ ...prev, ...hrData }))
      }
    } catch (e: any) {
      showError("Impossible de charger les paramètres")
    } finally {
      setIsFetching(false)
    }
  }, [showError])

  useEffect(() => { loadSettings() }, [loadSettings])

  const validateGeneralTab = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!establishment.name.trim()) newErrors.name = "Le nom est requis"
    if (!establishment.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = "Email invalide"
    if (!establishment.phone.trim()) newErrors.phone = "Le téléphone est requis"
    if (establishment.taxRate < 0 || establishment.taxRate > 100) newErrors.taxRate = "TVA doit être entre 0 et 100"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (activeTab === 'general' && !validateGeneralTab()) return
    
    setIsProcessing(true)
    try {
      switch (activeTab) {
        case 'hr':
          await authService.updateHrConfig(hrConfig)
          break
        case 'general':
          await authService.completeEstablishment(establishment)
          break
        case 'business':
          await authService.updateBusinessSettings(
            businessConfig.type, 
            businessConfig.type === 'RESTAURANT' ? restaurantConfig :
            businessConfig.type === 'RETAIL' ? retailConfig :
            pharmacyConfig
          );
          
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

      <div className="flex flex-col lg:flex-row gap-8 ">
        <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} businessConfig={businessConfig} />

        <div className="flex-1 max-w-2xl p-6 rounded-sm border border-slate-200 bg-white">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Onglet Général */}
            {activeTab === 'general' && (
              <FormSection title="Informations légales" icon={Building2}>
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

                  <FormField label="Nom de l'établissement" icon={Store} error={errors.name}>
                    <Input 
                      value={establishment.name}
                      onChange={e => {
                        setEstablishment({...establishment, name: e.target.value})
                        setHasChanges(true)
                      }}
                      className="h-11 rounded-sm border-slate-200 font-medium"
                      placeholder="Restaurant Le Gourmet"
                    />
                  </FormField>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField label="Email" icon={Mail} error={errors.email}>
                      <Input 
                        type="email"
                        value={establishment.email}
                        onChange={e => {
                          setEstablishment({...establishment, email: e.target.value})
                          setHasChanges(true)
                        }}
                        className="h-11 rounded-sm"
                      />
                    </FormField>
                    
                    <FormField label="Téléphone" icon={Phone} error={errors.phone}>
                      <Input 
                        value={establishment.phone}
                        onChange={e => {
                          setEstablishment({...establishment, phone: e.target.value})
                          setHasChanges(true)
                        }}
                        className="h-11 rounded-sm"
                      />
                    </FormField>
                  </div>

                  <FormField label="Adresse" icon={MapPin}>
                    <Input 
                      value={establishment.address}
                      onChange={e => {
                        setEstablishment({...establishment, address: e.target.value})
                        setHasChanges(true)
                      }}
                      className="h-11 rounded-sm"
                      placeholder="123 Avenue principale, Douala"
                    />
                  </FormField>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField label="Devise" icon={DollarSign}>
                      <select 
                        value={establishment.currency}
                        onChange={e => {
                          setEstablishment({...establishment, currency: e.target.value as 'XAF' | 'EUR'})
                          setHasChanges(true)
                        }}
                        className="w-full h-11 px-3 border border-slate-200 rounded-sm text-sm bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                      >
                        {CURRENCIES.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </FormField>

                    <FormField label="Taux TVA (%)" icon={Percent} error={errors.taxRate}>
                      <Input 
                        type="number"
                        step="0.01"
                        value={establishment.taxRate}
                        onChange={e => {
                          setEstablishment({...establishment, taxRate: parseFloat(e.target.value)})
                          setHasChanges(true)
                        }}
                        className="h-11 rounded-sm"
                      />
                    </FormField>
                  </div>
                </div>
              </FormSection>
            )}

            {/* Onglet Business (Restaurant) */}
            {activeTab === 'business' && businessConfig.type === 'RESTAURANT' && (
              <FormSection title="Horaires & Services" icon={Clock}>
                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField label="Heure d'ouverture" icon={Clock4}>
                      <Input 
                        type="time"
                        value={restaurantConfig.openingTime}
                        onChange={e => {
                          setRestaurantConfig({...restaurantConfig, openingTime: e.target.value})
                          setHasChanges(true)
                        }}
                        className="h-11 rounded-sm"
                      />
                    </FormField>
                    
                    <FormField label="Heure de fermeture" icon={Clock4}>
                      <Input 
                        type="time"
                        value={restaurantConfig.closingTime}
                        onChange={e => {
                          setRestaurantConfig({...restaurantConfig, closingTime: e.target.value})
                          setHasChanges(true)
                        }}
                        className="h-11 rounded-sm"
                      />
                    </FormField>
                  </div>

                  <div className="space-y-3 pt-2">
                    <ToggleSwitch 
                      label="Impression automatique des tickets"
                      description="Génère automatiquement un ticket après chaque commande"
                      checked={restaurantConfig.autoPrintTickets}
                      onChange={(val) => {
                        setRestaurantConfig({...restaurantConfig, autoPrintTickets: val})
                        setHasChanges(true)
                      }}
                    />
                    
                    <ToggleSwitch 
                      label="Confirmation cuisine manuelle"
                      description="Le staff doit valider les commandes avant envoi en cuisine"
                      checked={restaurantConfig.manualKitchenConfirmation}
                      onChange={(val) => {
                        setRestaurantConfig({...restaurantConfig, manualKitchenConfirmation: val})
                        setHasChanges(true)
                      }}
                    />

                    <div className="border-t border-slate-100 pt-3 mt-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <CreditCard className="h-3 w-3" />
                        Moyens de paiement acceptés
                      </p>
                      <div className="space-y-3">
                        <ToggleSwitch 
                          label="Mobile Money (Orange/MTN)"
                          checked={restaurantConfig.acceptMobileMoney}
                          onChange={(val) => {
                            setRestaurantConfig({...restaurantConfig, acceptMobileMoney: val})
                            setHasChanges(true)
                          }}
                        />
                        <ToggleSwitch 
                          label="Carte bancaire"
                          checked={restaurantConfig.acceptCreditCard}
                          onChange={(val) => {
                            setRestaurantConfig({...restaurantConfig, acceptCreditCard: val})
                            setHasChanges(true)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </FormSection>
            )}

            {/* Onglet Business (Retail) */}
            {activeTab === 'business' && businessConfig.type === 'RETAIL' && (
              <FormSection title="Paramètres de la Boutique" icon={Store}>
                <div className="space-y-5">
                  <ToggleSwitch
                    label="Activer le scan de code-barres"
                    description="Permet d'ajouter des produits au panier via un scanner"
                    checked={retailConfig.enableBarcodeScanning}
                    onChange={(val) => {
                      setRetailConfig({...retailConfig, enableBarcodeScanning: val})
                      setHasChanges(true)
                    }}
                  />
                  <ToggleSwitch
                    label="Activer le programme de fidélité"
                    description="Gère les points ou réductions pour les clients fidèles"
                    checked={retailConfig.loyaltyProgramEnabled}
                    onChange={(val) => {
                      setRetailConfig({...retailConfig, loyaltyProgramEnabled: val})
                      setHasChanges(true)
                    }}
                  />
                  <FormField label="Méthode de paiement par défaut" icon={CreditCard}>
                    <select
                      value={retailConfig.defaultPaymentMethod}
                      onChange={e => {
                        setRetailConfig({...retailConfig, defaultPaymentMethod: e.target.value as 'CASH' | 'CARD'})
                        setHasChanges(true)
                      }}
                      className="w-full h-11 px-3 border border-slate-200 rounded-sm text-sm bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                    >
                      <option value="CASH">Espèces</option>
                      <option value="CARD">Carte Bancaire</option>
                    </select>
                  </FormField>
                </div>
              </FormSection>
            )}

            {/* Onglet Business (Pharmacy) */}
            {activeTab === 'business' && businessConfig.type === 'PHARMACY' && (
              <FormSection title="Paramètres de l'Officine" icon={Stethoscope}>
                <div className="space-y-5">
                  <ToggleSwitch
                    label="Validation de prescription requise"
                    description="Exige une validation pour les produits sous ordonnance"
                    checked={pharmacyConfig.requirePrescriptionValidation}
                    onChange={(val) => {
                      setPharmacyConfig({...pharmacyConfig, requirePrescriptionValidation: val})
                      setHasChanges(true)
                    }}
                  />
                  <ToggleSwitch
                    label="Gestion FEFO par défaut"
                    description="Priorise les lots avec la date de péremption la plus proche"
                    checked={pharmacyConfig.enableFEFOByDefault}
                    onChange={(val) => {
                      setPharmacyConfig({...pharmacyConfig, enableFEFOByDefault: val})
                      setHasChanges(true)
                    }}
                  />
                  {/* Ajoutez d'autres options spécifiques à la pharmacie ici */}
                </div>
              </FormSection>
            )}

            {/* Onglet RH */}
            {activeTab === 'hr' && (
              <FormSection title="Configuration RH" icon={UserCheck}>
                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField label="Seuil heures sup / semaine" icon={Clock}>
                      <Input 
                        type="number"
                        value={hrConfig.overtimeThresholdPerWeek}
                        onChange={e => {
                          setHrConfig({...hrConfig, overtimeThresholdPerWeek: parseInt(e.target.value)})
                          setHasChanges(true)
                        }}
                        className="h-11 rounded-sm"
                      />
                    </FormField>
                    
                    <FormField label="Jour de paie" icon={Calendar}>
                      <select 
                        value={hrConfig.payDay}
                        onChange={e => {
                          setHrConfig({...hrConfig, payDay: parseInt(e.target.value)})
                          setHasChanges(true)
                        }}
                        className="w-full h-11 px-3 border border-slate-200 rounded-sm text-sm bg-white"
                      >
                        {PAY_DAYS.map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </FormField>
                  </div>

                  <FormField label="Taux cotisation sociale (%)" icon={Percent}>
                    <Input 
                      type="number"
                      step="0.01"
                      value={hrConfig.socialSecurityRate * 100}
                      onChange={e => {
                        setHrConfig({...hrConfig, socialSecurityRate: parseFloat(e.target.value) / 100})
                        setHasChanges(true)
                      }}
                      className="h-11 rounded-sm"
                    />
                  </FormField>

                  <ToggleSwitch 
                    label="Paie automatique"
                    description="Génération automatique des bulletins de paie chaque mois"
                    checked={hrConfig.enableAutoPayroll}
                    onChange={(val) => {
                      setHrConfig({...hrConfig, enableAutoPayroll: val})
                      setHasChanges(true)
                    }}
                  />
                </div>
              </FormSection>
            )}

            {/* Bouton de sauvegarde */}
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