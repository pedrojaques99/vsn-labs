'use client'

import { ReactNode } from 'react'

interface TextButtonProps {
  onClick: () => void
  children: ReactNode
  icon?: ReactNode
  variant?: 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'secondary'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  fullWidth?: boolean
  className?: string
}

export default function TextButton({ 
  onClick, 
  children,
  icon,
  variant = 'default',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  className = ''
}: TextButtonProps) {
  const sizeConfig = {
    small: {
      padding: 'px-2 py-1 sm:px-3 sm:py-1.5',
      text: 'text-xs sm:text-sm',
      icon: 'text-xs sm:text-sm'
    },
    medium: {
      padding: 'px-3 py-1.5 sm:px-4 sm:py-2',
      text: 'text-xs sm:text-sm',
      icon: 'text-sm sm:text-base'
    },
    large: {
      padding: 'px-4 py-2 sm:px-6 sm:py-3',
      text: 'text-sm sm:text-base',
      icon: 'text-base sm:text-lg'
    }
  }

  const variantConfig = {
    default: {
      base: 'bg-black/40 border-white/20 text-white/80',
      hover: 'hover:bg-white/10 hover:border-white/30 hover:text-white',
      icon: 'text-white/60'
    },
    primary: {
      base: 'bg-cyan-500/20 border-cyan-400/40 text-cyan-400',
      hover: 'hover:bg-cyan-500/30 hover:border-cyan-400/60 hover:text-cyan-300',
      icon: 'text-cyan-400'
    },
    success: {
      base: 'bg-green-500/20 border-green-400/40 text-green-400',
      hover: 'hover:bg-green-500/30 hover:border-green-400/60 hover:text-green-300',
      icon: 'text-green-400'
    },
    danger: {
      base: 'bg-red-500/20 border-red-400/40 text-red-400',
      hover: 'hover:bg-red-500/30 hover:border-red-400/60 hover:text-red-300',
      icon: 'text-red-400'
    },
    warning: {
      base: 'bg-pink-500/20 border-pink-400/40 text-pink-400',
      hover: 'hover:bg-pink-500/30 hover:border-pink-400/60 hover:text-pink-300',
      icon: 'text-pink-400'
    },
    secondary: {
      base: 'bg-white/10 border-white/20 text-white/80',
      hover: 'hover:bg-white/20 hover:border-white/30 hover:text-white',
      icon: 'text-white/60'
    }
  }

  const config = sizeConfig[size]
  const variantStyles = variantConfig[variant]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center gap-2
        ${config.padding}
        ${variantStyles.base}
        ${variantStyles.hover}
        border rounded-sm
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        disabled:hover:bg-black/40 disabled:hover:border-white/20
        disabled:hover:text-white/80
        font-mono
        cursor-pointer
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {icon && (
        <div className={`${config.icon} ${variantStyles.icon} transition-colors duration-200`}>
          {icon}
        </div>
      )}
      <span className={`${config.text} transition-colors duration-200`}>
        {children}
      </span>
    </button>
  )
}
