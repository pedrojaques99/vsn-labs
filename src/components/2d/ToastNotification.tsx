'use client'

import { X } from 'lucide-react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  timeout?: NodeJS.Timeout
}

interface ToastNotificationProps {
  toasts: Toast[]
  onRemoveToast: (id: string) => void
}

export default function ToastNotification({ toasts, onRemoveToast }: ToastNotificationProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => onRemoveToast(toast.id)}
          className={`
            max-w-sm p-4 rounded-sm shadow-lg backdrop-blur-sm border transform transition-all duration-300 ease-in-out cursor-pointer
            ${toast.type === 'success' ? 'bg-green-500/20 border-green-400/40 text-green-100 hover:bg-green-500/30' : ''}
            ${toast.type === 'error' ? 'bg-red-500/20 border-red-400/40 text-red-100 hover:bg-red-500/30' : ''}
            ${toast.type === 'info' ? 'bg-[var(--theme-accent)]/20 border-[var(--theme-accent)]/40 text-[var(--theme-text)] hover:bg-[var(--theme-accent)]/30' : ''}
            animate-in slide-in-from-right-full fade-in
          `}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {toast.type === 'success' && (
                <div className="w-2 h-2 rounded-sm bg-green-400 animate-pulse"></div>
              )}
              {toast.type === 'error' && (
                <div className="w-2 h-2 rounded-sm bg-red-400 animate-pulse"></div>
              )}
              {toast.type === 'info' && (
                <div className="w-2 h-2 rounded-sm bg-blue-400 animate-pulse"></div>
              )}
              <span className="text-sm font-mono leading-relaxed">{toast.message}</span>
            </div>
            <button
              onClick={() => onRemoveToast(toast.id)}
              className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] transition-colors flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
