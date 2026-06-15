import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { DashboardLayout } from '../components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  ChevronLeft, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Shield,
  Clock,
  Palmtree,
  Ban,
  FileText,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  UserCheck
} from 'lucide-react'
import { authService } from './auth.service'
import { useToast, Toast } from '../components/ui/Toast'
import { cn } from '../lib/utils'

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast, showSuccess, showError } = useToast()
  
  const [employee, setEmployee] = useState<any>(null)
  const [leaveBalance, setLeaveBalance] = useState<any>(null)
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const loadEmployeeData = useCallback(async () => {
    if (!id) return
    setIsFetching(true)
    try {
      const [empData, balanceData, attData] = await Promise.all([
        authService.getMember(id),
        authService.getLeaveBalance(id),
        authService.getEmployeeAttendance(id, 10) // On affiche les 10 derniers événements
      ])
      console.log('[EmployeeDetailPage] Données chargées avec succès :', { employee: empData, attendance: attData });
      setEmployee(empData)
      setLeaveBalance(balanceData)
      setAttendanceLogs(attData)
    } catch (e: any) {
      showError("Impossible de charger les détails de l'employé")
      console.error(e)
    } finally {
      setIsFetching(false)
    }
  }, [id, showError])

  useEffect(() => {
    loadEmployeeData()
  }, [loadEmployeeData])

  const handleTerminate = async () => {
    if (!id || !window.confirm("Êtes-vous sûr de vouloir mettre fin au contrat de cet employé ?")) return
    
    setIsProcessing(true)
    try {
      await authService.terminateEmployee(id, "Fin de contrat administrative")
      showSuccess("Statut de l'employé mis à jour (Inactif)")
      loadEmployeeData()
    } catch (e: any) {
      showError(e.message || "Erreur lors de la mise à jour")
    } finally {
      setIsProcessing(false)
    }
  }

  if (isFetching) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
          <p className="text-sm text-slate-500 font-medium">Chargement du profil employé...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!employee) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900">Employé introuvable</h2>
          <Button variant="link" onClick={() => navigate('/members')} className="text-orange-600">Retour à la liste</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="fixed top-4 right-4 z-[100]">
        {toast && <Toast toast={toast} />}
      </div>

      <div className="mb-8">
        <Link 
          to="/hr" 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-orange-600 transition-colors mb-4 group"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Retour à la gestion RH
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-sm bg-gray-500 text-white flex items-center justify-center text-xl font-black">
              {employee.firstName?.[0]}{employee.lastName?.[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {employee.firstName} {employee.lastName}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">{employee.employeeProfile?.employeeNumber || employee.employeeNumber}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase border",
                  (employee.employeeProfile?.status || employee.status) === 'ACTIVE' ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-500"
                )}>
                  {(employee.employeeProfile?.status || employee.status) === 'ACTIVE' ? 'En poste' : 'Inactif'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(employee.employeeProfile?.status || employee.status) === 'ACTIVE' && (
              <Button 
                variant="outline" 
                className="h-9 border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold"
                onClick={handleTerminate}
                disabled={isProcessing}
              >
                <Ban className="h-4 w-4 mr-2" />
                Mettre fin au contrat
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne Principale : Infos & Contrat */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-sm border-slate-200 p-6">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-orange-600" />
                Informations Professionnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoItem label="Poste actuel" value={employee.employeeProfile?.position || employee.position} icon={Shield} />
                <InfoItem label="Type de contrat" value={employee.employeeProfile?.contractType || employee.contractType} icon={FileText} />
                <InfoItem label="Date d'embauche" value={employee.employeeProfile?.hireDate ? new Date(employee.employeeProfile.hireDate).toLocaleDateString() : (employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : 'N/A')} icon={Calendar} />
                <InfoItem label="Salaire de base" value={`${(employee.employeeProfile?.baseSalary || employee.baseSalary || 0).toLocaleString()} FCFA`} icon={DollarSign} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-sm border-slate-200 p-6">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-orange-600" />
                Coordonnées de contact
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoItem label="Email professionnel" value={employee.email} icon={Mail} />
                <InfoItem label="Téléphone" value={employee.phone || 'Non renseigné'} icon={Phone} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne Latérale : Congés & Statistiques */}
        <div className="space-y-6">
          <Card className="rounded-sm border-slate-200 bg-orange-600 text-white overflow-hidden relative p-6">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Palmtree className="h-20 w-20 rotate-12" />
            </div>
            <CardHeader>
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest opacity-80 flex items-center gap-2 text-white">
                Solde de congés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black">{leaveBalance?.remainingDays ?? 0}</span>
                <span className="text-sm font-bold uppercase opacity-80">Jours restants</span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-4 text-[10px] font-bold uppercase tracking-tighter">
                <div>
                  <p className="opacity-70">Acquis</p>
                  <p className="text-lg">{leaveBalance?.accruedDays ?? 0}</p>
                </div>
                <div>
                  <p className="opacity-70">Utilisés</p>
                  <p className="text-lg">{leaveBalance?.usedDays ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section Pointage en format Tableau */}
      <div className="mt-8">
        <Card className="rounded-sm border-slate-200 overflow-hidden p-6">
          <CardHeader className="border-b border-slate-50 bg-slate-50/50 py-4 px-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                Historique des présences & pointages
              </CardTitle>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-2 py-1 border border-slate-100 rounded-sm">
                {attendanceLogs.length} derniers logs
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 bg-slate-50/30">
                    <th className="px-6 py-3">Date & Heure</th>
                    <th className="px-6 py-3">Action</th>
                    <th className="px-6 py-3">Statut</th>
                    <th className="px-6 py-3">Enregistré par</th>
                    <th className="px-6 py-3 text-right">Référence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {attendanceLogs.length > 0 ? attendanceLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700">{new Date(log.timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase border",
                          log.type === 'CHECK_IN' ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"
                        )}>
                          {log.type === 'CHECK_IN' ? <ArrowRight className="h-3 w-3" /> : <ArrowLeft className="h-3 w-3" />}
                          {log.type === 'CHECK_IN' ? 'Entrée' : 'Sortie'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-1.5">
                            <div className={cn("h-1.5 w-1.5 rounded-full", log.status === 'PRESENT' ? 'bg-emerald-500' : 'bg-slate-300')} />
                            <span className="text-xs font-medium text-slate-600">{log.status}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500 border border-slate-200 uppercase">
                            {log.recordedByName?.split(' ').map((n: any) => n[0]).join('') || '?'}
                          </div>
                          <span className="text-xs font-medium text-slate-600">{log.recordedByName || 'Système'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[10px] font-mono text-slate-300 uppercase">#{log.id.slice(-8)}</span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                        Aucune donnée de présence enregistrée pour cet employé.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-slate-50/30 border-t border-slate-100 flex justify-center">
              <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-600">
                Télécharger l'historique complet (PDF/Excel)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function InfoItem({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-slate-50 rounded-sm border border-slate-100">
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-700">{value || 'N/A'}</p>
      </div>
    </div>
  )
}