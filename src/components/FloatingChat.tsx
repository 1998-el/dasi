import React, { useState } from 'react'
import { MessageSquare, X, Send, Headset } from 'lucide-react'
import { cn } from '../lib/utils'
import { Button } from './ui/button'
import { Input } from './ui/input'

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [chatLog, setChatLog] = useState([
    { id: 1, role: 'assistant', text: "Bonjour ! Je suis l'assistant Maat School. Comment puis-je vous aider ?", time: new Date() }
  ])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const newUserMsg = { id: Date.now(), role: 'user', text: message, time: new Date() }
    setChatLog(prev => [...prev, newUserMsg])
    setMessage('')

    // Simulation d'une réponse automatique
    setTimeout(() => {
      setChatLog(prev => [...prev, { 
        id: Date.now() + 1, 
        role: 'assistant', 
        text: 'Votre demande a été transmise au support technique. Un agent reviendra vers vous sous peu.', 
        time: new Date() 
      }])
    }, 1500)
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Fenêtre de Chat */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-sm border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-orange-600 flex items-center justify-center border border-orange-500/50">
                <Headset className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold leading-none tracking-tight">Support Maat School</p>
                <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-bold uppercase tracking-widest">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Agent en ligne
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Corps du Chat */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {chatLog.map((msg) => (
              <div key={msg.id} className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
                <div className={cn(
                  "max-w-[85%] p-3 rounded-sm text-xs font-medium shadow-sm",
                  msg.role === 'user' 
                    ? "bg-orange-600 text-white rounded-tr-none" 
                    : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                )}>
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">
                  {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-white flex gap-2 items-center">
            <Input 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tapez votre message..." 
              className="flex-1 h-9 rounded-sm text-xs border-slate-200 focus-visible:ring-orange-500/20 bg-slate-50/50"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!message.trim()}
              className="bg-orange-600 hover:bg-orange-700 h-9 w-9 shrink-0 rounded-sm shadow-sm active:scale-95 transition-transform"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      )}

      {/* Bouton Flottant Principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 w-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-500 hover:scale-105 active:scale-90",
          isOpen 
            ? "bg-slate-900 text-white rotate-90" 
            : "bg-orange-600 text-white hover:bg-orange-700"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-500 border-2 border-slate-50 rounded-full flex items-center justify-center text-[10px] font-bold ">
            1
          </span>
        )}
      </button>
    </div>
  )
}