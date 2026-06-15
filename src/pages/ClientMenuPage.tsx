import React, { useEffect, useMemo, useRef, useState } from 'react'

import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ShoppingCart,
  Plus,
  Minus,
  Utensils,
  CheckCircle2,
  Loader2,
  Printer,
  AlertCircle,
  X
} from 'lucide-react'
import { cn } from '../lib/utils'
import { authService } from './auth.service'

interface Product { // L'interface Produit n'a pas besoin de modification
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  category: string
}

interface CartItem extends Product {
  quantity: number
}

export function ClientMenuPage() {
  const { t } = useTranslation()
  const { tenantId: routeTenantId, tableCode: routeTableCode } = useParams() // Extraction correcte des deux paramètres

  const [resolvedTableId, setTableId] = useState<string | null>(null)
  const [resolvedTenantId, setTenantId] = useState<string | null>(null)
  const [tableName, setTableName] = useState<string>('')

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('ALL')
  const [cart, setCart] = useState<CartItem[]>([])

  const [isFetching, setIsFetching] = useState(!!routeTableCode && !!routeTenantId) // Le spinner tourne si les deux sont présents
  const [isOrdering, setIsOrdering] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const [lastOrderInfo, setLastOrderInfo] = useState<{ id: string; orderNumber: string } | null>(null)

  const didResolveQrRef = useRef(false)

  // Effet A: résout table + tenant depuis le QR (une seule fois)
  useEffect(() => {
    if (!routeTableCode || !routeTenantId) { // Vérifie que les deux paramètres sont présents
      setIsFetching(false)
      return
    }

    const resolveQr = async () => {
      if (resolvedTableId && resolvedTenantId) return
      if (didResolveQrRef.current) return
      
      try {
        didResolveQrRef.current = true
        setIsFetching(true)

        const tableInfo = await authService.getTableByQRCode(routeTableCode, routeTenantId) // Passage des deux paramètres
        if (tableInfo) {
          setTableId(tableInfo.id)
          setTenantId(tableInfo.tenantId || tableInfo.branchId)
          setTableName(tableInfo.number)
        }
      } catch (e) {
        console.error('Failed to resolve QR', e)
      } finally {
        setIsFetching(false)
      }
    }

    if (routeTableCode && routeTenantId && (!resolvedTableId || !resolvedTenantId)) { // Vérification de la présence des deux paramètres
      resolveQr()
    }
  }, [routeTableCode, routeTenantId, resolvedTableId, resolvedTenantId]) // Ajout des deux paramètres comme dépendances

  // Effet B: charge menu une fois table/tenant résolus
  useEffect(() => {
    const loadMenu = async () => {
      if (!resolvedTableId || !resolvedTenantId) return

      try {
        setIsFetching(true)

        const [productsData, tableData] = await Promise.all([
          authService.getProducts({ status: 'AVAILABLE' }, resolvedTenantId),
          authService.getTable(resolvedTableId, resolvedTenantId)
        ])

        setProducts(productsData ?? [])
        if (tableData?.number) setTableName(tableData.number)

        const cats = Array.from(
          new Set(
            (productsData ?? [])
              .map((p: any) => p?.category)
              .filter((c: any) => Boolean(c) && typeof c === 'string' && c.trim().length > 0)
          )
        ) as string[]

        setCategories(cats)
      } catch (e) {
        console.error('Failed to load menu', e)
        // En cas d'erreur de chargement du menu, on arrête quand même le spinner
        setIsFetching(false)
      } finally {
        // Important: On ne coupe le chargement que si on a tenté de charger 
        // ou si une erreur est survenue.
        setIsFetching(false)
      }
    }

    loadMenu()
  }, [resolvedTableId, resolvedTenantId])

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            return { ...item, quantity: Math.max(0, item.quantity + delta) }
          }
          return item
        })
        .filter((item) => item.quantity > 0)
    )
  }


  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0)

  const categoriesToRender = useMemo(() => {
    return (categories ?? []).filter((c) => Boolean(c) && typeof c === 'string' && c.trim().length > 0)
  }, [categories])

  const productsByCategory = useMemo(() => {
    const map = new Map<string, Product[]>()
    for (const p of products) {
      if (!p.category || typeof p.category !== 'string' || p.category.trim().length === 0) continue
      if (!map.has(p.category)) map.set(p.category, [])
      map.get(p.category)!.push(p)
    }
    return map
  }, [products])

  const handlePlaceOrder = async () => {
    if (isOrdering) return
    if (!resolvedTableId || !resolvedTenantId || cart.length === 0) return

    setIsOrdering(true)
    try {
      const response = await authService.createOrder(
        {
          tableId: resolvedTableId,
          source: 'DIGITAL_MENU',
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            unitPrice: item.price
          }))
        },
        resolvedTenantId
      )

      setLastOrderInfo({ id: response.id, orderNumber: response.orderNumber })
      setOrderComplete(true)
      setCart([])
      setIsCartOpen(false)
    } catch (e) {
      alert("Erreur lors de l'envoi de la commande.")
    } finally {
      setIsOrdering(false)
    }
  }

  const handlePrintTicket = async () => {
    if (!lastOrderInfo) return
    setIsPrinting(true)
    try {
      await authService.downloadTicketPdf(lastOrderInfo.id, lastOrderInfo.orderNumber)

    } catch (e: any) {
      console.error("Erreur lors du téléchargement du ticket.", e)
      alert("Erreur lors du téléchargement du ticket.")
    } finally {
      setIsPrinting(false)
    }
  }

  if (!isFetching && (!resolvedTableId || !resolvedTenantId)) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-xl font-bold text-slate-900 mb-2">QR Code Invalide</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Veuillez scanner le QR Code présent sur votre table pour accéder à la carte et commander.
        </p>
      </div>
    )
  }

  if (isFetching) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium italic">{t('common.loading')}</p>
      </div>
    )
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="h-24 w-24 rounded-full bg-emerald-50 flex items-center justify-center mb-6 border border-emerald-100">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">{t('client_menu.order_success')}</h1>
        <p className="text-slate-500 mb-10 text-sm max-w-xs leading-relaxed">{t('client_menu.order_success_desc')}</p>

        <div className="w-full max-w-xs space-y-3">
          <button
            onClick={handlePrintTicket}
            disabled={isPrinting}
            className="w-full h-14 bg-orange-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 disabled:opacity-70 border-b-4 border-orange-800 active:border-b-0 active:translate-y-1 transition-all"
          >
            {isPrinting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Printer className="h-5 w-5" />}
            {isPrinting ? t('client_menu.downloading_ticket') : t('client_menu.print_ticket')}
          </button>

          <button
            onClick={() => setOrderComplete(false)}
            className="w-full h-12 bg-white text-slate-600 rounded-xl font-bold uppercase text-[10px] tracking-widest border border-slate-200"
          >
            Commander autre chose
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-32">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <div className="flex items-center gap-3">
              <img src="/logo/logo.png" alt="Logo" className="h-9 w-auto" />
              <div>
                <h1 className="text-base md:text-lg font-black text-slate-900 leading-none">Bistrot Central</h1>
                <p className="text-[8px] md:text-[9px] font-bold uppercase text-slate-400 tracking-wider mt-1">
                  {t('client_menu.welcome')}
                </p>
              </div>
            </div>

            {tableName && (
              <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex flex-col items-center">
                <span className="text-[8px] font-black uppercase text-slate-400">{t('client_menu.your_table')}</span>
                <span className="text-sm font-black text-slate-900">{tableName}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border-2',
                activeCategory === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-500 border-slate-100'
              )}
            >
              {t('orders_page.categories.ALL')}
            </button>

            {categoriesToRender.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border-2',
                  activeCategory === cat
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-500 border-slate-100'
                )}
              >
                {t(`orders_page.categories.${cat}`)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        {categoriesToRender
          .filter((cat) => activeCategory === 'ALL' || cat === activeCategory)
          .map((category) => {
            const list = productsByCategory.get(category) ?? []
            return (
              <section key={category} className="space-y-6">
                <h2 className="text-lg font-black text-slate-900 tracking-tight pl-1 border-l-4 border-orange-600 ml-1">
                  {t(`orders_page.categories.${category}`)}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {list.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white p-4 rounded-2xl flex flex-row-reverse items-center gap-4 border border-slate-200 hover:border-orange-200 active:scale-[0.99] transition-all cursor-pointer group"
                      onClick={() => addToCart(product)}
                    >
                      <div className="h-28 w-28 md:h-32 md:w-32 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="h-full w-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                            <Utensils className="h-8 w-8 mb-1 opacity-20" />
                            <span className="text-[8px] font-bold uppercase tracking-tighter opacity-40">No Image</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 py-1">
                        <h3 className="font-black text-slate-900 text-sm md:text-base mb-1 group-hover:text-orange-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-[11px] md:text-xs text-slate-400 line-clamp-2 leading-snug mb-4">
                          {product.description || 'Sélection du chef préparée avec soin.'}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-sm md:text-base font-black text-slate-900 tracking-tighter">
                            {product.price.toLocaleString()} FCFA
                          </span>
                          <button
                            className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-orange-600 transition-all border-b-2 border-slate-700 active:border-b-0 active:translate-y-0.5"
                            type="button"
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
      </main>

      {cartCount > 0 && !isCartOpen && (
        <div className="fixed bottom-6 left-0 right-0 px-6 z-40 animate-in slide-in-from-bottom-10 duration-500 flex justify-center">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full max-w-md h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-between px-6 active:scale-95 transition-transform border-b-4 border-slate-950"
          >
            <div className="flex items-center gap-3">
              <div className="bg-orange-600 h-7 w-7 rounded-lg flex items-center justify-center text-xs font-black">
                {cartCount}
              </div>
              <span className="text-xs font-black uppercase tracking-widest">{t('client_menu.view_cart')}</span>
            </div>
            <span className="text-sm font-black tracking-tight">{total.toLocaleString()} FCFA</span>
          </button>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />

          <div className="relative bg-white rounded-t-3xl max-w-2xl mx-auto w-full max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-500">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl">
              <h2 className="text-xl font-black text-slate-900">{t('client_menu.cart_title')}</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-lg overflow-hidden bg-slate-50 border border-slate-50 shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-300 bg-slate-50">
                        <Utensils className="h-5 w-5 opacity-30" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">{item.name}</h4>
                    <p className="text-xs font-black text-orange-600">{item.price.toLocaleString()} F</p>
                  </div>
                  <div className="flex items-center bg-slate-100 rounded-full px-2 py-1">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="h-6 w-6 flex items-center justify-center text-slate-500"
                      type="button"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-black text-slate-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="h-6 w-6 flex items-center justify-center text-slate-500"
                      type="button"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-white border-t border-slate-100 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{t('client_menu.total')}</span>
                <span className="text-2xl font-black text-slate-900">{total.toLocaleString()} F</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={isOrdering || cart.length === 0}
                className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black uppercase text-xs tracking-widest border-b-4 border-orange-800 flex items-center justify-center gap-3 disabled:opacity-50 transition-all active:border-b-0 active:translate-y-1"
              >
                {isOrdering ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingCart className="h-5 w-5" />}
                {t('client_menu.confirm_order')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}