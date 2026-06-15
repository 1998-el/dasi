import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { 
  Wallet, 
  PieChart, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText,
  TrendingUp,
  Loader2,
  X,
  Save,
  Filter,
  MoreHorizontal
} from 'lucide-react'
import { authService } from './auth.service'
import { useToast, Toast } from '../components/ui/Toast'
import { cn } from '../lib/utils'

type FinanceTab = 'expenses' | 'budgets' | 'analytics';

export function ExpensesPage() {
  const { toast, showSuccess, showError } = useToast()
  const [activeTab, setActiveTab] = useState<FinanceTab>('expenses')
  const [isFetching, setIsFetching] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [expenses, setExpenses] = useState<any[]>([])
  const [budgets, setBudgets] = useState<any[]>([])
  const [isExpenseDrawerOpen, setIsExpenseDrawerOpen] = useState(false)
  const [isBudgetDrawerOpen, setIsBudgetDrawerOpen] = useState(false)

  const [budgetFormData, setBudgetFormData] = useState({
    name: '',
    allocatedAmount: 0,
    category: 'STOCK_RESTOCK',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    description: ''
  })

  const [expenseFormData, setExpenseFormData] = useState({
    category: 'FOOD_SUPPLIES',
    amount: 0,
    description: '',
    budgetId: '',
    items: [{ name: '', price: 0 }]
  })

  const [budgetCheck, setBudgetCheck] = useState<any>(null)

  const loadData = useCallback(async () => {
    setIsFetching(true)
    try {
      const [expData, budData] = await Promise.all([
        authService.getExpenses(),
        authService.getBudgets()
      ])
      
      console.log('[ExpensesPage] Données des dépenses reçues:', expData);
      console.log('[ExpensesPage] Données des budgets reçus:', budData);

      setExpenses(expData ?? [])
      setBudgets(budData ?? [])
    } catch (e: any) {
      showError("Erreur de chargement des données financières")
    } finally {
      setIsFetching(false)
    }
  }, [showError])

  useEffect(() => { loadData() }, [loadData])

  // Intelligence : Vérifier le budget en temps réel pendant la saisie
  useEffect(() => {
    if (expenseFormData.budgetId && expenseFormData.amount > 0) {
      const timer = setTimeout(async () => {
        const check = await authService.checkBudgetLimit(expenseFormData.budgetId, expenseFormData.amount)
        setBudgetCheck(check)
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setBudgetCheck(null)
    }
  }, [expenseFormData.budgetId, expenseFormData.amount])

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    try {
      await authService.createExpense(expenseFormData)
      showSuccess("Dépense enregistrée en attente d'approbation")
      setIsExpenseDrawerOpen(false)
      loadData()
    } catch (e: any) {
      showError(e.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    try {
      await authService.createBudget({
        ...budgetFormData,
        budgetNumber: `BUD-${Date.now().toString().slice(-6)}` // Génération d'une réf temporaire si le backend ne le fait pas
      })
      showSuccess("Nouveau budget initialisé")
      setIsBudgetDrawerOpen(false)
      setBudgetFormData({ name: '', allocatedAmount: 0, category: 'STOCK_RESTOCK', startDate: new Date().toISOString().split('T')[0], endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0], description: '' })
      loadData()
    } catch (e: any) {
      showError(e.message || "Erreur de création du budget")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="fixed top-4 right-4 z-[100]">
        {toast && <Toast toast={toast} />}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">
            Gestion Financière
          </h1>
          <p className="text-sm text-slate-500 font-medium italic">Intelligence budgétaire & contrôle des coûts.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsExpenseDrawerOpen(true)}
            className="bg-gray-500 hover:bg-orange-600 text-white h-10 rounded-sm flex items-center gap-2 transition-all duration-300 shadow-lg shadow-slate-200"
          >
            <Plus className="h-4 w-4" />
            Nouvelle Dépense
          </Button>
          <div className="flex bg-slate-100 p-1 rounded-sm border border-slate-200">
            {(['expenses', 'budgets', 'analytics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-1.5 text-[10px] font-black rounded-sm transition-all uppercase tracking-widest",
                  activeTab === tab ? "bg-white text-orange-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {tab === 'expenses' ? 'Flux Dépenses' : tab === 'budgets' ? 'Budgets' : 'Analyses'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isFetching ? (
        <div className="flex flex-col items-center justify-center h-64"><Loader2 className="h-8 w-8 text-orange-500 animate-spin" /></div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* TAB: BUDGETS (Visual high-level) */}
          {activeTab === 'budgets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(budgets || []).map((budget) => {
                const percent = (budget.spentAmount / budget.allocatedAmount) * 100
                const isWarning = percent > 85
                const isDanger = percent >= 100

                return (
                  <Card key={budget.id} className="rounded-sm border-slate-200  hover:border-slate-300 transition-colors shadow-none overflow-hidden group">
                    <div className={cn("h-1 w-full ", isDanger ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-emerald-500")} />
                    <CardHeader className="pb-2 px-6">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-sm font-black text-slate-700 uppercase tracking-tight">{budget.name}</CardTitle>
                        <span className="text-[10px] font-mono text-slate-400">#{budget.budgetNumber}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                      <div className="flex justify-between items-baseline">
                        <span className="text-2xl font-black text-slate-900">{budget.spentAmount.toLocaleString()} <span className="text-xs font-bold text-slate-400">F</span></span>
                        <span className="text-xs font-bold text-slate-500">sur {budget.allocatedAmount.toLocaleString()} F</span>
                      </div>
                      
                      <div className="space-y-1.5">
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full transition-all duration-1000", isDanger ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-emerald-500")} 
                            style={{ width: `${Math.min(100, percent)}%` }} 
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                          <span className={isDanger ? "text-red-600" : "text-slate-400"}>{percent.toFixed(1)}% Consommé</span>
                          <span className="text-slate-400">Reste: {budget.remainingAmount.toLocaleString()} F</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              <button 
                onClick={() => setIsBudgetDrawerOpen(true)}
                className="border-2 border-dashed border-slate-200 rounded-sm flex flex-col items-center justify-center p-6 text-slate-400 hover:text-orange-600 hover:border-orange-200 transition-all gap-2 group"
              >
                 <Plus className="h-6 w-6 group-hover:scale-110 transition-transform" />
                 <span className="text-xs font-bold uppercase tracking-widest">Nouveau Budget</span>
              </button>
            </div>
          )}

          {/* TAB: EXPENSES (List with Approval Flow) */}
          {activeTab === 'expenses' && (
            <Card className="rounded-sm border-slate-200 shadow-none overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-black text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Référence</th>
                      <th className="px-6 py-4">Catégorie</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4 text-right">Montant</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-center">Statut</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(expenses || []).map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900">{exp.expenseNumber}</td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-sm border border-slate-200 text-slate-600">
                            {exp.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-600 max-w-xs truncate">{exp.description}</td>
                        <td className="px-6 py-4 text-right font-black text-slate-900">{exp.amount.toLocaleString()} F</td>
                        <td className="px-6 py-4 text-xs text-slate-400">{new Date(exp.expenseDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={cn(
                            "px-2 py-0.5 rounded-sm text-[10px] font-black uppercase border",
                            exp.status === 'PENDING' ? "bg-amber-50 border-amber-200 text-amber-600" :
                            exp.status === 'APPROVED' ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-red-50 border-red-200 text-red-600"
                          )}>{exp.status === 'PENDING' ? 'En attente' : exp.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {exp.status === 'PENDING' && (
                            <Button 
                              size="sm" variant="outline" 
                              className="h-7 text-[10px] font-black uppercase border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                              onClick={async () => {
                                await authService.approveExpense(exp.id)
                                showSuccess("Dépense approuvée")
                                loadData()
                              }}
                            >Approuver</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Side Drawer - Nouvelle Dépense (Avec Intelligence Budgétaire) */}
      <div className={cn(
        "fixed inset-0 z-50 flex justify-end transition-all duration-300",
        isExpenseDrawerOpen ? "visible" : "invisible pointer-events-none"
      )}>
        <div className={cn("fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-500", isExpenseDrawerOpen ? "opacity-100" : "opacity-0")} onClick={() => setIsExpenseDrawerOpen(false)} />
        <div className={cn("relative bg-white w-full max-w-xl h-full border-l border-slate-200 flex flex-col overflow-hidden transition-all duration-500 ease-out shadow-2xl", isExpenseDrawerOpen ? "translate-x-0" : "translate-x-full")}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Enregistrer une dépense</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsExpenseDrawerOpen(false)}><X className="h-5 w-5" /></Button>
          </div>
          <form onSubmit={handleCreateExpense} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Budget de rattachement</Label>
              <select 
                required
                className="w-full h-11 px-3 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-orange-500 bg-slate-50/50 font-bold text-slate-700"
                value={expenseFormData.budgetId}
                onChange={e => setExpenseFormData({...expenseFormData, budgetId: e.target.value})}
              >
                <option value="">Sélectionner un budget actif...</option>
                {(budgets || []).map(b => (
                  <option key={b.id} value={b.id}>{b.name} (Dispo: {b.remainingAmount.toLocaleString()} F)</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Catégorie</Label>
                <select 
                  className="w-full h-11 px-3 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-orange-500 bg-white"
                  value={expenseFormData.category}
                  onChange={e => setExpenseFormData({...expenseFormData, category: e.target.value})}
                >
                  <option value="FOOD_SUPPLIES">Approvisionnement Food</option>
                  <option value="BEVERAGE_SUPPLIES">Approvisionnement Boissons</option>
                  <option value="RENT">Loyer / Charges</option>
                  <option value="WATER">Eau / Électricité / Net</option>
                  <option value="MAINTENANCE">Réparations / Maintenance</option>
                  <option value="MARKETING">Marketing / Pub</option>
                  <option value="OTHER">Divers</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Montant Total (FCFA)</Label>
                <Input 
                  type="number" required 
                  className={cn("h-11 font-black text-lg rounded-sm", budgetCheck?.allowed === false ? "border-red-300 bg-red-50 text-red-700" : "border-slate-200")} 
                  value={expenseFormData.amount || 0} 
                  onChange={e => setExpenseFormData({...expenseFormData, amount: parseInt(e.target.value) || 0})} 
                />
              </div>
            </div>

            {/* Alerte Intelligence Budgétaire */}
            {budgetCheck && (
              <div className={cn(
                "p-4 rounded-sm border flex items-start gap-3 animate-in slide-in-from-top-2 duration-300",
                budgetCheck.allowed ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-800"
              )}>
                {budgetCheck.allowed ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertTriangle className="h-5 w-5 shrink-0" />}
                <div className="text-[11px] font-bold leading-relaxed">
                  <p className="uppercase tracking-widest mb-1">{budgetCheck.message}</p>
                  <p className="opacity-70">Impact budget : {(budgetCheck.percentage).toFixed(1)}% consommé après validation.</p>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Justificatif / Description</Label>
              <textarea 
                className="w-full p-4 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-orange-500 h-24 resize-none font-medium text-slate-600 bg-slate-50/30"
                value={expenseFormData.description}
                onChange={e => setExpenseFormData({...expenseFormData, description: e.target.value})}
                placeholder="Précisez la nature de la dépense..."
              />
            </div>

          </form>
          <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
            <Button variant="outline" className="flex-1 rounded-sm font-black uppercase text-[10px] tracking-widest" onClick={() => setIsExpenseDrawerOpen(false)}>Annuler</Button>
            <Button 
              disabled={isProcessing || !expenseFormData.budgetId || expenseFormData.amount <= 0}
              className="flex-[2] bg-slate-900 hover:bg-orange-600 text-white rounded-sm font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all" 
              onClick={handleCreateExpense}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Soumettre pour approbation
            </Button>
          </div>
        </div>
      </div>

      {/* Side Drawer - Nouveau Budget */}
      <div className={cn(
        "fixed inset-0 z-50 flex justify-end transition-all duration-300",
        isBudgetDrawerOpen ? "visible" : "invisible pointer-events-none"
      )}>
        <div className={cn("fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-500", isBudgetDrawerOpen ? "opacity-100" : "opacity-0")} onClick={() => setIsBudgetDrawerOpen(false)} />
        <div className={cn("relative bg-white w-full max-w-xl h-full border-l border-slate-200 flex flex-col overflow-hidden transition-all duration-500 ease-out shadow-2xl", isBudgetDrawerOpen ? "translate-x-0" : "translate-x-full")}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter text-orange-600">Initialiser un budget</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsBudgetDrawerOpen(false)}><X className="h-5 w-5" /></Button>
          </div>
          <form onSubmit={handleCreateBudget} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nom du Budget</Label>
              <Input 
                required placeholder="Ex: Stock Boissons - Décembre 2026"
                className="h-11 font-bold rounded-sm border-slate-200"
                value={budgetFormData.name}
                onChange={e => setBudgetFormData({...budgetFormData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enveloppe Allouée (FCFA)</Label>
                <Input 
                  type="number" required 
                  className="h-11 font-black text-lg rounded-sm border-slate-200" 
                  value={budgetFormData.allocatedAmount || 0} 
                  onChange={e => setBudgetFormData({...budgetFormData, allocatedAmount: parseInt(e.target.value) || 0})} 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Type d'achat autorisé</Label>
                <select 
                  className="w-full h-11 px-3 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-orange-500 bg-white font-bold"
                  value={budgetFormData.category}
                  onChange={e => setBudgetFormData({...budgetFormData, category: e.target.value})}
                >
                  <option value="STOCK_RESTOCK">Réapprovisionnement Stock</option>
                  <option value="EQUIPMENT">Matériel & Équipement</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="SUPPLIES">Fournitures Diverses</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date de début</Label>
                <Input type="date" required className="h-11 rounded-sm border-slate-200" value={budgetFormData.startDate} onChange={e => setBudgetFormData({...budgetFormData, startDate: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date de fin</Label>
                <Input type="date" required className="h-11 rounded-sm border-slate-200" value={budgetFormData.endDate} onChange={e => setBudgetFormData({...budgetFormData, endDate: e.target.value})} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Notes additionnelles</Label>
              <textarea 
                className="w-full p-4 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-orange-500 h-24 resize-none font-medium text-slate-600 bg-slate-50/30"
                value={budgetFormData.description}
                onChange={e => setBudgetFormData({...budgetFormData, description: e.target.value})}
                placeholder="Précisez l'objectif de ce budget..."
              />
            </div>
          </form>
          <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
            <Button variant="outline" className="flex-1 rounded-sm font-black uppercase text-[10px] tracking-widest" onClick={() => setIsBudgetDrawerOpen(false)}>Annuler</Button>
            <Button 
              disabled={isProcessing || !budgetFormData.name || budgetFormData.allocatedAmount <= 0}
              className="flex-[2] bg-orange-600 hover:bg-orange-700 text-white rounded-sm font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all" 
              onClick={handleCreateBudget}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Confirmer le budget
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}