import { useState } from 'react'
import { Menu, Bell, Store, ChevronDown, User, Settings, LogOut, Globe, StickyNote, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { FloatingNote } from './FloatingNote'
import { cn } from '../lib/utils'

interface TopbarProps {
  toggleSidebar: () => void
}

export function Topbar({ toggleSidebar }: TopbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { user, logout, tenantName } = useAuth()
  const { i18n, t } = useTranslation()
  const [isNoteOpen, setIsNoteOpen] = useState(false)
  const [isChangingLanguage, setIsChangingLanguage] = useState(false)

  const handleLanguageChange = async () => {
    if (isChangingLanguage) return
    setIsChangingLanguage(true)
    const nextLang = i18n.language === 'fr' ? 'en' : 'fr'
    await i18n.changeLanguage(nextLang)
    setTimeout(() => setIsChangingLanguage(false), 600) // Délai pour un meilleur feedback visuel
  }

  const roleLabels: Record<string, string> = {
    admin: t('settings.roles.admin', 'Administrateur'),
    manager: t('settings.roles.manager', 'Gestionnaire'),
    waiter: t('settings.roles.waiter', 'Serveur'),
    kitchen: t('settings.roles.kitchen', 'Cuisine'),
  }

  const hasUnreadNotifications = true

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
      
      {/* Partie Gauche : Mobile Toggle & Contexte Établissement */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-sm text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Sélecteur d'établissement (Sobre & Pro) */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
          <Store className="h-4 w-4 text-slate-500 rounded-sm" />
          <span className="text-xs font-semibold tracking-wide">{tenantName || 'Mon Établissement'}</span>
          {/* <ChevronDown className="h-3 w-3 text-slate-400 ml-1" /> */}
        </div>
      </div>

      {/* Partie Droite : Actions, Notifications & Profil */}
      <div className="flex items-center gap-4">
        
        {/* Bloc-notes Flottant */}
        <button 
          onClick={() => setIsNoteOpen(!isNoteOpen)}
          className={cn(
            "p-2 rounded-sm transition-all focus:outline-none",
            isNoteOpen 
              ? "text-orange-600 bg-orange-50 shadow-inner ring-1 ring-orange-200" 
              : "text-slate-500 hover:text-orange-600 hover:bg-orange-50"
          )}
        >
          <StickyNote className="h-4 w-4" />
        </button>

        <div className="h-6 w-px bg-slate-200" />
        
        {/* Sélecteur de Langue */}
        <button 
          onClick={handleLanguageChange}
          disabled={isChangingLanguage}
          className={cn(
            "flex items-center gap-1.5 p-2 rounded-sm transition-all focus:outline-none min-w-[48px] justify-center",
            isChangingLanguage ? "opacity-70 cursor-wait" : "text-slate-500 hover:text-orange-600 hover:bg-orange-50"
          )}
          title={i18n.language === 'fr' ? 'Switch to English' : 'Passer en Français'}
        >
          {isChangingLanguage ? <Loader2 className="h-4 w-4 animate-spin text-orange-600" /> : <Globe className="h-4 w-4" />}
          {!isChangingLanguage && (
            <span className="text-[10px] font-black uppercase tracking-widest">{i18n.language === 'fr' ? 'EN' : 'FR'}</span>
          )}
        </button>

        <div className="h-6 w-px bg-slate-200" />
        
        {/* Bouton Notifications */}
        <button 
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          aria-label="Voir les notifications"
        >
          <Bell className="h-5 w-5" />
          {hasUnreadNotifications && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-orange-600 ring-2 ring-white" />
          )}
        </button>

        {/* Séparateur vertical discret */}
        <div className="h-6 w-px bg-slate-200" />

        {/* Profil Utilisateur */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 pl-1 focus:outline-none group"
          >
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-sm font-semibold text-slate-900 leading-none mb-1 group-hover:text-orange-600 transition-colors">
                {user?.name ?? 'Utilisateur'}
              </span>
              <span className="text-[11px] font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-sm self-end">
                {user?.role ? roleLabels[user.role] ?? user.role : 'Invité'}
              </span>
            </div>

            {/* Avatar (Initials) */}
            <div className="h-9 w-9 rounded-sm bg-gray-500 text-white flex items-center justify-center text-xs font-bold tracking-wider border border-slate-800 transition-transform active:scale-95">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
            </div>
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-sm py-1 z-50 animate-in fade-in zoom-in duration-100 origin-top-right">
                <button className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                  <User className="h-4 w-4 text-slate-400" />
                  {t('common.details', 'Mon Profil')}
                </button>
                <button className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                  <Settings className="h-4 w-4 text-slate-400" />
                  {t('sidebar.settings', 'Paramètres')}
                </button>
                <div className="h-px bg-slate-100 my-1" />
                <button 
                  onClick={logout}
                  className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  {t('sidebar.logout', 'Déconnexion')}
                </button>
              </div>
            </>
          )}
        </div>

      </div>

      {/* Composant Note Flottant */}
      <FloatingNote isOpen={isNoteOpen} onClose={() => setIsNoteOpen(false)} />
    </header>
  )
}