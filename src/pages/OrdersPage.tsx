import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DashboardLayout } from '../components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Plus,
  ShoppingCart,
  Clock,
  Users,
  CheckCircle2,
  X,
  Minus,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Search,
  UtensilsCrossed,
  LayoutGrid,
  List,
  ChefHat,
  Stethoscope,
  Activity,
  Truck,
  Info,
  History,
  CreditCard,
} from 'lucide-react'
import { cn } from '../lib/utils'

// Statuts calqués sur OrderStatus du Backend
type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED' | 'COMPLETED';

const statusConfig: Record<OrderStatus, { key: string; color: string; badge: string }> = {
  PENDING: { key: 'orders.status.pending', color: 'text-amber-600', badge: 'bg-amber-50 border-amber-200 text-amber-700' },
  CONFIRMED: { key: 'orders.status.confirmed', color: 'text-blue-600', badge: 'bg-blue-50 border-blue-200 text-blue-700' },
  PREPARING: { key: 'orders.status.preparing', color: 'text-orange-600', badge: 'bg-orange-50 border-orange-200 text-orange-700' },
  READY: { key: 'orders.status.ready', color: 'text-emerald-600', badge: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  SERVED: { key: 'orders.status.served', color: 'text-slate-600', badge: 'bg-slate-50 border-slate-200 text-slate-700' },
  CANCELLED: { key: 'orders.status.cancelled', color: 'text-red-600', badge: 'bg-red-50 border-red-200 text-red-700' },
  COMPLETED: { key: 'orders.status.completed', color: 'text-purple-600', badge: 'bg-purple-50 border-purple-200 text-purple-700' },
}

type OrderItem = {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  subtotal: number
  status: string
  product?: {
    name: string
    imageUrl?: string
  }
}

type BackendOrder = {
  id: string
  orderNumber: string
  tableId: string
  totalAmount: number
  status: OrderStatus
  customerName?: string
  createdAt?: string | Date
  orderTime?: string | Date
  guestCount: number
  items: OrderItem[]
  specialInstructions?: string
}

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

const AUTHORIZED_ROLES = ['admin', 'manager', 'waiter', 'kitchen_staff', 'super_admin'];

import { useRequireRole, useAuth } from '../context/AuthContext'
import { authService } from './auth.service'
import { useToast, Toast } from '../components/ui/Toast'
import { DeleteDialog } from '../components/ui/DeleteDialog'

export function OrdersPage() {
  const { t } = useTranslation()
  const { showError, showSuccess, toast, clear } = useToast()
  const { user, businessConfig } = useAuth()
  const [isFetching, setIsFetching] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const [orders, setOrders] = useState<BackendOrder[]>([])
  const [availableTables, setAvailableTables] = useState<{id: string, number: string, status: string, zone?: string | null, currentOrderId?: string | null}[]>([])
  const [menuProducts, setMenuProducts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('ALL')
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [applyTax, setApplyTax] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState<BackendOrder | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 9
  const [existingOrderItems, setExistingOrderItems] = useState<OrderItem[]>([])
  const [orderForDetail, setOrderForDetail] = useState<BackendOrder | null>(null)

  const [formData, setFormData] = useState({
    tableId: '',
    guestCount: 1,
    source: 'ON_SITE',
    specialInstructions: '',
    customerId: '',
    customerName: '',
    prescriptionId: '',
    paymentMethod: 'CASH' as 'CASH' | 'CARD' | 'ORANGE_MONEY' | 'MTN_MONEY'
  })
  const [cart, setCart] = useState<CartItem[]>([])

  useRequireRole(AUTHORIZED_ROLES as any, '/dashboard')

  const MENU_CATEGORIES = useMemo(() => {
    if (businessConfig.type === 'RESTAURANT') {
      return [
        { id: 'ALL', label: 'Tout' },
        { id: 'STARTER', label: 'Entrées' },
        { id: 'MAIN_COURSE', label: 'Plats' },
        { id: 'DESSERT', label: 'Desserts' },
        { id: 'BEVERAGE', label: 'Boissons' },
      ];
    }
    return [{ id: 'ALL', label: 'Tout' }]; // Le Retail/Pharma utilise souvent la recherche ou les scans
  }, [businessConfig.type]);

  const selectedTableObj = (availableTables || []).find(t => t.id === formData.tableId);
  const isExistingOrder = selectedTableObj?.status === 'OCCUPIED' && selectedTableObj.currentOrderId;

  useEffect(() => {
    if (isExistingOrder && isAddModalOpen) {
      const fetchExisting = async () => {
        try {
          const order = await authService.getOrder(selectedTableObj.currentOrderId!);
          setExistingOrderItems(order?.items || []);
        } catch (e) {
          console.error("Erreur chargement commande existante", e);
        }
      };
      fetchExisting();
    } else {
      setExistingOrderItems([]);
    }
  }, [formData.tableId, isExistingOrder, isAddModalOpen, selectedTableObj?.currentOrderId]);

  const isOnlyBeverages = cart.length > 0 && cart.every(item => {
    const cat = item.category?.trim().toUpperCase();
    return cat === 'BEVERAGE' || cat === 'BOISSON' || cat === 'DRINK';
  });

  useEffect(() => {
    if (!isAddModalOpen) {
      setProductSearchTerm('')
      setApplyTax(false)
    }
  }, [isAddModalOpen])

  const subtotal = cart.reduce((acc: number, item) => acc + (item.price * item.quantity), 0)
  const existingTotal = existingOrderItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0)
  
  // Calcul de la taxe (19.25% pour Retail si activé, 0 sinon)
  const taxRate = (businessConfig.type === 'RETAIL' && applyTax) ? 0.1925 : 0
  const tax = (subtotal + existingTotal) * taxRate
  const total = subtotal + existingTotal + tax

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id)
      if (existing) {
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { 
        id: product.id, 
        productId: product.id, 
        name: product.name, 
        price: product.price, 
        quantity: 1,
        category: product.category 
      }]
    })
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => prev.map((item) => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQty }
      }
      return item
    }))
  }

  // Intelligence : Recherche par Code-barres pour Retail/Pharma
  const handleProductSearch = async (val: string) => {
    setProductSearchTerm(val);
    if ((businessConfig.type === 'RETAIL' || businessConfig.type === 'PHARMACY') && val.length >= 8) {
      try {
        const product = await authService.getRetailProductByBarcode(val);
        if (product) {
          addToCart(product);
          setProductSearchTerm(''); // Reset après succès
          showSuccess(`${product.name} ajouté`);
        }
      } catch (e) {}
    }
  };

  const loadData = useCallback(async () => {
    try {
      setIsFetching(true)
      
      const isResto = businessConfig.type === 'RESTAURANT';

      // AIGUILLAGE SOURCE : Historique dédié pour Retail, /sales pour Pharma, /orders pour Resto
      const fetchList = businessConfig.type === 'RETAIL' 
        ? authService.getRetailHistory() 
        : (businessConfig.type === 'PHARMACY' 
            ? authService.getSales() 
            : authService.getOrders());
            
      // Sécurité : on ne demande les tables que si on est un restaurant (évite la 403)
      const fetchTables = isResto ? authService.getTables() : Promise.resolve([]);

      const [dataRows, tablesData, productsData] = await Promise.all([
        fetchList,
        fetchTables,
        authService.getProducts({ status: 'AVAILABLE' })
      ])
      
      console.log('[OrdersPage] Données brutes reçues du backend:', { dataRows, tablesData, productsData });
      
      // Normalisation : On harmonise les champs (saleNumber -> orderNumber) pour l'affichage
      const normalizedData = (dataRows as any[] || []).map(item => ({
        ...item,
        orderNumber: item.orderNumber || item.saleNumber || item.dispenseNumber || item.cartNumber || item.id?.slice(-6),
        // Alignement des statuts de vente (PAID) sur les badges de commande (COMPLETED)
        status: item.status === 'PAID' ? 'COMPLETED' : item.status
      }));

      setOrders(normalizedData as BackendOrder[])
      setAvailableTables(tablesData ?? [])
      setMenuProducts(productsData ?? [])
    } catch (e: any) {
      showError(e?.message || 'Erreur lors du chargement des données')
    } finally {
      setIsFetching(false)
    }
  }, [showError])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleStatusUpdate = async (id: string, action: 'validate' | 'prepare' | 'ready' | 'serve' | 'bill') => {
    setIsProcessing(true)
    try {
      if (action === 'validate') await authService.validateOrder(id, user?.id || '')
      if (action === 'prepare') await authService.prepareOrder(id)
      if (action === 'ready') await authService.markOrderReady(id)
      if (action === 'serve') await authService.serveOrder(id, user?.id || '')
      if (action === 'bill' && user?.id) {
        await authService.createSaleFromOrder(id)
        showSuccess(t('orders_page.notifications.invoice_generated'))
        setIsDetailOpen(false)
      } else {
        showSuccess(t('orders_page.notifications.order_updated'))
      }
      
      await loadData()
    } catch (e: any) {
      showError(e.message || "Échec de l'action")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!orderToCancel) return
    setIsProcessing(true)
    try {
      await authService.cancelOrder(orderToCancel.id, { reason: "Annulation manuelle admin", cancelledById: user?.id })
      showSuccess(t('orders_page.notifications.order_cancelled'))
      setIsCancelDialogOpen(false)
      loadData()
    } catch (e: any) {
      showError("Échec de l'annulation")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation de base
    if (cart.length === 0) return
    if (businessConfig.type === 'RESTAURANT' && !formData.tableId) return
    
    setIsProcessing(true)
    clear()

    try {
      // Préparation des items au format DTO attendu par les services spécialisés.
      // On force le type Number sur unitPrice pour éviter l'erreur de validation 400.
      const items = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: Number(item.price)
      }));

      // AIGUILLAGE : Branchement vers l'endpoint correspondant au BusinessType
      if (businessConfig.type === 'RETAIL') {
        // Module Boutique (Retail) : Finalisation atomique d'une vente POS
        await authService.checkoutRetail({
          subtotal,
          taxAmount: tax,
          totalAmount: total,
          paymentMethod: formData.paymentMethod,
          customerId: formData.customerId || undefined,
          items,
          applyTax
        });
        showSuccess("Vente boutique finalisée avec succès");
      } 
      else if (businessConfig.type === 'PHARMACY') {
        // Module Pharmacie : Dispensation avec gestion automatique des lots (FEFO)
        await authService.checkoutPharmacy({
          prescriptionId: formData.prescriptionId || undefined,
          totalAmount: total,
          paymentMethod: formData.paymentMethod,
          items
        });
        showSuccess("Dispensation effectuée avec succès");
      }
      else if (businessConfig.type === 'RESTAURANT') {
        // Module Restaurant : Gestion du flux de salle et cuisine
        if (isExistingOrder) {
          // Cumul d'articles sur une table déjà occupée
          await authService.addProductsToExistingOrder(selectedTableObj.currentOrderId!, items);
          showSuccess(t('orders_page.notifications.items_added', { number: selectedTableObj.number }));
        } else {
          // Création d'une nouvelle commande avec assignation de table
          const payload = {
            tableId: formData.tableId,
            guestCount: formData.guestCount,
            source: formData.source,
            specialInstructions: formData.specialInstructions,
            items,
            customerName: formData.customerName || undefined
          }
          
          const newOrder = await authService.createOrder(payload)
          
          // UX : Si la commande ne contient que des boissons, on peut la marquer comme servie immédiatement
          if (isOnlyBeverages && newOrder?.id) {
            await authService.serveOrder(newOrder.id, user?.id || 'system')
          }

          showSuccess(isOnlyBeverages 
            ? t('orders_page.notifications.order_updated') 
            : t('orders_page.notifications.order_sent'))
        }
      }

      // Nettoyage de l'interface et rafraîchissement
      setIsAddModalOpen(false)
      setCart([])
      setApplyTax(false)
      setFormData({
        tableId: '',
        guestCount: 1,
        source: 'ON_SITE',
        specialInstructions: '',
        customerId: '',
        customerName: '',
        prescriptionId: '',
        paymentMethod: 'CASH'
      })
      loadData()
    } catch (e: any) {
      showError(e.message || "Erreur lors de la communication avec le service de vente")
    } finally {
      setIsProcessing(false)
    }
  }

  const getTableLabel = (tableIdOrNum: string | number) => {
    const table = (availableTables || []).find((tbl: any) => tbl.id === tableIdOrNum || String(tbl.number) === String(tableIdOrNum))
    if (table) {
      return `${t('orders_page.table')} ${table.number} ${table.zone ? `(${table.zone})` : ''}`
    }
    return `${t('orders_page.table')} ${tableIdOrNum}`
  }

  const filteredOrders = (orders || []).filter(order => 
    order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (businessConfig.features.hasTables 
      ? getTableLabel(order.tableId).toLowerCase().includes(searchTerm.toLowerCase())
      : (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE)
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredOrders.slice(start, start + PAGE_SIZE)
  }, [filteredOrders, currentPage])

  useEffect(() => { setCurrentPage(1) }, [searchTerm, filteredOrders.length])

  if (isFetching && orders.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
          <p className="text-sm text-slate-500 font-medium">{t('common.loading')}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="fixed top-4 right-4 z-[100]">
        {toast && <Toast toast={toast} />}
      </div>

      {/* Header responsive */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{businessConfig.labels.orders}</h1>
          <p className="text-xs md:text-sm text-slate-500">Suivi des flux et traitement des {businessConfig.labels.orders.toLowerCase()}.</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-sm">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-1.5 md:p-2 rounded-sm transition-all",
                  viewMode === 'grid' 
                    ? "bg-white shadow-none text-orange-600" 
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </button>
              <button 
                onClick={() => setViewMode('table')}
                className={cn(
                  "p-1.5 md:p-2 rounded-sm transition-all",
                  viewMode === 'table' 
                    ? "bg-white shadow-none text-orange-600" 
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                <List className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </button>
            </div>

            {/* Search bar */}
            <div className="relative flex-1 sm:flex-none min-w-[150px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-slate-400" />
              <Input
                placeholder={t('orders_page.search_placeholder')}
                className="pl-9 w-full sm:w-40 md:w-48 h-8 md:h-9 rounded-sm border-slate-200 bg-white text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* New order button */}
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white shadow-none h-9 md:h-10 rounded-sm flex items-center justify-center gap-1.5 px-3 md:px-4 text-sm font-semibold w-full sm:w-auto"
          >
            <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span>{t('orders_page.new_order')}</span>
          </Button>
        </div>
      </div>
      
      {/* Orders list - Grid view */}
      {viewMode === 'grid' ? (
        <div className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
            {paginatedOrders.map((order) => (
              <Card key={order.id} className={cn(
                "shadow-none p-3 md:p-4 rounded-sm border-slate-200 hover:border-orange-200 transition-colors",
                order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && "bg-[#e9f7ff]"
              )}>
                <CardHeader className="pb-2 md:pb-3 border-b border-slate-50 px-0">
                  <CardTitle className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] md:text-xs font-mono text-slate-400 uppercase tracking-widest">#{order.orderNumber || order.id?.slice(-6)}</span>
                      <span className="text-xs md:text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                        {businessConfig.type === 'PHARMACY' ? <Stethoscope className="h-3 w-3 md:h-3.5 md:w-3.5 text-emerald-600" /> : <ShoppingCart className="h-3 w-3 md:h-3.5 md:w-3.5 text-orange-600" />}
                        {businessConfig.features.hasTables ? getTableLabel(order.tableId) : (order.customerName || 'Vente Directe')}
                      </span>
                    </div>
                    <span className={cn("text-[9px] md:text-[11px] font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded-sm border uppercase tracking-tighter", statusConfig[order.status].badge)}>
                      {t(statusConfig[order.status].key)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 md:pt-4 px-0">
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between text-[10px] md:text-xs">
                      {businessConfig.features.hasTables && (
                        <div className="flex items-center gap-1 text-slate-500">
                          <Users className="h-3 w-3 md:h-3.5 md:w-3.5" />
                          <span>{t('orders_page.guests_count', { count: order.guestCount || 1 })}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-slate-500 font-medium">
                        <Clock className="h-3 w-3 md:h-3.5 md:w-3.5" />
                        <span>
                          {(() => {
                            const dateVal = order.orderTime || order.createdAt;
                            return dateVal ? new Date(dateVal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
                          })()}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2 md:p-2.5 rounded-sm border border-slate-100">
                      <p className="text-[9px] md:text-[11px] text-slate-400 uppercase font-bold mb-1 tracking-wide">{t('orders_page.preview')}</p>
                      <p className="text-xs md:text-sm text-slate-700 font-medium">{t('orders_page.items_selected', { count: order.items?.length || 0 })}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1 md:pt-2 flex-wrap gap-2">
                      <span className="text-base md:text-lg font-black text-slate-900">{(order.totalAmount || 0).toLocaleString()} {t('common.currency')}</span>
                      <div className="flex gap-1.5 md:gap-2">
                        <NextStatusButton order={order} onUpdate={handleStatusUpdate} isProcessing={isProcessing} size="sm" />
                        <button 
                          onClick={() => { setOrderForDetail(order); setIsDetailOpen(true); }}
                          className="px-2 md:px-3 py-1 text-[10px] md:text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-sm transition-colors"
                        >
                          {t('common.details')}
                        </button>
                        <button 
                          onClick={() => { setOrderToCancel(order); setIsCancelDialogOpen(true); }}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                        >
                          <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <PaginationControls 
            currentPage={currentPage} 
            totalPages={totalPages} 
            totalItems={filteredOrders.length} 
            pageSize={PAGE_SIZE} 
            onPageChange={setCurrentPage} 
          />
        </div>
      ) : (
        /* Table view - responsive with horizontal scroll */
        <div className="bg-white rounded-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[9px] md:text-[10px] font-bold uppercase text-slate-400 bg-slate-50/50">
                  <th className="px-3 md:px-6 py-2 md:py-3">Réf.</th>
                  <th className="px-3 md:px-6 py-2 md:py-3">{businessConfig.features.hasTables ? 'Table' : 'Client'}</th>
                  {businessConfig.features.hasTables && <th className="px-3 md:px-6 py-2 md:py-3 hidden sm:table-cell">{t('orders_page.guests')}</th>}
                  <th className="px-3 md:px-6 py-2 md:py-3">{t('orders_page.total')}</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 hidden md:table-cell">{t('common.status')}</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className={cn(
                    "hover:bg-slate-50/50 transition-colors",
                    order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && "bg-[#e9f7ff]"
                  )}>
                    <td className="px-3 md:px-6 py-3 md:py-4 font-mono font-bold text-slate-900 text-xs">#{order.orderNumber}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 font-bold text-xs md:text-sm">{businessConfig.features.hasTables ? getTableLabel(order.tableId) : (order.customerName || 'Passage')}</td>
                    {businessConfig.features.hasTables && <td className="px-3 md:px-6 py-3 md:py-4 hidden sm:table-cell text-xs">{order.guestCount}</td>}
                    <td className="px-3 md:px-6 py-3 md:py-4 font-black text-xs md:text-sm">{(order.totalAmount || 0).toLocaleString()} {t('common.currency')}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 hidden md:table-cell">
                      <span className={cn("text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded-sm border uppercase tracking-tighter", statusConfig[order.status].badge)}>
                        {t(statusConfig[order.status].key)}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 md:gap-2">
                        <NextStatusButton order={order} onUpdate={handleStatusUpdate} isProcessing={isProcessing} size="sm" />
                        <button 
                          onClick={() => { setOrderForDetail(order); setIsDetailOpen(true); }}
                          className="p-1.5 md:p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-sm"
                        >
                          <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationControls 
            currentPage={currentPage} 
            totalPages={totalPages} 
            totalItems={filteredOrders.length} 
            pageSize={PAGE_SIZE} 
            onPageChange={setCurrentPage} 
            className="p-3 md:p-4 bg-slate-50 border-t border-slate-100"
          />
        </div>
      )}

      {/* Modal Nouvelle Commande - Responsive Drawer */}
      <div className={cn(
        "fixed inset-0 z-50 flex justify-end transition-all duration-300",
        isAddModalOpen ? "visible" : "invisible pointer-events-none"
      )}>
        <div 
          className={cn(
            "fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-500",
            isAddModalOpen ? "opacity-100" : "opacity-0"
          )} 
          onClick={() => setIsAddModalOpen(false)} 
        />
        
        <div className={cn(
          "relative bg-white w-full md:w-[90vw] lg:max-w-6xl h-full border-l border-slate-200 flex flex-col overflow-hidden transition-all duration-500 ease-out",
          isAddModalOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        )}>
            
          {/* Header Modal - Titre + affectation */}
          <div className="p-3 md:p-4 border-b border-slate-200 bg-white sticky top-0 z-20">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn("h-9 w-9 md:h-11 md:w-11 rounded-full flex items-center justify-center shrink-0", businessConfig.type === 'PHARMACY' ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600")}>
                  {businessConfig.type === 'PHARMACY' ? <Stethoscope className="h-4 w-4 md:h-5 md:w-5" /> : <Users className="h-4 w-4 md:h-5 md:w-5" />}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base md:text-lg font-bold text-slate-900 leading-tight truncate">{t('orders_page.new_order')}</h2>
                  <p className="text-[11px] text-slate-500 truncate">{businessConfig.labels.orders}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-slate-100 rounded-full shrink-0" 
                onClick={() => setIsAddModalOpen(false)}
              >
                <X className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
              </Button>
            </div>

            {/* Affectation (table / client) */}
            <div className="mt-3">
              {businessConfig.type === 'RESTAURANT' ? (
                <div className="flex flex-wrap items-center bg-slate-50 border border-slate-200 rounded-sm px-2 py-1.5 focus-within:border-orange-300 focus-within:bg-white transition-all gap-2">
                  <select 
                    className="text-xs md:text-sm font-bold bg-transparent border-none py-1 pl-1 pr-5 focus:ring-0 cursor-pointer text-slate-900 appearance-none min-w-[90px]"
                    value={formData.tableId} 
                    onChange={e => setFormData({...formData, tableId: e.target.value})}
                  >
                    <option value="">{t('orders_page.add_modal.table_placeholder')}</option>
                    {(availableTables || [])
                      .filter(t => t.status === 'FREE' || t.status === 'OCCUPIED')
                      .map(table => (
                        <option key={table.id} value={table.id}>
                          {table.status === 'OCCUPIED' ? '🔴 ' : ''}T.{table.number} {table.zone ? `(${table.zone})` : ''}
                        </option>
                      ))}
                  </select>
                  <span className="text-slate-300 text-xs">|</span>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      className="text-xs md:text-sm font-bold bg-transparent border-none p-0 focus:ring-0 w-8 text-slate-900 text-center"
                      value={formData.guestCount || 1} 
                      onChange={e => setFormData({...formData, guestCount: parseInt(e.target.value) || 1})}
                      min="1"
                    />
                    <span className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase">{t('orders_page.add_modal.pers')}</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <div className="flex-1">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                      {businessConfig.type === 'PHARMACY' ? 'Patient' : t('dashboard.customer')}
                    </Label>
                    <Input 
                      placeholder={businessConfig.type === 'PHARMACY' ? "Nom du Patient" : "Nom du Client"} 
                      className="h-9 text-xs border-slate-200 bg-slate-50 focus:bg-white transition-all" 
                      value={formData.customerName}
                      onChange={e => setFormData({...formData, customerName: e.target.value})} 
                    />
                  </div>
                  {businessConfig.type === 'PHARMACY' && (
                    <div className="flex-1">
                      <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">N° Ordonnance</Label>
                      <Input 
                        placeholder="REF-ORDO-..." 
                        className="h-9 text-xs border-slate-200 bg-slate-50 focus:bg-white transition-all" 
                        value={formData.prescriptionId}
                        onChange={e => setFormData({...formData, prescriptionId: e.target.value})}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            {/* Section Menu - Responsive grid */}
            <div className="flex-1 flex flex-col border-r border-slate-100 bg-slate-50/20 min-h-0">
              <div className="px-3 md:px-6 py-2 md:py-4 flex gap-2 md:gap-3 overflow-x-auto no-scrollbar border-b border-slate-100 bg-white sticky top-0 z-10">
                {MENU_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "text-[10px] md:text-xs font-bold whitespace-nowrap pb-1 transition-colors border-b-2",
                      activeCategory === cat.id 
                        ? "text-orange-600 border-orange-500" 
                        : "text-slate-400 border-transparent hover:text-slate-600"
                    )}
                  >
                    {t(`orders_page.categories.${cat.id}`)}
                  </button>
                ))}
              </div>

              {/* Search bar */}
              <div className="px-3 md:px-6 py-2 md:py-3 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-[41px] md:top-[53px] z-10">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                  <Input
                    placeholder={t('orders_page.add_modal.search_product_placeholder')}
                    className="pl-9 h-9 md:h-11 border-slate-200 bg-slate-50/50 focus:bg-white rounded-sm transition-all focus:ring-4 focus:ring-orange-500/5 focus:border-orange-300 text-xs md:text-sm"
                    value={productSearchTerm}
                    onChange={(e) => handleProductSearch(e.target.value)}
                  />
                  {productSearchTerm && (
                    <button 
                      onClick={() => setProductSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="h-3 w-3 md:h-4 md:w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Products grid - responsive */}
              <div className="p-3 md:p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 overflow-y-auto flex-1">
                {(menuProducts || [])
                  .filter(p => (activeCategory === 'ALL' || p.category === activeCategory) && 
                              (p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) || 
                               (p.sku && p.sku.toLowerCase().includes(productSearchTerm.toLowerCase()))))
                  .map(product => (
                  <button 
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="flex flex-col text-left bg-white border border-slate-200 p-2 md:p-3 rounded-sm hover:border-orange-300 transition-all group h-[300px]"
                  >
                    {product.imageUrl && (
                      <div className="w-full h-40 mb-1.5 md:mb-3 overflow-hidden rounded-sm bg-slate-100 border border-slate-100 shrink-0">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300" />
                      </div>
                    )}
                    <span className="text-[8px] md:text-[10px] font-mono text-slate-400 uppercase mb-0.5">{product.sku}</span>
                    <span className="text-xs md:text-sm font-bold text-slate-800 leading-tight mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors">{product.name}</span>
                    <span className="mt-auto text-xs md:text-sm font-black text-slate-900">{product.price.toLocaleString()} {t('common.currency')}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cart Section - Responsive */}
            <div className="w-full lg:w-[380px] flex flex-col bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 h-[320px] sm:h-[350px] lg:h-auto shrink-0">
              <div className="p-3 md:p-4 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">{t('orders_page.add_modal.cart')}</span>
                <span className="text-[9px] md:text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 md:px-2 py-0.5 rounded-full">{t('orders_page.items_selected', { count: cart.length })}</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
                {existingOrderItems.length > 0 && (
                  <div className="mb-4 space-y-2 opacity-60">
                    <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <History className="h-2.5 w-2.5 md:h-3 md:w-3" /> Articles déjà servis
                    </p>
                    {existingOrderItems.slice(0, 3).map(item => (
                      <div key={item.id} className="flex justify-between items-center text-[10px] md:text-xs py-1 border-b border-slate-50">
                        <span className="text-slate-600 italic truncate">{item.quantity}x {item.product?.name}</span>
                        <span className="font-mono">{(item.unitPrice * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    {existingOrderItems.length > 3 && (
                      <p className="text-[9px] text-slate-400 italic">+{existingOrderItems.length - 3} autres</p>
                    )}
                  </div>
                )}

                {cart.length > 0 && existingOrderItems.length > 0 && <div className="h-px bg-orange-100 my-2" />}

                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <ShoppingCart className="h-6 w-6 md:h-8 md:w-8 text-slate-200 mb-2" />
                    <p className="text-[10px] md:text-xs text-slate-400 font-medium italic">{t('orders_page.add_modal.empty_cart')}</p>
                  </div>
                ) : cart.map(item => (
                  <div key={item.id} className="p-2 md:p-3 bg-slate-50/50 rounded-sm border border-slate-100 group transition-all hover:border-orange-100 hover:bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col flex-1 mr-2">
                        <span className="text-xs md:text-sm font-bold text-slate-800 leading-tight line-clamp-2">{item.name}</span>
                        <span className="text-[9px] md:text-[10px] font-bold text-orange-600/70">{(item.price * item.quantity).toLocaleString()} {t('common.currency')}</span>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
                        <X className="h-3 w-3 md:h-4 md:w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center bg-white border border-slate-200 rounded-sm overflow-hidden h-7 md:h-8">
                        <button onClick={() => updateQuantity(item.id, -1)} className="px-2 md:px-3 hover:bg-slate-50 text-slate-400 transition-colors">
                          <Minus className="h-2.5 w-2.5 md:h-3 md:w-3" />
                        </button>
                        <span className="w-8 md:w-10 text-center text-[10px] md:text-xs font-bold text-slate-700 border-x border-slate-100">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="px-2 md:px-3 hover:bg-slate-50 text-slate-400 transition-colors">
                          <Plus className="h-2.5 w-2.5 md:h-3 md:w-3" />
                        </button>
                      </div>
                      <span className="text-[9px] md:text-[10px] text-slate-400 font-medium italic">{item.price.toLocaleString()} / un.</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Footer */}
              <div className="p-3 md:p-4 bg-slate-50 border-t border-slate-100 space-y-3">
                <div className="space-y-1 text-[10px] md:text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>{t('orders_page.add_modal.subtotal')}</span>
                    <span>{subtotal.toLocaleString()} {t('common.currency')}</span>
                  </div>
                  {businessConfig.type === 'RETAIL' && (
                    <div className="flex justify-between text-slate-500">
                      <span>{t('orders_page.add_modal.tax')}</span>
                      <span>{tax.toLocaleString()} {t('common.currency')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-800 font-bold pt-1 text-sm md:text-base border-t border-slate-200 mt-1">
                    <span>{businessConfig.type === 'RETAIL' ? t('orders.orders_page.add_modal.total_ttc') : t('orders.orders_page.add_modal.total_retail')}</span>
                    <span>{total.toLocaleString()} {t('common.currency')}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <textarea 
                    placeholder={t('orders_page.add_modal.special_instructions')}
                    className="w-full p-2 text-[10px] md:text-xs border border-slate-200 rounded-sm focus:ring-0 focus:border-orange-500 resize-none h-12 md:h-16 bg-white"
                    value={formData.specialInstructions} 
                    onChange={e => setFormData({...formData, specialInstructions: e.target.value})}
                  />
                  <Button 
                    onClick={handleCreateOrder}
                    disabled={cart.length === 0 || (businessConfig.type === 'RESTAURANT' && !formData.tableId)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-none font-bold h-9 md:h-11 flex items-center justify-between px-3 md:px-4 text-xs md:text-sm group"
                  >
                    <span className="truncate">
                      {businessConfig.type === 'RETAIL' 
                        ? "Finaliser la vente" 
                        : businessConfig.type === 'PHARMACY' 
                        ? "Effectuer la dispensation" 
                        : isExistingOrder 
                        ? t('orders_page.add_modal.update_order') 
                        : (isOnlyBeverages ? t('orders_page.add_modal.serve_now') : t('orders_page.add_modal.send_to_kitchen'))}
                    </span>
                    <div className="flex items-center gap-0.5 md:gap-1 shrink-0 ml-2">
                      <span className="text-[10px] md:text-sm">{total.toLocaleString()}</span>
                      <ChevronRight className="h-3 w-3 md:h-4 md:w-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Drawer - Responsive */}
      <div className={cn(
        "fixed inset-0 z-[110] flex justify-end transition-all duration-300",
        isDetailOpen ? "visible" : "invisible pointer-events-none"
      )}>
        <div 
          className={cn(
            "fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-500", 
            isDetailOpen ? "opacity-100" : "opacity-0"
          )} 
          onClick={() => setIsDetailOpen(false)} 
        />
        <div className={cn(
          "relative bg-white w-full sm:max-w-md h-full border-l border-slate-200 flex flex-col overflow-hidden transition-all duration-500 ease-out", 
          isDetailOpen ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="p-3 md:p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
            <div className="flex flex-col">
              <h2 className="text-base md:text-lg font-bold text-slate-900">{t('orders_page.detail_drawer.title')}</h2>
              <span className="text-[10px] md:text-xs font-mono text-slate-400 uppercase tracking-widest">#{orderForDetail?.orderNumber || orderForDetail?.id.slice(-6)}</span>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 md:h-9 md:w-9" onClick={() => setIsDetailOpen(false)}>
              <X className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
          
          {orderForDetail && (
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {/* Status summary */}
              <div className="flex items-center justify-between p-3 md:p-4 bg-slate-50 rounded-sm border border-slate-100">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{businessConfig.features.hasTables ? t('orders_page.detail_drawer.assigned_to') : t('orders_page.customer')}</span>
                  <span className="text-xs md:text-sm font-bold text-slate-900">{businessConfig.features.hasTables ? getTableLabel(orderForDetail.tableId) : (orderForDetail.customerName || 'Client Passage')}</span>
                </div>
                <span className={cn("text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded-sm border uppercase tracking-tighter", statusConfig[orderForDetail.status].badge)}>
                  {t(statusConfig[orderForDetail.status].key)}
                </span>
              </div>

              {/* Items list */}
              <div className="space-y-3">
                <Label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <UtensilsCrossed className="h-3 w-3 md:h-3.5 md:w-3.5" /> {t('orders_page.detail_drawer.ordered_items')}
                </Label>
                <div className="space-y-2">
                  {orderForDetail.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 md:p-3 border border-slate-100 rounded-sm">
                      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                        <div className="h-7 w-7 md:h-8 md:w-8 rounded-sm bg-slate-100 flex items-center justify-center text-[10px] md:text-xs font-bold text-slate-500 shrink-0">
                          {item.quantity}x
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs md:text-sm font-bold text-slate-800 truncate">{item.product?.name || "Article"}</span>
                          <span className="text-[9px] md:text-[10px] text-slate-400 font-medium">{item.unitPrice.toLocaleString()} {t('common.currency')} / unité</span>
                        </div>
                      </div>
                      <span className="text-xs md:text-sm font-black text-slate-900 ml-2 shrink-0">{item.subtotal.toLocaleString()} {t('common.currency')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special instructions */}
              <div className="space-y-2">
                <Label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Info className="h-3 w-3 md:h-3.5 md:w-3.5" /> {t('orders_page.detail_drawer.special_instructions')}
                </Label>
                <div className="p-3 md:p-4 bg-orange-50/30 border border-orange-100 rounded-sm italic text-xs md:text-sm text-slate-600">
                  {orderForDetail.specialInstructions || t('orders_page.detail_drawer.no_instructions')}
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <Label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <History className="h-3 w-3 md:h-3.5 md:w-3.5" /> {t('orders_page.detail_drawer.timeline')}
                </Label>
                <div className="space-y-2 pl-2 border-l-2 border-slate-100 ml-1">
                  <div className="relative pl-5">
                    <div className="absolute -left-[7px] top-1 h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-emerald-500 border-2 border-white" />
                    <p className="text-[10px] md:text-xs font-bold text-slate-800">{t('orders_page.detail_drawer.order_created')}</p>
                    <p className="text-[9px] md:text-[10px] text-slate-400">
                      {(() => {
                        const dateVal = orderForDetail.orderTime || orderForDetail.createdAt;
                        if (!dateVal) return t('orders_page.detail_drawer.no_date');
                        const d = new Date(dateVal);
                        return isNaN(d.getTime()) ? `Format invalide` : d.toLocaleString();
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="flex justify-between text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">
                  <span>{t('orders_page.detail_drawer.subtotal')}</span>
                  <span>{orderForDetail.totalAmount.toLocaleString()} {t('common.currency')}</span>
                </div>
                <div className="flex justify-between text-base md:text-lg font-black text-slate-900 pt-2">
                  <span>{t('orders_page.detail_drawer.total_to_pay')}</span>
                  <span>{orderForDetail.totalAmount.toLocaleString()} {t('common.currency')}</span>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 md:p-4 bg-white border-t border-slate-100 flex gap-2 md:gap-3 sticky bottom-0">
            <Button 
              variant="outline" 
              className="flex-1 rounded-sm font-bold border-slate-200 text-xs md:text-sm h-9 md:h-10 shadow-none" 
              onClick={() => setIsDetailOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            {orderForDetail && (
              <div className="flex-1">
                <NextStatusButton 
                  order={orderForDetail} 
                  onUpdate={handleStatusUpdate} 
                  isProcessing={isProcessing} 
                  className="w-full h-9 md:h-10 text-xs md:text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <DeleteDialog 
        isOpen={isCancelDialogOpen}
        isLoading={isProcessing}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={handleCancelOrder}
        title={t('orders_page.cancel_order')}
        description={t('orders_page.cancel_confirmation')}
        itemName={orderToCancel ? `#${orderToCancel.orderNumber || orderToCancel.id.slice(-6)}` : ''}
        confirmText={t('orders_page.cancel_order')}
      />
    </DashboardLayout>
  )
}

// NextStatusButton component
function NextStatusButton({ 
  order, 
  onUpdate, 
  isProcessing, 
  size = 'default',
  className 
}: { 
  order: BackendOrder; 
  onUpdate: (id: string, action: any) => void; 
  isProcessing: boolean;
  size?: 'default' | 'sm';
  className?: string;
}) {
  const { t } = useTranslation()
  const { businessConfig } = useAuth()
  if (order.status === 'CANCELLED' || order.status === 'COMPLETED') return null;

  const isResto = businessConfig.type === 'RESTAURANT';
  const isPharma = businessConfig.type === 'PHARMACY';

  const configMap = {
    PENDING: { action: 'validate', label: isPharma ? 'Vérifier Ordo.' : t('orders_page.actions_labels.validate'), icon: CheckCircle2, color: 'bg-blue-600' },
    CONFIRMED: { 
      action: 'prepare', 
      label: isPharma ? 'Préparer Lots' : (isResto ? t('orders_page.actions_labels.prepare') : 'Préparer Colis'), 
      icon: isPharma ? Activity : ChefHat, 
      color: 'bg-orange-600' 
    },
    PREPARING: { action: 'ready', label: t('orders_page.actions_labels.ready'), icon: UtensilsCrossed, color: 'bg-emerald-600' },
    READY: { action: 'serve', label: isPharma ? 'Dispenser' : (isResto ? t('orders_page.actions_labels.serve') : 'Expédier'), icon: Truck, color: 'bg-indigo-600' },
    SERVED: { action: 'bill', label: t('orders_page.actions_labels.bill'), icon: CreditCard, color: 'bg-purple-600' },
  } as const;

  const config = configMap[order.status as keyof typeof configMap];

  if (!config) return null;

  const Icon = config.icon;
  return (
    <Button 
      disabled={isProcessing}
      onClick={() => onUpdate(order.id, config.action as any)}
      className={cn(
        "text-white font-bold rounded-sm flex items-center gap-1 md:gap-2 shadow-none transition-all",
        config.color,
        size === 'sm' ? "h-7 px-2 text-[9px] md:text-[10px]" : "h-8 md:h-9 px-2 md:px-3 text-xs md:text-sm",
        className
      )}
    >
      <Icon className={cn(size === 'sm' ? "h-2.5 w-2.5 md:h-3 md:w-3" : "h-3 w-3 md:h-4 md:w-4")} />
      <span className="hidden xs:inline">{config.label}</span>
    </Button>
  );
}

// PaginationControls component
function PaginationControls({ currentPage, totalPages, totalItems, pageSize, onPageChange, className }: { 
  currentPage: number; 
  totalPages: number; 
  totalItems: number; 
  pageSize: number; 
  onPageChange: (p: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;
  
  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-3 mt-4", className)}>
      <p className="text-[10px] md:text-xs text-slate-500 font-medium">
        {((currentPage - 1) * pageSize + 1)} - {Math.min(currentPage * pageSize, totalItems)} sur {totalItems}
      </p>
      <div className="flex gap-1.5 md:gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          disabled={currentPage === 1} 
          onClick={() => onPageChange(currentPage - 1)} 
          className="h-7 w-7 md:h-8 md:w-8 p-0 rounded-sm shadow-none"
        >
          <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
        </Button>
        <span className="flex items-center px-2 md:px-3 text-[10px] md:text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-sm">
          {currentPage} / {totalPages}
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={currentPage === totalPages} 
          onClick={() => onPageChange(currentPage + 1)} 
          className="h-7 w-7 md:h-8 md:w-8 p-0 rounded-sm shadow-none"
        >
          <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
        </Button>
      </div>
    </div>
  )
}
