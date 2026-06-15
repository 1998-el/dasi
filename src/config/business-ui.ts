import type { BusinessType } from '../context/business'
import { BUSINESS_CONFIGS } from '../context/business'
import type { LucideIcon } from 'lucide-react'
import { LayoutDashboard, ShoppingCart, CreditCard, Ticket, Table2, Package, Truck, Wallet, UserPlus, Users, Settings } from 'lucide-react'

export type SidebarItemKey =
  | 'dashboard'
  | 'orders'
  | 'payments'
  | 'tickets'
  | 'tables'
  | 'products'
  | 'inventory'
  | 'suppliers'
  | 'finance'
  | 'members'
  | 'hr'
  | 'settings'

export interface SidebarItem {
  key: SidebarItemKey
  path: string
  icon: LucideIcon
  /** label clé i18n (optionnel) */
  i18nKey?: string
  /** permet de filtrer par vertical */
  businessTypes: BusinessType[]
}

const ICONS = {
  LayoutDashboard,
  ShoppingCart,
  CreditCard,
  Ticket,
  Table2,
  Package,
  Truck,
  Wallet,
  UserPlus,
  Users,
  Settings,
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    key: 'dashboard',
    path: '/dashboard',
    icon: ICONS.LayoutDashboard,
    i18nKey: 'sidebar.dashboard',
    businessTypes: ['RESTAURANT', 'RETAIL', 'PHARMACY'],
  },
  {
    key: 'orders',
    path: '/orders',
    icon: ICONS.ShoppingCart,
    i18nKey: 'sidebar.orders',
    businessTypes: ['RESTAURANT', 'RETAIL', 'PHARMACY'],
  },
  {
    key: 'payments',
    path: '/payments',
    icon: ICONS.CreditCard,
    i18nKey: 'sidebar.payments',
    businessTypes: ['RESTAURANT', 'RETAIL', 'PHARMACY'],
  },
  {
    key: 'tickets',
    path: '/tickets',
    icon: ICONS.Ticket,
    i18nKey: 'sidebar.tickets',
    businessTypes: ['RESTAURANT', 'RETAIL', 'PHARMACY'],
  },
  {
    key: 'tables',
    path: '/tables',
    icon: ICONS.Table2,
    i18nKey: 'sidebar.tables',
    businessTypes: ['RESTAURANT'],
  },
  {
    key: 'products',
    path: '/products',
    icon: ICONS.Package,
    i18nKey: 'sidebar.products',
    businessTypes: ['RESTAURANT', 'RETAIL', 'PHARMACY'],
  },
  {
    key: 'inventory',
    path: '/inventory',
    icon: ICONS.Package,
    i18nKey: 'sidebar.inventory',
    businessTypes: ['RESTAURANT', 'RETAIL', 'PHARMACY'],
  },
  {
    key: 'suppliers',
    path: '/suppliers',
    icon: ICONS.Truck,
    i18nKey: 'sidebar.suppliers',
    businessTypes: ['RESTAURANT', 'RETAIL', 'PHARMACY'],
  },
  {
    key: 'finance',
    path: '/finance',
    icon: ICONS.Wallet,
    i18nKey: 'sidebar.finance',
    businessTypes: ['RETAIL', 'PHARMACY', 'RESTAURANT'],
  },
  {
    key: 'members',
    path: '/members',
    icon: ICONS.UserPlus,
    i18nKey: 'sidebar.members',
    businessTypes: ['RESTAURANT', 'RETAIL', 'PHARMACY'],
  },
  {
    key: 'hr',
    path: '/hr',
    icon: ICONS.Users,
    i18nKey: 'sidebar.hr',
    businessTypes: ['RESTAURANT', 'RETAIL', 'PHARMACY'],
  },
]

export function getSidebarItems(businessType: BusinessType): SidebarItem[] {
  // Respect fallback
  const config = BUSINESS_CONFIGS[businessType] ?? BUSINESS_CONFIGS.RESTAURANT
  return SIDEBAR_ITEMS.filter((it) => it.businessTypes.includes(config.type))
}

