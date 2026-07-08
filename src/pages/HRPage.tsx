import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../components/DashboardLayout'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { Input } from '../components/ui/input'
import { 
  Users, 
  Clock, 
  Calculator, 
  UserPlus, 
  Plus,
  X,
  Save,
  Search, 
  ChevronRight,
  ChevronDown,
  Loader2, 
  TrendingUp, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  LogOut,
  LogIn,
  DollarSign,
  Briefcase,
  Sparkles,
  Palmtree,
  BarChart3,
  Settings2,
  CalendarCheck,
  UserCheck
} from 'lucide-react'
import { authService } from './auth.service'
import { useToast, Toast } from '../components/ui/Toast'
import { cn } from '../lib/utils'

type HRTab = 'overview' | 'employees' | 'attendance' | 'leave' | 'analytics' | 'settings';

export function HRPage() {
  const { toast, showSuccess, showError } = useToast()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<HRTab>('overview')
  const [isFetching, setIsFetching] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null)
  const [summary, setSummary] = useState<any>(null)
  const [employees, setEmployees] = useState<any[]>([])
  const [recentAttendance, setRecentAttendance] = useState<any[]>([])
  const [leaveRequests, setLeaveRequests] = useState<any[]>([])
  const [hrConfig, setHrConfig] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [isEmployeeDrawerOpen, setIsEmployeeDrawerOpen] = useState(false)
  const [isLeaveDrawerOpen, setIsLeaveDrawerOpen] = useState(false)
  const [employeeFormData, setEmployeeFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    baseSalary: 0,
    contractType: 'CDI',
    hireDate: new Date().toISOString().split('T')[0],
  })

  const [leaveFormData, setLeaveFormData] = useState({
    employeeId: '',
    type: 'PAID_VACATION',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  })

  const loadData = useCallback(async () => {
    setIsFetching(true)
    try {
      const [sumData, empData, leaveData, configData] = await Promise.all([
        authService.getHRSummary(),
        authService.getEmployees(),
        authService.getLeaveRequests(),
        authService.getHrConfig()
      ])
      console.log('[HRPage] Sync Backend OK:', { summary: sumData, count: empData.length });

      // Map employeeId -> "Prénom Nom" pour résoudre le nom dans l'activité récente
      // (le backend /hr/summary ne renvoie que l'employeeId, pas le nom).
      const employeeNameById = new Map<string, string>(
        (empData || []).map((e: any) => [e.id, `${e.firstName || ''} ${e.lastName || ''}`.trim()])
      )

      const enrichedActivity = (sumData?.recentActivity ?? []).map((a: any) => ({
        ...a,
        employeeName:
          a.employeeName ||
          employeeNameById.get(a.employeeId) ||
          'Employé inconnu',
        // Le backend renvoie `markedBy` (qui a pointé) ; on garde la compatibilité.
        markedBy: a.markedBy ?? a.recordedByName ?? null,
      }))

      setSummary(sumData)
      setEmployees(empData)
      setRecentAttendance(enrichedActivity)
      setLeaveRequests(leaveData)
      setHrConfig(configData)
    } catch (e: any) {
      showError("Erreur de chargement des données RH")
    } finally {
      setIsFetching(false)
    }
  }, [showError])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAttendanceAction = async (employeeId: string, type: 'IN' | 'OUT') => {
    setIsProcessing(true)
    try {
      if (type === 'IN') await authService.checkIn(employeeId)
      else await authService.checkOut(employeeId)
      showSuccess(`Pointage ${type === 'IN' ? 'Entrée' : 'Sortie'} enregistré`)
      loadData()
    } catch (e: any) {
      showError(e.message || "Erreur de pointage")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleLeaveDecision = async (requestId: string, action: 'approve' | 'reject') => {
    setIsProcessing(true)
    try {
      if (action === 'approve') await authService.approveLeaveRequest(requestId)
      else await authService.rejectLeaveRequest(requestId, "Refusé par la direction")
      showSuccess(`Demande ${action === 'approve' ? 'validée' : 'rejetée'}`)
      loadData()
    } catch (e: any) {
      showError(e.message || "Action impossible")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    try {
      // On génère un matricule automatique pour satisfaire la validation du backend
      // en attendant que le service NestJS s'en occupe nativement.
      const payload = {
        ...employeeFormData,
        employeeNumber: `EMP-${Date.now().toString().slice(-6)}`
      }
      await authService.createEmployee(payload)
      showSuccess("Nouvel employé enregistré")
      setIsEmployeeDrawerOpen(false)
      setEmployeeFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        baseSalary: 0,
        contractType: 'CDI',
        hireDate: new Date().toISOString().split('T')[0],
      })
      loadData()
    } catch (e: any) {
      showError(e.message || "Erreur de création")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    try {
      await authService.requestLeave(leaveFormData)
      showSuccess("Demande de congé enregistrée")
      setIsLeaveDrawerOpen(false)
      setLeaveFormData({
        employeeId: '',
        type: 'PAID_VACATION',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: '',
      })
      loadData()
    } catch (e: any) {
      showError(e.message || "Erreur lors de la demande")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    try {
      await authService.updateHrConfig(hrConfig)
      showSuccess("Configuration RH mise à jour")
    } catch (e) {
      showError("Erreur de sauvegarde")
    } finally {
      setIsProcessing(false)
    }
  }

  const loadAnalytics = async () => {
    setIsFetching(true)
    try {
      // Mock temporaire en attendant l'implémentation authService
      setAnalytics({ cost: { laborCostPercentage: 25, totalSalary: 1200000, totalSales: 5000000 } })
    } catch (e) {
      showError("Erreur analytics")
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'analytics') loadAnalytics()
  }, [activeTab])

  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
    const position = (emp.position || '').toLowerCase();
    const number = (emp.employeeNumber || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return fullName.includes(term) || position.includes(term) || number.includes(term);
  })


  return (
    <DashboardLayout>
      <div className="fixed top-4 right-4 z-[100]">
        {toast && <Toast toast={toast} />}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ressources Humaines</h1>
          <p className="text-sm text-slate-500">Gestion du personnel, pointages et paie.</p>
        </div>
        <div className="flex items-center gap-3">
          {(activeTab === 'employees' || activeTab === 'attendance') && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Nom, poste, matricule..." 
                className="pl-9 w-64 h-9 rounded-sm border-slate-200 bg-white text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          {activeTab === 'employees' && (
            <Button 
              onClick={() => setIsEmployeeDrawerOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white h-9 rounded-sm flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouveau Profil
            </Button>
          )}
          {activeTab === 'leave' && (
            <Button 
              onClick={() => setIsLeaveDrawerOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white h-9 rounded-sm flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouvelle Demande
            </Button>
          )}
        </div>
        <div className="flex bg-slate-100 p-1 rounded-sm">
  {(['overview', 'employees', 'attendance', 'leave', 'settings'] as const).map((tab) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={cn(
        "px-4 py-1.5 text-[10px] font-black rounded-sm transition-all uppercase tracking-[0.05em]",
        activeTab === tab
          ? "bg-white text-orange-600 shadow-sm border border-slate-200/50"
          : "text-slate-400 hover:text-slate-600"
      )}
    >
      {tab === 'overview'
        ? 'Synthèse'
        : tab === 'employees'
        ? 'Employés'
        : tab === 'attendance'
        ? 'Pointage'
        : tab === 'leave'
        ? 'Congés'
        : 'Réglages'}
    </button>
  ))}
</div>
      </div>

      {isFetching ? (
        <div className="flex flex-col items-center justify-center h-64"><Loader2 className="h-8 w-8 text-orange-500 animate-spin" /></div>
      ) : (
        <div className="space-y-6">
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label="Effectif Total" value={summary?.totalEmployees ?? 0} icon={Users} color="orange" />
                <StatCard label="Présents (Jour)" value={summary?.presentToday ?? 0} icon={LogIn} color="emerald" />
                <StatCard label="En Congés" value={summary?.employeesOnLeave?.length ?? 0} icon={Calendar} color="orange" />
                <StatCard label="Demandes en attente" value={summary?.pendingLeaveRequestsCount ?? 0} icon={AlertCircle} color="purple" />
              </div>

              {/* Liste de qui est présent aujourd'hui + par qui (marqué par) */}
              <Card className="rounded-sm border-slate-200">
                <div className="p-4 border-b border-slate-100 font-bold text-xs uppercase text-slate-500 tracking-widest flex items-center justify-between">
                  Présents aujourd'hui ({summary?.presentToday ?? 0})
                  <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <CardContent className="p-0">
                  {summary?.presentEmployees?.length > 0 ? (
                    <div className="divide-y divide-slate-50">
                      {summary.presentEmployees.map((p: any, i: number) => (
                        <div key={p.id || i} className="px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-sm bg-emerald-50 text-emerald-600")}>
                              <LogIn className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-900">{p.name || 'Employé'}</span>
                              <span className="text-[10px] text-slate-400">
                                Depuis {p.markedAt ? new Date(p.markedAt).toLocaleTimeString() : '—'}
                                {p.markedBy ? ` · pointé par ${p.markedBy}` : ''}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-sm uppercase text-emerald-700 bg-emerald-50">
                            Présent
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic text-center py-4">
                      Liste détaillée indisponible — {summary?.presentToday ?? 0} présence(s) comptabilisée(s). Activez le champ <code>presentEmployees</code> côté backend.
                    </p>
                  )}
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="rounded-sm border-slate-200">
                  <div className="p-4 border-b border-slate-100 font-bold text-xs uppercase text-slate-500 tracking-widest">Activité Récente</div>
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-50">
                      {recentAttendance.map((log, i) => (
                        <div key={i} className="px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-sm", log.type === 'CHECK_IN' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
                              {log.type === 'CHECK_IN' ? <LogIn className="h-3.5 w-3.5" /> : <LogOut className="h-3.5 w-3.5" />}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-900">{log.employeeName || 'Employé inconnu'}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(log.time).toLocaleTimeString()}
                                {log.markedBy ? ` · par ${log.markedBy}` : ''}
                              </span>
                            </div>
                          </div>
                          <span className={cn("text-[10px] font-black px-1.5 py-0.5 rounded-sm uppercase", log.type === 'CHECK_IN' ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50")}>
                            {log.type === 'CHECK_IN' ? 'Entrée' : 'Sortie'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-sm border-slate-200">
                  <div className="p-4 border-b border-slate-100 font-bold text-xs uppercase text-slate-500 tracking-widest flex items-center justify-between">
                    Congés en cours
                    <Palmtree className="h-3.5 w-3.5 text-orange-400" />
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {summary?.employeesOnLeave?.length > 0 ? summary.employeesOnLeave.map((l: any) => (
                        <div key={l.id} className="flex items-center justify-between text-xs">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{l.name}</span>
                            <span className="text-[10px] text-slate-400">{l.type}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-500">Jusqu'au</p>
                            <p className="font-bold text-orange-600">{new Date(l.until).toLocaleDateString()}</p>
                          </div>
                        </div>
                      )) : (
                        <p className="text-xs text-slate-400 italic text-center py-4">Aucun employé en congé aujourd'hui.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* TAB: EMPLOYEES */}
          {activeTab === 'employees' && (
            <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="px-6 py-3">Employé</th>
                    <th className="px-6 py-3">Poste</th>
                    <th className="px-6 py-3">Contrat & Embauche</th>
                    <th className="px-6 py-3">Salaire Base</th>
                    <th className="px-6 py-3">Statut</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredEmployees.map((emp) => (
                    <React.Fragment key={emp.id}>
                      <tr 
                        className={cn(
                          "hover:bg-slate-50/50 cursor-pointer transition-all duration-300",
                          expandedEmployeeId === emp.id && "bg-orange-50/60 shadow-sm"
                        )}
                        onClick={() => setExpandedEmployeeId(expandedEmployeeId === emp.id ? null : emp.id)}
                      >
                        <td className="px-6 py-4 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                          {emp.firstName?.[0]}{emp.lastName?.[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{emp.firstName} {emp.lastName}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-tighter">{emp.employeeNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">{emp.position || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-900">{emp.contractType}</span>
                          <span className="text-[10px] text-slate-400">Depuis le {new Date(emp.hireDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-900">{(emp.baseSalary || 0).toLocaleString()} F</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-0.5 border rounded-sm text-[10px] font-bold uppercase",
                          emp.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"
                        )}>{emp.status === 'ACTIVE' ? 'Actif' : emp.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/hr/members/${emp.id}`);
                            }}
                            className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all duration-200"
                            title="Voir profil complet"
                          >
                            <Users className="h-4 w-4" />
                          </button>
                          <div className={cn(
                            "p-1.5 rounded-full transition-all duration-500",
                            expandedEmployeeId === emp.id ? "bg-orange-100 shadow-inner" : "bg-slate-50 border border-slate-100"
                          )}>
                            <ChevronDown className={cn(
                              "h-4 w-4 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)", 
                              expandedEmployeeId === emp.id ? "text-orange-600 rotate-180" : "text-slate-400"
                            )} />
                          </div>
                        </div>
                      </td>
                    </tr>
                    {expandedEmployeeId === emp.id && (
                      <tr className="bg-orange-50/20 border-t border-orange-100/40">
                        <td colSpan={6} className="p-0">
                          <div className="px-14 py-8 overflow-hidden animate-in fade-in slide-in-from-top-2 zoom-in-[0.98] duration-500 ease-out">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-3">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Coordonnées</p>
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                  <span className="text-slate-400">Tel:</span> {emp.phone || 'Non renseigné'}
                                </p>
                                <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                  <span className="text-slate-400">Email:</span> {emp.email}
                                </p>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Finances & Contrat</p>
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-700">
                                  <span className="text-slate-400">Salaire :</span> {emp.baseSalary?.toLocaleString()} FCFA
                                </p>
                                <p className="text-xs font-bold text-slate-700">
                                  <span className="text-slate-400">Type :</span> {emp.contractType}
                                </p>
                                <p className="text-xs font-bold text-slate-700">
                                  <span className="text-slate-400">Date d'entrée :</span> {new Date(emp.hireDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Actions Rapides</p>
                              <div className="flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase border-slate-200 hover:bg-white hover:text-orange-600 transition-colors">
                                  <CalendarCheck className="h-3 w-3 mr-2" /> Planning
                                </Button>
                                <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase border-slate-200 hover:bg-white hover:text-orange-600 transition-colors">
                                  <DollarSign className="h-3 w-3 mr-2" /> Fiche de Paie
                                </Button>
                              </div>
                            </div>
                          </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: ATTENDANCE (POINTAGE) */}
          {activeTab === 'attendance' && (
            <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-500">Pointage des présences - {new Date().toLocaleDateString()}</span>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-sm border border-emerald-100">
                    <LogIn className="h-3 w-3" /> Arrivée
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-700 text-[10px] font-bold rounded-sm border border-red-100">
                    <LogOut className="h-3 w-3" /> Départ
                  </div>
                </div>
              </div>
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-slate-50">
                  {filteredEmployees.filter(e => e.status === 'ACTIVE').map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{emp.firstName} {emp.lastName}</span>
                          <span className="text-[10px] text-slate-400">{emp.position}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-3">
                            <Button 
                              size="sm" variant="outline" 
                              className="h-8 border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-bold text-[10px] uppercase"
                              onClick={() => handleAttendanceAction(emp.id, 'IN')}
                              disabled={isProcessing}
                            >Pointage Entrée</Button>
                            <Button 
                              size="sm" variant="outline" 
                              className="h-8 border-red-200 text-red-600 hover:bg-red-50 font-bold text-[10px] uppercase"
                              onClick={() => handleAttendanceAction(emp.id, 'OUT')}
                              disabled={isProcessing}
                            >Pointage Sortie</Button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: LEAVE (CONGÉS) */}
          {activeTab === 'leave' && (
            <div className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-orange-600 text-white rounded-sm">
                    <p className="text-[10px] font-bold uppercase opacity-80">Demandes en attente</p>
                    <p className="text-2xl font-black">{summary?.pendingLeaveRequestsCount ?? 0}</p>
                  </div>
               </div>

               <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                      <tr>
                        <th className="px-6 py-3">Employé</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Période</th>
                        <th className="px-6 py-3">Statut</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {leaveRequests.map((req) => (
                        <tr key={req.id}>
                          <td className="px-6 py-4 font-bold text-slate-900">{req.employee?.firstName} {req.employee?.lastName}</td>
                          <td className="px-6 py-4 text-xs font-medium text-slate-600">{req.type}</td>
                          <td className="px-6 py-4 text-xs text-slate-500">
                            Du {new Date(req.startDate).toLocaleDateString()} au {new Date(req.endDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase border",
                              req.status === 'PENDING' ? "bg-amber-50 border-amber-200 text-amber-700" :
                              req.status === 'APPROVED' ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-100 text-slate-600"
                            )}>{req.status}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             {req.status === 'PENDING' && (
                               <div className="flex justify-end gap-2">
                                  <button onClick={() => handleLeaveDecision(req.id, 'approve')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-sm"><CheckCircle2 className="h-4 w-4" /></button>
                                  <button onClick={() => handleLeaveDecision(req.id, 'reject')} className="p-1.5 text-red-600 hover:bg-red-50 rounded-sm"><X className="h-4 w-4" /></button>
                               </div>
                             )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
          )}

          {/* TAB: SETTINGS (CONFIGURATION RH) */}
          {activeTab === 'settings' && hrConfig && (
            <Card className="max-w-2xl border-slate-200 rounded-sm">
              <div className="p-4 border-b border-slate-100 font-bold text-xs uppercase text-slate-500 tracking-widest flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-orange-500" /> Paramètres Globaux RH
              </div>
              <form onSubmit={handleUpdateConfig} className="p-6 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <Label className="text-[10px] font-bold text-slate-400 uppercase">Seuil Heures Sup (Semaine)</Label>
                       <Input type="number" value={hrConfig.overtimeThresholdPerWeek} onChange={e => setHrConfig({...hrConfig, overtimeThresholdPerWeek: parseInt(e.target.value)})} className="h-10 rounded-sm" />
                    </div>
                    <div className="space-y-1.5">
                       <Label className="text-[10px] font-bold text-slate-400 uppercase">Taux Sécurité Sociale (%)</Label>
                       <Input type="number" step="0.01" value={hrConfig.socialSecurityRate * 100} onChange={e => setHrConfig({...hrConfig, socialSecurityRate: parseFloat(e.target.value) / 100})} className="h-10 rounded-sm" />
                    </div>
                 </div>
                 <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <Button type="submit" disabled={isProcessing} className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-8 h-10 rounded-sm">
                       Sauvegarder la configuration
                    </Button>
                 </div>
              </form>
            </Card>
          )}

          {/* TAB: ANALYTICS (RAPPORTS) */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-sm border-slate-200">
                  <div className="p-4 border-b border-slate-100 font-bold text-xs uppercase text-slate-500 tracking-widest flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-500" /> Coût de la main d'œuvre
                  </div>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Ratio Masse Salariale / CA</span>
                          <span className="text-3xl font-black text-slate-900">{analytics?.cost?.laborCostPercentage?.toFixed(1)}%</span>
                       </div>
                       <div className={cn("px-2 py-1 rounded-sm text-[10px] font-bold uppercase", (analytics?.cost?.laborCostPercentage > 30) ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600")}>
                         {analytics?.cost?.laborCostPercentage > 30 ? 'Critique' : 'Optimal'}
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                       <div className="p-3 bg-slate-50 rounded-sm">
                          <p className="text-slate-400 uppercase text-[9px] mb-1">Masse Salariale</p>
                          <p className="text-slate-900">{(analytics?.cost?.totalSalary ?? 0).toLocaleString()} F</p>
                       </div>
                       <div className="p-3 bg-slate-50 rounded-sm">
                          <p className="text-slate-400 uppercase text-[9px] mb-1">Chiffre d'Affaires</p>
                          <p className="text-slate-900">{(analytics?.cost?.totalSales ?? 0).toLocaleString()} F</p>
                       </div>
                    </div>
                  </CardContent>
                </Card>
            </div>
          )}
        </div>
      )}

      {/* Side Drawer - Nouvelle Demande de Congé */}
      <div className={cn(
        "fixed inset-0 z-50 flex justify-end transition-all duration-300",
        isLeaveDrawerOpen ? "visible" : "invisible pointer-events-none"
      )}>
        <div className={cn("fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-500", isLeaveDrawerOpen ? "opacity-100" : "opacity-0")} onClick={() => setIsLeaveDrawerOpen(false)} />
        <div className={cn("relative bg-white w-full max-w-xl h-full border-l border-slate-200 flex flex-col overflow-hidden transition-all duration-500 ease-out shadow-2xl", isLeaveDrawerOpen ? "translate-x-0" : "translate-x-full")}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <h2 className="text-lg font-bold text-slate-900">Nouvelle Demande de Congé</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsLeaveDrawerOpen(false)}><X className="h-5 w-5" /></Button>
          </div>
          <form onSubmit={handleCreateLeave} className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Employé concerné</Label>
              <select 
                required
                className="w-full h-10 px-3 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-orange-500 bg-white"
                value={leaveFormData.employeeId}
                onChange={e => setLeaveFormData({...leaveFormData, employeeId: e.target.value})}
              >
                <option value="">Sélectionner un employé...</option>
                {employees.filter(emp => emp.status === 'ACTIVE').map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} - {emp.position}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Type de congé</Label>
              <select 
                required
                className="w-full h-10 px-3 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-orange-500 bg-white"
                value={leaveFormData.type}
                onChange={e => setLeaveFormData({...leaveFormData, type: e.target.value})}
              >
                <option value="PAID_VACATION">Congé Payé</option>
                <option value="UNPAID_LEAVE">Congé Sans Solde</option>
                <option value="SICK_LEAVE">Maladie / Accident</option>
                <option value="MATERNITY_LEAVE">Maternité / Paternité</option>
                <option value="SPECIAL_AUTHORIZATION">Autre motif (Autorisation spéciale)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Date de début</Label>
                <Input type="date" required className="h-10 rounded-sm border-slate-200" value={leaveFormData.startDate} onChange={e => setLeaveFormData({...leaveFormData, startDate: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Date de fin</Label>
                <Input type="date" required className="h-10 rounded-sm border-slate-200" value={leaveFormData.endDate} onChange={e => setLeaveFormData({...leaveFormData, endDate: e.target.value})} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Motif / Notes</Label>
              <textarea 
                className="w-full p-3 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-orange-500 h-24 resize-none font-sans"
                value={leaveFormData.reason}
                onChange={e => setLeaveFormData({...leaveFormData, reason: e.target.value})}
                placeholder="Expliquez brièvement la raison du congé..."
              />
            </div>

            <div className="p-4 bg-orange-50 border border-orange-100 rounded-sm flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-orange-800 leading-relaxed font-medium">
                Cette demande sera envoyée pour approbation. Le solde de congés de l'employé sera débité automatiquement une fois la demande acceptée par un administrateur.
              </p>
            </div>
          </form>
          <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
            <Button variant="outline" className="flex-1 rounded-sm font-bold" onClick={() => setIsLeaveDrawerOpen(false)}>Annuler</Button>
            <Button 
              disabled={isProcessing || !leaveFormData.employeeId}
              className="flex-[2] bg-orange-600 hover:bg-orange-700 text-white rounded-sm font-bold flex items-center justify-center gap-2" 
              onClick={handleCreateLeave}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Enregistrer la demande
            </Button>
          </div>
        </div>
      </div>

      {/* Side Drawer - Nouvel Employé */}
      <div className={cn(
        "fixed inset-0 z-50 flex justify-end transition-all duration-300",
        isEmployeeDrawerOpen ? "visible" : "invisible pointer-events-none"
      )}>
        <div className={cn("fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-500", isEmployeeDrawerOpen ? "opacity-100" : "opacity-0")} onClick={() => setIsEmployeeDrawerOpen(false)} />
        <div className={cn("relative bg-white w-full max-w-xl h-full border-l border-slate-200 flex flex-col overflow-hidden transition-all duration-500 ease-out shadow-2xl", isEmployeeDrawerOpen ? "translate-x-0" : "translate-x-full")}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <h2 className="text-lg font-bold text-slate-900">Enregistrer un employé</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsEmployeeDrawerOpen(false)}><X className="h-5 w-5" /></Button>
          </div>
          <form onSubmit={handleCreateEmployee} className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Prénom</Label>
                <Input required className="h-10 rounded-sm border-slate-200" value={employeeFormData.firstName} onChange={e => setEmployeeFormData({...employeeFormData, firstName: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Nom</Label>
                <Input required className="h-10 rounded-sm border-slate-200" value={employeeFormData.lastName} onChange={e => setEmployeeFormData({...employeeFormData, lastName: e.target.value})} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Email professionnel</Label>
              <Input type="email" required className="h-10 rounded-sm border-slate-200" value={employeeFormData.email} onChange={e => setEmployeeFormData({...employeeFormData, email: e.target.value})} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Téléphone</Label>
              <Input type="tel" className="h-10 rounded-sm border-slate-200" value={employeeFormData.phone} onChange={e => setEmployeeFormData({...employeeFormData, phone: e.target.value})} placeholder="+237 ..." />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Poste / Fonction</Label>
              <Input 
                required 
                placeholder="Serveur, Cuisinier..." 
                className="h-10 rounded-sm border-slate-200" 
                value={employeeFormData.position} 
                onChange={e => setEmployeeFormData({...employeeFormData, position: e.target.value})} 
                list="positions-list"
              />
              <datalist id="positions-list">
                {Array.from(new Set(employees.map(e => e.position).filter(Boolean))).map(pos => (
                  <option key={pos} value={pos} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Salaire de Base (FCFA)</Label>
                <Input type="number" required className="h-10 rounded-sm border-slate-200" value={employeeFormData.baseSalary} onChange={e => setEmployeeFormData({...employeeFormData, baseSalary: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Type de Contrat</Label>
                <select 
                  className="w-full h-10 px-3 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-orange-500 bg-white"
                  value={employeeFormData.contractType}
                  onChange={e => setEmployeeFormData({...employeeFormData, contractType: e.target.value})}
                >
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="STAGE">Stage</option>
                  <option value="FREELANCE">Freelance</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Date d'embauche</Label>
              <Input type="date" required className="h-10 rounded-sm border-slate-200" value={employeeFormData.hireDate} onChange={e => setEmployeeFormData({...employeeFormData, hireDate: e.target.value})} />
            </div>

            <div className="p-4 bg-orange-50 border border-orange-100 rounded-sm flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-orange-800 leading-relaxed font-medium">
                L'employé doit avoir un compte utilisateur existant. Son accès au back-office dépendra du rôle qui lui a été attribué (Waitstaff, Kitchen, etc.).
              </p>
            </div>
          </form>
          <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
            <Button variant="outline" className="flex-1 rounded-sm font-bold" onClick={() => setIsEmployeeDrawerOpen(false)}>Annuler</Button>
            <Button 
              disabled={isProcessing || !employeeFormData.email || !employeeFormData.firstName}
              className="flex-[2] bg-orange-600 hover:bg-orange-700 text-white rounded-sm font-bold flex items-center justify-center gap-2" 
              onClick={handleCreateEmployee}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Confirmer l'embauche
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({ label, value, icon: Icon, color }: any) {
  const colorClasses: any = {
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  }
  return (
    <div className="bg-white p-4 border border-slate-200 rounded-sm">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <div className={cn("p-2 rounded-sm border", colorClasses[color])}><Icon className="h-4 w-4" /></div>
      </div>
      <p className="text-xl font-black text-slate-900 tracking-tight">{value}</p>
    </div>
  )
}