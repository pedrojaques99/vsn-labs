'use client'

import { TextButton } from '@/components/shared'

interface AuthDialogProps {
  isOpen: boolean
  onHandleLogin: () => void
  onClose: () => void
}

export default function AuthDialog({
  isOpen,
  onHandleLogin,
  onClose
}: AuthDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-theme-static rounded-sm p-6 max-w-md w-full mx-4 text-center">
        <h3 className="text-lg font-mono mb-4 text-[var(--theme-text)]">Login Required</h3>
        <p className="text-[var(--theme-text-secondary)] mb-6">Login to save and like mixes</p>
        <div className="flex gap-2">
          <TextButton
            onClick={onHandleLogin}
            variant="primary"
            size="medium"
            fullWidth
          >
            Login
          </TextButton>
          <TextButton
            onClick={onClose}
            variant="secondary"
            size="medium"
          >
            Cancel
          </TextButton>
        </div>
      </div>
    </div>
  )
}
