'use client'

import { ReactNode, useState } from 'react'

interface PresetButtonProps {
  onClick: () => void
  icon?: ReactNode
  children: ReactNode
  variant?: 'icon' | 'text'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  className?: string
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragEnd?: (e: React.DragEvent) => void
}

export default function PresetButton({ 
  onClick, 
  icon,
  children, 
  variant = 'text',
  size = 'medium',
  disabled = false,
  className = '',
  draggable = false,
  onDragStart,
  onDragEnd
}: PresetButtonProps) {
  const [isDragging, setIsDragging] = useState(false)

  const sizeConfig = {
    small: {
      container: 'min-w-12 h-12 px-2',
      text: 'text-[9px]',
      icon: 'text-sm'
    },
    medium: {
      container: 'min-w-16 h-16 px-3',
      text: 'text-[10px]',
      icon: 'text-lg'
    },
    large: {
      container: 'min-w-20 h-20 px-4',
      text: 'text-xs',
      icon: 'text-xl'
    }
  }

  const config = sizeConfig[size]

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    onDragStart?.(e)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false)
    onDragEnd?.(e)
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`
        flex flex-col items-center justify-center
        ${config.container}
        glass-theme rounded-sm
        hover:bg-[var(--theme-glass-hover)] hover:border-[var(--theme-accent)]/40
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        disabled:hover:bg-[var(--theme-glass-bg)] disabled:hover:border-[var(--theme-glass-border)]
        group
        ${draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
        ${isDragging 
          ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)]/20 scale-95 shadow-lg shadow-[var(--theme-accent)]/30' 
          : 'border-[var(--theme-glass-border)]'
        }
        ${className}
      `}
    >
      {variant === 'icon' && icon && (
        <div className={`${config.icon} text-[var(--theme-text-secondary)] group-hover:text-[var(--theme-text)] transition-colors duration-200 mb-1`}>
          {icon}
        </div>
      )}
      
      <div className={`${config.text} text-center leading-tight font-mono text-[var(--theme-text)] group-hover:text-[var(--theme-text)] transition-colors duration-200`}>
        {children}
      </div>
    </button>
  )
}
