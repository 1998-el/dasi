import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DashboardLayout } from '../components/DashboardLayout'
import { 
  TrendingUp, 
  ChefHat, 
  Coins,
  Layers,
  AlertCircle,
  Clock,
  Package,
  Stethoscope,
  ShoppingCart,
  // Sun,
  // Moon,
  Users,
  Utensils,
  Activity,
  Loader2
} from 'lucide-react'
import { cn } from '../lib/utils'
import { useAuth } from '../context/AuthContext'
import { authService } from './auth.service'

interface DashboardSummary {
  occupancyRate: number
  pendingOrders: number
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  lowStockCount: number
  dailyTarget?: number // Objectif de CA optionnel
  orderTarget?: number // Objectif de commandes optionnel
}

interface TopProduct {
  productId: string
  name: string
  quantity: number
  revenue: number
}

interface RecentOrder {
  id: string
  number: string
  type: string
  totalAmount: number
  status: string
  date: string
  customer: string
  reference: string
}

const statusLabels: Record<string, { key: string; color: string }> = {
  PENDING: { key: 'orders.status.pending', color: 'bg-amber-100 text-amber-700' },
  CONFIRMED: { key: 'orders.status.confirmed', color: 'bg-orange-100 text-orange-700' },
  PREPARING: { key: 'orders.status.preparing', color: 'bg-orange-100 text-orange-700' },
  READY: { key: 'orders.status.ready', color: 'bg-emerald-100 text-emerald-700' },
  SERVED: { key: 'orders.status.served', color: 'bg-slate-100 text-slate-700' },
  COMPLETED: { key: 'orders.status.completed', color: 'bg-purple-100 text-purple-700' },
  CANCELLED: { key: 'orders.status.cancelled', color: 'bg-red-100 text-red-700' },
}

