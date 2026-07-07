import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { 
  Plus, 
  Search, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  RefreshCw,
  X,
  Save,
  MoreVertical,
  Loader2,
  AlertCircle,
  ShieldCheck
} from 'lucide-react'
import { cn } from '../lib/utils'
import { authService } from './auth.service'
import { useAuth } from '../context/AuthContext'
import { useToast, Toast } from '../components/ui/Toast'
import { DeleteDialog } from '../components/ui/DeleteDialog'

// Types calqués sur PaymentStatus et PaymentMethod du service NestJS
type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
type PaymentMethod = 'CASH' | 'CARD' | 'ORANGE_MONEY' | 'MTN_MONEY';

interface Sale {
  id: string;
  saleNumber: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  customer?: { name: string } | null;
  customerName?: string | null;
  order?: {
    tableNumber?: string | null;
    customerName?: string | null;
  } | null;
  items?: Array<{
    product: { name: string };
  }>;
}

interface Payment {
  id: string;
  paymentNumber: string;
  saleId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  processedAt: string;
  customerName?: string;
  transactionId?: string;
}

const STATUS_CONFIG: Record<PaymentStatus, { label: string; badge: string; icon: any }> = {
  PAID: { label: 'Payé', badge: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: CheckCircle2 },
  PENDING: { label: 'Vérification', badge: 'bg-amber-50 border-amber-200 text-amber-700', icon: Clock },
  REFUNDED: { label: 'Remboursé', badge: 'bg-slate-50 border-slate-200 text-slate-700', icon: RotateCcw },
  FAILED: { label: 'Échoué', badge: 'bg-red-50 border-red-200 text-red-700', icon: XCircle },
};

const METHOD_CONFIG: Record<PaymentMethod, { label: string; icon: any }> = {
  CASH: { label: 'Espèces', icon: Banknote },
  CARD: { label: 'Carte', icon: CreditCard },
  ORANGE_MONEY: { label: 'Orange Money', icon: Smartphone },
  MTN_MONEY: { label: 'MTN MoMo', icon: Smartphone },
};

