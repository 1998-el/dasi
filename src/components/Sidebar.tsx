import { Link, useLocation } from 'react-router-dom'
import { useMemo, useState, useRef, useEffect } from 'react'; 
import { cn } from '../lib/utils'
import { LogOut, X, Calculator, FileText, MoreHorizontal } from 'lucide-react'
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

  // État pour le menu overflow (trois points)
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);
  const overflowButtonRef = useRef<HTMLButtonElement>(null);

  // Gestion du clic extérieur pour fermer le menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        overflowRef.current && 
        !overflowRef.current.contains(event.target as Node) &&
        overflowButtonRef.current &&
        !overflowButtonRef.current.contains(event.target as Node)
      ) {
        setIsOverflowOpen(false);
      }
    }
    if (isOverflowOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOverflowOpen]);

  // Gestion de la touche Échap pour fermer le menu
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOverflowOpen(false);
      }
    }
    if (isOverflowOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOverflowOpen]);

  // Déterminer si on dépasse 9 éléments
  const hasOverflow = !isCollapsed && mainMenuItems.length > 9;
  const visibleItems = hasOverflow ? mainMenuItems.slice(0, 9) : mainMenuItems;
  const overflowItems = hasOverflow ? mainMenuItems.slice(9) : [];

  return (
    <>
      {/* VERSION DESKTOP : Sidebar classique (visible uniquement sur large écran) */}
      <aside className={cn(
         "hidden lg:flex h-screen bg-sidebar-bg text-[#333333] flex-col shadow-inner border-r border-slate-200 transition-all duration-300 ease-in-out relative",
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
        <div>
          <ul className="space-y-1">
            {/* Éléments visibles (max 9) */}
            {visibleItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024 && !isCollapsed) {
                        toggleSidebar();
                      }
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                      "focus:outline-none focus:ring-2 focus:ring-orange-500/40",
                      isActive
                         ? "bg-orange-600 text-white shadow-sm"
                         : "text-[#333333] hover:bg-slate-100 hover:text-[#333333]",
                      isCollapsed && "justify-center px-0 h-10"
                    )}
                    title={isCollapsed ? t(item.i18nKey ?? '', { defaultValue: item.key }) : undefined}
                  >
                    <item.icon className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-white" : "text-[#333333]"
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

            {/* BOUTON "..." (trois points) - visible uniquement si > 9 éléments et sidebar dépliée */}
            {hasOverflow && !isCollapsed && (
              <li className="relative">
                <button
                  ref={overflowButtonRef}
                  onClick={() => setIsOverflowOpen(!isOverflowOpen)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 w-full text-left",
                    "text-[#333333] hover:bg-slate-100 hover:text-[#333333]",
                    "focus:outline-none focus:ring-2 focus:ring-orange-500/40",
                    isOverflowOpen && "bg-slate-100"
                  )}
                  aria-expanded={isOverflowOpen}
                  aria-haspopup="true"
                >
                  <MoreHorizontal className="h-4 w-4 shrink-0" />
                  <span className="animate-in fade-in slide-in-from-left-2 duration-300">
                    {t('sidebar.more', { defaultValue: 'Plus' })}
                  </span>
                </button>

                {/* MENU FLOTTANT (type dropdown) */}
                {isOverflowOpen && (
                  <div 
                    ref={overflowRef}
                    className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    <ul className="py-1 max-h-80 overflow-y-auto">
                      {overflowItems.map((item) => {
                        const isActive = location.pathname === item.path
                        return (
                          <li key={item.path} role="none">
                            <Link
                              to={item.path}
                              onClick={() => {
                                setIsOverflowOpen(false);
                                if (window.innerWidth < 1024 && !isCollapsed) {
                                  toggleSidebar();
                                }
                              }}
                              className={cn(
                                "flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150",
                                "hover:bg-slate-50",
                                isActive
                                  ? "bg-orange-50 text-orange-700 font-medium"
                                  : "text-[#333333]"
                              )}
                              role="menuitem"
                            >
                              <item.icon className="h-4 w-4 shrink-0" />
                              <span>{t(item.i18nKey ?? '', { defaultValue: item.key })}</span>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-200 shrink-0">
        <button
          onClick={logout}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left text-[#333333] hover:text-red-600 hover:bg-red-50 transition-all duration-150",
            "focus:outline-none focus:ring-2 focus:ring-red-500/30",
            isCollapsed && "justify-center px-0"
          )}
          title={isCollapsed ? t('sidebar.logout') : undefined}
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

          {/* Grille de Tuiles (Windows 8 Style) - tous les éléments visibles */}  
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