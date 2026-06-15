import React, { useState, useRef, useEffect } from 'react'
import { X, GripHorizontal, Save, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../lib/utils'

interface FloatingNoteProps {
  isOpen: boolean
  onClose: () => void
}

export function FloatingNote({ isOpen, onClose }: FloatingNoteProps) {
  const { t } = useTranslation()
  // Position initiale : en haut à droite, sous la topbar
  const [position, setPosition] = useState({ x: window.innerWidth - 300, y: 80 })
  const [isDragging, setIsDragging] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [note, setNote] = useState(localStorage.getItem('maat_user_note') || '')
  const noteRef = useRef<HTMLDivElement>(null)

  // Sauvegarde automatique à chaque modification
  useEffect(() => {
    localStorage.setItem('maat_user_note', note)
  }, [note])

  // Logique du Drag & Drop
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      
      let newX = e.clientX - offset.x
      let newY = e.clientY - offset.y
      
      // Contraintes pour éviter que la note ne sorte de l'écran (bords)
      const maxX = window.innerWidth - (noteRef.current?.offsetWidth || 256)
      const maxY = window.innerHeight - (noteRef.current?.offsetHeight || 256)
      
      newX = Math.max(0, Math.min(newX, maxX))
      newY = Math.max(0, Math.min(newY, maxY))
      
      setPosition({ x: newX, y: newY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, offset])

  const handleMouseDown = (e: React.MouseEvent) => {
    // On ne déclenche le drag que si on clique sur le header (poignée)
    const target = e.target as HTMLElement
    if (target.tagName === 'TEXTAREA' || target.closest('button')) return

    if (noteRef.current) {
      const rect = noteRef.current.getBoundingClientRect()
      setOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
      setIsDragging(true)
      e.preventDefault()
    }
  }

  const handleClear = () => {
    if (note && window.confirm(t('common.delete') + " ?")) {
      setNote('')
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={noteRef}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        zIndex: 9999 
      }}
      onMouseDown={handleMouseDown}
      className={cn(
        "fixed w-64 bg-amber-50 border border-amber-200 shadow-2xl rounded-sm flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200",
        isDragging ? "cursor-grabbing opacity-90 scale-[1.02] transition-transform" : "cursor-grab"
      )}
    >
      {/* Header acting as a drag handle */}
      <div className="bg-amber-100/80 backdrop-blur-sm px-3 py-2 flex items-center justify-between border-b border-amber-200">
        <div className="flex items-center gap-2">
          <GripHorizontal className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">Bloc-notes</span>
        </div>
        <button onClick={onClose} className="text-amber-500 hover:text-amber-700 p-0.5 rounded-full hover:bg-amber-200/50 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t('orders_page.add_modal.special_instructions')}
        className="w-full h-48 p-4 bg-transparent resize-none text-sm text-amber-900 placeholder:text-amber-300 focus:outline-none leading-relaxed select-text font-medium"
      />

      <div className="p-2 bg-amber-100/30 flex justify-between items-center border-t border-amber-200/50">
        <button onClick={handleClear} className="p-1.5 text-amber-400 hover:text-red-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
        <div className="flex items-center gap-1 opacity-40 italic text-[9px] text-amber-700 font-bold uppercase"><Save className="h-2.5 w-2.5" /> Auto-sync</div>
      </div>
    </div>
  )
}