'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import Link from 'next/link'

export default function DonatePage() {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const donationMethods = [
    {
      id: 'pix',
      name: 'PIX (Brasil)',
      icon: '🇧🇷',
      description: 'Transferência instantânea via PIX',
      address: 'pedrohjaques99@gmail.com',
      qrCode: null // You can add a QR code image later
    },
    {
      id: 'usdc',
      name: 'USDC (ETH Mainnet)',
      icon: '🪙',
      description: 'USD Coin na rede Ethereum',
      address: '0xf7F137844f67550DcE4f52aA76aE68f757a76DDd',
      network: 'Ethereum Mainnet'
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white font-mono relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5"></div>
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255, 255, 255, 0.05) 2px,
              rgba(255, 255, 255, 0.05) 4px
            )`
          }}
        />
      </div>

      <div className="relative z-10 p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-4 tracking-wider">
              [DONATE] ☕
            </h1>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto"></div>
          </div>
          
          <div className="max-w-2xl mx-auto space-y-4 text-white/80">
            <p className="text-lg">
              Support <span className="text-cyan-400">Visant Labs</span> and help us create more experimental tools
            </p>
            <p className="text-sm text-white/60 leading-relaxed">
              Your donation helps maintain and develop new interactive experiences, 
              creative tools, and experimental projects. Every contribution, no matter the size, 
              makes a difference in keeping our creative lab running.
            </p>
            <div className="mt-6 p-4 border border-cyan-400/20 rounded-lg bg-cyan-400/5">
              <p className="text-sm text-cyan-100/80 leading-relaxed">
                <span className="text-cyan-400 font-medium">Pedro Xavier</span> - Creative Director & Commercial Lead
                <br />
                Leading both creative vision and commercial strategy for Visant Labs
              </p>
            </div>
          </div>
        </div>

        {/* Donation Methods */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {donationMethods.map((method) => (
            <div 
              key={method.id}
              className="border border-white/20 rounded-lg bg-black/40 backdrop-blur-sm p-6 hover:border-cyan-400/40 transition-colors duration-300"
            >
              {/* Method Header */}
              <div className="text-center mb-6">
                <div className="text-3xl mb-3">{method.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{method.name}</h3>
                <p className="text-xs text-white/60">{method.description}</p>
                {method.network && (
                  <div className="mt-2 text-xs text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded">
                    {method.network}
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="text-xs text-white/60 text-center">
                    {method.id === 'pix' ? 'Chave PIX:' : 'Wallet Address:'}
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/20 rounded">
                    <code className="flex-1 text-xs text-white/80 break-all">
                      {method.address}
                    </code>
                    <button
                      onClick={() => copyToClipboard(method.address, method.id)}
                      className="flex-shrink-0 p-2 hover:bg-white/10 rounded transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedField === method.id ? (
                        <Check size={16} className="text-green-400" />
                      ) : (
                        <Copy size={16} className="text-white/60" />
                      )}
                    </button>
                  </div>
                  {copiedField === method.id && (
                    <div className="text-xs text-green-400 text-center">
                      ✓ Copied to clipboard!
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Why Donate Section */}
        <div className="border border-white/20 rounded-lg bg-black/40 backdrop-blur-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-center mb-6 text-white">
            Why Support Visant Labs?
          </h3>
          
          <div className="grid md:grid-cols-4 gap-6 text-sm">
            <div className="text-center space-y-3">
              <div className="text-2xl">🎨</div>
              <h4 className="text-white font-medium">Creative Direction</h4>
              <p className="text-white/60 leading-relaxed">
                Support Pedro Xavier&apos;s creative vision and artistic development
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="text-2xl">💼</div>
              <h4 className="text-white font-medium">Commercial Strategy</h4>
              <p className="text-white/60 leading-relaxed">
                Fund business development and commercial initiatives
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="text-2xl">🛠️</div>
              <h4 className="text-white font-medium">Tool Development</h4>
              <p className="text-white/60 leading-relaxed">
                Fund the creation of new experimental tools and interactive experiences
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="text-2xl">🚀</div>
              <h4 className="text-white font-medium">Infrastructure</h4>
              <p className="text-white/60 leading-relaxed">
                Maintain servers, domains, and infrastructure for our projects
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-6 text-sm">
            <Link 
              href="/" 
              className="text-white/60 hover:text-cyan-400 transition-colors font-mono"
            >
              ← HOME
            </Link>
            <a 
              href="/pedro-xavier" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-cyan-400 transition-colors font-mono"
              title="Pedro Xavier Profile (New Tab)"
            >
              PEDRO XAVIER
            </a>
            <a 
              href="/youtube-mixer" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-cyan-400 transition-colors font-mono"
              title="YouTube Mixer Tool (New Tab)"
            >
              TOOLS →
            </a>
          </div>

          <div className="text-xs text-white/30 font-mono pt-4 border-t border-white/10">
            © 2025 VISANT LABS • THANK YOU FOR YOUR SUPPORT ❤️
          </div>
        </div>
      </div>
    </div>
  )
}
