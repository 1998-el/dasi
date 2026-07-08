import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { 
  Plus, 
  Search, 
  Package, 
  ChevronLeft,
  ChevronRight,
  AlertTriangle, 
  X, 
  Save, 
  Trash2,
  Tags,
  Archive,
  Edit3,
  Loader2,
  Info,
  CalendarClock,
  BarChart3,
  Layers2,
  ShieldCheck
} from 'lucide-react'
import { cn } from '../lib/utils'
import { authService } from './auth.service'
import { useToast, Toast } from '../components/ui/Toast'
import { useAuth } from '../context/AuthContext'
import { DeleteDialog } from '../components/ui/DeleteDialog'

// Types alignés sur l'enum ProductCategory du backend (Prisma)
type ProductStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED';
type ProductCategory =
  | 'FOOD' | 'BEVERAGE' | 'DESSERT' | 'OTHER' | 'STARTER' | 'MAIN_COURSE' | 'DRINK'
  | 'COCKTAIL' | 'WINE' | 'BEER' | 'FAST_FOOD' | 'BREAKFAST' | 'SIDE_DISH' | 'SAUCE'
  | 'MATERIEL_MEDICAL' | 'CARRELAGE' | 'PEINTURE' | 'PLOMBERIE' | 'ELECTRICITE'
  | 'OUTILLAGE' | 'QUINCAILLERIE' | 'MENUISERIE' | 'DIAGNOSTIC' | 'ALIMENTAIRE'
  | 'ENTRETIEN' | 'AUTRES' | 'DIVERS';

interface Product {
  id: string;
  name: string;
  sku: string;
  category?: ProductCategory;        // Relation Category (nom)
  categoryEnum?: ProductCategory;    // Enum persisté côté backend (utilisé par les filtres)
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  status: ProductStatus;
  trackStock: boolean;
  description?: string;
  imageUrl?: string;
  taxRate?: number;
  barcode?: string; // Pour Retail/Pharmacy
  batchNumber?: string; // Pour Pharmacy
  expiryDate?: string; // Pour Pharmacy
  unit?: string;
}

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  // Restaurant
  STARTER: 'Entrées',
  MAIN_COURSE: 'Plats',
  DESSERT: 'Desserts',
  BEVERAGE: 'Boissons',
  DRINK: 'Boissons',
  COCKTAIL: 'Cocktails',
  WINE: 'Vins',
  BEER: 'Bières',
  BREAKFAST: 'Petit-déjeuner',
  FAST_FOOD: 'Fast-food',
  SIDE_DISH: 'Accompagnements',
  SAUCE: 'Sauces',
  FOOD: 'Autres plats',
  // Retail / Pharmacy
  ALIMENTAIRE: 'Alimentaire',
  ENTRETIEN: 'Entretien',
  AUTRES: 'Autres',
  DIVERS: 'Divers',
  MATERIEL_MEDICAL: 'Matériel médical',
  // Bricolage / Quincaillerie (valeurs enum existantes)
  CARRELAGE: 'Carrelage',
  PEINTURE: 'Peinture',
  PLOMBERIE: 'Plomberie',
  ELECTRICITE: 'Électricité',
  OUTILLAGE: 'Outillage',
  QUINCAILLERIE: 'Quincaillerie',
  MENUISERIE: 'Menuiserie',
  DIAGNOSTIC: 'Diagnostic',
  OTHER: 'Autres',
};

// Catégories proposées selon le métier (toujours des valeurs valides de l'enum ProductCategory)
const CATEGORY_OPTIONS_BY_TYPE: Record<string, ProductCategory[]> = {
  RESTAURANT: ['STARTER', 'MAIN_COURSE', 'DESSERT', 'BEVERAGE', 'SIDE_DISH', 'SAUCE', 'BREAKFAST', 'FAST_FOOD', 'FOOD', 'OTHER'],
  RETAIL: ['ALIMENTAIRE', 'ENTRETIEN', 'AUTRES', 'DIVERS', 'MATERIEL_MEDICAL'],
  PHARMACY: ['MATERIEL_MEDICAL', 'ALIMENTAIRE', 'ENTRETIEN', 'AUTRES', 'DIVERS'],
};

