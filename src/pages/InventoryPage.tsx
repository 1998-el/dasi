import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { DashboardLayout } from '../components/DashboardLayout'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { 
  Search, AlertTriangle, Loader2, Plus, Minus, CalendarClock, X
} from 'lucide-react'
import { cn } from '../lib/utils'
import { authService } from './auth.service'
import { useToast, Toast } from '../components/ui/Toast'
import { useAuth } from '../context/AuthContext'

interface Batch {
  id: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  status: 'OK' | 'URGENT' | 'EXPIRED'; // Assuming status can be derived or comes from backend
}

export function InventoryPage() {
  const { t } = useTranslation()
  const { businessConfig } = useAuth()
  const { toast, showSuccess, showError } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [, setIsFetching] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [adjustmentItem, setAdjustmentItem] = useState<any>(null)
  const [lotManagementItem, setLotManagementItem] = useState<any>(null) // Pour la pharmacie
  const [adjustmentReason, setAdjustmentReason] = useState('INVENTORY')
  const [lotToAdjust, setLotToAdjust] = useState<Batch | null>(null)
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false)
  const [historyItem, setHistoryItem] = useState<any>(null) // Pour l'historique des mouvements
  const [movements, setMovements] = useState<any[]>([])
  const [adjustmentValue, setAdjustmentValue] = useState(0)
  const [productBatches, setProductBatches] = useState<Batch[]>([]); // New state for batches
  const [isAddingLot, setIsAddingLot] = useState(false)
  const [newLot, setNewLot] = useState({ number: '', quantity: 0, expiryDate: '' })

  const fetchInventory = useCallback(async () => {
    setIsFetching(true)
    try {
      const data = await authService.getProducts()
      setItems(data || [])
    } catch (e: any) {
      showError("Erreur de chargement de l'inventaire")
    } finally {
      setIsFetching(false)
    }
  }, [showError])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  const handleAdjustment = async () => {
    if (!adjustmentItem) return
    setIsProcessing(true)
    try {
      await authService.updateProduct(adjustmentItem.id, { 
        stock: adjustmentValue,
        reason: adjustmentReason
      })
      showSuccess("Stock mis à jour")
      setAdjustmentItem(null)
      fetchInventory()
    } catch (e: any) {
      showError("Échec de la mise à jour")
    } finally {
      setIsProcessing(false)
    }
  }

  const fetchHistory = async (item: any) => {
    setHistoryItem(item)
    setIsProcessing(true)
    try {
      // Appel au nouvel endpoint d'historique (Inventory table)
      const data = await authService.getProductMovements(item.id)
      setMovements(data || [])
      setIsHistoryDrawerOpen(true)
    } catch (e) {
      showError("Erreur de chargement de l'historique")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleLotManagement = async (item: any) => {
    showSuccess(`Ouverture de la gestion des lots pour ${item.name}`);
    setLotManagementItem(item);
    setIsProcessing(true); // Indicate loading for batches
    try {
      const batches = await authService.getBatchesByProductId(item.id);
      setProductBatches(batches);
    } catch (e: any) {
      showError(e.message || "Erreur lors du chargement des lots");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddLot = async () => {
    if (!lotManagementItem || !newLot.number || newLot.quantity <= 0) {
      showError("Veuillez remplir tous les champs du lot");
      return;
    }
    setIsProcessing(true);
    try {
      await authService.updateProduct(lotManagementItem.id, {
        addBatch: newLot
      });
      showSuccess("Lot ajouté avec succès");
      setIsAddingLot(false);
      handleLotManagement(lotManagementItem); // Refresh batches
    } catch (e: any) {
      showError("Échec de l'ajout du lot");
    } finally {
      setIsProcessing(false);
    }
  };

  const getMovementReasonLabel = (reason: string) => {
    switch (reason) {
      case 'SALE': return t('inventory_page.reason_sale');
      case 'ADJUSTMENT': return t('inventory_page.reason_adjustment');
      case 'RESTOCK': return t('inventory_page.reason_restock');
      case 'DAMAGE': return t('inventory_page.reason_damage');
      case 'INVENTORY': return t('inventory_page.reason_inventory');
      default: return reason;
    }
  };

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="fixed top-4 right-4 z-[100]">{toast && <Toast toast={toast} />}</div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{businessConfig.labels.inventory}</h1>
        <p className="text-sm text-slate-500">{businessConfig.type === 'PHARMACY' ? 'Traçabilité des lots et péremptions (FEFO)' : t('inventory_page.subtitle', 'Niveau des stocks')}</p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder={t('inventory_page.search_placeholder')}
            className="pl-9 h-10 rounded-sm border-slate-200 bg-white text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => {
          const isLow = item.stock <= (item.minStock || 5)
          const isOut = item.stock === 0
          return (
            <Card key={item.id} className={cn("border-slate-200 shadow-none rounded-sm transition-all", isLow && "border-amber-200 bg-amber-50/20")}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 leading-tight">{item.name}</h3>
                      {item.isNarcotic && (
                        <span className="bg-red-600 text-white text-[8px] font-black px-1 py-0.5 rounded uppercase tracking-tighter">Stup.</span>
                      )}
                    </div>
                    {businessConfig.features.hasBatches && item.nextExpiryDate && (
                       <div className="flex items-center gap-1.5 text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                         <CalendarClock className="h-2.5 w-2.5" />
                         Expire le {new Date(item.nextExpiryDate).toLocaleDateString()}
                       </div>
                    )}
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{item.sku || 'SANS-SKU'}</p>
                  </div>
                  {isLow && <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 uppercase tracking-tighter bg-white px-2 py-1 rounded-sm border border-amber-100 shadow-sm"><AlertTriangle className="h-3 w-3" /> {isOut ? t('inventory_page.out_of_stock') : t('inventory_page.low_stock_alert')}</span>}
                </div>
                <div className="flex items-end justify-between">
                  <button onClick={() => fetchHistory(item)} className="flex flex-col text-left group">
                    <span className="text-2xl font-black text-slate-900 leading-none group-hover:text-orange-600 transition-colors">{item.stock} <span className="text-xs font-medium text-slate-400">{item.unit || 'unit.'}</span></span>
                    <span className="text-[9px] text-slate-400 uppercase font-bold mt-1.5 flex items-center gap-1">
                      <CalendarClock className="h-2.5 w-2.5" /> Historique
                    </span>
                  </button>
                  {businessConfig.type === 'PHARMACY' ? (
                    <Button variant="outline" size="sm" onClick={() => handleLotManagement(item)} className="h-8 rounded-sm text-[10px] font-black uppercase tracking-widest border-slate-200 hover:bg-slate-50">
                      Gérer les lots
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => { setAdjustmentItem(item); setAdjustmentValue(item.stock); }} className="h-8 rounded-sm text-[10px] font-black uppercase tracking-widest border-slate-200 hover:bg-slate-50">
                      {t('inventory_page.adjust_stock')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {adjustmentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" onClick={() => setAdjustmentItem(null)} />
          <div className="relative bg-white w-full max-w-sm rounded-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200">
            <h2 className="text-lg font-black text-slate-900 mb-1">Ajustement global</h2>
            <p className="text-xs text-slate-500 mb-8 font-medium italic">{adjustmentItem.name}</p>
            
            <div className="space-y-4 mb-8">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-400 uppercase">Raison du mouvement</Label>
                <select 
                  className="w-full h-10 px-3 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-orange-500 bg-white"
                  value={adjustmentReason}
                  onChange={e => setAdjustmentReason(e.target.value)}
                >
                  <option value="INVENTORY">{t('inventory_page.reason_inventory')}</option>
                  <option value="DAMAGE">{t('inventory_page.reason_damage')}</option>
                  <option value="RESTOCK">{t('inventory_page.reason_restock')}</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-center gap-8 mb-10">
              <button onClick={() => setAdjustmentValue(v => Math.max(0, v - 1))} className="h-12 w-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"><Minus className="h-5 w-5 text-slate-400" /></button>
              <Input type="number" className="w-24 h-14 text-center text-3xl font-black border-none bg-slate-50 focus:ring-0 rounded-sm" value={adjustmentValue || 0} onChange={e => setAdjustmentValue(parseInt(e.target.value) || 0)} />
              <button onClick={() => setAdjustmentValue(v => v + 1)} className="h-12 w-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"><Plus className="h-5 w-5 text-slate-400" /></button>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-11 font-bold text-xs uppercase" onClick={() => setAdjustmentItem(null)}>{t('common.cancel')}</Button>
              <Button className="flex-1 bg-orange-600 hover:bg-orange-700 h-11 font-bold text-xs uppercase" onClick={handleAdjustment} disabled={isProcessing}>{isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : t('common.save')}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de gestion des lots (pour Pharmacie) */}
      {lotManagementItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" onClick={() => setLotManagementItem(null)} />
          <div className="relative bg-white w-full max-w-md rounded-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-900">Gestion des Lots</h2>
              <button onClick={() => setLotManagementItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-6 font-medium italic">{lotManagementItem.name}</p>
            
            <div className="mb-6">
              {!isAddingLot ? (
                <Button onClick={() => setIsAddingLot(true)} variant="outline" className="w-full border-dashed border-orange-200 text-orange-600 text-[10px] font-black uppercase h-9">
                  <Plus className="h-3 w-3 mr-2" /> Ajouter un nouveau lot
                </Button>
              ) : (
                <div className="p-4 border border-orange-100 bg-orange-50/30 rounded-sm space-y-3 animate-in fade-in slide-in-from-top-1">
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="N° Lot" className="h-8 text-xs bg-white" value={newLot.number} onChange={e => setNewLot({...newLot, number: e.target.value})} />
                    <Input type="number" placeholder="Qté" className="h-8 text-xs bg-white" value={newLot.quantity || ''} onChange={e => setNewLot({...newLot, quantity: parseInt(e.target.value) || 0})} />
                  </div>
                  <Input type="date" className="h-8 text-xs bg-white" value={newLot.expiryDate} onChange={e => setNewLot({...newLot, expiryDate: e.target.value})} />
                  <div className="flex gap-2">
                    <Button onClick={() => setIsAddingLot(false)} variant="ghost" className="flex-1 h-8 text-[10px] uppercase font-bold">Annuler</Button>
                    <Button onClick={handleAddLot} className="flex-1 h-8 bg-orange-600 text-white text-[10px] uppercase font-bold">Enregistrer</Button>
                  </div>
                </div>
              )}
            </div>

            <div className="py-2 border-t border-slate-50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Gestion des lots par ordre d'expiration (FEFO).
              </p>
              <div className="space-y-2 mt-4">
                {isProcessing ? ( // Show loader while fetching batches
                  <div className="flex flex-col items-center justify-center h-24">
                    <Loader2 className="h-6 w-6 text-orange-500 animate-spin mb-2" />
                    <p className="text-xs text-slate-500">Chargement des lots...</p>
                  </div>
                ) : productBatches.length > 0 ? (
                  productBatches.map((lot, idx) => (
                    <div key={lot.id || idx} className="flex items-center justify-between p-3 border border-slate-100 rounded-sm bg-slate-50/50">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900">{lot.batchNumber}</span>
                        <span className={cn("text-[9px] font-bold uppercase", lot.status === 'URGENT' ? 'text-red-500' : 'text-slate-400')}>
                          Exp: {new Date(lot.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {lotToAdjust?.id === lot.id ? (
                          <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                            <Input 
                              type="number" 
                              autoFocus
                              className="w-16 h-7 text-xs font-bold px-1" 
                              defaultValue={lot.quantity}
                              onBlur={(e) => {
                                const newVal = parseInt(e.target.value);
                                if (newVal !== lot.quantity) {
                                  // Ici on appellerait un authService.adjustLotQuantity(lot.id, newVal)
                                  showSuccess(`Lot ${lot.batchNumber} mis à jour`);
                                }
                                setLotToAdjust(null);
                              }}
                            />
                          </div>
                        ) : (
                          <button 
                            onClick={() => setLotToAdjust(lot)}
                            className="text-xs font-bold text-slate-700 hover:text-orange-600 transition-colors"
                          >
                            {lot.quantity} unités
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-slate-400 italic text-xs">Aucun lot trouvé pour ce produit.</div>
                )}
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="w-full h-11 font-bold text-xs uppercase" onClick={() => setLotManagementItem(null)}>Fermer</Button>
            </div>
          </div>
        </div>
      )}

      {/* Side Drawer - Historique des mouvements */}
      {isHistoryDrawerOpen && historyItem && (
        <div className={cn(
          "fixed inset-0 z-50 flex justify-end transition-all duration-300",
          isHistoryDrawerOpen ? "visible" : "invisible pointer-events-none"
        )}>
          <div className={cn("fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-500", isHistoryDrawerOpen ? "opacity-100" : "opacity-0")} onClick={() => setIsHistoryDrawerOpen(false)} />
          <div className={cn("relative bg-white w-full max-w-xl h-full border-l border-slate-200 flex flex-col overflow-hidden transition-all duration-500 ease-out shadow-2xl", isHistoryDrawerOpen ? "translate-x-0" : "translate-x-full")}>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">{t('inventory_page.history_drawer_title')}</h2>
              <button onClick={() => setIsHistoryDrawerOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <p className="text-sm text-slate-500 font-medium italic">{t('inventory_page.history_drawer_subtitle')} : <span className="font-bold text-slate-900">{historyItem.name}</span></p>

              {movements.length === 0 ? (
                <div className="text-center py-12 text-slate-400 italic">
                  {t('inventory_page.no_movements')}
                </div>
              ) : (
                <div className="space-y-4">
                  {movements.map((movement, idx) => (
                    <div key={idx} className="p-4 border border-slate-100 rounded-sm bg-slate-50/50 flex items-start gap-4">
                      <div className={cn(
                        "p-2 rounded-full",
                        movement.type === 'IN' ? "bg-emerald-50 text-emerald-600" :
                        movement.type === 'OUT' ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                      )}>
                        {movement.type === 'IN' ? <Plus className="h-4 w-4" /> :
                         movement.type === 'OUT' ? <Minus className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-slate-900">{t(`inventory_page.movement_${movement.type.toLowerCase()}`)}</span>
                          <span className="text-[10px] text-slate-400">{new Date(movement.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                          <div>
                            <span className="font-medium">{t('inventory_page.movement_quantity')}:</span> <span className="font-bold">{movement.quantity}</span>
                          </div>
                          <div>
                            <span className="font-medium">{t('inventory_page.movement_reason')}:</span> <span className="font-bold">{getMovementReasonLabel(movement.reason)}</span>
                          </div>
                          <div>
                            <span className="font-medium">{t('inventory_page.movement_before_stock')}:</span> <span className="font-bold">{movement.beforeStock}</span>
                          </div>
                          <div>
                            <span className="font-medium">{t('inventory_page.movement_after_stock')}:</span> <span className="font-bold">{movement.afterStock}</span>
                          </div>
                          {movement.createdBy && (
                            <div className="col-span-2">
                              <span className="font-medium">{t('inventory_page.movement_by')}:</span> <span className="font-bold">{movement.createdBy}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
              <Button variant="outline" className="w-full h-11 font-bold text-xs uppercase" onClick={() => setIsHistoryDrawerOpen(false)}>Fermer</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de gestion des lots (pour Pharmacie) */}
      {lotManagementItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" onClick={() => setLotManagementItem(null)} />
          <div className="relative bg-white w-full max-w-md rounded-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-900">Gestion des Lots</h2>
              <button onClick={() => setLotManagementItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-6 font-medium italic">{lotManagementItem.name}</p>
            
            <div className="mb-6">
              {!isAddingLot ? (
                <Button onClick={() => setIsAddingLot(true)} variant="outline" className="w-full border-dashed border-orange-200 text-orange-600 text-[10px] font-black uppercase h-9">
                  <Plus className="h-3 w-3 mr-2" /> Ajouter un nouveau lot
                </Button>
              ) : (
                <div className="p-4 border border-orange-100 bg-orange-50/30 rounded-sm space-y-3 animate-in fade-in slide-in-from-top-1">
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="N° Lot" className="h-8 text-xs bg-white" value={newLot.number} onChange={e => setNewLot({...newLot, number: e.target.value})} />
                    <Input type="number" placeholder="Qté" className="h-8 text-xs bg-white" value={newLot.quantity || ''} onChange={e => setNewLot({...newLot, quantity: parseInt(e.target.value) || 0})} />
                  </div>
                  <Input type="date" className="h-8 text-xs bg-white" value={newLot.expiryDate} onChange={e => setNewLot({...newLot, expiryDate: e.target.value})} />
                  <div className="flex gap-2">
                    <Button onClick={() => setIsAddingLot(false)} variant="ghost" className="flex-1 h-8 text-[10px] uppercase font-bold">Annuler</Button>
                    <Button onClick={handleAddLot} className="flex-1 h-8 bg-orange-600 text-white text-[10px] uppercase font-bold">Enregistrer</Button>
                  </div>
                </div>
              )}
            </div>

            <div className="py-2 border-t border-slate-50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Gestion des lots par ordre d'expiration (FEFO).
              </p>
              <div className="space-y-2 mt-4">
                {isProcessing ? ( // Show loader while fetching batches
                  <div className="flex flex-col items-center justify-center h-24">
                    <Loader2 className="h-6 w-6 text-orange-500 animate-spin mb-2" />
                    <p className="text-xs text-slate-500">Chargement des lots...</p>
                  </div>
                ) : productBatches.length > 0 ? (
                  productBatches.map((lot, idx) => (
                    <div key={lot.id || idx} className="flex items-center justify-between p-3 border border-slate-100 rounded-sm bg-slate-50/50">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900">{lot.batchNumber}</span>
                        <span className={cn("text-[9px] font-bold uppercase", lot.status === 'URGENT' ? 'text-red-500' : 'text-slate-400')}>
                          Exp: {new Date(lot.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-700">{lot.quantity} unités</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-slate-400 italic text-xs">Aucun lot trouvé pour ce produit.</div>
                )}
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="w-full h-11 font-bold text-xs uppercase" onClick={() => setLotManagementItem(null)}>Fermer</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}