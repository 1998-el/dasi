import React from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/DashboardLayout'
import { AlertTriangle } from 'lucide-react'

export function UnauthorizedPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-700 flex items-start gap-3 max-w-xl">
          <AlertTriangle className="h-6 w-6 mt-0.5" />
          <div>
            <h1 className="text-lg font-bold">Accès refusé</h1>
            <p className="text-sm mt-1 text-red-700/90">
              Votre compte ne dispose pas des permissions nécessaires pour afficher cette page.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <Link to="/dashboard" className="text-sm font-bold text-[#636366] hover:text-[#48484A]">
            Retour au dashboard
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}

