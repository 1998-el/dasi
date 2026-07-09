import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Headset, Loader2, Check, CheckCheck } from 'lucide-react'
import { cn } from '../lib/utils'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useAuth } from '../context/AuthContext'
import { db } from '../lib/firebase'
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  Timestamp,
  doc,
  setDoc
} from 'firebase/firestore'

interface FloatingChatProps {
  isOpen: boolean
  onClose: () => void
  onToggle: () => void
}

export function FloatingChat({ isOpen, onClose, onToggle }: FloatingChatProps) {
  const { user, tenantId } = useAuth()
  const [message, setMessage] = useState('')
  const [chatLog, setChatLog] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [optimisticMessages, setOptimisticMessages] = useState<any[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen || !tenantId) return

    setIsLoading(true)
    const messagesCollection = collection(db, 'conversations', tenantId, 'messages')
    const q = query(messagesCollection, orderBy('createdAt', 'asc'))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages: any[] = []
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() })
      })
      
      if (messages.length === 0) {
        messages.push({
          id: 'initial',
          role: 'assistant',
          content: "Bonjour ! Je suis l'assistant Maatics. Comment puis-je vous aider ?",
          createdAt: new Timestamp(new Date().getTime() / 1000, 0)
        })
      }

      setChatLog(messages)
      setIsLoading(false)
    }, (error) => {
      console.error("Erreur de chargement du chat:", error)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [isOpen, tenantId])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatLog, optimisticMessages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isSending) return
    if (!tenantId || !user?.id) return

    const messageContent = message.trim()
    setMessage('')
    setIsSending(true)

    // ===== OPTIMISTIC UPDATE (style Apple) =====
    const tempId = `temp-${Date.now()}`
    const optimisticMsg = {
      id: tempId,
      senderId: user.id,
      senderName: user.name,
      content: messageContent,
      type: 'TEXT',
      isRead: false,
      isOptimistic: true,
      createdAt: new Timestamp(Date.now() / 1000, 0),
      status: 'sending'
    }

    setOptimisticMessages(prev => [...prev, optimisticMsg])

    try {
      // 1. Créer/update la conversation
      const convRef = doc(db, 'conversations', tenantId);
      await setDoc(convRef, {
        userId: user.id,
        participants: [user.id],
        lastMessage: messageContent,
        lastMessageAt: serverTimestamp(),
        status: 'OPEN',
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // 2. Ajouter le message
      const messagesCollection = collection(db, 'conversations', tenantId, 'messages');
      const docRef = await addDoc(messagesCollection, {
        conversationId: tenantId,
        senderId: user.id,
        senderName: user.name,
        senderRole: 'USER',
        content: messageContent,
        type: 'TEXT',
        isRead: false,
        createdAt: serverTimestamp()
      });

      // 3. Mettre à jour le message optimiste avec l'ID réel
      setOptimisticMessages(prev => 
        prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, id: docRef.id, isOptimistic: false, status: 'sent' }
            : msg
        )
      )

      // 4. Animation de confirmation (style Apple)
      setTimeout(() => {
        setOptimisticMessages(prev => 
          prev.map(msg => 
            msg.id === docRef.id 
              ? { ...msg, status: 'delivered' }
              : msg
          )
        )
      }, 500)

      setTimeout(() => {
        setOptimisticMessages(prev => 
          prev.map(msg => 
            msg.id === docRef.id 
              ? { ...msg, status: 'read' }
              : msg
          )
        )
      }, 1000)

    } catch (error) {
      console.error("Erreur d'envoi du message:", error);
      setOptimisticMessages(prev => 
        prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, status: 'error' }
            : msg
        )
      )
    } finally {
      setIsSending(false)
    }
  }

  // Fusionner les messages réels et optimistes
  const allMessages = [...chatLog, ...optimisticMessages]
    .sort((a, b) => {
      const timeA = a.createdAt?.seconds || a.createdAt?.toDate?.()?.getTime() || 0
      const timeB = b.createdAt?.seconds || b.createdAt?.toDate?.()?.getTime() || 0
      return timeA - timeB
    })
    // Éviter les doublons (un message réel peut remplacer un optimiste)
    .filter((msg, index, self) => 
      index === self.findIndex(m => m.id === msg.id)
    )

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Fenêtre de Chat */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-[var(--color-primary-white)] rounded-2xl border border-[var(--color-secondary-border)] shadow-2xl shadow-blue-500/10 flex flex-col overflow-hidden animate-fade-in">
          
          {/* ===== HEADER ===== */}
          <div className="p-4 bg-[var(--color-primary-blue)] text-[var(--color-primary-white)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-[var(--color-orange-400)] flex items-center justify-center shadow-md shadow-blue-500/30">
                <Headset className="h-5 w-5 text-[var(--color-primary-white)]" />
              </div>
              <div>
                <p className="text-xs font-bold leading-none tracking-tight">Support Maatics</p>
                <p className="text-[10px] text-blue-200 mt-1 flex items-center gap-1 font-bold uppercase tracking-widest">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Agent en ligne
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-1 hover:bg-white/20 rounded-full text-white/70 hover:text-[var(--color-primary-white)] transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ===== CORPS ===== */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--color-secondary-light)]">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 text-[var(--color-primary-blue)] animate-spin" />
              </div>
            ) : (
              allMessages.map((msg) => {
                const isUserMessage = msg.senderId === user?.id || msg.isOptimistic
                const isOptimistic = msg.isOptimistic
                const status = msg.status || 'sent'
                
                return (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "flex flex-col",
                      isUserMessage ? "items-end" : "items-start",
                      // Animation style Apple
                      isOptimistic && "animate-in fade-in slide-in-from-bottom-2 duration-300"
                    )}
                  >
                    <div className={cn(
                      "max-w-[85%] p-3 rounded-2xl text-xs font-medium shadow-sm transition-all relative",
                      isUserMessage
                        ? "bg-[var(--color-primary-blue)] text-[var(--color-primary-white)] rounded-br-none shadow-blue-500/20" 
                        : "bg-[var(--color-primary-white)] text-[var(--color-primary-black)] border border-[var(--color-secondary-border)] rounded-bl-none shadow-md"
                    )}>
                      {msg.content || msg.text}
                      
                      {/* Indicateur de statut style Apple */}
                      {isUserMessage && (
                        <div className="absolute -bottom-4 right-1 flex items-center gap-0.5">
                          {status === 'sending' && (
                            <div className="flex items-center gap-1">
                              <div className="h-1.5 w-1.5 rounded-full bg-white/40 animate-pulse" />
                              <div className="h-1.5 w-1.5 rounded-full bg-white/40 animate-pulse delay-150" />
                              <div className="h-1.5 w-1.5 rounded-full bg-white/40 animate-pulse delay-300" />
                            </div>
                          )}
                          {status === 'sent' && (
                            <Check className="h-3 w-3 text-white/60" />
                          )}
                          {status === 'delivered' && (
                            <CheckCheck className="h-3 w-3 text-white/80" />
                          )}
                          {status === 'read' && (
                            <CheckCheck className="h-3 w-3 text-emerald-300" />
                          )}
                          {status === 'error' && (
                            <span className="text-[8px] text-red-300 font-medium">Non envoyé</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <span className="text-[9px] text-[var(--color-secondary-gray)] mt-1 px-1">
                      {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* ===== INPUT ===== */}
          <form onSubmit={handleSend} className="p-3 border-t border-[var(--color-secondary-border)] bg-[var(--color-primary-white)] flex gap-2 items-center">
            <Input 
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tapez votre message..." 
              disabled={isSending}
              className="flex-1 h-9 rounded-full text-xs border-[var(--color-secondary-border)] focus-visible:ring-[var(--color-primary-blue)]/30 bg-[var(--color-secondary-light)] placeholder:text-[var(--color-secondary-gray)] disabled:opacity-50 transition-opacity"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!message.trim() || isSending}
              className={cn(
                "bg-[var(--color-primary-blue)] hover:bg-[var(--color-orange-700)] h-9 w-9 shrink-0 rounded-full shadow-md shadow-blue-500/30 transition-all duration-200",
                isSending && "opacity-70 scale-95"
              )}
            >
              {isSending ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              )}
            </Button>
          </form>
        </div>
      )}

      {/* ===== BOUTON FLOTTANT ===== */}
      <button
        onClick={onToggle}
        className={cn(
          "h-14 w-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-500 hover:scale-105 active:scale-90",
          isOpen 
            ? "bg-[var(--color-primary-black)] text-[var(--color-primary-white)] rotate-90 shadow-black/30" 
            : "bg-[var(--color-primary-blue)] text-[var(--color-primary-white)] hover:bg-[var(--color-orange-700)] shadow-blue-500/40"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-[var(--color-orange-400)] border-2 border-[var(--color-primary-white)] rounded-full flex items-center justify-center text-[10px] font-bold text-[var(--color-primary-white)]">
            1
          </span>
        )}
      </button>
    </div>
  )
}