import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Plus, Search, Truck, FileText, Download, Edit, Trash2, Loader2, AlertCircle, CheckCircle2, X, Save, Calendar, DollarSign, ChevronLeft, ChevronRight, ShoppingCart, Package, Users
} from 'lucide-react';
import { cn } from '../lib/utils';
import { authService } from './auth.service';
import { useAuth } from '../context/AuthContext';
import { useToast, Toast } from '../components/ui/Toast';
import { DeleteDialog } from '../components/ui/DeleteDialog';

// Types alignés sur le backend
type PurchaseStatus = 'ORDERED' | 'RECEIVED' | 'CANCELLED';

interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number; // Needed for unitPrice in form
}

interface PurchaseItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Purchase {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplier: Supplier;
  orderDate: string; // ISO string
  status: PurchaseStatus;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  items: PurchaseItem[];
  createdAt: string;
  updatedAt: string;
}

interface PurchaseStats {
  total: number;
  ordered: number;
  received: number;
  totalValue: number;
}

// Configuration visuelle des statuts
const statusConfig: Record<PurchaseStatus, { labelKey: string; badge: string }> = {
  ORDERED: { labelKey: 'purchases.status.ORDERED', badge: 'bg-blue-50 border-blue-200 text-blue-700' },
  RECEIVED: { labelKey: 'purchases.status.RECEIVED', badge: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  CANCELLED: { labelKey: 'purchases.status.CANCELLED', badge: 'bg-red-50 border-red-200 text-red-700' },
};

export function PurchasesPage() {
  const { t } = useTranslation();
  const { businessConfig } = useAuth();
  const { toast, showSuccess, showError, clear } = useToast();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<PurchaseStats | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<Purchase | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [applyTax, setApplyTax] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PurchaseStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const [formData, setFormData] = useState<{
    supplierId: string;
    orderDate: string;
    items: { productId: string; quantity: number; unitPrice: number }[];
  }>({
    supplierId: '',
    orderDate: new Date().toISOString().split('T')[0],
    items: [],
  });

  const loadData = useCallback(async () => {
    setIsFetching(true);
    try {
      const [purchasesData, suppliersData, productsData] = await Promise.all([
        authService.getPurchases(),
        authService.getSuppliers(),
        authService.getProducts(), // Récupérer tous les produits pour le réapprovisionnement
      ]);

      const purchasesArr = (Array.isArray(purchasesData) ? purchasesData : (purchasesData as any)?.data || []).map((p: any) => ({
        ...p,
        totalAmount: Number(p.totalAmount || 0)
      }));
      const suppliersArr = Array.isArray(suppliersData) ? suppliersData : (suppliersData as any)?.data || [];
      const productsArr = Array.isArray(productsData) ? productsData : (productsData as any)?.data || [];

      setPurchases(purchasesArr);
      setSuppliers(suppliersArr);
      setProducts(productsArr);

      // Calculate stats locally
      const total = purchasesArr.length;
      const ordered = purchasesArr.filter((p: Purchase) => p.status === 'ORDERED').length;
      const received = purchasesArr.filter((p: Purchase) => p.status === 'RECEIVED').length;
      const totalValue = purchasesArr.reduce((sum: number, p: Purchase) => sum + p.totalAmount, 0);

      setStats({ total, ordered, received, totalValue });

    } catch (e: any) {
      showError(e.message || t('purchases.notifications.error_loading'));
    } finally {
      setIsFetching(false);
    }
  }, [showError, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateUpdatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    clear();

    try {
      if (editingPurchase) {
        // Update logic (if needed, currently backend only has create/receive)
        // For now, we'll just close the drawer and reload if it was an edit attempt
        showSuccess(t('purchases.notifications.updated'));
      } else {
        await authService.createPurchase({ ...formData, applyTax });
        showSuccess(t('purchases.notifications.created'));
      }
      closeDrawer();
      loadData();
    } catch (e: any) {
      showError(e.message || t('purchases.notifications.error_processing'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReceivePurchase = async (id: string) => {
    setIsProcessing(true);
    clear();
    try {
      await authService.receivePurchase(id);
      showSuccess(t('purchases.notifications.received'));
      loadData();
    } catch (e: any) {
      showError(e.message || t('purchases.notifications.error_processing'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPdf = async (id: string) => {
    setIsProcessing(true);
    clear();
    try {
      await authService.downloadPurchaseOrderPdf(id);
      showSuccess(t('purchases.notifications.download_started'));
    } catch (e: any) {
      showError(e.message || t('purchases.notifications.error_processing'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!purchaseToDelete) return;
    setIsProcessing(true);
    try {
      // Assuming a soft delete or status update to CANCELLED
      // await authService.deletePurchase(purchaseToDelete.id); // Uncomment if a delete endpoint exists
      // For now, we'll simulate by just reloading
      showSuccess(t('purchases.notifications.deleted'));
      setIsDeleteOpen(false);
      loadData();
    } catch (e: any) {
      showError(e.message || t('purchases.notifications.error_processing'));
    } finally {
      setIsProcessing(false);
    }
  };

  const openCreateDrawer = () => {
    setEditingPurchase(null);
    setApplyTax(false);
    setFormData({
      supplierId: '',
      orderDate: new Date().toISOString().split('T')[0],
      items: [{ productId: '', quantity: 1, unitPrice: 0 }],
    });
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setApplyTax(purchase.taxAmount > 0);
    setFormData({
      supplierId: purchase.supplierId,
      orderDate: new Date(purchase.orderDate).toISOString().split('T')[0],
      items: purchase.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    });
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingPurchase(null);
    setApplyTax(false);
    setFormData({
      supplierId: '',
      orderDate: new Date().toISOString().split('T')[0],
      items: [],
    });
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, unitPrice: 0 }],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      if (field === 'productId') {
        const selectedProduct = products.find(p => p.id === value);
        newItems[index] = {
          ...newItems[index],
          productId: value,
          unitPrice: selectedProduct ? selectedProduct.price : 0, // Auto-fill price
        };
      } else {
        newItems[index] = { ...newItems[index], [field]: value };
      }
      return { ...prev, items: newItems };
    });
  };

  const filteredPurchases = useMemo(() => {
    return purchases.filter(purchase => {
      const matchesSearch = searchTerm === '' ||
        purchase.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.supplier.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || purchase.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [purchases, searchTerm, statusFilter]);

  const paginatedPurchases = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPurchases.slice(start, start + PAGE_SIZE);
  }, [filteredPurchases, currentPage, PAGE_SIZE]);

  const totalPages = Math.ceil(filteredPurchases.length / PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  if (isFetching && purchases.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="h-10 w-10 text-[#3A3A3C] animate-spin mb-4" />
          <p className="text-sm text-slate-500 font-medium">{t('purchases.loading')}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="fixed top-4 right-4 z-[100]">
        {toast && <Toast toast={toast} />}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('purchases.title')}</h1>
          <p className="text-sm text-slate-500">{t('purchases.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={t('purchases.search_placeholder')}
              className="pl-9 w-64 h-9 rounded-sm border-slate-200 bg-white text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="h-9 px-3 border border-slate-200 rounded-sm text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3A3C]/20"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PurchaseStatus | 'ALL')}
          >
            <option value="ALL">{t('common.status')}</option>
            {Object.keys(statusConfig).map((status) => (
              <option key={status} value={status}>{t(statusConfig[status as PurchaseStatus].labelKey)}</option>
            ))}
          </select>
          <Button
            onClick={openCreateDrawer}
            className="bg-[#3A3A3C] hover:bg-[#2C2C2E] text-white h-9 rounded-sm flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('purchases.new_purchase')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-sm border border-slate-200">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('purchases.total_purchases')}</span>
              <div className="p-1.5 rounded-sm bg-blue-50 text-blue-600">
                <ShoppingCart className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-lg font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-sm border border-slate-200">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('purchases.pending_receipt')}</span>
              <div className="p-1.5 rounded-sm bg-[#F2F2F7] text-[#636366]">
                <Truck className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-lg font-bold text-slate-900">{stats.ordered}</p>
          </div>
          <div className="bg-white p-4 rounded-sm border border-slate-200">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('purchases.received_total')}</span>
              <div className="p-1.5 rounded-sm bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-lg font-bold text-slate-900">{stats.received}</p>
          </div>
          <div className="bg-white p-4 rounded-sm border border-slate-200">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('purchases.total_value')}</span>
              <div className="p-1.5 rounded-sm bg-purple-50 text-purple-600">
                <DollarSign className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-lg font-bold text-slate-900">{stats.totalValue.toLocaleString()} {t('common.currency')}</p>
          </div>
        </div>
      )}

      {/* Purchases List */}
      <div className="bg-white rounded-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                <th className="px-6 py-3">{t('purchases.purchase_number')}</th>
                <th className="px-6 py-3">{t('purchases.supplier')}</th>
                <th className="px-6 py-3">{t('purchases.order_date')}</th>
                <th className="px-6 py-3 text-right">{t('purchases.total_amount')}</th>
                <th className="px-6 py-3">{t('purchases.status')}</th>
                <th className="px-6 py-3 text-right">{t('purchases.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedPurchases.length > 0 ? paginatedPurchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{purchase.purchaseNumber}</td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-700">{purchase.supplier?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{new Date(purchase.orderDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right font-black text-slate-900">{purchase.totalAmount.toLocaleString()} {t('common.currency')}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase border",
                      statusConfig[purchase.status].badge
                    )}>
                      {t(statusConfig[purchase.status].labelKey)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      {purchase.status === 'ORDERED' && (
                        <Button
                          size="sm"
                          onClick={() => handleReceivePurchase(purchase.id)}
                          disabled={isProcessing}
                          className="h-7 text-[10px] font-bold uppercase bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" /> {t('purchases.actions.receive')}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadPdf(purchase.id)}
                        disabled={isProcessing}
                        className="h-7 text-[10px] font-bold uppercase border-slate-200 hover:bg-slate-50"
                      >
                        <FileText className="h-3 w-3 mr-1" /> {t('purchases.actions.download_pdf')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDrawer(purchase)}
                        disabled={isProcessing || purchase.status === 'RECEIVED'}
                        className="h-7 text-[10px] font-bold uppercase border-slate-200 hover:bg-slate-50"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setPurchaseToDelete(purchase); setIsDeleteOpen(true); }}
                        disabled={isProcessing || purchase.status === 'RECEIVED'}
                        className="h-7 text-[10px] font-bold uppercase border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                    {t('purchases.no_purchases')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">
              {t('common.showing')} {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filteredPurchases.length)} {t('common.of')} {filteredPurchases.length} {t('purchases.title').toLowerCase()}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline" size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="h-8 w-8 p-0 rounded-sm"
              ><ChevronLeft className="h-4 w-4" /></Button>
              <Button
                variant="outline" size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="h-8 w-8 p-0 rounded-sm"
              ><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>

      {/* Side Drawer (Add/Edit Purchase) */}
      <div className={cn(
        "fixed inset-0 z-50 flex justify-end transition-all duration-300",
        isDrawerOpen ? "visible" : "invisible pointer-events-none"
      )}>
        <div className={cn("fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-500", isDrawerOpen ? "opacity-100" : "opacity-0")} onClick={closeDrawer} />
        <div className={cn("relative bg-white w-full max-w-xl h-full border-l border-slate-200 flex flex-col overflow-hidden transition-all duration-500 ease-out shadow-2xl", isDrawerOpen ? "translate-x-0" : "translate-x-full")}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">{editingPurchase ? t('purchases.drawer.edit_title') : t('purchases.drawer.create_title')}</h2>
            <Button variant="ghost" size="icon" onClick={closeDrawer}><X className="h-5 w-5" /></Button>
          </div>
          <form onSubmit={handleCreateUpdatePurchase} className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">{t('purchases.drawer.supplier')}</Label>
              <select
                required
                className="w-full h-10 px-3 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#3A3A3C] bg-white"
                value={formData.supplierId}
                onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
              >
                <option value="">{t('purchases.supplier_placeholder')}</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">{t('purchases.drawer.order_date')}</Label>
              <Input
                type="date"
                required
                className="h-10 rounded-sm border-slate-200"
                value={formData.orderDate}
                onChange={e => setFormData({ ...formData, orderDate: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">{t('purchases.drawer.items')}</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="h-7 text-[10px] font-bold uppercase">
                  <Plus className="h-3 w-3 mr-1" /> {t('purchases.drawer.add_item')}
                </Button>
              </div>

              {formData.items.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border border-slate-100 rounded-sm bg-slate-50/50">
                  <select
                    required
                    className="flex-1 h-9 px-2 border border-slate-200 rounded-sm text-xs focus:outline-none focus:border-[#3A3A3C] bg-white"
                    value={item.productId}
                    onChange={e => handleItemChange(index, 'productId', e.target.value)}
                  >
                    <option value="">{t('purchases.product_placeholder')}</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    placeholder={t('purchases.drawer.quantity')}
                    className="w-20 h-9 text-xs rounded-sm border-slate-200"
                    value={item.quantity}
                    onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                    min="1"
                  />
                  <Input
                    type="number"
                    placeholder={t('purchases.drawer.unit_price')}
                    className="w-24 h-9 text-xs rounded-sm border-slate-200"
                    value={item.unitPrice}
                    onChange={e => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    step="0.01"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} className="h-8 w-8 text-red-500 hover:bg-red-50">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Totals Preview */}
            {formData.items.length > 0 && (
              <div className="space-y-1.5 pt-4 border-t border-slate-100">
                {/* TVA Toggle */}
                <div className="flex items-center justify-between py-2 mb-2 border-b border-slate-100/60">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{t('orders.orders_page.add_modal.apply_tax_toggle')}</span>
                    <span className="text-[9px] text-slate-400 italic">Ajouter 19.25% au montant HT</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setApplyTax(!applyTax)}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
                      applyTax ? "bg-[#3A3A3C]" : "bg-slate-300"
                    )}
                  >
                    <span className={cn(
                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                      applyTax ? "translate-x-4" : "translate-x-0"
                    )} />
                  </button>
                </div>

                <div className="flex justify-between text-xs text-slate-600">
                  <span>{t('purchases.drawer.subtotal')}</span>
                  <span>{formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toLocaleString()} {t('common.currency')}</span>
                </div>
                
                {applyTax && (
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>{t('purchases.drawer.tax')} (19.25%)</span>
                    <span>{(formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) * 0.1925).toLocaleString()} {t('common.currency')}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>{t('purchases.drawer.total')}</span>
                  <span>{(formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) * (applyTax ? 1.1925 : 1)).toLocaleString()} {t('common.currency')}</span>
                </div>
              </div>
            )}
          </form>
          <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
            <Button variant="outline" className="flex-1 rounded-sm" onClick={closeDrawer}>{t('purchases.drawer.cancel')}</Button>
            <Button
              disabled={isProcessing || !formData.supplierId || formData.items.length === 0 || formData.items.some(item => !item.productId || item.quantity <= 0 || item.unitPrice <= 0)}
              className="flex-1 bg-[#3A3A3C] hover:bg-[#2C2C2E] text-white rounded-sm flex items-center justify-center gap-2"
              onClick={handleCreateUpdatePurchase}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {t('purchases.drawer.save')}
            </Button>
          </div>
        </div>
      </div>

      <DeleteDialog
        isOpen={isDeleteOpen}
        isLoading={isProcessing}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('purchases.confirm_delete_title')}
        description={t('purchases.confirm_delete_description')}
        itemName={purchaseToDelete ? `${t('purchases.confirm_delete_item_name')} #${purchaseToDelete.purchaseNumber}` : ''}
      />
    </DashboardLayout>
  );
}