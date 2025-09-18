'use client'

import { useState, useEffect } from 'react'
import { VolumeX, Volume1, Volume2 } from 'lucide-react'
import MasterButton from './MasterButton'

interface VolumeSliderProps {
  value: number
  onChange: (value: number) => void
  size?: 'small' | 'medium' | 'large'
  showIcon?: boolean
  showValue?: boolean
  className?: string
  onMute?: () => void
}

export default function VolumeSlider({ 
  value, 
  onChange, 
  size = 'medium',
  showIcon = true,
  showValue = true,
  className = '',
  onMute
}: VolumeSliderProps) {
  const [previousVolume, setPreviousVolume] = useState(value)
  const [isMuted, setIsMuted] = useState(value === 0)
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(value.toString())
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartValue, setDragStartValue] = useState(0)

  // Sync mute state with value
  useEffect(() => {
    setIsMuted(value === 0)
  }, [value])

  // Update previous volume when not muted
  useEffect(() => {
    if (value > 0) {
      setPreviousVolume(value)
    }
  }, [value])

  // Sync input value with prop value
  useEffect(() => {
    if (!isEditing) {
      setInputValue(value.toString())
    }
  }, [value, isEditing])

  // No need to block page scroll - just handle wheel events on the slider
  
  const sizes = {
    small: { 
      icon: 'w-4 h-4', 
      slider: 'h-1', 
      width: 'w-16', 
      text: 'text-xs',
      iconSize: 12
    },
    medium: { 
      icon: 'w-5 h-5', 
      slider: 'h-1.5', 
      width: 'w-20', 
      text: 'text-sm',
      iconSize: 14
    },
    large: { 
      icon: 'w-6 h-6', 
      slider: 'h-2', 
      width: 'w-24', 
      text: 'text-base',
      iconSize: 16
    }
  }

  const config = sizes[size]

  const getVolumeIcon = (vol: number) => {
    if (isMuted || vol === 0) return <VolumeX size={config.iconSize} />
    if (vol < 50) return <Volume1 size={config.iconSize} />
    return <Volume2 size={config.iconSize} />
  }

  const handleMuteToggle = () => {
    if (isMuted) {
      // Unmute: restore previous volume
      onChange(previousVolume > 0 ? previousVolume : 50)
    } else {
      // Mute: save current volume and set to 0
      setPreviousVolume(value)
      onChange(0)
    }
    if (onMute) {
      onMute()
    }
  }

  const handleScroll = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? -2 : 2
    const newValue = Math.max(0, Math.min(100, value + delta))
    
    // Only prevent default if we're at the limits and trying to go further
    const isAtMin = value === 0 && delta < 0
    const isAtMax = value === 100 && delta > 0
    
    if (!isAtMin && !isAtMax) {
      e.preventDefault()
      e.stopPropagation()
      onChange(newValue)
    }
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setIsDragging(false)
  }

  const handleSliderMouseDown = () => {
    setIsDragging(true)
  }

  const handleSliderMouseUp = () => {
    setIsDragging(false)
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const numValue = parseInt(inputValue)
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
        onChange(numValue)
        setIsEditing(false)
      } else {
        setInputValue(value.toString())
        setIsEditing(false)
      }
    } else if (e.key === 'Escape') {
      setInputValue(value.toString())
      setIsEditing(false)
    }
  }

  const handleInputBlur = () => {
    const numValue = parseInt(inputValue)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      onChange(numValue)
    } else {
      setInputValue(value.toString())
    }
    setIsEditing(false)
  }

  const handleVolumeIconMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    setDragStartX(e.clientX)
    setDragStartValue(value)
  }

  const handleVolumeIconMouseMove = (e: MouseEvent) => {
    if (!isResizing) return
    
    const deltaX = e.clientX - dragStartX
    const sensitivity = 2 // Pixels per volume unit
    const deltaValue = Math.round(deltaX / sensitivity)
    const newValue = Math.max(0, Math.min(100, dragStartValue + deltaValue))
    
    if (newValue !== value) {
      onChange(newValue)
    }
  }

  const handleVolumeIconMouseUp = () => {
    setIsResizing(false)
  }

  // Add global mouse event listeners for resize
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleVolumeIconMouseMove)
      document.addEventListener('mouseup', handleVolumeIconMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleVolumeIconMouseMove)
        document.removeEventListener('mouseup', handleVolumeIconMouseUp)
      }
    }
  }, [isResizing, dragStartX, dragStartValue, value, onChange])

  return (
    <div className={`flex items-center ${className} overflow-visible`}>
      {/* Volume Icon */}
      {showIcon && (
        <MasterButton
          onClick={handleMuteToggle}
          onMouseDown={handleVolumeIconMouseDown}
          icon={getVolumeIcon(value)}
          title={isMuted ? `Muted - Click to unmute, drag to adjust` : `Volume: ${value}% - Click to mute, drag to adjust`}
          variant={isMuted ? "danger" : "default"}
          size={size}
          className={`flex-shrink-0 mr-2 select-none ${isMuted ? 'ring-2 ring-red-400/50 shadow-lg shadow-red-400/20' : ''} ${isResizing ? 'cursor-ew-resize' : 'cursor-pointer'}`}
        />
      )}
      
      {/* Slider and Value Container - Always visible */}
      <div 
        className="flex items-center gap-2 flex-1 transition-all duration-300 ease-out overflow-visible max-w-32 sm:max-w-40 md:max-w-48"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
          {/* Slider */}
          <div 
            className={`flex-1 relative flex items-center ${
              isDragging || isHovered ? 'z-10' : ''
            }`}
            onWheel={handleScroll}
          >
            <input
              type="range"
              min="0"
              max="100"
              size={size === 'small' ? 16 : size === 'medium' ? 24 : 32}
              value={value}
              onChange={handleSliderChange}
              onMouseDown={handleSliderMouseDown}
              onMouseUp={handleSliderMouseUp}
                    className={`bg-black/60 border border-white/30 appearance-none focus:outline-none transition-all duration-300 ease-out ${
                      isDragging || isHovered 
                        ? `${config.slider} w-full shadow-lg shadow-[var(--theme-accent)]/20 cursor-ew-resize` 
                        : `${config.slider} w-full cursor-pointer`
                    }
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-1
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:bg-[var(--theme-accent)]
                [&::-webkit-slider-thumb]:border
                [&::-webkit-slider-thumb]:border-[var(--theme-accent)]
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:transition-all
                [&::-webkit-slider-thumb]:duration-200
                [&::-webkit-slider-thumb]:hover:w-2
                [&::-webkit-slider-thumb]:hover:h-5
                [&::-moz-range-thumb]:w-3
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:bg-[var(--theme-accent)]
                [&::-moz-range-thumb]:border-none
                [&::-moz-range-thumb]:cursor-pointer`}
              style={{
                background: `linear-gradient(to right, var(--theme-accent) 0%, var(--theme-accent) ${value}%, var(--theme-glass-bg) ${value}%, var(--theme-glass-bg) 100%)`
              }}
            />
          </div>
          
        {/* Value Display - Clickable Input */}
        {showValue && (
          <div className={`${config.text} font-mono text-white/50 min-w-[1rem] text-center flex items-center justify-center`}>
            {isEditing ? (
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                onBlur={handleInputBlur}
                className="bg-transparent border-none outline-none text-center w-8 text-white/80 cursor-text"
                autoFocus
                title="Type volume (0-100) and press Enter"
              />
            ) : (
              <span 
                className="cursor-text hover:text-white/80 transition-colors"
                onClick={() => setIsEditing(true)}
                title="Click to edit volume"
              >
                {value}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}