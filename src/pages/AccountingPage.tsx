import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { DashboardLayout } from '../components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Download, 
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Receipt,
  Printer,
  Loader2,
  Calendar
} from 'lucide-react'
import { cn } from '../lib/utils'
import { useAuth } from '../context/AuthContext'
import { useToast, Toast } from '../components/ui/Toast'
import { authService } from './auth.service'

// Couleurs standards pour la ventilation des dépenses
const COLORS = ['bg-orange-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-slate-400'];

export function AccountingPage() {
  const { t } = useTranslation()
  const { businessConfig } = useAuth()
  const { showSuccess, showError, toast } = useToast()
  const [activeTab, setActiveTab] = useState<'pnl' | 'balance' | 'journal' | 'reports'>('pnl')
  const [isLoading, setIsLoading] = useState(true)
  const [pnlData, setPnlData] = useState<any[]>([])
  const [expenseBreakdown, setExpenseBreakdown] = useState<any[]>([])
  const [balanceData, setBalanceData] = useState<any>(null)
  const [journalData, setJournalData] = useState<any[]>([])
  const [reportHistory, setReportHistory] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      if (activeTab === 'pnl') {
        // On passe la date sélectionnée (ou le premier du mois) pour filtrer les écritures
        const data = await authService.getAccountingPnL(selectedDate)
        setPnlData(data?.monthlyData || [])
        setExpenseBreakdown(data?.expenseBreakdown || [])
      } else if (activeTab === 'balance') {
        // Récupération de la balance à date
        const data = await authService.getAccountingBalance(undefined, selectedDate)
        setBalanceData(data)
      } else if (activeTab === 'reports') {
        const history = await authService.getZReportHistory()
        setReportHistory(history)
      } else if (activeTab === 'journal') {
        const data = await authService.getAccountingJournal()
        setJournalData(data || [])
      }
    } catch (e: any) {
      showError(e.message || "Erreur de chargement des données comptables")
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, selectedDate, showError])

  useEffect(() => {
    loadData()
  }, [loadData, activeTab, selectedDate])

  const handleDownloadZReport = async () => {
    try {
      showSuccess("Génération du Z-Report en cours...")
      await authService.downloadZReportPdf(selectedDate)
    } catch (e: any) {
      showError(e.message || "Erreur lors du téléchargement")
    }
  }

  const handleExportExcel = async () => {
    try {
      showSuccess("Génération du fichier Excel...")
      await authService.exportAccountingToExcel(activeTab === 'balance' ? 'balance' : 'pnl')
    } catch (e: any) {
      showError(e.message || "Erreur lors de l'export")
    }
  }

  // Calcul des totaux simulés
  const totals = useMemo(() => {
    const revenue = pnlData.reduce((acc, d) => acc + (d.revenue || 0), 0)
    const expenses = pnlData.reduce((acc, d) => acc + (d.expenses || 0), 0)
    const tax = pnlData.reduce((acc, d) => acc + (d.tax || 0), 0)
    return {
      revenue,
      expenses,
      grossMargin: revenue - (expenses * 0.6),
      netProfit: revenue - expenses - tax,
      tax
    }
  }, [pnlData])

  if (isLoading && pnlData.length === 0 && !balanceData) {
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
      <div className="fixed top-4 right-4 z-[100]">{toast && <Toast toast={toast} />}</div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
            {t('accounting.title')}
          </h1>
          <p className="text-sm text-slate-500 font-medium italic">{t('accounting.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative mr-2">
             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
             <input 
                type="date" 
                className="pl-9 h-9 border border-slate-200 rounded-sm text-[10px] font-bold uppercase focus:ring-0 focus:border-orange-500 bg-white"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
             />
          </div>
          <div className="flex bg-slate-100 p-1 rounded-sm border border-slate-200 mr-2">
            {(['pnl', 'balance', 'journal', 'reports'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-1.5 text-[10px] font-black rounded-sm transition-all uppercase tracking-widest",
                  activeTab === tab ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {t(`accounting.tabs.${tab}`)}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="h-9 border-slate-200 text-slate-600 font-bold text-[10px] uppercase gap-2" onClick={handleExportExcel}>
            <Download className="h-3.5 w-3.5" /> Excel
          </Button>
          <Button className="h-9 bg-orange-600 hover:bg-orange-700 text-white font-bold text-[10px] uppercase gap-2" onClick={handleDownloadZReport}>
            <FileText className="h-3.5 w-3.5" /> Z-Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard label={t('accounting.kpis.revenue')} value={totals.revenue} icon={DollarSign} trend="+12.5%" trendType="up" />
        <KPICard label={t('accounting.kpis.expenses')} value={totals.expenses} icon={Receipt} trend="+4.2%" trendType="down" color="text-red-600" />
        <KPICard label={t('accounting.kpis.margin')} value={totals.grossMargin} icon={BarChart3} trend="34.2%" trendType="neutral" color="text-blue-600" />
        <KPICard label={t('accounting.kpis.net_profit')} value={totals.netProfit} icon={TrendingUp} trend="+18.4%" trendType="up" color="text-emerald-600" highlight />
      </div>

      {activeTab === 'pnl' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 rounded-sm border-slate-200 shadow-none overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-slate-50/30">
            <CardTitle className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-500" />
              {t('accounting.sections.performance_trend')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-64 flex items-end justify-between gap-4">
              {pnlData.map((data, idx) => {
                const max = 2500000
                const revHeight = (data.revenue / max) * 100
                const expHeight = (data.expenses / max) * 100
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative">
                    <div className="w-full flex items-end justify-center gap-1 h-full border-b border-slate-100 pb-2">
                      <div className="w-3 bg-orange-500 rounded-t-sm transition-all group-hover:opacity-80" style={{ height: `${revHeight}%` }} />
                      <div className="w-3 bg-slate-300 rounded-t-sm transition-all group-hover:bg-slate-400" style={{ height: `${expHeight}%` }} />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-3">{data.month.substring(0, 3)}.</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-8 flex justify-center gap-6">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded-sm" /><span className="text-[10px] font-bold text-slate-500 uppercase">{t('accounting.kpis.revenue')}</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-300 rounded-sm" /><span className="text-[10px] font-bold text-slate-500 uppercase">{t('accounting.kpis.expenses')}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-sm border-slate-200 shadow-none overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-slate-50/30">
            <CardTitle className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <PieChart className="h-4 w-4 text-orange-500" />
              {t('accounting.sections.expense_structure')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {expenseBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="text-slate-900">{item.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={cn("h-full", COLORS[idx % COLORS.length])} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
            <div className="mt-8 p-4 bg-orange-50 border border-orange-100 rounded-sm flex items-start gap-3">
              <Calculator className="h-4 w-4 text-orange-600 shrink-0" />
              <p className="text-[10px] font-bold text-orange-800 uppercase leading-relaxed">
                Analyse : La part des marchandises est élevée ({businessConfig.type === 'RESTAURANT' ? 'Food Cost' : 'Achats'}). Surveillez les marges.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 rounded-sm border-slate-200 shadow-none overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-slate-50/30 py-3">
             <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-black uppercase text-slate-500 tracking-widest">{t('accounting.sections.monthly_breakdown')}</CardTitle>
                <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded-sm">Semestre 1 - 2026</span>
             </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                  <th className="px-6 py-3 border-r border-slate-100">Mois</th>
                  <th className="px-6 py-3 text-right">{t('accounting.kpis.revenue')}</th>
                  <th className="px-6 py-3 text-right">{t('accounting.kpis.expenses')}</th>
                  <th className="px-6 py-3 text-right">Marge S.</th>
                  <th className="px-6 py-3 text-right">{t('accounting.kpis.tax_collected')}</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pnlData.map((data, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 border-r border-slate-50">{data.month}</td>
                    <td className="px-6 py-4 text-right font-black text-slate-800">{data.revenue.toLocaleString()} F</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-500">{data.expenses.toLocaleString()} F</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">{(data.revenue - data.expenses).toLocaleString()} F</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-400">{data.tax.toLocaleString()} F</td>
                    <td className="px-6 py-4 text-center"><button onClick={() => authService.downloadZReportPdf(selectedDate)} className="p-1.5 text-slate-400 hover:text-orange-600"><Printer className="h-3.5 w-3.5" /></button></td>
                  </tr>
                ))}
                <tr className="bg-slate-900 text-white font-black">
                   <td className="px-6 py-4 border-r border-slate-700 uppercase text-xs tracking-widest">TOTAL SEMESTRE</td>
                   <td className="px-6 py-4 text-right">{totals.revenue.toLocaleString()} F</td>
                   <td className="px-6 py-4 text-right opacity-70">{totals.expenses.toLocaleString()} F</td>
                   <td className="px-6 py-4 text-right text-emerald-400">{(totals.revenue - totals.expenses).toLocaleString()} F</td>
                   <td className="px-6 py-4 text-right opacity-70">{totals.tax.toLocaleString()} F</td>
                   <td className="px-6 py-4" />
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
        </div>
      ) : activeTab === 'balance' ? (
        <Card className="rounded-sm border-slate-200 shadow-none overflow-hidden">
           <CardHeader className="border-b border-slate-50 bg-slate-50/30">
              <CardTitle className="text-xs font-black uppercase text-slate-500 tracking-widest">Balance Générale des Comptes (OHADA)</CardTitle>
           </CardHeader>
           <CardContent className="p-0">
              <table className="w-full text-left border-collapse text-sm">
                 <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                       <th className="px-6 py-3 border-r border-slate-100">N° Compte</th>
                       <th className="px-6 py-3">Libellé</th>
                       <th className="px-6 py-3 text-right">Débit</th>
                       <th className="px-6 py-3 text-right">Crédit</th>
                       <th className="px-6 py-3 text-right">Solde</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {(balanceData?.accounts || []).map((acc: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                         <td className="px-6 py-4 font-mono text-xs font-bold border-r border-slate-50">{acc.code}</td>
                         <td className="px-6 py-4 font-medium text-slate-700">{acc.label}</td>
                         <td className="px-6 py-4 text-right">{acc.debit.toLocaleString()} F</td>
                         <td className="px-6 py-4 text-right">{acc.credit.toLocaleString()} F</td>
                         <td className={cn("px-6 py-4 text-right font-black", acc.balance >= 0 ? "text-emerald-600" : "text-red-600")}>
                            {acc.balance.toLocaleString()} F
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </CardContent>
        </Card>
       ) : activeTab === 'journal' ? (
        <Card className="rounded-sm border-slate-200 shadow-none overflow-hidden">
           <CardHeader className="border-b border-slate-50 bg-slate-50/30">
              <CardTitle className="text-xs font-black uppercase text-slate-500 tracking-widest">Journal Comptable (OHADA)</CardTitle>
           </CardHeader>
           <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                 <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                       <th className="px-6 py-3">Référence</th>
                       <th className="px-6 py-3">Journal</th>
                       <th className="px-6 py-3">Libellé</th>
                       <th className="px-6 py-3">Date</th>
                       <th className="px-6 py-3 text-right">Montant</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {journalData.length > 0 ? journalData.map((entry: any) => {
                      const total = (entry.lines || []).reduce(
                        (acc: number, l: any) => acc + Number(l.debit ?? 0) + Number(l.credit ?? 0),
                        0,
                      ) / 2
                      return (
                        <tr key={entry.id} className="hover:bg-slate-50/50 align-top">
                           <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">{entry.reference}</td>
                           <td className="px-6 py-4">
                             <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-sm bg-orange-50 text-orange-700 border border-orange-100">
                               {entry.journal}
                             </span>
                           </td>
                           <td className="px-6 py-4">
                             <p className="text-xs font-medium text-slate-700">{entry.description}</p>
                             <div className="mt-1 flex flex-wrap gap-1">
                               {(entry.lines || []).map((l: any, i: number) => (
                                 <span key={i} className="text-[9px] font-mono text-slate-400 bg-slate-100 rounded px-1 py-0.5">
                                   {l.accountCode}
                                 </span>
                               ))}
                             </div>
                           </td>
                           <td className="px-6 py-4 text-xs text-slate-500">{new Date(entry.createdAt).toLocaleDateString()}</td>
                           <td className="px-6 py-4 text-right font-black text-slate-800">{total.toLocaleString()} F</td>
                        </tr>
                      )
                    }) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                          Aucune écriture comptable enregistrée pour le moment.
                        </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </CardContent>
        </Card>
       ) : activeTab === 'reports' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-sm border-slate-200 shadow-none overflow-hidden">
            <CardHeader className="border-b border-slate-50 bg-slate-50/30">
              <CardTitle className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                <Printer className="h-4 w-4 text-orange-500" />
                Clôture de Caisse (Z-Report)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-xs text-slate-500 font-medium">
                Générez et téléchargez le rapport de clôture pour la journée sélectionnée dans le sélecteur de date en haut de page.
              </p>
              <Button 
                onClick={handleDownloadZReport}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-[10px] uppercase h-10 gap-2"
              >
                <Download className="h-3.5 w-3.5" /> Télécharger le Z-Report
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-sm border-slate-200 shadow-none overflow-hidden">
            <CardHeader className="border-b border-slate-50 bg-slate-50/30">
              <CardTitle className="text-xs font-black uppercase text-slate-500 tracking-widest">
                Historique des Rapports
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {reportHistory.length > 0 ? reportHistory.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-sm bg-slate-50/50 group">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">Clôture du {new Date(report.date).toLocaleDateString()}</span>
                      <span className="text-[9px] text-slate-400 font-mono">#{report.id.slice(-8)}</span>
                    </div>
                    <button onClick={() => authService.downloadZReportPdf(report.date)} className="p-2 text-slate-400 hover:text-orange-600 opacity-0 group-hover:opacity-100 transition-all"><Printer className="h-3.5 w-3.5" /></button>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400 italic text-center py-8">Aucun historique disponible.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </DashboardLayout>
  )
}

function KPICard({ label, value, icon: Icon, trend, trendType, color = "text-slate-900", highlight = false }: any) {
  return (
    <Card className={cn("rounded-sm border-slate-200 p-5 shadow-none transition-all hover:border-slate-300", highlight && "bg-slate-50 border-orange-200")}>
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <div className={cn("p-2 rounded-sm bg-white border border-slate-100", color)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <p className={cn("text-xl font-black tracking-tight", color)}>{value.toLocaleString()} <span className="text-xs font-bold text-slate-400">F</span></p>
        <div className={cn(
          "flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-sm",
          trendType === 'up' ? "bg-emerald-50 text-emerald-700" : 
          trendType === 'down' ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
        )}>
          {trendType === 'up' ? <ArrowUpRight className="h-2.5 w-2.5" /> : 
           trendType === 'down' ? <ArrowDownRight className="h-2.5 w-2.5" /> : null}
          {trend}
        </div>
      </div>
    </Card>
  )
}