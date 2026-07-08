import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DashboardLayout } from '../components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { 
  FileText, 
  Download, 
  Calendar,
  ShieldCheck,
  AlertCircle,
  Printer,
  History
} from 'lucide-react'
import { authService } from './auth.service'
import { useToast, Toast } from '../components/ui/Toast'

export function CashClosingPage() {
  const { t } = useTranslation()
  const { showSuccess, showError, toast } = useToast()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleGenerateReport = async () => {
    setIsProcessing(true)
    try {
      showSuccess("Génération du rapport en cours...")
      await authService.downloadZReportPdf(selectedDate)
    } catch (e: any) {
      showError(e.message || "Erreur lors de la génération du rapport")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadCsv = async () => {
    setIsProcessing(true)
    try {
      showSuccess("Export CSV en cours...")
      await authService.downloadZReportCsv(selectedDate)
    } catch (e: any) {
      showError(e.message || "Erreur lors de l'export CSV")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="fixed top-4 right-4 z-[100]">{toast && <Toast toast={toast} />}</div>

      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
          Clôture de Caisse (Z-Report)
        </h1>
        <p className="text-sm text-slate-500 font-medium italic">
          Générez les rapports de fin de journée pour la conformité fiscale et le suivi des ventes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-sm border-slate-200 shadow-none overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-slate-50/30">
            <CardTitle className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              Sélection de la période
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="max-w-xs space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Date de clôture
              </label>
              <input 
                type="date" 
                className="w-full h-12 px-4 border border-slate-200 rounded-sm text-sm font-bold uppercase focus:ring-0 focus:border-orange-500 bg-white"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="p-4 bg-orange-50 border border-orange-100 rounded-sm flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
              <p className="text-xs text-orange-800 leading-relaxed font-medium">
                Le Z-Report est un document officiel qui réinitialise les compteurs de vente pour la journée sélectionnée. 
                Assurez-vous que toutes les transactions sont finalisées avant de générer le rapport final.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                disabled={isProcessing}
                onClick={handleGenerateReport}
                className="h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase px-8 gap-3"
              >
                <Printer className="h-4 w-4" />
                Générer & Télécharger PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDownloadCsv}
                disabled={isProcessing}
                className="h-12 border-slate-200 text-slate-600 font-bold text-xs uppercase px-8 gap-3"
              >
                <Download className="h-4 w-4" />
                Export CSV (Données brutes)
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-sm border-slate-200 shadow-none overflow-hidden">
            <CardHeader className="border-b border-slate-50 bg-slate-50/30">
              <CardTitle className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Conformité OHADA
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-xs text-slate-500 leading-relaxed font-medium italic">
                Tous les rapports générés sont horodatés et archivés dans le journal des ventes OHADA pour vos futures audits.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-sm border-slate-200 shadow-none overflow-hidden">
             <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                <CardTitle className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                  <History className="h-4 w-4 text-orange-500" />
                  Dernières clôtures
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6">
                <div className="space-y-4">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-slate-50 last:border-none">
                        <span className="font-bold text-slate-600">Z-Report - 2026-03-0{i}</span>
                        <button onClick={() => authService.downloadZReportPdf(`2026-03-0${i}`)} className="text-orange-600 hover:underline font-black uppercase text-[10px]">Re-télécharger</button>
                     </div>
                   ))}
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}