import React from 'react'

export function PayrollPage({ globalSearch }: { globalSearch: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-sm p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Paie</h2>
          <p className="text-sm text-slate-500">Calcul, génération et validation des périodes de paie.</p>
        </div>
        <div className="text-xs font-bold text-slate-400">Recherche: {globalSearch || '—'}</div>
      </div>

      <div className="mt-6 rounded-sm border border-slate-100 bg-slate-50/40 p-4 text-sm text-slate-600">
        UI en cours de branchement sur le backend HR: <b>GET</b> /hr/payroll?period=YYYY-MM, <b>POST</b> /hr/payroll/process/:period...
      </div>
    </div>
  )
}

