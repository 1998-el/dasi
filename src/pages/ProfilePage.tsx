import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import { authService } from './auth.service'
import { useToast, Toast } from '../components/ui/Toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Store, 
  MapPin, 
  Phone, 
  Lock, 
  Save, 
  Loader2,
  Camera,
  BadgeCheck
} from 'lucide-react'
import { cn } from '../lib/utils'

export function ProfilePage() {
  const { user } = useAuth()
  const { toast, showSuccess, showError } = useToast()
  
  const [profile, setProfile] = useState<any>(null)
  const [isFetching, setIsFetching] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  })

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile()
        setProfile(data)
        setPersonalInfo({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || ''
        })
      } catch (e: any) {
        showError(e.message || "Erreur de chargement du profil")
      } finally {
        setIsFetching(false)
      }
    }
    fetchProfile()
  }, [showError])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      await authService.updateProfile(personalInfo)
      showSuccess("Informations personnelles mises à jour")
    } catch (e: any) {
      showError(e.message || "Erreur de mise à jour")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError("Les mots de passe ne correspondent pas")
      return
    }
    setIsChangingPassword(true)
    try {
      await authService.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      })
      showSuccess("Mot de passe modifié avec succès")
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (e: any) {
      showError(e.message || "Échec du changement de mot de passe")
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (isFetching) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
          <p className="text-sm text-slate-500 font-medium">Chargement de votre profil...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="fixed top-4 right-4 z-[100]">
        {toast && <Toast toast={toast} />}
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mon Profil</h1>
        <p className="text-sm text-slate-500">Gérez vos informations personnelles et les paramètres de sécurité.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Colonne de Gauche : Aperçu */}
        <div className="space-y-6">
          <Card className="text-center">
            <CardContent className="pt-8">
              <div className="relative inline-block mb-4">
                <div className="h-24 w-24 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-12 w-12 text-slate-300" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-orange-600 text-white rounded-full border-2 border-white hover:bg-orange-700 transition-colors shadow-sm">
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              
              <h2 className="text-lg font-bold text-slate-900">{profile?.firstName} {profile?.lastName}</h2>
              <p className="text-sm text-slate-500 mb-4">{profile?.email}</p>
              
              <div className="flex items-center justify-center gap-2">
                <span className="px-2.5 py-1 bg-orange-50 border border-orange-100 text-orange-700 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Shield className="h-3 w-3" />
                  {user?.role}
                </span>
                {profile?.onboardingStatus === 'COMPLETED' && (
                  <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <BadgeCheck className="h-3 w-3" />
                    Vérifié
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Établissement rattaché */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-50">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Store className="h-4 w-4 text-orange-600" />
                Établissement
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nom</p>
                <p className="text-sm font-bold text-slate-700">{profile?.tenant?.name || profile?.establishmentName || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Adresse</p>
                <div className="flex items-start gap-1.5 text-sm text-slate-600">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 text-slate-400" />
                  <span>{profile?.tenant?.address || "Non renseignée"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne de Droite : Formulaires */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Informations Personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations Personnelles</CardTitle>
              <CardDescription>Mettez à jour vos coordonnées de contact.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Prénom</Label>
                    <Input 
                      value={personalInfo.firstName}
                      onChange={e => setPersonalInfo({...personalInfo, firstName: e.target.value})}
                      className="h-10 rounded-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nom</Label>
                    <Input 
                      value={personalInfo.lastName}
                      onChange={e => setPersonalInfo({...personalInfo, lastName: e.target.value})}
                      className="h-10 rounded-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                      <Input 
                        disabled 
                        value={profile?.email}
                        className="h-10 rounded-sm pl-10 bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                      <Input 
                        value={personalInfo.phone}
                        onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})}
                        className="h-10 rounded-sm pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    type="submit"
                    disabled={isUpdating}
                    className="bg-orange-600 hover:bg-orange-700 text-white rounded-sm h-10 px-8 flex items-center gap-2 transition-colors"
                  >
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Enregistrer les modifications
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Sécurité */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sécurité</CardTitle>
              <CardDescription>Changez votre mot de passe pour protéger votre compte.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="space-y-2 max-w-md">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mot de passe actuel</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input 
                      type="password"
                      value={passwordData.oldPassword}
                      onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})}
                      className="h-10 rounded-sm pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                      <Input 
                        type="password"
                        value={passwordData.newPassword}
                        onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="h-10 rounded-sm pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Confirmer le mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                      <Input 
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="h-10 rounded-sm pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    type="submit"
                    disabled={isChangingPassword}
                    variant="outline"
                    className="rounded-sm h-10 px-8 flex items-center gap-2 border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                    Mettre à jour le mot de passe
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  )
}