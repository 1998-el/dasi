import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../components/DashboardLayout'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { Input } from '../components/ui/input'
import { 
  UserPlus, 
  Shield, 
  Mail, 
  Phone, 
  Briefcase, 
  Search, 
  Loader2, 
  X, 
  Save, 
  Key, 
  ChevronRight,
  BadgeCheck,
  UserCog,
} from 'lucide-react'
import { authService } from './auth.service'
import { useAuth } from '../context/AuthContext'
import { useToast, Toast } from '../components/ui/Toast'
import { cn } from '../lib/utils'

export function MembersPage() {
  const { businessConfig } = useAuth()
  const { toast, showSuccess, showError } = useToast()
  const navigate = useNavigate()

  const ROLES = useMemo(() => {
    const base = [
      { value: 'ADMIN', label: 'Administrateur', color: 'text-red-600 bg-red-50 border-red-100' },
      { value: 'MANAGER', label: 'Gestionnaire', color: 'text-purple-600 bg-purple-50 border-purple-100' },
      { value: 'STOCK_MANAGER', label: 'Responsable Stock', color: 'text-amber-600 bg-amber-50 border-amber-100' },
    ];

    if (businessConfig.type === 'PHARMACY') {
      return [
        ...base,
        { value: 'PHARMACIST', label: 'Pharmacien', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
        { value: 'ASSISTANT', label: 'Préparateur', color: 'text-blue-600 bg-blue-50 border-blue-100' },
      ];
    }
    if (businessConfig.type === 'RETAIL') {
      return [
        ...base,
        { value: 'SALES', label: 'Vendeur / Conseil', color: 'text-blue-600 bg-blue-50 border-blue-100' },
        { value: 'CASHIER', label: 'Caissier', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
      ];
    }
    return [
      ...base,
      { value: 'WAITER', label: 'Serveur / Salle', color: 'text-blue-600 bg-blue-50 border-blue-100' },
      { value: 'COOK', label: 'Cuisine', color: 'text-orange-600 bg-orange-50 border-orange-100' },
    ];
  }, [businessConfig.type]);
  
  const [members, setMembers] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'manual' | 'select'>('manual')
  const [searchTerm, setSearchTerm] = useState('')
  const [employeeSearch, setEmployeeSearch] = useState('')

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'WAITER',
    position: '',
    employeeNumber: '',
    baseSalary: 0
  })

  const generateMatricule = () => {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const random = Math.floor(1000 + Math.random() * 9000)
    return `EMP-${date}-${random}`
  }

  const loadMembers = useCallback(async () => {
    setIsFetching(true)
    try {
      const [membersData, employeesData] = await Promise.all([
        authService.getMembers(),
        authService.getEmployees({ status: 'ACTIVE' })
      ])
      setMembers(membersData || [])
      // On ne garde que les employés qui n'ont pas encore de compte membre (email non présent dans members)
      const memberEmails = new Set(membersData?.map((m: any) => m.email.toLowerCase()) || [])
      setEmployees(employeesData?.filter((e: any) => !memberEmails.has(e.email?.toLowerCase())) || [])
    } catch (e: any) {
      showError("Erreur de chargement de l'équipe")
    } finally {
      setIsFetching(false)
    }
  }, [showError])

  useEffect(() => { loadMembers() }, [loadMembers])

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    try {
      await authService.createMember(formData)
      showSuccess(`Accès créé pour ${formData.firstName}`)
      setIsDrawerOpen(false)
      setFormData({ firstName: '', lastName: '', email: '', password: '', phone: '', role: 'WAITER', position: '', employeeNumber: '', baseSalary: 0 })
      loadMembers()
    } catch (e: any) {
      showError(e.message || "Échec de la création")
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredMembers = members.filter(m => 
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredEmployees = employees.filter(e => 
    `${e.firstName} ${e.lastName}`.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    (e.employeeNumber || '').toLowerCase().includes(employeeSearch.toLowerCase())
  )

  const handleSelectEmployee = (emp: any) => {
    setFormData({
      ...formData,
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      email: emp.email || '',
      phone: emp.phone || '',
      position: emp.position || '',
      employeeNumber: emp.employeeNumber || generateMatricule(),
      baseSalary: emp.baseSalary || 0
    })
    setDrawerMode('manual')
  }

  return (
    <DashboardLayout>
      <div className="fixed top-4 right-4 z-[100]">{toast && <Toast toast={toast} />}</div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Équipe & Accès</h1>
          <p className="text-sm text-slate-500 font-medium italic">Gérez les comptes utilisateurs et les permissions du staff.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Rechercher un membre..." 
              className="pl-9 w-64 h-10 rounded-sm border-slate-200 bg-white text-xs font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        <Button
          onClick={() => {
            setFormData(prev => ({ ...prev, employeeNumber: generateMatricule() }))
            setDrawerMode('manual')
            setIsDrawerOpen(true)
          }}
            className="bg-gray-500  hover:bg-orange-600  text-white h-10 rounded-sm flex items-center gap-2 transition-all font-bold uppercase text-[10px] tracking-widest px-6"
          >
            <UserPlus className="h-4 w-4" />
            Ajouter un membre
          </Button>
        </div>
      </div>

      {isFetching ? (
        <div className="flex flex-col items-center justify-center h-64"><Loader2 className="h-8 w-8 text-orange-500 animate-spin" /></div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-sm overflow-hidden  animate-in fade-in duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 font-bold text-slate-500 border-r border-slate-200 w-12 text-center uppercase text-[10px] tracking-widest">#</th>
                  <th className="px-4 py-3 font-bold text-slate-500 border-r border-slate-200 uppercase text-[10px] tracking-widest">Membre</th>
                  <th className="px-4 py-3 font-bold text-slate-500 border-r border-slate-200 uppercase text-[10px] tracking-widest">Email</th>
                  <th className="px-4 py-3 font-bold text-slate-500 border-r border-slate-200 uppercase text-[10px] tracking-widest">Rôle</th>
                  <th className="px-4 py-3 font-bold text-slate-500 border-r border-slate-200 uppercase text-[10px] tracking-widest">Poste</th>
                  <th className="px-4 py-3 font-bold text-slate-500 text-center uppercase text-[10px] tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((member, index) => {
                  const roleConfig = ROLES.find(r => r.value === member.role) || ROLES[2]
                  return (
                    <tr key={member.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-4 py-3 border-r border-slate-100 text-center text-slate-300 font-mono text-[10px]">{index + 1}</td>
                      <td className="px-4 py-3 border-r border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-sm bg-slate-100 text-slate-600 flex items-center justify-center font-black text-[10px] border border-slate-200 shrink-0">
                            {member.firstName?.[0] || ''}{member.lastName?.[0] || ''}
                          </div>
                          <span className="font-bold text-slate-900 flex items-center gap-1.5 whitespace-nowrap">
                            {member.firstName} {member.lastName}
                            {member.role === 'ADMIN' && <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-r border-slate-100 text-slate-600 font-medium">{member.email}</td>
                      <td className="px-4 py-3 border-r border-slate-100">
                        <span className={cn("px-2 py-0.5 rounded-sm text-[10px] font-black uppercase border tracking-tighter whitespace-nowrap", roleConfig.color)}>
                          {roleConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-r border-slate-100 text-slate-500 font-medium">{member.employeeProfile?.position || member.position || 'N/A'}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => navigate(`/hr/members/${member.id}`)}
                          className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-sm transition-all inline-flex items-center gap-1 font-bold text-[10px] uppercase"
                        >
                          Profil <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredMembers.length === 0 && (
              <div className="p-12 text-center text-slate-400 italic">Aucun membre de l'équipe à afficher.</div>
            )}
          </div>
        </div>
      )}

      {/* Side Drawer - Création Membre & User */}
      <div className={cn("fixed inset-0 z-50 flex justify-end transition-all duration-300", isDrawerOpen ? "visible" : "invisible pointer-events-none")}>
        <div className={cn("fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-500", isDrawerOpen ? "opacity-100" : "opacity-0")} onClick={() => setIsDrawerOpen(false)} />
        <div className={cn("relative bg-white w-full max-w-xl h-full border-l border-slate-200 flex flex-col overflow-hidden transition-all duration-500 ease-out shadow-2xl", isDrawerOpen ? "translate-x-0" : "translate-x-full")}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
              <UserCog className="h-5 w-5 text-orange-600" /> Nouvel Accès Staff
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setIsDrawerOpen(false)}><X className="h-5 w-5" /></Button>
          </div>

          <div className="flex bg-slate-50 border-b border-slate-100 p-1">
            <button 
              onClick={() => setDrawerMode('manual')}
              className={cn("flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all", drawerMode === 'manual' ? "bg-white text-orange-600 shadow-sm" : "text-slate-400")}
            >
              Saisie Manuelle
            </button>
            <button 
              onClick={() => setDrawerMode('select')}
              className={cn("flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all", drawerMode === 'select' ? "bg-white text-orange-600 shadow-sm" : "text-slate-400")}
            >
              Depuis Employé RH
            </button>
          </div>

          {drawerMode === 'select' ? (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/30">
              <div className="p-4 border-b border-slate-100 bg-white">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Rechercher dans les dossiers RH..." 
                    className="pl-10 h-10 rounded-sm border-slate-200 bg-slate-50"
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredEmployees.length > 0 ? filteredEmployees.map(emp => (
                  <button
                    key={emp.id}
                    onClick={() => handleSelectEmployee(emp)}
                    className="w-full p-4 bg-white border border-slate-100 rounded-sm flex items-center justify-between hover:border-orange-200 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-sm bg-slate-100 flex items-center justify-center font-black text-xs text-slate-500 border border-slate-200 uppercase">
                        {emp.firstName?.[0]}{emp.lastName?.[0]}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-slate-900 group-hover:text-orange-600">{emp.firstName} {emp.lastName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{emp.position || 'Pas de poste'}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                  </button>
                )) : (
                  <div className="text-center py-12 px-6">
                    <Users className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-xs text-slate-500 italic">Aucun employé disponible pour la création de compte.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleCreateMember} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Prénom</Label>
                    <Input required className="h-11 rounded-sm border-slate-200 font-bold" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nom</Label>
                    <Input required className="h-11 rounded-sm border-slate-200 font-bold" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email (Identifiant de connexion)</Label>
                  <Input type="email" required className="h-11 rounded-sm border-slate-200 font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="staff@monresto.com" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mot de passe temporaire</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input type="password" required className="pl-10 h-11 rounded-sm border-slate-200" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rôle Système</Label>
                    <select className="w-full h-11 px-3 border border-slate-200 rounded-sm text-sm font-bold bg-white" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                      {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Poste de travail</Label>
                    <Input required className="h-11 rounded-sm border-slate-200 font-bold" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} placeholder="Chef de rang, Barman..." />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Matricule Interne</Label>
                    <Input 
                      required 
                      readOnly
                      className="h-11 rounded-sm border-slate-200 font-mono text-xs uppercase bg-slate-50 cursor-not-allowed" 
                      value={formData.employeeNumber} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Salaire Base (XAF)</Label>
                    <Input type="number" required className="h-11 rounded-sm border-slate-200 font-black" value={formData.baseSalary || 0} onChange={e => setFormData({...formData, baseSalary: parseInt(e.target.value) || 0})} />
                  </div>
                </div>
              </form>

              <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
                <Button variant="outline" className="flex-1 rounded-sm font-black uppercase text-[10px] tracking-widest" onClick={() => setIsDrawerOpen(false)}>Annuler</Button>
                <Button 
                  disabled={isProcessing || !formData.email}
                  className="flex-[2] bg-slate-900 hover:bg-orange-600 text-white rounded-sm font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg" 
                  onClick={handleCreateMember}
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Générer l'accès & profil
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}