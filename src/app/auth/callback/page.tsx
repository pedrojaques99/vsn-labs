'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    console.log('🔍 [AUTH_CALLBACK] Página de callback carregada')
    console.log('🔍 [AUTH_CALLBACK] URL atual:', window.location.href)
    console.log('🔍 [AUTH_CALLBACK] Search params:', window.location.search)
    console.log('🔍 [AUTH_CALLBACK] Hash:', window.location.hash)

    const handleAuthCallback = async () => {
      try {
        if (!supabase) {
          console.error('❌ [AUTH_CALLBACK] Supabase não configurado')
          router.push('/youtube-mixer?error=supabase_not_configured')
          return
        }

        console.log('🔄 [AUTH_CALLBACK] Processando callback de autenticação...')
        
        // Extrair código do URL (fluxo PKCE)
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const error_code = urlParams.get('error')
        const error_description = urlParams.get('error_description')
        
        console.log('🔍 [AUTH_CALLBACK] Parâmetros URL:', {
          hasCode: !!code,
          code: code?.substring(0, 20) + '...',
          error_code,
          error_description
        })

        // Se há erro nos parâmetros
        if (error_code) {
          console.error('❌ [AUTH_CALLBACK] Erro nos parâmetros URL:', { error_code, error_description })
          router.push(`/youtube-mixer?error=${encodeURIComponent(error_description || error_code)}`)
          return
        }

        // Se há código, trocar por sessão (fluxo PKCE)
        if (code) {
          console.log('🔄 [AUTH_CALLBACK] Trocando código por sessão...')
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          console.log('🔍 [AUTH_CALLBACK] Resultado exchangeCodeForSession:', {
            hasSession: !!data.session,
            hasUser: !!data.session?.user,
            userId: data.session?.user?.id,
            email: data.session?.user?.email,
            error: error
          })

          if (error) {
            console.error('❌ [AUTH_CALLBACK] Erro ao trocar código por sessão:', error)
            router.push(`/youtube-mixer?error=${encodeURIComponent(error.message)}`)
            return
          }

          if (data.session) {
            console.log('✅ [AUTH_CALLBACK] Login PKCE realizado com sucesso!')
            console.log('🔄 [AUTH_CALLBACK] Redirecionando para /youtube-mixer...')
            router.push('/youtube-mixer?login=success')
            return
          }
        }

        // Fallback: verificar se já existe sessão (fluxo implicit)
        console.log('🔄 [AUTH_CALLBACK] Verificando sessão existente...')
        const { data, error } = await supabase.auth.getSession()
        
        console.log('🔍 [AUTH_CALLBACK] Resultado getSession:', {
          hasSession: !!data.session,
          hasUser: !!data.session?.user,
          userId: data.session?.user?.id,
          email: data.session?.user?.email,
          error: error
        })

        if (error) {
          console.error('❌ [AUTH_CALLBACK] Erro ao verificar sessão:', error)
          router.push(`/youtube-mixer?error=${encodeURIComponent(error.message)}`)
          return
        }

        if (data.session) {
          console.log('✅ [AUTH_CALLBACK] Sessão existente encontrada!')
          console.log('🔄 [AUTH_CALLBACK] Redirecionando para /youtube-mixer...')
          router.push('/youtube-mixer?login=success')
        } else {
          console.warn('⚠️ [AUTH_CALLBACK] Nenhuma sessão ou código encontrado')
          router.push('/youtube-mixer?error=no_session_or_code')
        }
      } catch (err) {
        console.error('❌ [AUTH_CALLBACK] Erro inesperado:', err)
        router.push(`/youtube-mixer?error=${encodeURIComponent('Unexpected error during authentication')}`)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h1 className="text-xl font-mono mb-2">Authenticating...</h1>
        <p className="text-white/60 font-mono text-sm">Processing login callback</p>
      </div>
    </div>
  )
}
