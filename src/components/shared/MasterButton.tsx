'use client'

import { ReactNode } from 'react'

interface MasterButtonProps {
  onClick: () => void
  icon: ReactNode
  title: string
  variant?: 'default' | 'danger' | 'success' | 'warning'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  className?: string
  onMouseDown?: (e: React.MouseEvent) => void
}

export default function MasterButton({ 
  onClick, 
  icon, 
  title, 
  variant = 'default',
  size = 'medium',
  disabled = false,
  className = '',
  onMouseDown
}: MasterButtonProps) {
  const sizeConfig = {
    small: {
      container: 'w-6 h-6 sm:w-8 sm:h-8',
      icon: 'text-xs sm:text-sm'
    },
    medium: {
      container: 'w-8 h-8 sm:w-12 sm:h-12',
      icon: 'text-sm sm:text-lg'
    },
    large: {
      container: 'w-10 h-10 sm:w-16 sm:h-16',
      icon: 'text-base sm:text-xl'
    }
  }

  const variantConfig = {
    default: {
      base: 'bg-[var(--theme-glass-bg)] border-[var(--theme-glass-border)]',
      hover: 'hover:bg-[var(--theme-glass-hover)] hover:border-[var(--theme-accent)]',
      icon: 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent)]'
    },
    danger: {
      base: 'bg-red-500/10 border-red-500/30',
      hover: 'hover:bg-red-500/20 hover:border-red-500/50',
      icon: 'text-red-400 hover:text-red-300'
    },
    success: {
      base: 'bg-[var(--theme-accent)]/20 border-[var(--theme-accent)]/40',
      hover: 'hover:bg-[var(--theme-accent)]/30 hover:border-[var(--theme-accent)]/60',
      icon: 'text-[var(--theme-accent)]'
    },
    warning: {
      base: 'bg-yellow-500/10 border-yellow-500/30',
      hover: 'hover:bg-yellow-500/20 hover:border-yellow-500/50',
      icon: 'text-yellow-400 hover:text-yellow-300'
    }
  }

  const config = sizeConfig[size]
  const variantStyles = variantConfig[variant]

  return (
    <button
      onClick={onClick}
      onMouseDown={onMouseDown}
      disabled={disabled}
      className={`
        flex items-center justify-center 
        ${config.container}
        border rounded-sm
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        disabled:hover:bg-white/5 disabled:hover:border-white/20
        cursor-pointer
        ${variantStyles.base}
        ${variantStyles.hover}
        ${className}
      `}
      title={title}
    >
      <div className={`${config.icon} ${variantStyles.icon} transition-colors duration-200`}>
        {icon}
      </div>
    </button>
  )
}
