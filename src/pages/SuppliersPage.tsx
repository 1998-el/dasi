import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DashboardLayout } from '../components/DashboardLayout'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { 
  Plus, Search, Building2, Phone, Mail, MapPin, 
  Edit, Loader2, X, Save
} from 'lucide-react'
import { cn } from '../lib/utils'
import { authService } from './auth.service'
import { useAuth } from '../context/AuthContext'
import { useToast, Toast } from '../components/ui/Toast'

export function SuppliersPage() {
  const { businessConfig } = useAuth()
  const { t } = useTranslation()
  const { toast, showSuccess, showError } = useToast()
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    category: ''
  })

  const categories = useMemo(() => {
    if (businessConfig.type === 'PHARMACY') {
      return ["Laboratoires", "Grossistes Répartiteurs", "Matériel Médical", "Consommables"];
    }
    if (businessConfig.type === 'RESTAURANT') {
      return ["Boissons", "Nourriture / Frais", "Entretien", "Mobilier"];
    }
    return ["Grossistes", "Logistique", "Emballage", "Divers"];
  }, [businessConfig.type]);

  const fetchSuppliers = useCallback(async () => {
    setIsFetching(true)
    try {
      const data = await authService.getSuppliers()
      console.log('[SuppliersPage] Données des fournisseurs reçues du backend:', data);
      setSuppliers(data || [])
    } catch (e: any) {
      showError(e.message || "Erreur de chargement des fournisseurs")
    } finally {
      setIsFetching(false)
    }
  }, [showError])

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    try {
      const payload = {
        ...formData,
        categories: formData.category ? [formData.category] : []
      }
      if (selectedSupplier) {
        await (authService as any).updateSupplier(selectedSupplier.id, payload)
        showSuccess("Fournisseur mis à jour")
      } else {
        await (authService as any).createSupplier(payload)
        showSuccess("Fournisseur ajouté")
      }
      setIsDrawerOpen(false)
      fetchSuppliers()
      setFormData({ name: '', contactPerson: '', phone: '', email: '', address: '', category: '' })
    } catch (e: any) {
      showError(e.message || "Échec de l'opération")
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="fixed top-4 right-4 z-[100]">{toast && <Toast toast={toast} />}</div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('suppliers_page.title', 'Fournisseurs')}</h1>
          <p className="text-sm text-slate-500">{t('suppliers_page.subtitle', 'Gérez vos relations fournisseurs')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder={t('suppliers_page.search_placeholder')}
              className="pl-9 w-64 h-9 rounded-sm border-slate-200 bg-white text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => { setSelectedSupplier(null); setFormData({name:'', contactPerson:'', phone:'', email:'', address:'', category: ''}); setIsDrawerOpen(true); }} className="bg-orange-600 hover:bg-orange-700 h-9 rounded-sm gap-2 text-xs font-bold">
            <Plus className="h-4 w-4" /> {t('suppliers_page.add_supplier')}
          </Button>
        </div>
      </div>

      {isFetching ? (
        <div className="flex flex-col items-center justify-center h-64"><Loader2 className="h-8 w-8 text-orange-500 animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 bg-slate-50/50">
                <th className="px-6 py-3">{t('suppliers_page.name')}</th>
                <th className="px-6 py-3">{t('suppliers_page.contact')}</th>
                <th className="px-6 py-3">{t('suppliers_page.category')}</th>
                <th className="px-6 py-3">{t('suppliers_page.phone')}</th>
                <th className="px-6 py-3">{t('suppliers_page.email')}</th>
                <th className="px-6 py-3 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSuppliers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{s.name}</td>
                  <td className="px-6 py-4">{s.contactPerson || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-sm border border-slate-200 text-slate-600 uppercase">{s.categories?.[0] || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4">{s.phone}</td>
                  <td className="px-6 py-4 text-slate-500">{s.email}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => { 
                        setSelectedSupplier(s); 
                        setFormData({ 
                          name: s.name || '',
                          contactPerson: s.contactPerson || '',
                          phone: s.phone || '',
                          email: s.email || '',
                          address: s.address || '',
                          category: s.categories?.[0] || ''
                        }); 
                        setIsDrawerOpen(true); 
                      }} 
                      className="p-2 text-slate-400 hover:text-orange-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={cn("fixed inset-0 z-50 flex justify-end transition-all duration-300", isDrawerOpen ? "visible" : "invisible pointer-events-none")}>
        <div className={cn("absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500", isDrawerOpen ? "opacity-100" : "opacity-0")} onClick={() => setIsDrawerOpen(false)} />
        <div className={cn("relative bg-white w-full max-w-md h-full border-l border-slate-200 flex flex-col transition-all duration-500 ease-out shadow-2xl", isDrawerOpen ? "translate-x-0" : "translate-x-full")}>
           <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
             <h2 className="text-lg font-bold text-slate-900">{selectedSupplier ? "Modifier le fournisseur" : "Nouveau fournisseur"}</h2>
             <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsDrawerOpen(false)}><X className="h-5 w-5" /></Button>
           </div>
           <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-1.5"><Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('suppliers_page.name')}</Label><Input required className="h-10 rounded-sm border-slate-200" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              <div className="space-y-1.5"><Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('suppliers_page.contact')}</Label><Input className="h-10 rounded-sm border-slate-200" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} /></div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('suppliers_page.category')}</Label>
                <select 
                  className="w-full h-10 px-3 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-orange-500 bg-white font-medium"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="">Choisir une catégorie...</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5"><Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('suppliers_page.phone')}</Label><Input className="h-10 rounded-sm border-slate-200" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
              <div className="space-y-1.5"><Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('suppliers_page.email')}</Label><Input type="email" className="h-10 rounded-sm border-slate-200" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
              <div className="space-y-1.5"><Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('suppliers_page.address')}</Label><textarea className="w-full p-3 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-orange-500 h-20 resize-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
              <div className="pt-4 flex gap-3">
                <Button variant="outline" type="button" className="flex-1 h-11 rounded-sm font-bold" onClick={() => setIsDrawerOpen(false)}>{t('common.cancel')}</Button>
                <Button disabled={isProcessing} className="flex-1 bg-orange-600 hover:bg-orange-700 h-11 rounded-sm font-bold">{isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}{t('common.save')}</Button>
              </div>
           </form>
        </div>
      </div>
    </DashboardLayout>
  )
}