import React from 'react'
import {
  Building2,
  CalendarDays,
  CreditCard,
  Gauge,
  Users,
  Sparkles,
} from 'lucide-react'

export const HR_TAB_ICONS: Record<string, React.ComponentType<any>> = {
  employees: Users,
  leave: CalendarDays,
  payroll: CreditCard,
  shifts: Gauge,
  tips: Sparkles,
}

export { Building2 }

