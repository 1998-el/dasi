import { Link, useLocation } from 'react-router-dom'
import { useMemo } from 'react'; 
import { cn } from '../lib/utils'
import { LogOut, X, Calculator, FileText } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { getSidebarItems } from '../config/business-ui'


interface SidebarProps {
  isCollapsed: boolean
  toggleSidebar: () => void
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const location = useLocation()
  const { logout, businessConfig } = useAuth()
  const { t } = useTranslation()

  const rawMenuItems = getSidebarItems(businessConfig.type)

  const mainMenuItems = useMemo(() => {
    let items = [...rawMenuItems];

    // Injection de la Comptabilité si absente du config par défaut
    if (!items.find(i => i.path === '/accounting')) {
      items.push({
        path: '/accounting',
        icon: Calculator,
        i18nKey: 'sidebar.accounting',
        key: 'Accounting'
      });
    }

    // Ajout du lien vers le Z-Report (Clôture)
    if (!items.find(i => i.path === '/accounting/closing')) {
      items.push({
        path: '/accounting/closing',
        icon: FileText,
        i18nKey: 'sidebar.cash_closing',
        key: 'Z-Report'
      });
    }

    // Filtrer la page Paiements pour le businessType RETAIL
    if (businessConfig.type === 'RETAIL') {
      items = items.filter(item => item.path !== '/payments');
    }
    return items;
  }, [rawMenuItems, businessConfig.type]);


  return (
    <>
      {/* VERSION DESKTOP : Sidebar classique (visible uniquement sur large écran) */}
      <aside className={cn(
        "hidden lg:flex h-screen bg-white text-slate-700 flex-col shadow-inner border-r border-slate-200 transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-20" : "w-60"
      )}>

      {/* Brand / Header */}
      <div className={cn(
        "h-16 flex items-center border-b border-slate-100 overflow-hidden shrink-0",
        isCollapsed ? "justify-center px-0" : "px-6 gap-2.5"
      )}>
        <div className="flex items-center justify-center w-full">
          <img 
            src="/logo/logo.png" 
            alt="Logo RestoManager" 
            className={cn("w-auto object-contain transition-all", isCollapsed ? "h-12" : "h-22")}
          />
        </div>
       
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 py-6 overflow-y-auto overflow-x-hidden",
        isCollapsed ? "px-2" : "px-4"
      )}>
        {/* Main Menu */}
        <div>
        
          <ul className="space-y-1">
            {mainMenuItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => {
                      // On ne ferme/réduit la sidebar au clic que sur les petits écrans
                      if (window.innerWidth < 1024 && !isCollapsed) {
                        toggleSidebar();
                      }
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                      "focus:outline-none focus:ring-2 focus:ring-orange-500/40",
                      isActive
                        ? "bg-orange-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                      isCollapsed && "justify-center px-0 h-10"
                    )}
                    title={isCollapsed ? item.i18nKey : undefined}
                  >
                    <item.icon className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-white" : "text-slate-500"
                    )} />
                    {!isCollapsed && (
                      <span className="animate-in fade-in slide-in-from-left-2 duration-300">
                        {t(item.i18nKey ?? '', { defaultValue: item.key })}
                      </span>
                    )}

                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Configuration Section */}
        {/* <div className="mt-6">
          {!isCollapsed && (
            <p className="px-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-300 mb-4 animate-in fade-in">
              {t('sidebar.configuration')}
            </p>
          )}
          <ul className="space-y-1">
            <li>
              <Link
                to="/settings"
                onClick={() => {
                  if (window.innerWidth < 1024 && !isCollapsed) {
                    toggleSidebar();
                  }
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  location.pathname === '/settings'
                    ? "bg-orange-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  isCollapsed && "justify-center px-0"
                )}
                title={isCollapsed ? "Paramètres" : undefined}
              >
                <Settings className={cn(
                  "h-4 w-4 shrink-0",
                  location.pathname === '/settings' ? "text-white" : "text-slate-500"
                )} />
                {!isCollapsed && (
                  <span className="animate-in fade-in slide-in-from-left-2 duration-300">
                    {t('sidebar.settings')}
                  </span>
                )}
              </Link>
            </li>
          </ul>
        </div> */}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-200 shrink-0">
        <button
          onClick={logout}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left",
            "text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all duration-150",
            "focus:outline-none focus:ring-2 focus:ring-red-500/30",
            isCollapsed && "justify-center px-0"
          )}
          title={isCollapsed ? "Déconnexion" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && (
            <span className="animate-in fade-in slide-in-from-left-2 duration-300">
              {t('sidebar.logout')}
            </span>
          )}
        </button>
      </div>
      </aside>

      {/* VERSION MOBILE/TABLETTE : Menu Launcher (Style Windows 8 / Ubuntu) */}
      {!isCollapsed && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300 flex flex-col p-6 overflow-y-auto">
          {/* Header du Launcher */}
          <div className="flex justify-between items-center mb-10">
            <img src="/logo/logo.png" alt="Logo" className="h-12 w-auto brightness-0 invert" />
            <button 
              onClick={toggleSidebar} 
              className="p-3 text-white bg-white/10 rounded-full active:scale-90 transition-transform"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Grille de Tuiles (Windows 8 Style) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto w-full pb-10">
            {mainMenuItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={toggleSidebar}
                  className={cn(
                    "flex flex-col items-center justify-center aspect-square rounded-2xl transition-all duration-200 active:scale-95 group border",
                    isActive
                      ? "bg-orange-600 border-orange-400 text-white shadow-lg shadow-orange-500/40"
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  )}
                >
                  <div className={cn(
                    "p-4 rounded-2xl mb-3 transition-all group-hover:scale-110",
                    isActive ? "bg-white/20" : "bg-slate-800"
                  )}>
                    <item.icon className="h-7 w-7" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-center px-2">
                    {t(item.i18nKey ?? '', { defaultValue: item.key })}
                  </span>
                </Link>
              )
            })}

            {/* Tuile Déconnexion Spéciale */}
            <button
              onClick={logout}
              className="flex flex-col items-center justify-center aspect-square rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 active:scale-95"
            >
              <div className="p-4 rounded-2xl mb-3 bg-red-500/20">
                <LogOut className="h-7 w-7" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                {t('sidebar.logout')}
              </span>
            </button>
          </div>
          
          <div className="mt-auto text-center py-6 border-t border-white/5">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Maat School Dashboard v2.0</p>
          </div>
        </div>
      )}
    </>
  )
}