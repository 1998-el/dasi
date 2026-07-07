/**
 * Types manquants pour le checkout
 */
export interface PharmacyCheckoutDto {
  prescriptionId?: string;
  totalAmount: number;
  paymentMethod: string;
  items: Array<{ productId: string; quantity: number; unitPrice: number }>;
}

/**
 * Centralisation des points de connexion (Endpoints)
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ONBOARDING: '/auth/onboarding',
  VERIFY_OTP: '/auth/verify-otp',
  RESEND_OTP: '/auth/resend-otp',
  ESTABLISHMENT: '/auth/establishment',
  FORGOT_PASSWORD: '/auth/forgot-password',
  FORGOT_PASSWORD_RESEND: '/auth/forgot-password/resend',
  FORGOT_PASSWORD_RESET: '/auth/forgot-password/reset',
  PROFILE: '/auth/profile',
};

const DASHBOARD_ENDPOINTS = {
  SUMMARY: '/dashboard/summary',
  TOP_PRODUCTS: '/dashboard/top-products',
  SALES_BY_PERIOD: '/dashboard/sales-by-period',
  RECENT_ORDERS: '/dashboard/recent-orders',
  AI_INSIGHTS: '/dashboard/ai-insights',
}

const INVENTORY_ENDPOINTS = {
  BATCHES_BY_PRODUCT: '/products/:productId/batches',
};

const REPORT_ENDPOINTS = {
  Z_REPORT: '/reports/z-report',
  Z_REPORT_PDF: '/reports/z-report/pdf',
};

const ACCOUNTING_ENDPOINTS = {
  BALANCE: '/accounting/balance',
  PNL: '/accounting/pnl',
};

/**
 * Service AuthService : Point d'entrée unique pour l'authentification
 */
