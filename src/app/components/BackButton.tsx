'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function BackButton() {
  const pathname = usePathname()
  

  return (
    <>
      {/* Left side navigation */}
      <div className="fixed top-6 left-6 z-50 flex items-center gap-3">
        {/* Home Button with Lab Icon */}
        <Link 
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="back-button px-3 py-2 text-sm font-mono flex items-center gap-2"
          title="Visant Labs Home"
        >
          🧪
        </Link>
      </div>

      {/* Right side donate button */}
      <div className="fixed top-6 right-6 z-50">
        <Link 
          href="/donate"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2 py-1 text-xs font-mono bg-black/20 border border-white/10 rounded text-white/40 hover:text-white/70 hover:bg-black/40 hover:border-white/20 transition-all duration-200"
          title="Support Visant Labs"
        >
          ☕ <span>donate</span>
        </Link>
      </div>

    </>
  )
}
