import React, { useEffect, useState, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { DashboardLayout } from '../components/DashboardLayout'
import { 
  QrCode, 
  Users, 
  Percent, 
  RefreshCw, 
  Download, 
  LayoutGrid, 
  List,
  Plus,
  X,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronDown,
  ChevronUp,
  Save,
  Loader2,
  AlertCircle,
  Trash2,
  Edit2,
  Check,
  Search,
  Eye,
  FileText,
  Grid3x3,
  MapPin,
  UtensilsCrossed,
  Sparkles,
  Wrench,
  Ban,
  CalendarClock
} from 'lucide-react'
import { cn } from '../lib/utils' // Assuming cn is a utility for class names
import { useAuth, useRequireRole } from '../context/AuthContext'
import { authService } from './auth.service'
import { useToast, Toast } from '../components/ui/Toast'
import { DeleteDialog } from '../components/ui/DeleteDialog'

// Types alignés sur le backend Prisma
export type TableStatus = 'FREE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' | 'MAINTENANCE' | 'OUT_OF_SERVICE'

interface RestaurantTable {
  id: string
  number: string
  name: string
  capacity: number
  status: TableStatus
  zone: string | null
  positionX: number | null
  positionY: number | null
  qrCode: string
  qrCodeUrl: string
  qrCodeImage?: string | null
  isActive: boolean
  branchId?: string | null
  currentOrderId?: string | null
  totalOrders: number
  totalRevenue: number
  lastOrderAt?: string | null
  createdAt: string
  updatedAt: string
}

interface TableStats {
  total: number
  free: number
  occupied: number
  reserved: number
  cleaning: number
  maintenance: number
  outOfService: number
  occupancyRate: number
}

// Configuration visuelle des statuts (alignée sur les couleurs backend)
// Chaque statut porte désormais son icône, sa couleur d'accent et ses classes
// de carte (fond + bordure) afin d'avoir une seule source de vérité pour
// l'affichage du statut, quel que soit le mode de vue (grille, plan, liste).
const statusConfig: Record<TableStatus, {
  label: string
  bg: string
  text: string
  badge: string
  icon: React.ElementType
  card: string
  cardAccent: string
  action: string
}> = {
  FREE: {
    label: 'Libre',
    bg: 'bg-emerald-500',
    text: 'text-emerald-700',
    badge: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    icon: Check,
    card: 'bg-emerald-50 border-emerald-200',
    cardAccent: 'text-emerald-700',
    action: 'Installer des clients',
  },
  OCCUPIED: {
    label: 'Occupée',
    bg: 'bg-red-500',
    text: 'text-red-700',
    badge: 'bg-red-50 border-red-200 text-red-800',
    icon: UtensilsCrossed,
    card: 'bg-red-50 border-red-200',
    cardAccent: 'text-red-700',
    action: 'Libérer la table',
  },
  RESERVED: {
    label: 'Réservée',
    bg: 'bg-amber-500',
    text: 'text-amber-700',
    badge: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: CalendarClock,
    card: 'bg-amber-50 border-amber-200',
    cardAccent: 'text-amber-700',
    action: 'Installer les clients',
  },
  CLEANING: {
    label: 'Nettoyage',
    bg: 'bg-orange-500',
    text: 'text-orange-700',
    badge: 'bg-orange-50 border-orange-200 text-orange-800',
    icon: Sparkles,
    card: 'bg-orange-50 border-orange-200',
    cardAccent: 'text-orange-700',
    action: 'Marquer comme libre',
  },
  MAINTENANCE: {
    label: 'Maintenance',
    bg: 'bg-slate-500',
    text: 'text-slate-700',
    badge: 'bg-slate-50 border-slate-200 text-slate-800',
    icon: Wrench,
    card: 'bg-slate-100 border-slate-300',
    cardAccent: 'text-slate-700',
    action: 'Remettre en service',
  },
  OUT_OF_SERVICE: {
    label: 'Hors service',
    bg: 'bg-neutral-800',
    text: 'text-neutral-700',
    badge: 'bg-neutral-100 border-neutral-300 text-neutral-800',
    icon: Ban,
    card: 'bg-neutral-100 border-neutral-300',
    cardAccent: 'text-neutral-700',
    action: 'Remettre en service',
  },
}

const statusOptions: TableStatus[] = ['FREE', 'OCCUPIED', 'RESERVED', 'CLEANING', 'MAINTENANCE', 'OUT_OF_SERVICE']

// Zones disponibles
const zoneOptions = ['Salle Principale', 'Terrasse', 'VIP / Salon', 'Bar', 'Mezzanine', 'Jardin']

// Configuration visuelle des zones
const ZONE_THEMES: Record<string, { color: string; bg: string; border: string; bar: string }> = {
  'Salle Principale': { color: 'text-orange-600', bg: 'bg-orange-400/5', border: 'border-orange-200', bar: 'bg-orange-500' },
  'Terrasse': { color: 'text-emerald-600', bg: 'bg-emerald-400/5', border: 'border-emerald-200', bar: 'bg-emerald-500' },
  'VIP / Salon': { color: 'text-purple-600', bg: 'bg-purple-400/5', border: 'border-purple-200', bar: 'bg-purple-500' },
  'Bar': { color: 'text-amber-600', bg: 'bg-amber-400/5', border: 'border-amber-200', bar: 'bg-amber-500' },
  'Mezzanine': { color: 'text-orange-600', bg: 'bg-orange-400/5', border: 'border-orange-200', bar: 'bg-orange-500' },
  'Jardin': { color: 'text-lime-600', bg: 'bg-lime-400/5', border: 'border-lime-200', bar: 'bg-lime-500' },
  'default': { color: 'text-slate-600', bg: 'bg-slate-400/5', border: 'border-slate-200', bar: 'bg-slate-500' }
}

export function TablesPage() {
  const {
    user,
    tenantId,
    isLoading: authLoading,
    refreshTenantId,
    isAuthenticated,
    businessConfig
  } = useAuth()
  const [viewMode, setViewMode] = useState<'plan' | 'grid' | 'list'>('grid')
  const [tables, setTables] = useState<RestaurantTable[]>([])
  const [stats, setStats] = useState<TableStats | null>(null)
  const [isFetching, setIsFetching] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [tableToDelete, setTableToDelete] = useState<RestaurantTable | null>(null)
  const [tableToPreview, setTableToPreview] = useState<RestaurantTable | null>(null)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null)
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<TableStatus | 'ALL'>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 10
  const [collapsedZones, setCollapsedZones] = useState<Record<string, boolean>>({})

  // Autoriser admin, manager et waiter (serveur)
  useRequireRole(['admin', 'manager', 'waiter', 'super_admin'] as any, '/dashboard')

  // Sécurité métier : Rediriger si ce n'est pas un restaurant
  if (businessConfig.type !== 'RESTAURANT') {
    return <Navigate to="/dashboard" replace />
  }

  const [formData, setFormData] = useState({
    number: '',
    name: '',
    capacity: 4,
    zone: 'Salle Principale'
  })

  const { toast, showSuccess, showError } = useToast()

  // Calcul local des statistiques pour garantir l'affichage même si l'endpoint stats échoue
  const computedStats = useMemo(() => {
    if (!tables || tables.length === 0) return null;
    
    const counts = tables.reduce((acc, table) => {
      const status = table.status as TableStatus;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<TableStatus, number>);

    const total = tables.length;
    const occupied = counts.OCCUPIED || 0;

    return {
      total,
      free: counts.FREE || 0,
      occupied,
      reserved: counts.RESERVED || 0,
      cleaning: counts.CLEANING || 0,
      maintenance: counts.MAINTENANCE || 0,
      outOfService: counts.OUT_OF_SERVICE || 0,
      occupancyRate: total > 0 ? (occupied / total) * 100 : 0
    };
  }, [tables]);

  // Gestion du Drag & Drop pour le plan interactif
  const planRef = React.useRef<HTMLDivElement>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Récupération des données
  const fetchAllData = async () => {
    // Validation avant appel API
    if (!tenantId || tenantId === 'null' || tenantId === 'undefined') {
      setError("Configuration manquante. Veuillez vous reconnecter.")
      return
    }
    if (!isAuthenticated) {
      setError("Session expirée. Veuillez vous reconnecter.")
      return
    }

    setError(null)
    setIsFetching(true)
    try {
      const [tablesData, statsData] = await Promise.all([
        authService.getTables(),
        authService.getTableStats(),
      ])
      
      console.log('[TablesPage] Données des tables reçues du backend:', tablesData);
      console.log('[TablesPage] Statistiques des tables reçues du backend:', statsData);

      setTables(tablesData ?? [])
      setStats(statsData)

      console.log(`✅ Données chargées pour le tenant: ${tenantId}`)

    } catch (e: any) {
      console.error('Erreur chargement:', e)

      if (e.message?.includes('401') || e.message?.includes('Unauthorized')) {
        setError("Session expirée. Redirection vers la page de connexion...")
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      } else if (e.message?.includes('tenant')) {
        setError("Erreur de configuration du restaurant. Veuillez contacter l'administrateur.")
        await refreshTenantId()
      } else {
        setError(e.message || "Erreur lors du chargement des tables")
      }
    } finally {
      setIsFetching(false)
    }
  }

  // Vérification du tenantId
  useEffect(() => {
    if (user && !tenantId && !authLoading) {
      console.warn('TenantId manquant, tentative de récupération...')
      refreshTenantId()
    }
  }, [user, tenantId, authLoading, refreshTenantId])

  // Déclenche le chargement des données quand l'auth est prête et le tenantId est là
  useEffect(() => {
    if (!authLoading && user?.id && tenantId) {
      fetchAllData()
    }
  }, [user?.id, authLoading, tenantId])

  // Charger l'image réelle du QR code pour l'aperçu intelligent
  useEffect(() => {
    let currentUrl: string | null = null;
    
    if (isPreviewOpen && tableToPreview) {
      const loadPreview = async () => {
        // OPTIMISATION : Si la DataURL est déjà présente dans l'objet table, on l'utilise directement
        if (tableToPreview.qrCodeImage && tableToPreview.qrCodeImage.startsWith('data:image')) {
          setPreviewImageUrl(tableToPreview.qrCodeImage);
          setIsLoadingPreview(false);
          return;
        }

        setIsLoadingPreview(true)
        try {
          currentUrl = await authService.getTableQRCodeBlob(tableToPreview.id)
          setPreviewImageUrl(currentUrl)
        } catch (e) {
          console.error('[Preview] Failed to load QR code image:', e)
        } finally {
          setIsLoadingPreview(false)
        }
      }
      loadPreview()
    }

    return () => {
      if (currentUrl) URL.revokeObjectURL(currentUrl)
      setPreviewImageUrl(null)
    }
  }, [isPreviewOpen, tableToPreview])

  const handleMouseDown = (e: React.MouseEvent, table: RestaurantTable) => {
    if (isProcessing || viewMode !== 'plan') return
    if ((e.target as HTMLElement).closest('button')) return // Ne pas drag si on clique sur un bouton du menu rapide
    
    setDraggingId(table.id)
    setDragOffset({
      x: e.clientX - (table.positionX || 0),
      y: e.clientY - (table.positionY || 0)
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !planRef.current) return
    
    const rect = planRef.current.getBoundingClientRect()
    let x = e.clientX - dragOffset.x
    let y = e.clientY - dragOffset.y
    
    // Contraintes : rester dans les limites du conteneur (w-28 = 112px)
    x = Math.max(0, Math.min(x, rect.width - 112))
    y = Math.max(0, Math.min(y, rect.height - 112))
    
    // Magnétisme (snap to grid) par pas de 15px pour l'alignement
    const step = 15
    x = Math.round(x / step) * step
    y = Math.round(y / step) * step

    setTables(prev => (prev ?? []).map(t => t.id === draggingId ? { ...t, positionX: x, positionY: y } : t))
  }

  const handleMouseUp = async () => {
    if (!draggingId) return
    const table = (tables || []).find(t => t.id === draggingId)
    setDraggingId(null)
    
    if (table) {
      try {
        await authService.updateTable(table.id, {
          positionX: table.positionX || 0,
          positionY: table.positionY || 0
        })
      } catch (e) {
        console.error("Erreur sauvegarde position:", e)
      }
    }
  }

  // Calcul des délimitations de zones basé sur la position des tables
  const zoneAreas = useMemo(() => {
    const areas: Record<string, { minX: number; minY: number; maxX: number; maxY: number }> = {};
    
    (tables || []).filter(t => t.isActive && t.zone).forEach(table => {
      const zone = table.zone!
      const x = table.positionX || 50
      const y = table.positionY || 50
      const width = 112 // w-28
      const height = 112 // h-28

      if (!areas[zone]) {
        areas[zone] = { minX: x, minY: y, maxX: x + width, maxY: y + height }
      } else {
        areas[zone].minX = Math.min(areas[zone].minX, x)
        areas[zone].minY = Math.min(areas[zone].minY, y)
        areas[zone].maxX = Math.max(areas[zone].maxX, x + width)
        areas[zone].maxY = Math.max(areas[zone].maxY, y + height)
      }
    })

    return areas
  }, [tables])

  // Regroupement des tables par zone pour la vue Grille (inspirée de la maquette)
  const tablesByZone = useMemo(() => {
    const groups: Record<string, RestaurantTable[]> = {}
    filteredTablesForGrouping(tables).forEach(table => {
      const zone = table.zone || 'Sans zone'
      if (!groups[zone]) groups[zone] = []
      groups[zone].push(table)
    })
    return groups
  }, [tables])

  // Mise à jour du statut d'une table
  const handleStatusChange = async (id: string, newStatus: TableStatus) => {
    setIsProcessing(true)
    try {
      await authService.updateTableStatus(id, newStatus)
      setTables(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t))
      
      const newStats = await authService.getTableStats()
      setStats(newStats)
      showSuccess(`Table ${statusConfig[newStatus].label}`)
    } catch (e: any) {
      showError(e.message || "Échec de mise à jour")
    } finally {
      setIsProcessing(false)
    }
  }

  // Création d'une table
  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    try {
      const newTable = await authService.createTable({
        ...formData,
        positionX: Math.random() * 300 + 50,
        positionY: Math.random() * 200 + 50,
      })
      setTables(prev => [...prev, newTable])
      setIsAddModalOpen(false)
      setFormData({ number: '', name: '', capacity: 4, zone: 'Salle Principale' })
      showSuccess("Table créée avec succès")
      await fetchAllData()
    } catch (e: any) {
      showError(e.message || "Erreur lors de la création")
    } finally {
      setIsProcessing(false)
    }
  }

  // Mise à jour d'une table
  const handleUpdateTable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTable) return
    setIsProcessing(true)
    try {
      await authService.updateTable(selectedTable.id, {
        name: selectedTable.name,
        capacity: selectedTable.capacity,
        zone: selectedTable.zone || undefined,
        positionX: selectedTable.positionX || undefined,
        positionY: selectedTable.positionY || undefined,
        isActive: selectedTable.isActive,
        status: selectedTable.status
      })
      setTables(prev => prev.map(t => t.id === selectedTable.id ? selectedTable : t))
      setIsEditModalOpen(false)
      setSelectedTable(null)
      showSuccess("Table mise à jour")
      await fetchAllData()
    } catch (e: any) {
      showError(e.message || "Échec de la mise à jour")
    } finally {
      setIsProcessing(false)
    }
  }

  // Régénération QR Code
  const handleRegenerateQR = async (id: string) => {
    setIsProcessing(true)
    try {
      await authService.regenerateQRCode(id)
      showSuccess("QR Code régénéré")
      await fetchAllData()
    } catch (e: any) {
      showError("Erreur de régénération")
    } finally {
      setIsProcessing(false)
    }
  }

  // Suppression (soft delete)
  const handleConfirmDelete = async () => {
    if (!tableToDelete) return
    setIsProcessing(true)
    try {
      await authService.deleteTable(tableToDelete.id)
      setTables(prev => prev.filter(t => t.id !== tableToDelete.id))
      showSuccess(`Table ${tableToDelete.number} désactivée`)
      await fetchAllData()
      setIsDeleteOpen(false)
    } catch (e: any) {
      showError("Échec de la suppression")
    } finally {
      setIsProcessing(false)
    }
  }

  // Filtrage des tables
  const filteredTables = (tables || []).filter(table => {
    const matchesSearch = searchTerm === '' || 
      table.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (table.zone && table.zone.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'ALL' || table.status === statusFilter
    return matchesSearch && matchesStatus
  })

  function filteredTablesForGrouping(all: RestaurantTable[]) {
    return (all || []).filter(table => {
      const matchesSearch = searchTerm === '' ||
        table.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (table.zone && table.zone.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = statusFilter === 'ALL' || table.status === statusFilter
      return matchesSearch && matchesStatus && table.isActive
    })
  }

  // Table actuellement sélectionnée pour le panneau de détails (vue Grille)
  const activeDetailTable = useMemo(
    () => (tables || []).find(t => t.id === selectedTableId) || null,
    [tables, selectedTableId]
  )

  // Pagination
  const totalPages = Math.ceil(filteredTables.length / PAGE_SIZE)
  const paginatedTables = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredTables.slice(start, start + PAGE_SIZE)
  }, [filteredTables, currentPage])

  useEffect(() => { setCurrentPage(1) }, [searchTerm, statusFilter])

  // Rendu d'une carte table pour le mode plan
  const TableCard = ({ table }: { table: RestaurantTable }) => {
    const config = statusConfig[table.status]
    const [showMenu, setShowMenu] = useState(false)
    const isDragging = draggingId === table.id
    
    return (
      <div
        onMouseDown={(e) => handleMouseDown(e, table)}
        className={cn(
          "absolute w-28 h-28 rounded-md border-2 p-3 flex flex-col justify-between cursor-pointer shadow-sm group",
          !isDragging && "transition-all hover:shadow-md hover:scale-105 hover:z-[1050]",
          isDragging ? "z-50 shadow-xl border-orange-500 ring-4 ring-orange-500/10 cursor-grabbing scale-105" : "",
          table.status === 'FREE' && (isDragging ? "bg-white border-orange-500" : "bg-white border-emerald-300 hover:border-emerald-500"),
          table.status === 'OCCUPIED' && (isDragging ? "bg-white border-orange-500" : "bg-white border-red-300 hover:border-red-500"),
          table.status === 'RESERVED' && (isDragging ? "bg-white border-orange-500" : "bg-white border-amber-300 hover:border-amber-500"),
          table.status === 'CLEANING' && (isDragging ? "bg-white border-orange-500" : "bg-white border-orange-300 hover:border-orange-500"),
          (table.status === 'MAINTENANCE' || table.status === 'OUT_OF_SERVICE') && "bg-slate-100 border-slate-300 opacity-60"
        )}
        style={{ left: `${table.positionX || 50}px`, top: `${table.positionY || 50}px` }}
        onMouseEnter={() => setShowMenu(true)}
        onMouseLeave={() => setShowMenu(false)}
      >
        <div className="flex items-center justify-between w-full">
          <span className="font-bold text-slate-900 text-sm">T.{table.number}</span>
          <span className={cn("h-2 w-2 rounded-full", config.bg)} />
        </div>
        
        <div>
          <p className="text-[10px] text-slate-400 font-medium truncate">{table.zone || 'Salle'}</p>
          <div className="flex items-center gap-1 text-slate-600 text-xs mt-0.5">
            <Users className="h-3 w-3 text-slate-400" />
            <span className="font-medium">{table.capacity}</span>
          </div>
        </div>
        
        {/* Menu rapide au survol */}
        {showMenu && !isProcessing && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-sm shadow-lg flex gap-1 p-1 z-[1100]">
            {statusOptions.map(status => (
              <button
                key={status}
                onClick={() => handleStatusChange(table.id, status)}
                className={cn(
                  "px-2 py-1 text-[10px] font-medium rounded transition-colors",
                  status === table.status ? statusConfig[status].badge : "text-slate-500 hover:bg-slate-100"
                )}
              >
                {statusConfig[status].label}
              </button>
            ))}
            <button
              onClick={() => {
                setTableToPreview(table)
                setIsPreviewOpen(true)
              }}
              className="px-2 py-1 text-[10px] font-medium text-slate-500 hover:bg-slate-100 rounded"
              title="Aperçu intelligent"
            >
              <Eye className="h-3 w-3" />
            </button>
            <button
              onClick={() => {
                setSelectedTable(table)
                setIsEditModalOpen(true)
              }}
              className="px-2 py-1 text-[10px] font-medium text-slate-500 hover:bg-slate-100 rounded"
            >
              <Edit2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    )
  }

  // Rendu d'une carte table pour le mode Grille, inspiré de la maquette :
  // fond teinté selon le statut, contour d'accent sur la table sélectionnée,
  // et bascule de statut directement visible au clic.
  const GridTableCard = ({ table }: { table: RestaurantTable }) => {
    const config = statusConfig[table.status]
    const StatusIcon = config.icon
    const isSelected = selectedTableId === table.id

    return (
      <button
        type="button"
        onClick={() => setSelectedTableId(table.id)}
        className={cn(
          "text-left rounded-sm border p-3 transition-all hover:shadow-md",
          config.card,
          isSelected ? "border-2 border-orange-500 ring-2 ring-orange-500/10 shadow-md" : "border"
        )}
      >
        <div className="flex items-center justify-between">
          <span className={cn("font-bold text-sm", config.cardAccent)}>Table {table.number}</span>
          <StatusIcon className={cn("h-3.5 w-3.5", config.cardAccent)} />
        </div>
        <p className={cn("text-xs mt-1.5", config.cardAccent)}>
          {table.capacity} place{table.capacity > 1 ? 's' : ''} · {config.label}
        </p>
        {table.name && (
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">{table.name}</p>
        )}
      </button>
    )
  }

  if (authLoading || (isFetching && tables.length === 0)) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
          <p className="text-sm text-slate-500 font-medium">Chargement du plan de salle...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="fixed top-4 right-4 z-[100]">
        {toast && <Toast toast={toast} />}
      </div>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestion des Tables</h1>
          <p className="text-sm text-slate-500">Plan de salle, configuration des zones et génération de QR Codes.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle Grille / Plan / Liste */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn("p-1.5 rounded-md text-xs font-medium transition-colors", viewMode === 'grid' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900")}
              title="Vue par zones"
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('plan')}
              className={cn("p-1.5 rounded-md text-xs font-medium transition-colors", viewMode === 'plan' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900")}
              title="Plan interactif"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn("p-1.5 rounded-md text-xs font-medium transition-colors", viewMode === 'list' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900")}
              title="Vue liste"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <button 
            onClick={() => fetchAllData()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold px-3 py-2 rounded-sm transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-4 py-2 rounded-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nouvelle Table
          </button>
        </div>
      </div>

      {/* Affichage d'erreur globale */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-sm flex items-center gap-3 text-sm font-medium">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
          <button onClick={fetchAllData} className="ml-auto underline">Réessayer</button>
        </div>
      )}

      {/* Stats Cards */}
      {computedStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          <div className="bg-white p-3 rounded-sm border border-slate-200">
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-xl font-bold text-slate-900">{computedStats.total}</p>
          </div>
          <div className="bg-white p-3 rounded-sm border-l-4 border-emerald-500">
            <p className="text-xs text-slate-500">Libres</p>
            <p className="text-xl font-bold text-emerald-600">{computedStats.free}</p>
          </div>
          <div className="bg-white p-3 rounded-sm border-l-4 border-red-500">
            <p className="text-xs text-slate-500">Occupées</p>
            <p className="text-xl font-bold text-red-600">{computedStats.occupied}</p>
          </div>
          <div className="bg-white p-3 rounded-sm border-l-4 border-amber-500">
            <p className="text-xs text-slate-500">Réservées</p>
            <p className="text-xl font-bold text-amber-600">{computedStats.reserved}</p>
          </div>
          <div className="bg-white p-3 rounded-sm border-l-4 border-orange-500">
            <p className="text-xs text-slate-500">Nettoyage</p>
            <p className="text-xl font-bold text-orange-600">{computedStats.cleaning}</p>
          </div>
          <div className="bg-white p-3 rounded-sm">
            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-500">Occupation</p>
              <Percent className="h-3 w-3 text-slate-400" />
            </div>
            <p className="text-xl font-bold text-slate-900">{Math.round(computedStats.occupancyRate)}%</p>
          </div>
          <div className="bg-white p-3 rounded-sm">
            <p className="text-xs text-slate-500">Rotation</p>
            <p className="text-xl font-bold text-slate-900">
              {computedStats.total > 0 ? ((computedStats.occupied + computedStats.free) / computedStats.total).toFixed(1) : 0}
            </p>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une table (numéro, nom, zone)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-orange-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TableStatus | 'ALL')}
          className="px-3 py-2 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-orange-500 bg-white"
        >
          <option value="ALL">Tous les statuts</option>
          {statusOptions.map(status => (
            <option key={status} value={status}>{statusConfig[status].label}</option>
          ))}
        </select>
      </div>

      {/* Légende des statuts, commune aux vues Grille et Plan */}
      {(viewMode === 'grid' || viewMode === 'plan') && (
        <div className="flex flex-wrap gap-4 mb-6 text-xs text-slate-500">
          {statusOptions.map(status => {
            const config = statusConfig[status]
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(prev => prev === status ? 'ALL' : status)}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-full border transition-colors",
                  statusFilter === status ? config.badge : "border-transparent hover:bg-slate-50"
                )}
              >
                <span className={cn("h-2.5 w-2.5 rounded-full", config.bg)} />
                {config.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Mode Grille : disposition par zones, inspirée de la maquette */}
      {viewMode === 'grid' && (
        <div className="space-y-6 mb-6">
          {Object.keys(tablesByZone).length === 0 && (
            <div className="bg-white rounded-sm border border-slate-200 p-10 text-center">
              <p className="text-slate-400 text-sm">Aucune table ne correspond aux filtres actuels.</p>
            </div>
          )}

          {Object.entries(tablesByZone).map(([zoneName, zoneTables]) => {
            const theme = ZONE_THEMES[zoneName] || ZONE_THEMES.default
            const isCollapsed = !!collapsedZones[zoneName]
            const freeInZone = zoneTables.filter(t => t.status === 'FREE').length
            const occupiedInZone = zoneTables.filter(t => t.status === 'OCCUPIED').length
            const occupancyRate = zoneTables.length > 0 ? Math.round((occupiedInZone / zoneTables.length) * 100) : 0
            return (
              <div key={zoneName} className={cn("rounded-sm border bg-white overflow-hidden", theme.border)}>
                <button
                  type="button"
                  onClick={() => setCollapsedZones(prev => ({ ...prev, [zoneName]: !prev[zoneName] }))}
                  className={cn("w-full flex items-center justify-between gap-2 px-4 md:px-5 py-3 transition-colors hover:brightness-[0.99]", theme.bg)}
                  aria-expanded={!isCollapsed}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className={cn("h-4 w-4 shrink-0", theme.color)} />
                    <h2 className={cn("text-sm font-bold uppercase tracking-wide truncate", theme.color)}>{zoneName}</h2>
                    <span className="text-xs text-slate-400 font-medium shrink-0">({zoneTables.length})</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden sm:inline text-[11px] font-semibold text-slate-500">
                      {freeInZone} libres · {occupiedInZone} occupées
                    </span>
                    {isCollapsed
                      ? <ChevronDown className="h-4 w-4 text-slate-400" />
                      : <ChevronUp className="h-4 w-4 text-slate-400" />}
                  </div>
                </button>

                {/* Barre d'occupation de la zone */}
                <div className="h-1 w-full bg-slate-100">
                  <div
                    className={cn("h-full transition-all duration-500", theme.bar)}
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>

                {!isCollapsed && (
                  <div className="p-4 md:p-5 border-t border-slate-100">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {zoneTables.map(table => (
                        <GridTableCard key={table.id} table={table} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Panneau de détails de la table sélectionnée + gestion rapide du statut */}
          {activeDetailTable && (
            <div className="bg-white rounded-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900">
                  Table {activeDetailTable.number} — détails
                </h2>
                <button
                  onClick={() => setSelectedTableId(null)}
                  className="text-slate-400 hover:text-slate-600"
                  aria-label="Fermer les détails"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Statut actuel</p>
                  <span className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold border", statusConfig[activeDetailTable.status].badge)}>
                    {statusConfig[activeDetailTable.status].label}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Capacité</p>
                  <p className="font-semibold text-slate-900">{activeDetailTable.capacity} personnes</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Emplacement</p>
                  <p className="font-semibold text-slate-900">{activeDetailTable.zone || 'Non définie'}</p>
                </div>
              </div>

              {/* Changement de statut en un clic, avec libellés d'action explicites */}
              <p className="text-xs text-slate-500 mb-2">Changer le statut</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {statusOptions.map(status => {
                  const config = statusConfig[status]
                  const StatusIcon = config.icon
                  const isCurrent = activeDetailTable.status === status
                  return (
                    <button
                      key={status}
                      disabled={isProcessing || isCurrent}
                      onClick={() => handleStatusChange(activeDetailTable.id, status)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold border transition-colors disabled:cursor-default",
                        isCurrent ? config.badge : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {config.label}
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setTableToPreview(activeDetailTable)
                    setIsPreviewOpen(true)
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-sm hover:bg-slate-50"
                >
                  <Eye className="h-3.5 w-3.5" /> QR Code
                </button>
                <button
                  onClick={() => {
                    setSelectedTable(activeDetailTable)
                    setIsEditModalOpen(true)
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-sm hover:bg-slate-50"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Modifier
                </button>
                <button
                  onClick={() => handleStatusChange(
                    activeDetailTable.id,
                    activeDetailTable.status === 'FREE' ? 'OCCUPIED' : 'FREE'
                  )}
                  disabled={isProcessing}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 text-white text-xs font-semibold rounded-sm hover:bg-orange-700"
                >
                  {statusConfig[activeDetailTable.status].action}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode Plan */}
      {viewMode === 'plan' && (
        <div className="bg-white rounded-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Plan Interactif</h2>
          </div>

          <div 
            ref={planRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="relative w-full min-h-[600px] bg-slate-50 border border-slate-100 rounded-sm overflow-hidden select-none"
          >
            {/* Grille de fond */}
            <div className="absolute inset-0 opacity-30">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#cbd5e1" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Délimitations des Zones */}
            {Object.entries(zoneAreas).map(([zoneName, bounds]) => {
              const theme = ZONE_THEMES[zoneName] || ZONE_THEMES.default
              const padding = 24
              return (
                <div 
                  key={zoneName}
                  className={cn("absolute border-2 border-dashed rounded-3xl transition-all duration-300 ease-out", theme.bg, theme.border)}
                  style={{
                    left: bounds.minX - padding,
                    top: bounds.minY - padding,
                    width: (bounds.maxX - bounds.minX) + (padding * 2),
                    height: (bounds.maxY - bounds.minY) + (padding * 2),
                  }}
                >
                  <div className={cn("absolute -top-3 left-6 px-3 py-1 bg-white border rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm", theme.color, theme.border)}>
                    {zoneName}
                  </div>
                </div>
              )
            })}

            {/* Repères */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-black uppercase tracking-[0.2em] px-8 py-1.5 rounded-b-xl shadow-sm z-10 border-x border-b border-slate-700">
              Entrée Principale
            </div>
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 flex flex-col items-center justify-center bg-orange-100 border-2 border-orange-200 w-8 h-32 rounded-l-2xl z-10">
              <span className="[writing-mode:vertical-lr] text-[9px] font-black uppercase tracking-widest text-orange-600 rotate-180">Cuisine</span>
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-orange-100 border-2 border-orange-200 px-12 py-3 rounded-full z-10 shadow-inner flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Comptoir Bar</span>
            </div>

            {/* Tables */}
            {filteredTables.filter(t => t.isActive).map((table) => (
              <TableCard key={table.id} table={table} />
            ))}

            {/* Message si aucune table */}
            {filteredTables.filter(t => t.isActive).length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-slate-400 text-sm">Aucune table active à afficher</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode Liste */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 bg-slate-50">
                  <th className="p-4">Table</th>
                  <th className="p-4">Zone</th>
                  <th className="p-4">Capacité</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4">QR Code</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedTables.map((table) => (
                  <tr key={table.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{table.name}</div>
                      <div className="text-xs text-slate-400">N° {table.number}</div>
                    </td>
                    <td className="p-4 text-slate-600">{table.zone || '-'}</td>
                    <td className="p-4 text-slate-600">{table.capacity} pers.</td>
                    <td className="p-4">
                      <select
                        value={table.status}
                        onChange={(e) => handleStatusChange(table.id, e.target.value as TableStatus)}
                        disabled={isProcessing}
                        className={cn("px-2 py-1 rounded-sm text-xs font-medium border", statusConfig[table.status].badge)}
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>{statusConfig[status].label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-sm w-fit">
                        <QrCode className="h-3 w-3 text-slate-400" />
                        {table.qrCode?.slice(0, 16)}...
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => {
                            setTableToPreview(table)
                            setIsPreviewOpen(true)
                          }}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                          title="Aperçu intelligent"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => handleRegenerateQR(table.id)}
                          disabled={isProcessing}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors" 
                          title="Régénérer le QR code"
                        >
                          <RefreshCw className={cn("h-3.5 w-3.5", isProcessing && "animate-spin")} />
                        </button>
                        <button 
                          onClick={async () => {
                            setIsProcessing(true);
                            try {
                              await authService.downloadTableQRCode(table.id, table.number);
                              showSuccess(`QR Code T.${table.number} téléchargé`);
                            } catch (e) {
                              showError("Échec du téléchargement");
                            } finally {
                              setIsProcessing(false);
                            }
                          }}
                          disabled={isProcessing}
                          className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors disabled:opacity-50"
                          title="Télécharger le QR code (PNG)"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedTable(table)
                            setIsEditModalOpen(true)
                          }}
                          className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => {
                            setTableToDelete(table)
                            setIsDeleteOpen(true)
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination UI */}
          {totalPages > 1 && (
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500 font-medium">
                Affichage de {(currentPage - 1) * PAGE_SIZE + 1} à {Math.min(currentPage * PAGE_SIZE, filteredTables.length)} sur {filteredTables.length} tables
              </p>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="p-2 border border-slate-200 rounded-sm bg-white disabled:opacity-50 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-2 border border-slate-200 rounded-sm bg-white disabled:opacity-50 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal d'ajout */}
      <div className={cn(
        "fixed inset-0 z-50 flex justify-end transition-all duration-300",
        isAddModalOpen ? "visible" : "invisible pointer-events-none"
      )}>
        {/* Overlay avec fondu fluide */}
        <div
          className={cn(
            "fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-500 ease-in-out",
            isAddModalOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsAddModalOpen(false)}
        />

        {/* Panel latéral (Tiroir) avec animation combinée slide + fade pour plus de douceur */}
        <div className={cn(
          "relative bg-white w-full max-w-md h-full border-l border-slate-200 flex flex-col overflow-hidden transition-all duration-500 ease-out shadow-2xl p-6",
          isAddModalOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        )}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Nouvelle Table</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTable} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Numéro *</label>
                  <input 
                    type="text" required
                    className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-orange-500"
                    value={formData.number} 
                    onChange={e => setFormData({...formData, number: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Capacité *</label>
                  <input 
                    type="number" required min="1"
                    className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-orange-500"
                    value={formData.capacity || 0} 
                    onChange={e => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom d'affichage</label>
                <input 
                  type="text" placeholder="ex: Table Fenêtre"
                  className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-orange-500"
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Zone</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-orange-500 bg-white"
                  value={formData.zone} 
                  onChange={e => setFormData({...formData, zone: e.target.value})}
                >
                  {zoneOptions.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-sm hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-sm hover:bg-orange-700 flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Enregistrer
                </button>
              </div>
            </form>
        </div>
        </div>

      {/* Modal d'édition */}
      {isEditModalOpen && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-sm border border-slate-200 p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Modifier Table {selectedTable.number}</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateTable} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Numéro</label>
                  <input 
                    type="text" disabled
                    className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm bg-slate-50"
                    value={selectedTable.number}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Capacité</label>
                  <input 
                    type="number" min="1"
                    className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-orange-500"
                    value={selectedTable.capacity || 0}
                    onChange={e => setSelectedTable({...selectedTable, capacity: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom d'affichage</label>
                <input 
                  type="text"
                  className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-orange-500"
                  value={selectedTable.name}
                  onChange={e => setSelectedTable({...selectedTable, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Zone</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-orange-500 bg-white"
                  value={selectedTable.zone || 'Salle Principale'}
                  onChange={e => setSelectedTable({...selectedTable, zone: e.target.value})}
                >
                  {zoneOptions.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Statut</label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map(status => {
                    const config = statusConfig[status]
                    const StatusIcon = config.icon
                    const isChosen = selectedTable.status === status
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setSelectedTable({ ...selectedTable, status })}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs font-semibold border transition-colors",
                          isChosen ? config.badge : "border-slate-200 text-slate-500 hover:bg-slate-50"
                        )}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {config.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={selectedTable.isActive}
                  onChange={e => setSelectedTable({...selectedTable, isActive: e.target.checked})}
                  className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="isActive" className="text-sm text-slate-600">Table active</label>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-sm hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-sm hover:bg-orange-700 flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'Aperçu Intelligent du QR Code */}
      {isPreviewOpen && tableToPreview && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsPreviewOpen(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <QrCode className="h-4 w-4 text-orange-600" />
                Aperçu du QR Code
              </h3>
              <button onClick={() => setIsPreviewOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Preview Content - Simulation de support physique */}
            <div className="p-8 bg-slate-100/50 flex flex-col items-center">
              <div className="relative p-6 border-[12px] border-slate-900 rounded-[2.5rem] shadow-2xl bg-white w-full aspect-[3/4.5] flex flex-col items-center justify-between border-t-[16px]">
                <div className="text-center mt-2">
                   <img src="/logo/logo.png" alt="Logo" className="h-10 w-auto mx-auto mb-2 opacity-90" />
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Scannez & Commandez</p>
                </div>
                
                <div className="bg-white p-3  flex items-center justify-center min-h-[176px] w-full">
                   {isLoadingPreview ? (
                     <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
                   ) : previewImageUrl ? (
                     <img 
                       src={previewImageUrl} 
                       alt={`QR Code Table ${tableToPreview.number}`}
                       className="w-44 h-44 object-contain animate-in fade-in duration-500"
                     />
                   ) : (
                     <div className="text-center p-4">
                       <AlertCircle className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                       <p className="text-[10px] text-slate-400 font-medium">QR Code non disponible</p>
                     </div>
                   )}
                </div>

                <div className="text-center mb-4">
                  <span className="text-5xl font-black text-slate-900 tabular-nums">{tableToPreview.number}</span>
                  <p className="text-[11px] text-slate-500 font-bold mt-1 uppercase tracking-widest">{tableToPreview.zone || 'Salle Principale'}</p>
                </div>
              </div>
              {/* <p className="mt-6 text-[10px] text-slate-400 font-medium italic">Représentation visuelle du chevalet de table</p> */}
            </div>

            {/* Actions */}
            <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
          
              <button 
                disabled={isProcessing}
                onClick={async () => {
                  setIsProcessing(true);
                  try {
                    await authService.downloadTableQRCode(tableToPreview.id, tableToPreview.number);
                    showSuccess("Image PNG téléchargée");
                  } catch (e) {
                    showError("Erreur PNG");
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 h-11 rounded-sm text-xs font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
              >
                <Download className="h-4 w-4" /> Image PNG
              </button>
              <button 
                disabled={isProcessing}
                onClick={async () => {
                  setIsProcessing(true);
                  try {
                    await authService.downloadTableQRCodePdf(tableToPreview.id, tableToPreview.number);
                    showSuccess("Génération du PDF lancée");
                  } catch (e) {
                    showError("Erreur PDF");
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white h-11 rounded-sm text-xs font-bold hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                Format PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialogue de suppression */}
      <DeleteDialog
        isOpen={isDeleteOpen}
        isLoading={isProcessing}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Désactiver la table"
        description="Voulez-vous vraiment désactiver cette table ? Elle ne sera plus visible sur le plan de salle."
        itemName={`Table ${tableToDelete?.number}`}
      />
    </DashboardLayout>
  )
}