class AuthService {
  private tenantIdPromise: Promise<boolean> | null = null; // Déduplique les appels à fetchAndSetTenantId
  private lastProfileFetch: number = 0; // Timestamp pour limiter la fréquence des tentatives
  private profileCache: { tenantId: string | null; fetchedAt: number } = { tenantId: null, fetchedAt: 0 }; // cache court du tenantId
  private getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private setToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }

  private clearToken(): void {
    localStorage.removeItem('accessToken');
  }

  private getTenantId(): string | null {
    const id = localStorage.getItem('tenantId');
    if (!id || id === 'null' || id === 'undefined') return null;
    return id;
  }

  public setTenantId(id: string | null | undefined): void {
    if (!id || id === 'null' || id === 'undefined') {
      localStorage.removeItem('tenantId');
    } else {
      localStorage.setItem('tenantId', id);
    }
  }

  private clearTenantId(): void {
    localStorage.removeItem('tenantId');
  }

  /**
   * Vérifie si une requête nécessite un tenantId
   */
  private requiresTenantId(url: string): boolean {
    // Les endpoints d'authentification n'ont pas besoin de tenantId
    const authEndpoints = [
      '/auth/login',
      '/auth/register', 
      '/auth/start-onboarding',
      '/auth/onboarding',
      '/auth/verify-otp',
      '/auth/resend-otp',
      '/auth/forgot-password',
      '/auth/forgot-password/resend',
      '/auth/forgot-password/reset',
      '/auth/profile',
      '/auth/establishment',
      '/tables/qr/'
    ];
    
    return !authEndpoints.some(endpoint => url.includes(endpoint));
  }

  /**
   * Tente de récupérer le tenantId depuis le profil
   */
  private async fetchAndSetTenantId(): Promise<boolean> {
    try {
      const now = Date.now();

      // Si on a résolu récemment, on ne re-fetch pas le profil
      const CACHE_TTL_MS = 8000; // 8s (suffisant pour le chargement du dashboard)
      if (
        this.profileCache.tenantId &&
        now - this.profileCache.fetchedAt < CACHE_TTL_MS
      ) {
        this.setTenantId(this.profileCache.tenantId);
        return true;
      }

      // Si on sait qu'on n'a rien trouvé récemment, on évite aussi de re-taper
      if (
        this.profileCache.tenantId === null &&
        now - this.profileCache.fetchedAt < CACHE_TTL_MS
      ) {
        return false;
      }

      const token = this.getToken();
      if (!token) return false;

      const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.PROFILE}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      // Anti-flood : on enregistre la tentative
      this.lastProfileFetch = now;

      if (!response.ok) {
        this.profileCache = { tenantId: null, fetchedAt: now };
        return false;
      }

      const profile = await response.json();
      const tenantId = profile?.branchId ||
        profile?.establishmentId ||
        profile?.tenant?.id ||
        profile?.tenantId;

      this.profileCache = { tenantId: tenantId ?? null, fetchedAt: now };

      if (tenantId) {
        this.setTenantId(tenantId);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erreur lors de la récupération du tenantId:', error);
      this.profileCache = { tenantId: null, fetchedAt: Date.now() };
      return false;
    } finally {
      // On libère le verrou dès que la promesse est résolue (évite les relances pendant le chargement)
      this.tenantIdPromise = null;
    }
  }

  private async request<T>(method: string, url: string, body?: any, explicitTenantId?: string): Promise<T> {
    const token = this.getToken();
    const needsTenantId = this.requiresTenantId(url);
    const currentTenantId = this.getTenantId();

    // Vérification pour les requêtes qui nécessitent un tenantId
    if (needsTenantId && token && !currentTenantId) {
      // Si on a déjà tenté il y a moins de 2 secondes, on ne sature pas le serveur
      if (Date.now() - this.lastProfileFetch < 2000 && !this.tenantIdPromise) {
        throw new Error('Identification de l\'établissement en cours...');
      }
      
      if (!this.tenantIdPromise) {
        console.warn(`[AuthService] Résolution automatique du tenantId pour: ${url}`);
        this.tenantIdPromise = this.fetchAndSetTenantId();
      }
      await this.tenantIdPromise;
    }
    
    // Utiliser explicitTenantId si fourni, sinon fallback sur localStorage ou résolu
    const tenantIdToUse = explicitTenantId || this.getTenantId();

    const isFormData = body instanceof FormData;
    
    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Ajouter X-Tenant-ID seulement si explicitTenantId est fourni OU si la route le nécessite ET qu'il est disponible
      // Pour le menu client public, explicitTenantId sera utilisé, et token sera null.
      ...(tenantIdToUse && needsTenantId ? { 'X-Tenant-ID': tenantIdToUse } : {}),
    };

    if (!isFormData) headers['Content-Type'] = 'application/json';

    // Log de débogage pour vérifier le passage du tenantId
    console.log(`🔍 Requête ${method} ${url}`, { 
      hasToken: !!token, 
      hasTenantId: !!tenantIdToUse,
      tenantIdValue: tenantIdToUse,
      explicitTenantIdProvided: !!explicitTenantId
    });

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method,
      headers,
      body: body !== undefined ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });

    // Certains backends renvoient du JSON même en erreur; on essaie de parser.
    let result: any = null;
    try {
      result = await response.json();
    } catch {
      result = null;
    }

    if (!response.ok) {
      // Si erreur 401 et qu'on a un tenantId, on tente de le rafraîchir
      if (response.status === 401 && tenantIdToUse) {
        console.warn('Erreur 401 détectée, tentative de rafraîchissement du tenantId...');
        this.setTenantId(null); // Effacer le tenantId localement pour forcer une nouvelle récupération
        const refreshed = await this.fetchAndSetTenantId();
        if (refreshed) {
          // Réessayer la requête une fois
          return this.request<T>(method, url, body, explicitTenantId); // Passer explicitTenantId lors de la nouvelle tentative
        }
      }
      
      // Gestion plus fine des messages d'erreur du backend (NestJS renvoie souvent un tableau dans .message)
      const message = Array.isArray(result?.message) 
        ? result.message.join(', ') 
        : result?.message ?? 'Une erreur est survenue lors de la communication avec le serveur.';
        
      throw new Error(message);
    }

    return result as T;
  }

  async login(credentials: { email: string; password: string }) {
    const result = await this.request<{ accessToken: string; user: any }>(
      'POST',
      AUTH_ENDPOINTS.LOGIN,
      credentials
    );
    if (result.accessToken) this.setToken(result.accessToken);

    // Récupération robuste du tenantId
    const tenantId =
      result.user?.tenantId ||
      result.user?.tenant?.id ||
      result.user?.branchId ||
      result.user?.establishmentId ||
      (result as any)?.tenantId;
    
    if (tenantId) {
      this.setTenantId(tenantId);
      console.log('TenantId sauvegardé:', tenantId);
    } else {
      console.warn('Aucun tenantId trouvé dans la réponse login, tentative via profil...');
      await this.fetchAndSetTenantId();
    }

    return result;
  }

  async register(data: any) {
    const result = await this.request<{ accessToken: string; user: any }>(
      'POST',
      AUTH_ENDPOINTS.REGISTER,
      data
    );
    if (result.accessToken) this.setToken(result.accessToken);
    
    const tenantId = result.user?.branchId || 
                    result.user?.establishmentId || 
                    result.user?.tenant?.id ||
                    result.user?.tenantId;
    
    if (tenantId) {
      this.setTenantId(tenantId);
      console.log('TenantId sauvegardé après registration:', tenantId);
    }

    return result;
  }

  startOnboarding(data: any) {
    return this.request<{
      accessToken: string
      user: any
      userId: string
      onboardingStatus: string
      otpDeliveryMode?: 'dev' | 'resend'
      otpDebugCode?: string
      otpExpiresAt?: string
    }>('POST', '/auth/start-onboarding', data)
      .catch(() => this.request<any>('POST', '/auth/onboarding', data))
      .then((result) => {
        if (result?.accessToken) this.setToken(result.accessToken);
        
        const tenantId = result.user?.branchId || 
                        result.user?.establishmentId || 
                        result.user?.tenant?.id || 
                        result.userId ||
                        result.user?.tenantId;
        
        if (tenantId) {
          this.setTenantId(tenantId);
          console.log('TenantId sauvegardé après onboarding:', tenantId);
        }

        return result;
      });
  }

  verifyOtp(data: { email: string; otp: string }) {
    return this.request(
      'POST',
      AUTH_ENDPOINTS.VERIFY_OTP,
      data
    );
  }

  resendOtp() {
    return this.request<{
      message: string
      onboardingStatus: string
      otpDeliveryMode?: 'dev' | 'resend'
      otpDebugCode?: string
      otpExpiresAt?: string
    }>(
      'POST',
      AUTH_ENDPOINTS.RESEND_OTP,
    );
  }

  completeEstablishment(data: any) {
    return this.request(
      'POST',
      AUTH_ENDPOINTS.ESTABLISHMENT,
      data
    );
  }

  requestPasswordReset(data: { email: string }) {
    return this.request<{
      message: string
      otpDeliveryMode?: 'dev' | 'resend'
      otpDebugCode?: string
      otpExpiresAt?: string
    }>(
      'POST',
      AUTH_ENDPOINTS.FORGOT_PASSWORD,
      data,
    );
  }

  resendPasswordResetCode(data: { email: string }) {
    return this.request<{
      message: string
      otpDeliveryMode?: 'dev' | 'resend'
      otpDebugCode?: string
      otpExpiresAt?: string
    }>(
      'POST',
      AUTH_ENDPOINTS.FORGOT_PASSWORD_RESEND,
      data,
    );
  }

  resetPassword(data: { email: string; otp: string; password: string }) {
    return this.request<{
      message: string
    }>(
      'POST',
      AUTH_ENDPOINTS.FORGOT_PASSWORD_RESET,
      data,
    );
  }

  async getProfile() {
    const profile = await this.request<any>('GET', AUTH_ENDPOINTS.PROFILE);
    const tenantId = profile?.branchId || 
                    profile?.establishmentId || 
                    profile?.tenant?.id ||
                    profile?.tenantId;
    
    if (tenantId) {
      this.setTenantId(tenantId);
      console.log('TenantId mis à jour depuis le profil:', tenantId);
    }
    
    return profile;
  }

  async updateProfile(data: { firstName?: string; lastName?: string; phone?: string; avatar?: string }) {
    return this.request<any>('PUT', AUTH_ENDPOINTS.PROFILE, data);
  }

  async changePassword(data: { oldPassword?: string; newPassword?: string }) {
    return this.request<any>('PUT', '/auth/change-password', data);
  }

  // ========== MÉTHODES DASHBOARD ==========

  getDashboardSummary() {
    return this.request<any>('GET', DASHBOARD_ENDPOINTS.SUMMARY);
  }

  getTopProducts(limit?: number) {
    const url = limit 
      ? `${DASHBOARD_ENDPOINTS.TOP_PRODUCTS}?limit=${limit}` 
      : DASHBOARD_ENDPOINTS.TOP_PRODUCTS;
    return this.request<any>('GET', url);
  }

  getSalesByPeriod(period: 'daily' | 'weekly', days?: number, weeks?: number) {
    const params = new URLSearchParams({ period });
    if (days) params.set('days', days.toString());
    if (weeks) params.set('weeks', weeks.toString());
    return this.request<any>('GET', `${DASHBOARD_ENDPOINTS.SALES_BY_PERIOD}?${params}`);
  }

  getRecentOrders(limit?: number) {
    const url = limit 
      ? `${DASHBOARD_ENDPOINTS.RECENT_ORDERS}?limit=${limit}` 
      : DASHBOARD_ENDPOINTS.RECENT_ORDERS;
    return this.request<any>('GET', url);
  }

  // ========== RETAIL / BOUTIQUE ==========

  async getRetailProductByBarcode(barcode: string): Promise<any> {
    return this.request<any>('GET', `/retail/product/${barcode}`);
  }

  async checkoutRetail(data: any): Promise<any> {
    return this.request<any>('POST', '/retail/checkout', data);
  }

  async getRetailHistory(filters?: { startDate?: string; endDate?: string; search?: string }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.set('startDate', filters.startDate);
    if (filters?.endDate) params.set('endDate', filters.endDate);
    if (filters?.search) params.set('search', filters.search);
    const query = params.toString();
    return this.request<any[]>('GET', query ? `/retail/history?${query}` : '/retail/history');
  }

  // ========== PHARMACY / PHARMACIE ==========

  async checkoutPharmacy(data: PharmacyCheckoutDto): Promise<any> {
    return this.request<any>('POST', '/pharmacy/checkout', data);
  }

  // ========== ANALYSE IA ==========
  async getAiInsights(): Promise<any> {
    return this.request<any>('GET', DASHBOARD_ENDPOINTS.AI_INSIGHTS);
  }

  // ========== CATALOGUE PRODUITS ==========

  async getProducts(filters?: {
    category?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }, explicitTenantId?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    
    const query = params.toString();
    return this.request<any[]>('GET', query ? `/products?${query}` : '/products', undefined, explicitTenantId);
  }

  async getProduct(id: string): Promise<any> {
    return this.request<any>('GET', `/products/${id}`);
  }

  async getProductStats(): Promise<any> {
    return this.request<any>('GET', '/products/stats');
  }

  async getLowStockProducts(): Promise<any[]> {
    return this.request<any[]>('GET', '/products/low-stock');
  }

  async createProduct(data: FormData | any): Promise<any> {
    return this.request<any>('POST', '/products', data);
  }

  async updateProduct(id: string, data: FormData | any): Promise<any> {
    return this.request<any>('PUT', `/products/${id}`, data);
  }

  async deleteProduct(id: string): Promise<any> {
    return this.request<any>('DELETE', `/products/${id}`);
  }

  // ========== GESTION DES TABLES (Le menu client peut utiliser ceci avec explicitTenantId) ==========

  async getTables(filters?: { search?: string; status?: string; page?: number; limit?: number }, explicitTenantId?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.set('search', filters.search);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    const query = params.toString();
    return this.request<any[]>('GET', query ? `/tables?${query}` : '/tables', undefined, explicitTenantId);
  }

  async getTableStats(): Promise<any> {
    return this.request<any>('GET', '/tables/stats');
  }

  async getFloorPlan(): Promise<any[]> {
    return this.request<any[]>('GET', '/tables/floor-plan');
  }

  async getTable(id: string, explicitTenantId?: string): Promise<any> {
    return this.request<any>('GET', `/tables/${id}`, undefined, explicitTenantId);
  }

  async getTableByQRCode(tableCode: string, explicitTenantId: string): Promise<any> { // Attend explicitement les deux paramètres
    return this.request<any>('GET', `/tables/scan/${explicitTenantId}/${tableCode}`);
  }

  async createTable(data: {
    number: string;
    name?: string;
    capacity?: number;
    zone?: string;
    positionX?: number;
    positionY?: number;
  }): Promise<any> {
    return this.request<any>('POST', '/tables', data);
  }

  async updateTableStatus(id: string, status: string, reason?: string): Promise<any> {
    return this.request<any>('PUT', `/tables/${id}/status`, { status, reason });
  }

  async updateTable(
    id: string,
    data: {
      name?: string;
      capacity?: number;
      zone?: string;
      positionX?: number;
      positionY?: number;
      isActive?: boolean;
      status?: string;
    }
  ): Promise<any> {
    return this.request<any>('PUT', `/tables/${id}`, data);
  }

  async regenerateQRCode(id: string): Promise<any> {
    return this.request<any>('POST', `/tables/${id}/qrcode/regenerate`);
  }

  async deleteTable(id: string): Promise<any> {
    return this.request<any>('DELETE', `/tables/${id}`);
  }

  async getTablesWithActiveOrders(): Promise<any[]> {
    return this.request<any[]>('GET', '/tables/active-orders');
  }

  // ========== COMMANDES / ORDERS ==========

  async getOrders(filters?: {
    status?: string;
    tableId?: string;
    source?: string;
    paid?: boolean;
    startDate?: string;
    endDate?: string;
    limit?: number;
    page?: number; // Le menu client n'utilise pas ceci, mais gardé pour la cohérence
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.tableId) params.set('tableId', filters.tableId);
    if (filters?.source) params.set('source', filters.source);
    if (filters?.paid !== undefined) params.set('paid', String(filters.paid));
    if (filters?.startDate) params.set('startDate', filters.startDate);
    if (filters?.endDate) params.set('endDate', filters.endDate);
    if (filters?.limit !== undefined) params.set('limit', String(filters.limit));
    if (filters?.page !== undefined) params.set('page', String(filters.page));

    const query = params.toString();
    const url = query ? `/orders?${query}` : '/orders';
    return this.request<any[]>('GET', url, undefined);
  }

  async getOrder(id: string): Promise<any> {
    return this.request<any>('GET', `/orders/${id}`);
  }

  async createOrder(data: {
    tableId: string;
    source: string;
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      groupId?: string;
      modifiers?: any;
      specialRequest?: string;
    }>;
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    guestCount?: number;
    specialInstructions?: string;
    validatedById?: string;
    status?: string; // Le menu client n'utilise pas ceci, mais gardé pour la cohérence
  }, explicitTenantId?: string): Promise<any> {
    return this.request<any>('POST', '/orders', data, explicitTenantId);
  }

  async validateOrder(id: string, validatedById: string): Promise<any> {
    // Backend: PUT /orders/:id/validate
    return this.request<any>('PUT', `/orders/${id}/validate`, { validatedById });
  }

  async prepareOrder(id: string): Promise<any> {
    // Backend: PUT /orders/:id/prepare
    return this.request<any>('PUT', `/orders/${id}/prepare`);
  }

  async markOrderReady(id: string): Promise<any> {
    // Backend: PUT /orders/:id/ready
    return this.request<any>('PUT', `/orders/${id}/ready`);
  }

  async serveOrder(id: string, servedById: string): Promise<any> {
    // Backend: PUT /orders/:id/serve
    return this.request<any>('PUT', `/orders/${id}/serve`, { servedById });
  }

  async cancelOrder(
    id: string,
    data: { reason: string; note?: string; cancelledById?: string },
  ): Promise<any> {
    // Backend: POST /orders/:id/cancel
    return this.request<any>('POST', `/orders/${id}/cancel`, {
      reason: data.reason,
      note: data.note,
      cancelledById: data.cancelledById,
    });
  }

  async addItemsToOrder(
    orderId: string,
    data: {
      items: Array<{
        productId: string;
        quantity: number;
        unitPrice: number;
        groupId?: string;
        modifiers?: any;
      }>;
    },
  ): Promise<any> {
    return this.request<any>('POST', `/orders/${orderId}/items`, data);
  }

  async addProductsToExistingOrder(
    orderId: string,
    items: Array<{ productId: string; quantity: number }>,
  ): Promise<any> {
    // Appelle la logique de cumul (SalesService sur le backend)
    return this.request<any>('POST', `/sales/order/${orderId}/items`, { items });
  }

  async getTableQRCodeBlob(id: string): Promise<string> {
    const token = this.getToken();
    const tenantId = this.getTenantId();

    const response = await fetch(`${API_BASE_URL}/tables/${id}/qrcode/image`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId || '',
      },
    });

    if (!response.ok) throw new Error('Erreur lors de la récupération du QR code');

    const blob = await response.blob();
    return window.URL.createObjectURL(blob);
  }

  async downloadTableQRCode(id: string, tableNumber: string): Promise<void> {
    const token = this.getToken();
    const tenantId = this.getTenantId();

    const response = await fetch(`${API_BASE_URL}/tables/${id}/qrcode/image`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId || '',
      },
    });

    if (!response.ok) throw new Error('Erreur lors du téléchargement du QR code');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrcode-table-${tableNumber}.png`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async downloadTableQRCodePdf(id: string, tableNumber: string): Promise<void> {
    const token = this.getToken();
    const tenantId = this.getTenantId();

    const response = await fetch(`${API_BASE_URL}/tables/${id}/qrcode/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId || '',
      },
    });

    if (!response.ok) throw new Error('Erreur lors du téléchargement du PDF');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `table-${tableNumber}-qr-stand.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // ========== PAIEMENTS / PAYMENTS ==========

  async getPayments(filters?: { status?: string; method?: string; saleId?: string }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.method) params.set('method', filters.method);
    if (filters?.saleId) params.set('saleId', filters.saleId);

    const query = params.toString();
    const url = query ? `/payments?${query}` : '/payments';
    return this.request<any[]>('GET', url);
  }

  async createPayment(data: any): Promise<any> {
    return this.request<any>('POST', '/payments', data);
  }

  async refundPayment(id: string, amount?: number): Promise<any> {
    return this.request<any>('POST', `/payments/${id}/refund`, { amount });
  }

  async verifyMobilePayment(id: string, data: { transactionId: string; phoneNumber?: string; providerResponse: any }): Promise<any> {
    return this.request<any>('POST', `/payments/${id}/verify`, data);
  }

  async forceValidatePayment(id: string, notes: string): Promise<any> {
    return this.request<any>('POST', `/payments/${id}/force-validate`, { notes });
  }

  async getPaymentReport(startDate: string, endDate: string): Promise<any> {
    return this.request<any>('GET', `/payments/report?startDate=${startDate}&endDate=${endDate}`);
  }

  // ========== TICKETS ==========

  async getTickets(filters?: { startDate?: string; endDate?: string; page?: number; limit?: number }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.set('startDate', filters.startDate);
    if (filters?.endDate) params.set('endDate', filters.endDate);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    const query = params.toString();
    return this.request<any[]>('GET', query ? `/tickets?${query}` : '/tickets');
  }

  async getTicketStats(): Promise<any> {
    return this.request<any>('GET', '/tickets/stats');
  }

  async reprintTicket(id: string): Promise<any> {
    return this.request<any>('POST', `/tickets/${id}/reprint`);
  }

  async downloadTicketPdf(id: string, ticketNumber: string): Promise<void> {
    const token = this.getToken();
    const tenantId = this.getTenantId();
    const response = await fetch(`${API_BASE_URL}/tickets/${id}/export`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId || '',
      },
    });
    if (!response.ok) throw new Error('Erreur lors de l\'export du ticket');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${ticketNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // ========== VENTES / SALES ==========

  async getSales(filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    customerId?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.customerId) params.set('customerId', filters.customerId);
    if (filters?.startDate) params.set('startDate', filters.startDate);
    if (filters?.endDate) params.set('endDate', filters.endDate);

    const query = params.toString();
    return this.request<any[]>('GET', query ? `/sales?${query}` : '/sales');
  }

  async getSale(id: string): Promise<any> {
    return this.request<any>('GET', `/sales/${id}`);
  }

  async createSaleFromOrder(orderId: string): Promise<any> {
    return this.request<any>('POST', `/sales/from-order/${orderId}`);
  }

  // ========== RH / HR & ÉQUIPE (MEMBRES) ==========

  async getMembers() {
    return this.request<any[]>('GET', '/hr/members');
  }

  async createMember(data: any) {
    return this.request<any>('POST', '/hr/members', data);
  }

  async getMember(id: string) {
    return this.request<any>('GET', `/hr/members/${id}`);
  }

  // Employés
  async getHRSummary(): Promise<any> {
    return this.request<any>('GET', '/hr/summary');
  }

  async getHrConfig(): Promise<any> {
    return this.request<any>('GET', '/hr/config');
  }

  async updateHrConfig(data: any): Promise<any> {
    return this.request<any>('PUT', '/hr/config', data);
  }

  // Pointage (Attendance)
  async checkIn(employeeId: string, timestamp?: string): Promise<any> {
    return this.request<any>('POST', '/hr/attendance/check-in', { employeeId, timestamp });
  }

  async checkOut(employeeId: string, timestamp?: string): Promise<any> {
    return this.request<any>('POST', '/hr/attendance/check-out', { employeeId, timestamp });
  }

  async getEmployees(filters?: { status?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    const query = params.toString();
    return this.request<any[]>('GET', query ? `/hr/employees?${query}` : '/hr/employees');
  }

  async getEmployee(id: string) {
    return this.request<any>('GET', `/hr/employees/${id}`);
  }

  async createEmployee(data: any) {
    return this.request<any>('POST', '/hr/employees', data);
  }

  async updateEmployee(id: string, data: any) {
    return this.request<any>('PUT', `/hr/employees/${id}`, data);
  }

  async terminateEmployee(id: string, reason?: string) {
    return this.request<any>('PUT', `/hr/employees/${id}/terminate`, { reason });
  }

  // Congés
  async getAttendance(): Promise<any[]> {
    return this.request<any[]>('GET', '/hr/attendance');
  }

  async getEmployeeAttendance(employeeId: string, limit: number = 30) {
    return this.request<any[]>('GET', `/hr/attendance/employee/${employeeId}?limit=${limit}`);
  }

  async getEmployeeAttendanceDetails(employeeId: string) {
    return this.request<any>('GET', `/hr/attendance/employee/${employeeId}/details`);
  }

  // ========== FINANCE & DÉPENSES ==========

  async getExpenses(filters?: any) {
    const params = new URLSearchParams(filters).toString();
    return this.request<any[]>('GET', `/finance/expenses?${params}`);
  }

  async createExpense(data: any) {
    return this.request<any>('POST', '/finance/expenses', data);
  }

  async approveExpense(id: string) {
    return this.request<any>('POST', `/finance/expenses/${id}/approve`);
  }

  async getBudgets() {
    return this.request<any[]>('GET', '/finance/budgets');
  }

  async createBudget(data: any) {
    return this.request<any>('POST', '/finance/budgets', data);
  }

  async checkBudgetLimit(budgetId: string, amount: number) {
    return this.request<any>('GET', `/finance/budgets/${budgetId}/check?amount=${amount}`);
  }

  async requestLeave(data: any) {
    return this.request<any>('POST', '/hr/leave/request', data);
  }

  async getLeaveRequests(filters?: { status?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    const query = params.toString();
    return this.request<any[]>(
      'GET',
      query ? `/hr/leave?${query}` : '/hr/leave',
    );
  }

  async getPendingLeaveRequests() {
    return this.request<any[]>('GET', '/hr/leave/pending');
  }

  async approveLeaveRequest(leaveId: string) {
    return this.request<any>('PUT', `/hr/leave/${leaveId}/approve`, {});
  }

  async rejectLeaveRequest(leaveId: string, reason?: string) {
    return this.request<any>('PUT', `/hr/leave/${leaveId}/reject`, { reason });
  }

  async getLeaveBalance(employeeId: string) {
    return this.request<any>('GET', `/hr/leave/balance/${employeeId}`);
  }

  // Paie
  async getPayrolls(filters?: { period?: string }) {
    const params = new URLSearchParams();
    if (filters?.period) params.set('period', filters.period);
    const query = params.toString();
    return this.request<any[]>(
      'GET',
      query ? `/hr/payroll?${query}` : '/hr/payroll',
    );
  }

  async calculatePayroll(period: string) {
    return this.request<any>('GET', `/hr/payroll/calculate/${period}`);
  }

  async processPayroll(period: string) {
    return this.request<any>('POST', `/hr/payroll/process/${period}`);
  }

  async getPayroll(employeeId: string, period: string) {
    return this.request<any>('GET', `/hr/payroll/${employeeId}/${period}`);
  }

  // Shifts
  async getShifts(filters?: { weekStart?: string }) {
    const params = new URLSearchParams();
    if (filters?.weekStart) params.set('weekStart', filters.weekStart);
    const query = params.toString();
    return this.request<any[]>(
      'GET',
      query ? `/hr/shifts?${query}` : '/hr/shifts',
    );
  }

  async createShift(data: any) {
    return this.request<any>('POST', '/hr/shifts', data);
  }

  async generateShifts(weekStart: string) {
    return this.request<any>('POST', '/hr/shifts/generate', { weekStart });
  }

  async assignShift(shiftId: string, data: any) {
    return this.request<any>('PUT', `/hr/shifts/${shiftId}/assign`, data);
  }

  async publishShift(shiftId: string) {
    return this.request<any>('PUT', `/hr/shifts/${shiftId}/publish`, {});
  }

  // Tips
  async getTipHistory(filters?: { employeeId?: string }) {
    const params = new URLSearchParams();
    if (filters?.employeeId) params.set('employeeId', filters.employeeId);
    const query = params.toString();
    return this.request<any[]>(
      'GET',
      query ? `/hr/tips/history?${query}` : '/hr/tips/history',
    );
  }

  // ========== FOURNISSEURS / SUPPLIERS ==========

  async getSuppliers(): Promise<any[]> {
    return this.request<any[]>('GET', '/suppliers');
  }

  async createSupplier(data: any): Promise<any> {
    return this.request<any>('POST', '/suppliers', data);
  }

  async updateSupplier(id: string, data: any): Promise<any> {
    return this.request<any>('PUT', `/suppliers/${id}`, data);
  }

  async linkSupplierToProduct(supplierId: string, productId: string): Promise<any> {
    return this.request<any>('PUT', `/suppliers/${supplierId}/link-product/${productId}`);
  }

  // ========== INVENTAIRE / INVENTORY ==========

  async getBatchesByProductId(productId: string): Promise<any[]> {
    return this.request<any[]>('GET', INVENTORY_ENDPOINTS.BATCHES_BY_PRODUCT.replace(':productId', productId));
  }

  // ========== REPORTING / Z-REPORT (CASH CLOSING) ==========

  async getZReport(date: string, format: string = 'PDF'): Promise<any> {
    const params = new URLSearchParams({ date, format });
    return this.request<any>('GET', `${REPORT_ENDPOINTS.Z_REPORT}?${params.toString()}`);
  }

  async downloadZReportPdf(date: string): Promise<void> {
    const token = this.getToken();
    const tenantId = this.getTenantId();
    
    const response = await fetch(`${API_BASE_URL}${REPORT_ENDPOINTS.Z_REPORT_PDF}?date=${date}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId || '',
      },
    });

    if (!response.ok) throw new Error('Erreur lors du téléchargement du Z-Report');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `z-report-${date}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async downloadZReportCsv(date: string): Promise<void> {
    const token = this.getToken();
    const tenantId = this.getTenantId();
    
    const response = await fetch(`${API_BASE_URL}${REPORT_ENDPOINTS.Z_REPORT}?date=${date}&format=CSV`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId || '',
      },
    });

    if (!response.ok) throw new Error('Erreur lors du téléchargement du CSV');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `z-report-${date}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // ========== CONFIGURATION BUSINESS ==========

  async getBusinessSettings(type: string): Promise<any> {
    return this.request<any>('GET', `/settings/business/${type.toLowerCase()}`);
  }

  async updateBusinessSettings(type: string, data: any): Promise<any> {
    return this.request<any>('PUT', `/settings/business/${type.toLowerCase()}`, data);
  }

  async getZReportHistory(): Promise<any[]> {
    return this.request<any[]>('GET', '/reports/z-report/history');
  }

  // ========== COMPTABILITÉ / ACCOUNTING (OHADA) ==========

  async getAccountingBalance(startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    return this.request<any>('GET', `${ACCOUNTING_ENDPOINTS.BALANCE}?${params.toString()}`);
  }

  async getAccountingPnL(startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    return this.request<any>('GET', `${ACCOUNTING_ENDPOINTS.PNL}?${params.toString()}`);
  }

  // Journal OHADA (écritures comptables)
  async getAccountingJournal(start?: string, end?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (start) params.set('start', start);
    if (end) params.set('end', end);
    const query = params.toString();
    return this.request<any[]>('GET', query ? `/accounting/journal?${query}` : '/accounting/journal');
  }

  async exportAccountingToExcel(type: 'pnl' | 'balance', startDate?: string, endDate?: string): Promise<void> {
    const token = this.getToken();
    const tenantId = this.getTenantId();
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    
    const url = type === 'pnl' ? `${ACCOUNTING_ENDPOINTS.PNL}/export` : `${ACCOUNTING_ENDPOINTS.BALANCE}/export`;
    const response = await fetch(`${API_BASE_URL}${url}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId || '',
      },
    });

    if (!response.ok) throw new Error('Erreur lors de l\'export Excel');

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `export-${type}-${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
  }

  // ========== MÉTHODES UTILITAIRES ==========

  logout() {

    this.clearToken();
    this.clearTenantId();
    localStorage.removeItem('auth_user');
    console.log('Déconnexion: token et tenantId supprimés');
  }

  /**
   * Vérifie si l'utilisateur est authentifié ET a un tenantId
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getTenantId();
  }

  /**
   * Récupère le tenantId actuel (pour débogage)
   */
  getCurrentTenantId(): string | null {
    return this.getTenantId();
  }

  /**
   * Rafraîchit manuellement le tenantId depuis le profil
   */
  async refreshTenantId(): Promise<boolean> {
    return this.fetchAndSetTenantId();
  }
}

export const authService = new AuthService();