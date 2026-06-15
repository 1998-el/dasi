import React from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface DeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
  itemName?: string
  isLoading?: boolean
  confirmText?: string
}

export function DeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmer la suppression",
  description = "Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.",
  itemName,
  isLoading = false,
  confirmText = "Supprimer"
}: DeleteDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-sm border border-slate-200 p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-50 rounded-full shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              {description} {itemName && <span className="font-bold text-slate-700">"{itemName}"</span>}
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2 min-w-[120px]"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}