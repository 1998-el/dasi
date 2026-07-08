import { useState, useEffect, useCallback, useMemo } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { 
  Printer, 
  Download, 
  Search, 
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  FileText,
  Hash
} from 'lucide-react'
import { authService } from './auth.service'
import { useAuth } from '../context/AuthContext'
import { useToast, Toast } from '../components/ui/Toast'
import { cn } from '../lib/utils'

interface Ticket {
  id: string;
  ticketNumber: string;
  printCount: number;
  printedAt: string;
  content: string;
  order: {
    id: string;
    orderNumber: string;
    tableNumber?: string | null;
    customerName?: string | null;
    table?: { number: string; zone?: string | null } | null;
    items: Array<{
      quantity: number;
      product: { name: string };
    }>;
    totalAmount: number;
  } | null;
  sale: {
    totalAmount: number;
    saleNumber?: string;
  } | null;
  normalizedAmount?: number;
  normalizedRef?: string;
}

interface TicketStats {
  total: number;
  totalPrints: number;
  today: number;
}

export function TicketsPage() {
  const { businessConfig } = useAuth()
  const { toast, showSuccess, showError } = useToast()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [stats, setStats] = useState<TicketStats | null>(null)
  const [isFetching, setIsFetching] = useState(true)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 10

  const loadData = useCallback(async () => {
    setIsFetching(true)
    try {
      const [ticketsData, statsData] = await Promise.all([
        authService.getTickets(),
        authService.getTicketStats()
      ])
      console.log('[TicketsPage] Liste des tickets chargée :', ticketsData);

      // Normalisation pour gérer Retail vs Restaurant
      const normalized = (ticketsData || []).map((t: any) => {
        let amount = t.sale?.totalAmount ?? t.order?.totalAmount ?? 0;
        let reference = t.order?.orderNumber ?? t.sale?.saleNumber;
        
        // Extraction intelligente pour Retail si les liens relationnels sont absents (cas du module Boutique)
        if (!amount && t.content) {
          if (t.content.trim().startsWith('{')) {
            try {
              const p = JSON.parse(t.content);
              amount = p.total || p.totalAmount || 0;
              reference = reference || p.cartNumber;
            } catch {}
          } else {
            // Extraction regex du montant pour les tickets textuels (ex: TOTAL À PAYER : 3 000 F)
            const match = t.content.match(/TOTAL.*?[:\s]+([\d\s\u202f,]+)/i);
            if (match) amount = parseInt(match[1].replace(/[\s\u202f,]/g, '')) || 0;
          }
        }
        
        return {
          ...t,
          normalizedAmount: amount,
          normalizedRef: reference || (t.retailCartId ? `Panier #${t.retailCartId.slice(-6)}` : t.ticketNumber.replace('TK-', ''))
        };
      });

      setTickets(normalized)
      setStats(statsData)
    } catch (e: any) {
      showError(e.message || "Erreur de chargement des tickets")
    } finally {
      setIsFetching(false)
    }
  }, [showError])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleReprint = async (id: string) => {
    setIsProcessing(id)
    console.log('[TicketsPage] Tentative de réimpression pour le ticket ID :', id);
    try {
      await authService.reprintTicket(id)
      showSuccess("Compteur de réimpression mis à jour")
      loadData()
    } catch (e: any) {
      showError("Échec de la réimpression")
    } finally {
      setIsProcessing(null)
    }
  }

  const handleDownload = async (ticket: Ticket) => {
    console.log('[TicketsPage] Export PDF demandé pour le ticket :', ticket);
    try {
      await authService.downloadTicketPdf(ticket.id, ticket.ticketNumber)
      showSuccess("Téléchargement lancé")
    } catch (e: any) {
      showError("Erreur lors de l'export PDF")
    }
  }

  const filteredTickets = tickets.filter(t => 
    t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.normalizedRef || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.order?.table?.zone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.order?.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filteredTickets.length / PAGE_SIZE)
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredTickets.slice(start, start + PAGE_SIZE)
  }, [filteredTickets, currentPage])

  useEffect(() => { setCurrentPage(1) }, [searchTerm])

  return (
    <DashboardLayout>
      <div className="fixed top-4 right-4 z-[100]">
        {toast && <Toast toast={toast} />}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Archives Tickets</h1>
          <p className="text-sm text-slate-500">Consultez, réimprimez ou exportez les tickets de caisse.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Rechercher TKT, Commande, Zone..." 
            className="pl-9 w-64 h-9 rounded-sm border-slate-200 bg-white text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Émis", value: stats?.total ?? 0, icon: FileText, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Tickets du jour", value: stats?.today ?? 0, icon: Calendar, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Total Impressions", value: stats?.totalPrints ?? 0, icon: Printer, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-sm border border-slate-200 flex items-center gap-4">
            <div className={cn("p-3 rounded-sm", s.bg, s.color)}><s.icon className="h-5 w-5" /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-xl font-bold text-slate-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {isFetching ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white border border-slate-200 rounded-sm">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin mb-4" />
          <p className="text-sm text-slate-500 font-medium">Chargement des archives...</p>
        </div>
      ) : (
        <div className="bg-white rounded-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 bg-slate-50/50">
                  <th className="px-6 py-3">Réf. Ticket</th>
                <th className="px-6 py-3">
                  {businessConfig.type === 'RESTAURANT' ? 'Commande / Table' : 
                   businessConfig.type === 'PHARMACY' ? 'Dispensation' : 'Vente'}
                </th>
                  <th className="px-6 py-3 text-right">Montant</th>
                  <th className="px-6 py-3">Imprimé le</th>
                  <th className="px-6 py-3 text-center">Copies</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{ticket.ticketNumber}</td>
                    <td className="px-6 py-4 text-xs">
                      <div className="font-bold text-slate-900">{ticket.normalizedRef}</div>
                      <div className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                        {businessConfig.features.hasTables ? (
                          <>
                            <span className="font-medium text-orange-600">Table {ticket.order?.tableNumber || ticket.order?.table?.number || 'N/A'}</span>
                            {ticket.order?.table?.zone && (
                              <span className="text-[10px] bg-slate-100 px-1.5 py-px rounded-sm border border-slate-200 text-slate-400 uppercase font-bold">
                                {ticket.order.table.zone}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-slate-500 font-medium">
                            {ticket.order?.customerName || (businessConfig.type === 'PHARMACY' ? 'Patient' : 'Vente Directe')}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 italic mt-1 line-clamp-1 max-w-[200px]">
                        {ticket.order?.items 
                          ? ticket.order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')
                          : (ticket.content?.trim().startsWith('{') 
                              ? (businessConfig.type === 'PHARMACY' ? 'Produits officine' : 'Articles boutique') 
                              : (businessConfig.type === 'PHARMACY' ? 'Dispensation directe' : 'Articles vente directe')
                            )
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-900">
                      {(ticket.normalizedAmount ?? 0).toLocaleString()} F
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(ticket.printedAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600">
                        {ticket.printCount} {ticket.printCount > 1 ? 'copies' : 'copie'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleReprint(ticket.id)}
                          disabled={!!isProcessing && isProcessing === ticket.id}
                          className="p-1.5 text-slate-400 hover:text-orange-600 transition-colors rounded-sm hover:bg-orange-50"
                          title="Réimprimer"
                        >
                          {isProcessing === ticket.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                        </button>
                        <button 
                          onClick={() => handleDownload(ticket)}
                          className="p-1.5 text-slate-400 hover:text-orange-600 transition-colors rounded-sm hover:bg-orange-50"
                          title="Exporter PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTickets.length === 0 && (
              <div className="p-12 text-center text-slate-400 italic">Aucun ticket trouvé.</div>
            )}
          </div>
          
          {/* Pagination UI */}
          {totalPages > 1 && (
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500 font-medium">
                Affichage de {(currentPage - 1) * PAGE_SIZE + 1} à {Math.min(currentPage * PAGE_SIZE, filteredTickets.length)} sur {filteredTickets.length} tickets
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline" size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="h-8 w-8 p-0 rounded-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline" size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="h-8 w-8 p-0 rounded-sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}