import type { BusinessType } from '@/context/business'
import type { UserRole } from '@/types/restaurant'

export type FrontendPermissionKey =
  | 'can_scan_product'
  | 'can_checkout_retail'
  | 'can_view_retail_history'
  | 'can_manage_products'
  | 'can_view_products'
  | 'can_view_stock_alerts'
  | 'can_view_catalog_stats'
  | 'can_manage_orders'
  | 'can_view_orders'
  | 'can_validate_order'
  | 'can_prepare_order'
  | 'can_mark_order_ready'
  | 'can_serve_order'
  | 'can_cancel_order'
  | 'can_edit_order_items'
  | 'can_manage_sales'
  | 'can_view_sales'
  | 'can_create_sale'
  | 'can_record_sale_payment'
  | 'can_add_items_to_order'
  | 'can_print_invoice'
  | 'can_manage_payments'
  | 'can_list_payments'
  | 'can_register_payment'
  | 'can_verify_payment'
  | 'can_force_validate_payment'
  | 'can_refund_payment'
  | 'can_return_items_to_stock'
  | 'can_view_customer_payments'
  | 'can_view_payment_report'
  | 'can_close_day'
  | 'can_view_reports'
  | 'can_manage_tickets'
  | 'can_view_tickets'
  | 'can_view_ticket_stats'
  | 'can_view_ticket_detail'
  | 'can_reprint_ticket'
  | 'can_generate_ticket'
  | 'can_export_ticket_pdf'
  | 'can_create_customer'
  | 'can_view_customers'
  | 'can_view_customer_detail'
  | 'can_access_super_admin_panel'
  | 'can_view_tables'
  | 'can_manage_tables'
  | 'can_view_accounting_balance'
  | 'can_export_accounting_balance'
  | 'can_view_pnl'
  | 'can_export_pnl'
  | 'can_generate_z_report'
  | 'can_view_z_history'
  | 'can_download_z_report_pdf'
  
// SUPER_ADMIN intentionally excluded from UI guards (as requested)

export interface PermissionContextPayload {
  role: UserRole
  businessType: BusinessType
  subscriptionStatus?: string
  isActive?: boolean
}

const normalizeRole = (r: string | undefined | null): string => (r ?? '').toLowerCase()

const toUserRoles = (role: UserRole): UserRole => role

/**
 * Map businessType/role/subscriptionStatus/isActive to derived UI permissions.
 * Backend also enforces subscription/tenant active globally; here we keep it UI-only.
 */
