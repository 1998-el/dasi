import React from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { BrainCircuit } from 'lucide-react'
import { AiInsightsDisplay } from '../components/AiInsightsDisplay'

export function AIAnalysisPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
          <BrainCircuit className="h-8 w-8 text-orange-600" />
          Analyse & Prévisions IA
        </h1>
        <p className="text-sm text-slate-500 font-medium italic mt-1">Analyse des tendances et optimisation des ressources basée sur vos données historiques.</p>
      </div>
      <AiInsightsDisplay />
    </DashboardLayout>
  )
}