// Placeholders du formulaire "Nouveau Produit" adaptés au métier
const PRODUCT_PLACEHOLDERS: Record<string, { name: string; description: string }> = {
  RESTAURANT: {
    name: 'Ex: Ndolé spécial, Jus de mangue...',
    description: 'Ingrédients, allergènes ou détails particuliers...',
  },
  RETAIL: {
    name: 'Ex: Savon, Riz 5kg, T-shirt...',
    description: 'Marque, caractéristiques ou détails produit...',
  },
  PHARMACY: {
    name: 'Ex: Paracétamol 500mg, Bandelette...',
    description: 'DCI, posologie ou précautions d\'emploi...',
  },
};

const STATUS_CONFIG: Record<ProductStatus, { label: string; badge: string }> = {
  AVAILABLE: { label: 'Disponible', badge: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  UNAVAILABLE: { label: 'Non disponible', badge: 'bg-slate-50 border-slate-200 text-slate-700' },
  OUT_OF_STOCK: { label: 'Rupture', badge: 'bg-amber-50 border-amber-200 text-amber-700' },
  DISCONTINUED: { label: 'Arrêté', badge: 'bg-red-50 border-red-200 text-red-700' },
};

interface ProductStats {
  total: number;
  available: number;
  lowStock: number;
  totalValue: number;
  outOfStock: number;
}

const generateSKU = (name: string) => {
  if (!name || name.trim().length === 0) return '';
  const prefix = (name.trim().substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '') || 'PRD').padEnd(3, 'X');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${random}`;
};

export function ProductsPage() {
  const { businessConfig } = useAuth()
  const { showError, showSuccess, toast, clear } = useToast()

  // Catégories cohérentes avec le métier (source unique de vérité)
  const categoryOptions = useMemo(
    () => CATEGORY_OPTIONS_BY_TYPE[businessConfig.type] || CATEGORY_OPTIONS_BY_TYPE.RESTAURANT,
    [businessConfig.type]
  )
  const placeholders = PRODUCT_PLACEHOLDERS[businessConfig.type] || PRODUCT_PLACEHOLDERS.RESTAURANT

  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<ProductStats | null>(null)
  const [isFetching, setIsFetching] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isAutoSku, setIsAutoSku] = useState(true)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false)
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 9
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: 'MAIN_COURSE' as ProductCategory,
    price: 0,
    costPrice: 0,
    stock: 0,
    minStock: 5,
    unit: 'piece',
    barcode: '',
    status: 'AVAILABLE' as ProductStatus,
    image: null as File | null,
    batchNumber: '',
    expiryDate: '',
  })

  const loadData = useCallback(async () => {
    setIsFetching(true)
    try {
      const [productsData, statsData] = await Promise.all([
        authService.getProducts({ 
          search: searchTerm, 
          category: categoryFilter === 'ALL' ? undefined : categoryFilter,
          status: statusFilter === 'ALL' ? undefined : statusFilter
        }),
        authService.getProductStats()
      ])
      setProducts(productsData)
      setStats(statsData)
    } catch (e: any) {
      showError(e.message || "Erreur de chargement du catalogue")
    } finally {
      setIsFetching(false)
    }
  }, [searchTerm, categoryFilter, statusFilter, showError])

  // Pagination
  const totalPages = Math.ceil(products.length / PAGE_SIZE)
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return products.slice(start, start + PAGE_SIZE)
  }, [products, currentPage])

  useEffect(() => { setCurrentPage(1) }, [searchTerm, categoryFilter, statusFilter])

  useEffect(() => {
    if (isFetching && products.length > 0) return // Évite les doubles appels inutiles
    const timer = setTimeout(() => loadData(), 400)
    return () => clearTimeout(timer)
  }, [loadData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    clear()

    try {
      const data = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'image') {
          if (value instanceof File) data.append('image', value);
        } else if (key === 'description' && !value) {
          return;
        } else if (value !== null && value !== undefined) {
          data.append(key, String(value));
        }
      })

      if (editingProduct) {
        await authService.updateProduct(editingProduct.id, data)
        showSuccess(`Produit ${formData.name} mis à jour`)
      } else {
        await authService.createProduct(data)
        showSuccess(`Produit ${formData.name} ajouté au catalogue`)
      }

      closeDrawer()
      loadData()
    } catch (e: any) {
      showError(e.message || "Erreur lors de l'enregistrement")
    } finally {
      setIsProcessing(false)
    }
  }

  const openCreateDrawer = () => {
    setEditingProduct(null)
    setIsAutoSku(true)
    setFormData({ 
      name: '', sku: '', description: '', category: 'MAIN_COURSE', barcode: '', batchNumber: '', expiryDate: '',
      price: 0, costPrice: 0, stock: 0, minStock: 5, unit: 'piece', 
      status: 'AVAILABLE', image: null 
    })
    setIsDrawerOpen(true)
  }

  const openEditDrawer = (product: Product) => {
    setEditingProduct(product)
    setIsAutoSku(false)
    setFormData({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      category: (product.categoryEnum || product.category || 'MAIN_COURSE') as ProductCategory,
      price: product.price,
      costPrice: product.costPrice,
      stock: product.stock,
      minStock: product.minStock,
      barcode: product.barcode || '',
      unit: product.unit || 'piece',
      status: product.status,
      image: null,
      batchNumber: product.batchNumber || '',
      expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : '',
    })
    setIsDrawerOpen(true)
  }

  const openDetailsDrawer = async (product: Product) => {
    setSelectedProductDetails(product)
    setIsDetailsDrawerOpen(true)
    try {
      const freshData = await authService.getProduct(product.id)
      setSelectedProductDetails(freshData)
    } catch (e) {
      console.error("Erreur lors de la mise à jour des détails", e)
    }
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setEditingProduct(null)
    setIsAutoSku(true)
    setFormData({ 
      name: '', sku: '', description: '', category: 'MAIN_COURSE', barcode: '', batchNumber: '', expiryDate: '',
      price: 0, costPrice: 0, stock: 0, minStock: 5, unit: 'piece', 
      status: 'AVAILABLE', image: null 
    })
  }

  const confirmDelete = async () => {
    if (!productToDelete) return
    setIsProcessing(true)
    try {
      await authService.deleteProduct(productToDelete.id)
      showSuccess("Produit supprimé")
      setIsDeleteOpen(false)
      loadData()
    } catch (e: any) {
      showError("Échec de la suppression")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="fixed top-4 right-4 z-[100]">
        {toast && <Toast toast={toast} />}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{businessConfig.labels.products}</h1>
          <p className="text-sm text-slate-500">Gérez votre {businessConfig.type === 'RESTAURANT' ? 'carte' : 'inventaire'}, les prix et les catégories.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Rechercher..." 
              className="pl-9 w-64 h-9 rounded-sm border-slate-200 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            className="h-9 px-3 border border-slate-200 rounded-sm text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">Toutes catégories</option>
            {categoryOptions.map((val) => (
              <option key={val} value={val}>{CATEGORY_LABELS[val]}</option>
            ))}
          </select>

          <select 
            className="h-9 px-3 border border-slate-200 rounded-sm text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tous les statuts</option>
            {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>

          <Button 
            onClick={openCreateDrawer}
            className="bg-orange-600 hover:bg-orange-700 text-white h-9 rounded-sm flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouveau Produit
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Produits", value: stats?.total ?? 0, icon: Package, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Alertes Stock", value: stats?.lowStock ?? 0, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Valeur Stock", value: `${(stats?.totalValue ?? 0).toLocaleString()} FCFA`, icon: Tags, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Ruptures", value: stats?.outOfStock ?? 0, icon: Archive, color: "text-red-600", bg: "bg-red-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-sm border border-slate-200">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
              <div className={cn("p-1.5 rounded-sm", stat.bg, stat.color)}>
                <stat.icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-lg font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>
      
      {isFetching && products.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin mb-4" />
          <p className="text-sm text-slate-500 font-medium">Chargement du catalogue...</p>
        </div>
      ) : (
      <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedProducts.map((product) => (
          <Card key={product.id} className="hover:border-orange-200 p-4 transition-colors">
            <CardHeader className="pb-3 border-b border-slate-50 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded-sm object-cover border border-slate-100" />
                )}
                <div className="flex flex-col">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{product.sku}</span>
                <CardTitle className="text-sm font-bold text-slate-900 mt-0.5">{product.name}</CardTitle>
                {businessConfig.features.hasBatches && (
                  <div className="flex items-center gap-1 mt-1 text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded">
                    <CalendarClock className="h-2.5 w-2.5" /> FEFO Actif
                  </div>
                )}
                </div>
              </div>
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-sm border uppercase tracking-tighter", STATUS_CONFIG[product.status].badge)}>
                {STATUS_CONFIG[product.status].label}
              </span>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex justify-between items-end">
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Catégorie</span>
                    <span className="text-xs text-slate-700 font-medium">{CATEGORY_LABELS[product.categoryEnum as ProductCategory] || CATEGORY_LABELS[product.category as ProductCategory] || '—'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Stock</span>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs font-bold", product.stock <= product.minStock ? "text-amber-600" : "text-slate-900")}>{product.stock} unités</span>
                      {product.stock <= product.minStock && <AlertTriangle className="h-3 w-3 text-amber-500" />}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-slate-900">{product.price.toLocaleString()} FCFA</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                <div className="flex gap-2">
                  <button 
                    onClick={() => openEditDrawer(product)}
                    className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-sm transition-colors"><Edit3 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => { setProductToDelete(product); setIsDeleteOpen(true); }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <button 
                  onClick={() => openDetailsDrawer(product)}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest flex items-center gap-1 transition-colors"
                >
                  Détails <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 border border-slate-200 rounded-sm">
          <p className="text-xs text-slate-500 font-medium">
            Affichage de {(currentPage - 1) * PAGE_SIZE + 1} à {Math.min(currentPage * PAGE_SIZE, products.length)} sur {products.length} produits
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline" size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="h-8 w-8 p-0 rounded-sm"
            ><ChevronLeft className="h-4 w-4" /></Button>
            <Button
              variant="outline" size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="h-8 w-8 p-0 rounded-sm"
            ><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
      </div>
      )}

      {/* Side Drawer (Add Product) */}
      <div className={cn(
        "fixed inset-0 z-50 flex justify-end transition-all duration-300",
        isDrawerOpen ? "visible" : "invisible pointer-events-none"
      )}>
        <div className={cn("fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-500", isDrawerOpen ? "opacity-100" : "opacity-0")} onClick={closeDrawer} />
        <div className={cn("relative bg-white w-full max-w-xl h-full border-l border-slate-200 flex flex-col overflow-hidden transition-all duration-500 ease-out shadow-2xl", isDrawerOpen ? "translate-x-0" : "translate-x-full")}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">{editingProduct ? 'Modifier le produit' : 'Nouveau Produit'}</h2>
            <Button variant="ghost" size="icon" onClick={closeDrawer}><X className="h-5 w-5" /></Button>
          </div>
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Désignation</Label>
                <Input 
                  required 
                  placeholder={placeholders.name}
                  className="h-10 rounded-sm border-slate-200" 
                  value={formData.name} 
                  onChange={e => {
                    const name = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      name,
                      sku: isAutoSku ? generateSKU(name) : prev.sku
                    }));
                  }} 
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">SKU</Label>
                  <button 
                    type="button"
                    onClick={() => {
                      const nextAuto = !isAutoSku;
                      setIsAutoSku(nextAuto);
                      if (nextAuto) {
                        setFormData(prev => ({ ...prev, sku: generateSKU(prev.name) }));
                      }
                    }}
                    className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-sm border transition-colors",
                      isAutoSku ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-slate-50 border-slate-200 text-slate-400"
                    )}
                  >
                    {isAutoSku ? 'Génération AUTO' : 'Saisie MANUELLE'}
                  </button>
                </div>
                <Input 
                  required 
                  disabled={isAutoSku}
                  className="h-10 rounded-sm border-slate-200 disabled:bg-slate-50 disabled:opacity-70 font-mono text-xs" 
                  value={formData.sku} 
                  onChange={e => setFormData({...formData, sku: e.target.value})} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Code-barres / EAN</Label>
                <Input 
                  placeholder="Scanner ou saisir..."
                  className="h-10 rounded-sm border-slate-200" 
                  value={formData.barcode} 
                  onChange={e => setFormData({...formData, barcode: e.target.value})} 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Unité de mesure</Label>
                <select 
                  className="w-full h-10 px-3 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-orange-500 bg-white"
                  value={formData.unit} 
                  onChange={e => setFormData({...formData, unit: e.target.value})}
                >
                  <option value="piece">Pièce (u)</option>
                  <option value="kg">Kilogramme (kg)</option>
                  <option value="g">Gramme (g)</option>
                  <option value="l">Litre (l)</option>
                  <option value="ml">Millilitre (ml)</option>
                  <option value="box">Boîte / Carton</option>
                  <option value="tablet">Comprimé / Tablette</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Description</Label>
              <textarea 
                className="w-full p-3 border border-slate-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 h-24 resize-none"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder={placeholders.description}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Catégorie</Label>
              <select className="w-full h-10 px-3 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-orange-500 bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as ProductCategory})}>
                {categoryOptions.map((v) => (
                  <option key={v} value={v}>{CATEGORY_LABELS[v]}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Statut</Label>
              <select className="w-full h-10 px-3 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-orange-500 bg-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as ProductStatus})}>
                {Object.entries(STATUS_CONFIG).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
              </select>
            </div>

            {businessConfig.type === 'PHARMACY' && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-sm space-y-4">
                <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Informations de Traçabilité (Lots)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-emerald-700 uppercase">N° de Lot</Label>
                    <Input className="h-9 bg-white border-emerald-200 text-xs" value={formData.batchNumber} onChange={e => setFormData({...formData, batchNumber: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-emerald-700 uppercase">Date d'expiration</Label>
                    <Input type="date" className="h-9 bg-white border-emerald-200 text-xs" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Prix Vente (FCFA)</Label>
                <Input type="number" required className="h-10 rounded-sm border-slate-200" value={formData.price || 0} onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Prix Revient (FCFA)</Label>
                <Input type="number" required className="h-10 rounded-sm border-slate-200" value={formData.costPrice || 0} onChange={e => setFormData({...formData, costPrice: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Stock Initial</Label>
                <Input type="number" className="h-10 rounded-sm border-slate-200" value={formData.stock || 0} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Alerte Min</Label>
                <Input type="number" className="h-10 rounded-sm border-slate-200" value={formData.minStock || 0} onChange={e => setFormData({...formData, minStock: parseInt(e.target.value) || 0})} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Image du produit</Label>
              <div className="flex flex-col gap-2">
                {editingProduct?.imageUrl && !formData.image && (
                  <img src={editingProduct.imageUrl} alt="Preview" className="h-20 w-20 object-cover rounded-sm border" />
                )}
                <Input type="file" accept="image/*" className="h-10 pt-2 rounded-sm border-slate-200" onChange={e => setFormData({...formData, image: e.target.files?.[0] || null})} />
              </div>
            </div>
          </form>
          <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
            <Button variant="outline" className="flex-1 rounded-sm" onClick={closeDrawer}>Annuler</Button>
            <Button 
              disabled={isProcessing}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded-sm" 
              onClick={handleSubmit}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Enregistrer
            </Button>
          </div>
        </div>
      </div>

      {/* Side Drawer (Product Details) */}
      <div className={cn(
        "fixed inset-0 z-50 flex justify-end transition-all duration-300",
        isDetailsDrawerOpen ? "visible" : "invisible pointer-events-none"
      )}>
        <div className={cn("fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-500", isDetailsDrawerOpen ? "opacity-100" : "opacity-0")} onClick={() => setIsDetailsDrawerOpen(false)} />
        <div className={cn("relative bg-white w-full max-w-xl h-full border-l border-slate-200 flex flex-col overflow-hidden transition-all duration-500 ease-out shadow-2xl", isDetailsDrawerOpen ? "translate-x-0" : "translate-x-full")}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Info className="h-5 w-5 text-orange-600" />
              Fiche Produit
            </h2>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsDetailsDrawerOpen(false)}><X className="h-5 w-5 text-slate-400" /></Button>
          </div>
          
          {selectedProductDetails && (
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Hero Section */}
              <div className="flex items-start gap-6">
                <div className="h-32 w-32 rounded-sm border border-slate-100 overflow-hidden bg-slate-50 shrink-0 ">
                  {selectedProductDetails.imageUrl ? (
                    <img src={selectedProductDetails.imageUrl} alt={selectedProductDetails.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-slate-50 text-slate-200">
                      <Package className="h-12 w-12" />
                    </div>
                  )}
                </div>
                <div className="space-y-1 pt-2">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">{selectedProductDetails.sku}</span>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">{selectedProductDetails.name}</h3>
                  <span className={cn("inline-block text-[10px] font-bold px-2 py-0.5 rounded-sm border uppercase tracking-tighter mt-2", STATUS_CONFIG[selectedProductDetails.status].badge)}>
                    {STATUS_CONFIG[selectedProductDetails.status].label}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description & Ingrédients</Label>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-sm border border-slate-100 italic">
                  {selectedProductDetails.description || "Aucune description détaillée n'a été renseignée pour ce produit."}
                </p>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-6">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Tags className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Prix Vente</span>
                    </div>
                    <span className="text-xl font-black text-slate-900">{selectedProductDetails.price.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-slate-400">
                      <BarChart3 className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Rentabilité</span>
                    </div>
                    <div className="space-y-0.5">
                       <span className="text-sm font-bold text-slate-700">Coût: {selectedProductDetails.costPrice.toLocaleString()} FCFA</span>
                       <p className="text-[10px] text-emerald-600 font-bold bg-emerald-50 w-fit px-1.5 py-0.5 rounded-sm">
                         Marge: {((selectedProductDetails.price - selectedProductDetails.costPrice) / selectedProductDetails.price * 100).toFixed(1)}%
                       </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Layers2 className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Stock Actuel</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={cn("text-xl font-black", selectedProductDetails.stock <= selectedProductDetails.minStock ? "text-amber-600" : "text-slate-900")}>
                        {selectedProductDetails.stock}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase">{selectedProductDetails.unit || 'pièces'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-slate-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Gestion Stock</span>
                    </div>
                    <div className="space-y-0.5">
                       <span className="text-sm font-bold text-slate-700">Min: {selectedProductDetails.minStock} {selectedProductDetails.unit || 'unités'}</span>
                       <p className="text-[10px] text-slate-400 font-medium">Suivi activé: {selectedProductDetails.trackStock ? 'OUI' : 'NON'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning Area if Stock is Low */}
              {selectedProductDetails.stock <= selectedProductDetails.minStock && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-sm flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-red-900 uppercase tracking-tight">Alerte Rupture Immédiate</p>
                    <p className="text-[11px] text-red-700/80 leading-relaxed mt-0.5 font-medium">
                      Le stock actuel est inférieur au seuil de sécurité. Un réapprovisionnement est fortement conseillé.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="p-4 bg-white border-t border-slate-100 flex gap-3 sticky bottom-0">
            <Button 
              variant="outline" 
              className="flex-1 rounded-sm font-bold border-slate-200" 
              onClick={() => setIsDetailsDrawerOpen(false)}
            >
              Fermer
            </Button>
            <Button 
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded-sm font-bold flex items-center justify-center gap-2"
              onClick={() => {
                setIsDetailsDrawerOpen(false);
                if (selectedProductDetails) openEditDrawer(selectedProductDetails);
              }}
            >
              <Edit3 className="h-4 w-4" />
              Modifier la fiche
            </Button>
          </div>
        </div>
      </div>

      <DeleteDialog 
        isOpen={isDeleteOpen}
        isLoading={isProcessing}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Supprimer le produit"
        description="Voulez-vous vraiment retirer ce produit du catalogue ? Cette action est irréversible."
        itemName={productToDelete?.name}
      />
    </DashboardLayout>
  )
}