export function buildFrontendPermissionMap(payload: PermissionContextPayload): Record<FrontendPermissionKey, boolean> {
  const role = normalizeRole(payload.role)
  const businessType = payload.businessType

  const roleAllows = (allowed: UserRole[]): boolean => allowed.some((r) => normalizeRole(r) === role)

  const commonTenant = true // FE relies on backend for tenant isolation

  const can_scan_product = businessType === 'RETAIL' && roleAllows(['admin', 'manager', 'waiter', 'kitchen', 'staff'] as any)
  const can_checkout_retail = businessType === 'RETAIL' && roleAllows(['admin', 'manager', 'cashier', 'waiter', 'staff'] as any)
  const can_view_retail_history = businessType === 'RETAIL' && roleAllows(['admin', 'manager', 'waiter', 'cashier', 'staff'] as any)

  // Restaurant module defaults (from provided matrix)
  const can_manage_products = commonTenant && roleAllows(['admin', 'manager'])
  const can_view_products = commonTenant && roleAllows(['admin', 'manager', 'waiter', 'kitchen'] as any)
  const can_view_stock_alerts = commonTenant && roleAllows(['admin', 'manager'])
  const can_view_catalog_stats = commonTenant && roleAllows(['admin', 'manager'])

  const can_manage_orders = roleAllows(['admin', 'manager', 'waiter', 'kitchen', 'cashier'] as any)
  const can_view_orders = roleAllows(['admin', 'manager', 'waiter', 'kitchen', 'cashier'] as any)
  const can_validate_order = roleAllows(['admin', 'manager', 'waiter', 'cashier', 'kitchen'] as any)
  const can_prepare_order = roleAllows(['admin', 'manager'])
  const can_mark_order_ready = roleAllows(['admin', 'manager'])
  const can_serve_order = roleAllows(['admin', 'manager', 'waiter'] as any)
  const can_cancel_order = roleAllows(['admin', 'manager'])
  const can_edit_order_items = roleAllows(['admin', 'manager', 'waiter', 'cashier'] as any)

  const can_manage_sales = roleAllows(['admin', 'manager', 'cashier'] as any)
  const can_view_sales = roleAllows(['admin', 'manager', 'cashier'] as any)
  const can_create_sale = roleAllows(['admin', 'manager', 'cashier'] as any)
  const can_record_sale_payment = roleAllows(['admin', 'manager', 'cashier'] as any)
  const can_add_items_to_order = roleAllows(['admin', 'manager', 'cashier', 'waiter'] as any)
  const can_print_invoice = roleAllows(['admin', 'manager', 'cashier'] as any)

  const can_manage_payments = roleAllows(['admin', 'manager', 'cashier'] as any)
  const can_list_payments = roleAllows(['admin', 'manager', 'cashier'] as any)
  const can_register_payment = roleAllows(['admin', 'manager', 'cashier'] as any)
  const can_verify_payment = roleAllows(['admin', 'manager', 'cashier'] as any)
  const can_force_validate_payment = roleAllows(['admin', 'manager'] as any)
  const can_refund_payment = roleAllows(['admin', 'manager', 'cashier'] as any)
  const can_return_items_to_stock = roleAllows(['admin', 'manager'] as any)
  const can_view_customer_payments = roleAllows(['admin', 'manager', 'cashier'] as any)
  const can_view_payment_report = roleAllows(['admin', 'manager'] as any)
  const can_close_day = roleAllows(['admin', 'manager'] as any)

  const can_view_reports = roleAllows(['admin', 'manager'] as any)

  const can_manage_tickets = roleAllows(['admin', 'manager', 'cashier'] as any)
  const can_view_tickets = roleAllows(['admin', 'manager', 'cashier'] as any)
  const can_view_ticket_stats = roleAllows(['admin', 'manager'] as any)
  const can_view_ticket_detail = roleAllows(['admin', 'manager', 'cashier'] as any)
  const can_reprint_ticket = roleAllows(['admin', 'manager', 'cashier'] as any)
  const can_generate_ticket = roleAllows(['admin', 'manager', 'cashier'] as any)
  const can_export_ticket_pdf = roleAllows(['admin', 'manager', 'cashier'] as any)

  const can_create_customer = roleAllows(['admin', 'manager', 'cashier'] as any)
  const can_view_customers = roleAllows(['admin', 'manager', 'cashier', 'waiter'] as any)
  const can_view_customer_detail = roleAllows(['admin', 'manager', 'cashier'] as any)

  const can_view_tables = businessType === 'RESTAURANT' && roleAllows(['admin', 'manager', 'waiter', 'kitchen'] as any)
  const can_manage_tables = businessType === 'RESTAURANT' && roleAllows(['admin', 'manager'] as any)

  const can_view_accounting_balance = roleAllows(['admin', 'manager'] as any)
  const can_export_accounting_balance = roleAllows(['admin', 'manager'] as any)
  const can_view_pnl = roleAllows(['admin', 'manager'] as any)
  const can_export_pnl = roleAllows(['admin', 'manager'] as any)

  const can_generate_z_report = roleAllows(['admin', 'manager'] as any)
  const can_view_z_history = roleAllows(['admin', 'manager'] as any)
  const can_download_z_report_pdf = roleAllows(['admin', 'manager'] as any)

  const can_access_super_admin_panel = false

  return {
    can_scan_product,
    can_checkout_retail,
    can_view_retail_history,

    can_manage_products,
    can_view_products,
    can_view_stock_alerts,
    can_view_catalog_stats,

    can_manage_orders,
    can_view_orders,
    can_validate_order,
    can_prepare_order,
    can_mark_order_ready,
    can_serve_order,
    can_cancel_order,
    can_edit_order_items,

    can_manage_sales,
    can_view_sales,
    can_create_sale,
    can_record_sale_payment,
    can_add_items_to_order,
    can_print_invoice,

    can_manage_payments,
    can_list_payments,
    can_register_payment,
    can_verify_payment,
    can_force_validate_payment,
    can_refund_payment,
    can_return_items_to_stock,
    can_view_customer_payments,
    can_view_payment_report,
    can_close_day,

    can_view_reports,

    can_manage_tickets,
    can_view_tickets,
    can_view_ticket_stats,
    can_view_ticket_detail,
    can_reprint_ticket,
    can_generate_ticket,
    can_export_ticket_pdf,

    can_create_customer,
    can_view_customers,
    can_view_customer_detail,

    can_access_super_admin_panel,

    can_view_tables,
    can_manage_tables,

    can_view_accounting_balance,
    can_export_accounting_balance,
    can_view_pnl,
    can_export_pnl,

    can_generate_z_report,
    can_view_z_history,
    can_download_z_report_pdf,
  }
}

