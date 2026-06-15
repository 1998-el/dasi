import React, { useMemo, useState } from 'react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { cn } from '../../lib/utils'
import {
  Building2,
  CalendarDays,
  CreditCard,
  Gauge,
  Users,
  Search,
  Sparkles,
} from 'lucide-react'

import { useRequireRole, useAuth } from '../../context/AuthContext'

import { EmployeesPage } from './EmployeesPage'
import { LeavePage } from './LeavePage'
import { PayrollPage } from './PayrollPage'
import { ShiftsPage } from './ShiftsPage'
import { TipsPage } from './TipsPage'

export type HrTabKey = 'employees' | 'leave' | 'payroll' | 'shifts' | 'tips'

const TABS: Array<{ key: HrTabKey; label: string; icon: React.ComponentType<any> }> = [
  { key: 'employees', label: 'Employés', icon: Users },
  { key: 'leave', label: 'Congés', icon: CalendarDays },
  { key: 'payroll', label: 'Paie', icon: CreditCard },
  { key: 'shifts', label: 'Planning', icon: Gauge },
  { key: 'tips', label: 'Tips', icon: Sparkles },

]

export function HrPage() {
  const { user } = useAuth()

  // Les rôles exacts côté backend ne sont pas typés ici: on autorise admin/manager/super_admin
  // (ajuster plus tard si besoin en fonction de UserRole backend)
  useRequireRole(['admin', 'manager', 'super_admin'] as any, '/unauthorized')

  const [activeTab, setActiveTab] = useState<HrTabKey>('employees')
  const [globalSearch, setGlobalSearch] = useState('')

  const TabIcon = useMemo(() => {
    const found = TABS.find((t) => t.key === activeTab)
    return found?.icon ?? Building2
  }, [activeTab])

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 border border-orange-100 rounded-sm text-orange-600">
              <TabIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ressources Humaines</h1>
              <p className="text-sm text-slate-500">Employés, congés, paie, planning et tips — en une interface.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Rechercher (nom, matricule, période)..."
              className="pl-9 w-72 h-9 rounded-sm border-slate-200 bg-white"
            />
          </div>

          {/* bouton contextuel: simple pour UX, les pages gèrent ensuite leurs drawers/modals */}
          <Button className="h-9 bg-orange-600 hover:bg-orange-700 text-white rounded-sm font-bold">
            Créer
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-sm p-2.5 mb-6">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => {
            const Icon = t.icon
            const isActive = t.key === activeTab
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-2 rounded-sm text-sm font-bold transition-colors',
                  isActive
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-slate-500')} />
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'employees' && <EmployeesPage globalSearch={globalSearch} />}
      {activeTab === 'leave' && <LeavePage globalSearch={globalSearch} />}
      {activeTab === 'payroll' && <PayrollPage globalSearch={globalSearch} />}
      {activeTab === 'shifts' && <ShiftsPage globalSearch={globalSearch} />}
      {activeTab === 'tips' && <TipsPage globalSearch={globalSearch} />}

      {/* Note: le contenu HR est progressivement branché sur les endpoints backend */}
    </DashboardLayout>
  )
}