export function PaymentsPage() {
  const { businessConfig } = useAuth()
  const { user } = useAuth()
  const { toast, showSuccess, showError, clear } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [pendingSales, setPendingSales] = useState<Sale[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false)
  const [paymentToRefund, setPaymentToRefund] = useState<Payment | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [isForceModalOpen, setIsForceModalOpen] = useState(false)
  const [paymentToForce, setPaymentToForce] = useState<Payment | null>(null)
  const [forceNotes, setForceNotes] = useState('')

  const [formData, setFormData] = useState({
    saleId: '',
    amount: 0,
    method: 'CASH' as PaymentMethod,
    phoneNumber: '',
    notes: '',
    cashAmount: 0,
    reference: ''
  })

  const fetchPayments = useCallback(async () => {
    setIsFetching(true)
    try {
      const [paymentsData, salesData] = await Promise.all([
        authService.getPayments(),
        authService.getSales({ status: 'PENDING' })
      ])
      setPayments(paymentsData)
      setPendingSales(salesData)
      console.log('[Payments] Ventes en attente chargées:', salesData);
    } catch (e: any) {
      showError(e.message || "Erreur de chargement des transactions")
    } finally {
      setIsFetching(false)
    }
  }, [showError])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    clear()

    try {
      const payload = {
        ...formData,
        processedBy: user?.id || 'system',
        changeAmount: formData.method === 'CASH' ? Math.max(0, formData.cashAmount - formData.amount) : 0
      }
      
      await authService.createPayment(payload)
      showSuccess("Paiement enregistré avec succès")
      setIsDrawerOpen(false)
      setFormData({ 
        saleId: '', amount: 0, method: 'CASH', phoneNumber: '', 
        notes: '', cashAmount: 0, reference: '' 
      })
      fetchPayments()
    } catch (e: any) {
      showError(e.message || "Échec de l'encaissement")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleForceValidate = async () => {
    if (!paymentToForce) return
    setIsProcessing(true)
    try {
      await authService.forceValidatePayment(paymentToForce.id, forceNotes)
      showSuccess("Paiement validé manuellement")
      setIsForceModalOpen(false)
      setForceNotes('')
      setPaymentToForce(null)
      fetchPayments()
    } catch (e: any) {
      showError(e.message || "Échec de la validation")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRefund = async () => {
    if (!paymentToRefund) return
    setIsProcessing(true)
    try {
      await authService.refundPayment(paymentToRefund.id)
      showSuccess("Paiement remboursé")
      setIsRefundDialogOpen(false)
      fetchPayments()
    } catch (e: any) {
      showError(e.message || "Échec du remboursement")
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredPayments = payments.filter(p => 
    p.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.saleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.customerName || 'Client Passage').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="fixed top-4 right-4 z-[100]">
        {toast && <Toast toast={toast} />}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{businessConfig.type === 'PHARMACY' ? 'Règlements & Dispensations' : 'Transactions'}</h1>
          <p className="text-sm text-slate-500">Historique des {businessConfig.labels.orders.toLowerCase()} et encaissements.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Rechercher PAY-ID..." 
              className="pl-9 w-64 h-9 rounded-sm border-slate-200 bg-white text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => setIsDrawerOpen(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white h-9 rounded-sm flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Encaisser
          </Button>
        </div>
      </div>

      {/* Journal des transactions (Tableau Moderne) */}
      {isFetching ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white border border-slate-200 rounded-sm">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin mb-4" />
          <p className="text-sm text-slate-500 font-medium">Chargement de l'historique...</p>
        </div>
      ) : (
        <div className="bg-white rounded-sm border border-slate-200 overflow-hidden shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500 bg-slate-50">
                  <th className="px-4 py-3 border-r border-slate-200">Réf. Paiement</th>
                  <th className="px-4 py-3 border-r border-slate-200">{businessConfig.labels.customers} / Flux</th>
                  <th className="px-4 py-3 border-r border-slate-200">Méthode</th>
                  <th className="px-4 py-3 border-r border-slate-200 text-right">Montant</th>
                  <th className="px-4 py-3 border-r border-slate-200">Date</th>
                  <th className="px-4 py-3 border-r border-slate-200">Statut</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((payment) => {
                  const MethodIcon = METHOD_CONFIG[payment.method].icon;
                  const StatusIcon = STATUS_CONFIG[payment.status].icon;
                  return (
                    <tr key={payment.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-4 py-3 border-r border-slate-100 text-xs font-mono font-bold text-slate-900">{payment.paymentNumber}</td>
                      <td className="px-4 py-3 border-r border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-900">{payment.customerName || (businessConfig.type === 'PHARMACY' ? 'Patient' : 'Passage')}</span>
                          <span className="text-[10px] text-slate-400 uppercase">{businessConfig.labels.orders} #{payment.saleId.slice(-6)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-r border-slate-100">
                        <div className="flex items-center gap-2">
                          <MethodIcon className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-xs text-slate-600">{METHOD_CONFIG[payment.method].label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-r border-slate-100 text-right font-black text-slate-900">{payment.amount.toLocaleString()} FCFA</td>
                      <td className="px-4 py-3 border-r border-slate-100 text-xs text-slate-500">{new Date(payment.processedAt).toLocaleString()}</td>
                      <td className="px-4 py-3 border-r border-slate-100">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold border uppercase tracking-tighter",
                          STATUS_CONFIG[payment.status].badge
                        )}>
                          <StatusIcon className="h-2.5 w-2.5" />
                          {STATUS_CONFIG[payment.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          {payment.status === 'PENDING' && (
                            <>
                              <button 
                                onClick={() => fetchPayments()}
                                disabled={isFetching}
                                className="p-1 text-orange-500 hover:text-orange-600 transition-colors disabled:opacity-50"
                                title="Vérifier le statut"
                              >
                                <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
                              </button>
                              {(user?.role === 'admin' || user?.role === 'manager') && (
                                <button 
                                  onClick={() => { setPaymentToForce(payment); setIsForceModalOpen(true); }}
                                  className="p-1 text-emerald-600 hover:text-emerald-700 transition-colors"
                                  title="Forcer la validation (Admin)"
                                >
                                  <ShieldCheck className="h-4 w-4" />
                                </button>
                              )}
                            </>
                          )}
                          {payment.status === 'PAID' && (
                            <button 
                              onClick={() => { setPaymentToRefund(payment); setIsRefundDialogOpen(true); }}
                              className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                              title="Rembourser"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Side Drawer - Nouveau Paiement (Inspiration NestJS createPayment) */}
      <div className={cn(
        "fixed inset-0 z-50 flex justify-end transition-all duration-300",
        isDrawerOpen ? "visible" : "invisible pointer-events-none"
      )}>
        <div className={cn("fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-500", isDrawerOpen ? "opacity-100" : "opacity-0")} onClick={() => setIsDrawerOpen(false)} />
        <div className={cn("relative bg-white w-full max-w-md h-full border-l border-slate-200 flex flex-col overflow-hidden transition-all duration-500 ease-out shadow-2xl", isDrawerOpen ? "translate-x-0" : "translate-x-full")}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <h2 className="text-lg font-bold text-slate-900">Encaisser une vente</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsDrawerOpen(false)}><X className="h-5 w-5" /></Button>
          </div>
          <form onSubmit={handleCreatePayment} className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vente à encaisser</Label>
              <select 
                required
                className="w-full h-10 px-3 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-orange-500 bg-white"
                value={formData.saleId}
                onChange={e => {
                  const saleId = e.target.value;
                  const sale = pendingSales.find(s => s.id === saleId);
                  console.log('[Payments] Vente sélectionnée:', sale);
                  if (sale) {
                    // On utilise remainingAmount s'il est > 0, sinon on calcule total - paid
                    const toPay = sale.remainingAmount > 0 ? sale.remainingAmount : (sale.totalAmount - sale.paidAmount);
                    setFormData(prev => ({ 
                      ...prev, 
                      saleId, 
                      amount: Number(toPay),
                      cashAmount: Number(toPay) 
                    }));
                  }
                }}
              >
                <option value="">Choisir une vente en attente...</option>
                {pendingSales.map(sale => {
                  const tableInfo = businessConfig.features.hasTables && sale.order?.tableNumber ? `Table ${sale.order.tableNumber}` : 'Vente directe';
                  const customerInfo = sale.customer?.name || sale.customerName || sale.order?.customerName || 'Client';
                  const itemsPreview = sale.items?.map(i => i.product.name).join(', ').substring(0, 35) + '...';
                  const toPay = sale.remainingAmount > 0 ? sale.remainingAmount : (sale.totalAmount - sale.paidAmount);
                  
                  return (
                    <option key={sale.id} value={sale.id}>
                      {sale.saleNumber} - {tableInfo} ({customerInfo}) | {itemsPreview} | {Number(toPay).toLocaleString()} F
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Montant total (FCFA)</Label>
              <Input type="number" required className="h-12 text-lg font-black rounded-sm border-slate-200 focus:border-orange-500" value={formData.amount} onChange={e => setFormData({...formData, amount: parseInt(e.target.value)})} />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mode de paiement</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['CASH', 'CARD', 'ORANGE_MONEY', 'MTN_MONEY'] as PaymentMethod[]).map(m => {
                  const isDisabled = m !== 'CASH'
                  return (
                    <button
                      key={m} type="button" disabled={isDisabled}
                      onClick={() => !isDisabled && setFormData({...formData, method: m})}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-sm border text-xs font-bold transition-all",
                        isDisabled
                          ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed"
                          : formData.method === m ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-orange-300"
                      )}
                    >
                      {m === 'CASH' && <Banknote className="h-4 w-4" />}
                      {m === 'CARD' && <CreditCard className="h-4 w-4" />}
                      {(m === 'ORANGE_MONEY' || m === 'MTN_MONEY') && <Smartphone className="h-4 w-4" />}
                      {METHOD_CONFIG[m].label}
                    </button>
                  )
                })}
              </div>
            </div>

            {formData.method === 'CASH' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Montant Reçu (Cash)</Label>
                  <Input type="number" className="h-10 rounded-sm border-slate-200" value={formData.cashAmount} onChange={e => setFormData({...formData, cashAmount: parseInt(e.target.value)})} />
                </div>
                {formData.cashAmount > formData.amount && (
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase">Monnaie à rendre :</span>
                    <span className="text-lg font-black text-emerald-600">{(formData.cashAmount - formData.amount).toLocaleString()} FCFA</span>
                  </div>
                )}
              </div>
            )}

            {(formData.method === 'ORANGE_MONEY' || formData.method === 'MTN_MONEY') && (
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-sm space-y-3 animate-in fade-in slide-in-from-top-2">
                <Label className="text-[10px] font-bold text-orange-700 uppercase tracking-widest">Numéro de téléphone client</Label>
                <Input placeholder="ex: 6xx xx xx xx" className="bg-white border-orange-200 h-10 rounded-sm" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                <p className="text-[10px] text-orange-600 italic">Un message de confirmation sera envoyé au client via l'API provider.</p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Notes / Référence Interne</Label>
              <textarea 
                className="w-full p-3 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-orange-500 h-20 resize-none"
                value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Numéro de reçu, info client..."
              />
            </div>
          </form>
          <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
            <Button variant="outline" className="flex-1 rounded-sm border-slate-200 font-bold" onClick={() => setIsDrawerOpen(false)}>Annuler</Button>
            <Button 
              disabled={isProcessing || !formData.saleId || formData.amount <= 0}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded-sm font-bold flex items-center justify-center gap-2" 
              onClick={handleCreatePayment}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Confirmer l'encaissement
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Validation Manuelle */}
      <div className={cn(
        "fixed inset-0 z-[110] flex items-center justify-center p-6 transition-all",
        isForceModalOpen ? "visible" : "invisible pointer-events-none"
      )}>
        <div className={cn("absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] transition-opacity duration-300", isForceModalOpen ? "opacity-100" : "opacity-0")} onClick={() => setIsForceModalOpen(false)} />
        <div className={cn("relative bg-white w-full max-w-sm rounded-sm border border-slate-200 p-6 shadow-2xl transition-all duration-300 transform", isForceModalOpen ? "scale-100 opacity-100" : "scale-95 opacity-0")}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Validation Manuelle</h2>
            <button onClick={() => setIsForceModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
          </div>
          <p className="text-[11px] text-slate-500 mb-6 leading-relaxed">Passez le statut à <span className="font-bold text-emerald-600">PAYÉ</span> manuellement. À utiliser si vous avez reçu les fonds par un canal externe.</p>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Note de validation</Label>
              <textarea 
                className="w-full p-3 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-orange-500 h-24 resize-none bg-slate-50/50"
                value={forceNotes} onChange={e => setForceNotes(e.target.value)}
                placeholder="Ex: Référence OrangeMoney confirmée par SMS..."
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 rounded-sm text-xs" onClick={() => setIsForceModalOpen(false)}>Annuler</Button>
              <Button 
                disabled={isProcessing || !forceNotes.trim()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm font-bold text-xs" 
                onClick={handleForceValidate}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer la réception"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <DeleteDialog 
        isOpen={isRefundDialogOpen}
        isLoading={isProcessing}
        onClose={() => setIsRefundDialogOpen(false)}
        onConfirm={handleRefund}
        title="Rembourser la transaction"
        description="Cette action annulera le paiement et ajustera le solde de la vente correspondante."
        itemName={paymentToRefund?.paymentNumber}
        confirmText="Confirmer le remboursement"
      />
    </DashboardLayout>
  )
}