export function DashboardPage() {
  const { t } = useTranslation()
  const { user, tenantId, isLoading: authLoading, businessConfig } = useAuth()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [selectedSalesPeriod, setSelectedSalesPeriod] = useState<'daily' | 'weekly'>('daily');
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Ne charger les données que si l'utilisateur est prêt ET que le tenantId est résolu
    if (authLoading || !user?.id || user.onboardingStatus !== 'COMPLETED' || !tenantId) return

    const fetchData = async () => {
      setIsFetching(true)
      setError(null)
      try {
        const [summaryData, topData, recentData, salesPeriodResponse] = await Promise.all([
          authService.getDashboardSummary(),
          authService.getTopProducts(5),
          authService.getRecentOrders(6),
          authService.getSalesByPeriod(selectedSalesPeriod) // Récupérer les ventes pour la période sélectionnée
        ])
        
        console.log('[Dashboard] Backend summary response:', summaryData)
        setSummary(summaryData)
        setTopProducts(topData)
        setRecentOrders(recentData)
      } catch (e: any) {
        console.error('Failed to fetch dashboard data', e)
        setError(e?.message || 'Impossible de charger les données du tableau de bord')
      } finally {
        setIsFetching(false)
      }
    }

    fetchData()
  }, [authLoading, user?.id, user?.onboardingStatus, tenantId, selectedSalesPeriod]) // Ajouter selectedSalesPeriod aux dépendances

  const hour = new Date().getHours()
  const greeting = hour >= 18 || hour < 5 ? t('dashboard.welcome_evening', 'Bonsoir') : t('dashboard.welcome_morning', 'Bonjour')
  // const GreetingIcon = hour >= 18 || hour < 5 ? Moon : Sun

  // État de chargement
  if (authLoading || isFetching) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="h-12 w-12 text-orange-500 animate-spin mb-4" />
          <p className="text-slate-500 text-sm">{t('dashboard.loading')}</p>
        </div>
      </DashboardLayout>
    )
  }

  // État d'erreur
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <div className="p-4 bg-red-50 border border-red-200 rounded-sm text-red-600 flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 text-orange-600 hover:text-orange-700 text-sm font-medium"
          >
            {t('common.error')} - {t('common.details')}
          </button>
        </div>
      </DashboardLayout>
    )
  }

  // Aucune donnée disponible
  if (!summary) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <p className="text-slate-500 text-sm">{t('dashboard.no_data')}</p>
        </div>
      </DashboardLayout>
    )
  }

  const stats = [
    {
      title: businessConfig.type === 'RESTAURANT' ? t('dashboard.occupancy_rate') : "Rotation Stock",
      value: businessConfig.type === 'RESTAURANT' ? `${Math.round(summary.occupancyRate)}%` : "1.2x",
      subtext: businessConfig.type === 'RESTAURANT' ? t('dashboard.stats_sub.in_room') : "Indice hebdo",
      trend: businessConfig.type === 'RESTAURANT' ? t('dashboard.trends.capacity') : "Stable",
      trendType: "neutral",
      icon: businessConfig.type === 'RESTAURANT' ? Layers : Package,
      color: businessConfig.type === 'RESTAURANT' ? "text-orange-600" : "text-orange-600",
      bgColor: businessConfig.type === 'RESTAURANT' ? "bg-orange-50" : "bg-orange-50"
    },
    {
      title: businessConfig.type === 'PHARMACY' ? "Ordonnances" : t('dashboard.sales_revenue'), 
      value: `${summary.totalSales?.toLocaleString() ?? '0'} FCFA`, // Utiliser directement les données du summary
      subtext: selectedSalesPeriod === 'daily' ? t('dashboard.stats_sub.daily_sales') : t('dashboard.stats_sub.weekly_sales'), // Sous-texte dynamique
      trend: t('dashboard.trends.ongoing'),
      trendType: "up",
      icon: businessConfig.type === 'PHARMACY' ? Stethoscope : ChefHat,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: t('dashboard.pending_orders'), // Ancien "pending_orders"
      value: summary.pendingOrders?.toString() ?? '0', // Garder la valeur du summary
      subtext: t('dashboard.stats_sub.waiting'), // Garder le sous-texte
      trend: t('dashboard.trends.ongoing'), // Garder la tendance
      trendType: "neutral",
      icon: businessConfig.type === 'RETAIL' ? ShoppingCart : Coins,
      color: "text-emerald-600", // Garder la couleur
      bgColor: "bg-emerald-50" // Garder le fond
    },
    {
      title: businessConfig.type === 'PHARMACY' ? "Patients" : (businessConfig.type === 'RETAIL' ? "Clients" : t('dashboard.covers_served')),
      value: summary.totalOrders?.toString() ?? '0',
      subtext: businessConfig.type === 'PHARMACY' ? "Traités" : t('dashboard.stats_sub.orders'),
      trend: t('dashboard.trends.total'),
      trendType: "neutral",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: t('dashboard.average_basket'),
      value: `${summary.averageOrderValue?.toLocaleString() ?? '0'} FCFA`,
      subtext: t('dashboard.stats_sub.per_order'),
      trend: t('dashboard.trends.average'),
      trendType: "neutral",
      icon: Utensils,
      color: "text-pink-600",
      bgColor: "bg-pink-50"
    },
    {
      title: t('dashboard.low_stock'),
      value: summary.lowStockCount?.toString() ?? '0',
      subtext: t('dashboard.stats_sub.restock'),
      trend: t('dashboard.trends.alert'),
      trendType: "neutral",
      icon: Activity,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    }
  ]

  const getServiceName = (h: number) => {
    if (h >= 5 && h < 12) return t('dashboard.services.breakfast', 'Petit Déjeuner')
    if (h >= 12 && h < 18) return t('dashboard.services.lunch', 'Service du Midi')
    if (h >= 18 && h < 23) return t('dashboard.services.dinner', 'Service du Soir')
    return t('dashboard.services.night', 'Service de Nuit')
  }

  const restaurantStatus = {
    isOpen: true,
    currentService: getServiceName(hour),
    alertMessage: summary.pendingOrders 
      ? t('dashboard.alerts.pending_prep', { count: summary.pendingOrders })
      : t('dashboard.alerts.no_pending')
  }

  const BusinessIcon = businessConfig.type === 'RETAIL' ? ShoppingCart : businessConfig.type === 'PHARMACY' ? Stethoscope : ChefHat
  const activityLabel = businessConfig.type === 'RESTAURANT'
    ? restaurantStatus.currentService
    : businessConfig.type === 'RETAIL'
      ? t('dashboard.business_retail', 'Boutique')
      : t('dashboard.business_pharmacy', 'Pharmacie')

  return (
    <DashboardLayout>
      {/* Header section */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-sm text-slate-500">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Sélecteur de période pour le chiffre d'affaires */}
          <div className="flex bg-white p-1 rounded-sm border border-slate-200">
            <button
              onClick={() => setSelectedSalesPeriod('daily')}
              className={cn(
                "px-3 py-1 text-[10px] font-bold rounded-sm transition-all uppercase tracking-widest",
                selectedSalesPeriod === 'daily' ? "bg-orange-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              {t('dashboard.daily')}
            </button>
            <button
              onClick={() => setSelectedSalesPeriod('weekly')}
              className={cn(
                "px-3 py-1 text-[10px] font-bold rounded-sm transition-all uppercase tracking-widest",
                selectedSalesPeriod === 'weekly' ? "bg-orange-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              {t('dashboard.weekly')}
            </button>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider bg-white text-slate-500 px-4 py-2 rounded-sm border border-slate-200 self-start sm:self-center">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            {t('dashboard.updated_now')}
          </div>
        </div>
      </div>


      {/* Info Banner — carte héro businessType-aware */}
      <div className="relative mb-8 overflow-hidden rounded-sm border border-[#1f69e0]/10 bg-gradient-to-br from-[#1f69e0] to-[#1954b8] text-white ">
        {/* Halos décoratifs */}
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-52 w-52 rounded-full bg-[#5a87df]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Identité + statut */}
          <div className="flex items-center gap-4">
            {/* <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold ring-1 ring-white/20 backdrop-blur">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div> */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">{greeting}, {user?.name}</h2>
                {/* <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-emerald-300 ring-1 ring-emerald-400/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {t('dashboard.live_status', 'En service')}
                </span> */}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold ring-1 ring-white/20">
                  <BusinessIcon className="h-3.5 w-3.5" />
                  {activityLabel}
                </span>
                <p className="flex items-center gap-1.5 text-sm font-medium text-white/80">
                  <AlertCircle className="h-4 w-4 text-white/70" />
                  {restaurantStatus.alertMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Mini-KPIs rapides */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">{t('dashboard.sales_revenue')}</p>
              <p className="text-lg font-bold tabular-nums">
                {summary.totalSales?.toLocaleString() ?? '0'} <span className="text-xs font-medium text-white/60">FCFA</span>
              </p>
            </div>
            <div className="h-10 w-px bg-white/15" />
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">{t('dashboard.pending_orders')}</p>
              <p className="text-lg font-bold tabular-nums">{summary.pendingOrders ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Stats KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white p-6 rounded-sm border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.title}</h3>
                  <div className={`p-2.5 ${stat.bgColor} ${stat.color} rounded-sm`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</span>
                  {stat.trendType === 'up' && (
                    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <TrendingUp className="h-3 w-3" />
                      {stat.trend}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{stat.subtext}</span>
                {stat.trendType === 'neutral' && stat.trend && (
                  <span className="font-medium text-slate-600">{stat.trend}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Section Graphique & Répartition - Uniquement si données disponibles */}
      {(summary.totalSales > 0 || summary.totalOrders > 0) && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Objectifs & Progression - basé sur les données réelles */}
          <div className="bg-white p-6 rounded-sm border border-slate-200 flex flex-col justify-between">
            <h3 className="text-sm font-bold text-slate-900 mb-6">{t('dashboard.performance')}</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                  <span className="text-slate-500">{t('dashboard.revenue_achieved')}</span>
                  <span className="text-slate-900">{summary.totalSales.toLocaleString()} FCFA</span>
                </div>
                {summary.dailyTarget && summary.dailyTarget > 0 && (
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 transition-all duration-1000" 
                      style={{ width: `${Math.min(100, (summary.totalSales / summary.dailyTarget) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                  <span className="text-slate-500">{t('dashboard.orders_processed')}</span>
                  <span className="text-slate-900">{summary.totalOrders}</span>
                </div>
                {summary.orderTarget && summary.orderTarget > 0 && (
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-1000" 
                      style={{ width: `${Math.min(100, (summary.totalOrders / summary.orderTarget) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Produits - Données réelles */}
          <div className="bg-white p-6 rounded-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-6">{t('dashboard.top_products')}</h3>
            <div className="space-y-4">
              {topProducts.length > 0 ? topProducts.map((product) => (
                <div key={product.productId} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800">{product.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-medium">{product.quantity} vendus</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{product.revenue.toLocaleString()} FCFA</span>
                </div>
              )) : (
                <p className="text-xs text-slate-400 italic">{t('dashboard.no_sales')}</p>
              )}
            </div>
          </div>

          {/* Dernières Commandes - Données réelles */}
          <div className="lg:col-span-3 bg-white rounded-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">{t('dashboard.recent_orders')}</h3>
              <button className="text-[10px] font-bold text-orange-600 uppercase tracking-widest hover:underline">{t('dashboard.view_all_flux')}</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                    <th className="px-6 py-3">{t('dashboard.order_number')}</th>
                    {businessConfig.features.hasTables && <th className="px-6 py-3">{t('dashboard.table')}</th>}
                    <th className="px-6 py-3">{businessConfig.type === 'PHARMACY' ? 'Patient' : t('dashboard.customer')}</th>
                    <th className="px-6 py-3 text-right">{t('dashboard.amount')}</th>
                    <th className="px-6 py-3">{t('common.status')}</th>
                    <th className="px-6 py-3">{t('dashboard.time')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono font-bold text-slate-900">#{order.number}</td>
                       {businessConfig.features.hasTables && <td className="px-6 py-4 text-xs font-bold text-slate-700">{order.reference}</td>}
                       <td className="px-6 py-4 text-xs text-slate-600">
                         {order.customer || (businessConfig.type === 'PHARMACY' ? 'Patient' : t('dashboard.anonymous_customer'))}
                       </td>
                       <td className="px-6 py-4 text-xs text-right font-black text-slate-900">{order.totalAmount.toLocaleString()} FCFA</td>
                       <td className="px-6 py-4">
                         <span className={cn(
                           "px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-tighter border border-transparent",
                           statusLabels[order.status]?.color || "bg-slate-100 text-slate-600"
                         )}>
                           {t(statusLabels[order.status]?.key || order.status)}
                         </span>
                       </td>
                       <td className="px-6 py-4 text-[10px] text-slate-400 font-medium">
                         {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
       )}
     </DashboardLayout>
   )
 }