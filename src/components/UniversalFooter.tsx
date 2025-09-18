'use client'

import { useEffect, useState } from 'react'

interface UniversalFooterProps {
  isDarkMode: boolean
  className?: string
}

export function UniversalFooter({ isDarkMode, className = '' }: UniversalFooterProps) {
  const [glitchText, setGlitchText] = useState('')

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      const glitchChars = '█▓▒░▄▀■□▣▤▥▦▧▨▩'
      const randomGlitch = Array.from({ length: 3 }, () => 
        glitchChars[Math.floor(Math.random() * glitchChars.length)]
      ).join('')
      setGlitchText(randomGlitch)
    }, 150)

    return () => clearInterval(glitchInterval)
  }, [])

  return (
    <div className={`mt-8 text-center text-xs text-gray-500 ${className}`}>
      <div className="flex justify-center items-center space-x-4">
        <span>VISANT CO. STUDIO © 2025</span>
        <span>{glitchText}</span>
        <span>EXPERIMENTAL DESIGN LAB</span>
      </div>
      <div className="mt-2 text-gray-600">
        {'>'} END OF TRANSMISSION
      </div>
    </div>
  )
}
