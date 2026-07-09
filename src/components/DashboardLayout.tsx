import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { FloatingChat } from './FloatingChat'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const toggleSidebar = () => setIsCollapsed(prev => !prev)
  const toggleChat = () => setIsChatOpen(prev => !prev)

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar toggleSidebar={toggleSidebar} toggleChat={toggleChat} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
      <FloatingChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} onToggle={toggleChat} />
    </div>
  )
}