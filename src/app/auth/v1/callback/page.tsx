'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthV1Callback() {
  const router = useRouter()

  useEffect(() => {
    console.log('🔍 [AUTH_V1_CALLBACK] Página de callback v1 carregada')
    console.log('🔍 [AUTH_V1_CALLBACK] URL atual:', window.location.href)
    console.log('🔍 [AUTH_V1_CALLBACK] Search params:', window.location.search)
    console.log('🔍 [AUTH_V1_CALLBACK] Hash:', window.location.hash)

    const handleAuthCallback = async () => {
      try {
        if (!supabase) {
          console.error('❌ [AUTH_V1_CALLBACK] Supabase não configurado')
          router.push('/youtube-mixer?error=supabase_not_configured')
          return
        }

        console.log('🔄 [AUTH_V1_CALLBACK] Processando callback de autenticação v1...')
        
        // Extrair código do URL (fluxo PKCE)
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const error_code = urlParams.get('error')
        const error_description = urlParams.get('error_description')
        
        console.log('🔍 [AUTH_V1_CALLBACK] Parâmetros URL:', {
          hasCode: !!code,
          code: code?.substring(0, 20) + '...',
          error_code,
          error_description
        })

        // Se há erro nos parâmetros
        if (error_code) {
          console.error('❌ [AUTH_V1_CALLBACK] Erro nos parâmetros URL:', { error_code, error_description })
          router.push(`/youtube-mixer?error=${encodeURIComponent(error_description || error_code)}`)
          return
        }

        // Se há código, trocar por sessão (fluxo PKCE)
        if (code) {
          console.log('🔄 [AUTH_V1_CALLBACK] Trocando código por sessão...')
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          console.log('🔍 [AUTH_V1_CALLBACK] Resultado exchangeCodeForSession:', {
            hasSession: !!data.session,
            hasUser: !!data.session?.user,
            userId: data.session?.user?.id,
            email: data.session?.user?.email,
            error: error
          })

          if (error) {
            console.error('❌ [AUTH_V1_CALLBACK] Erro ao trocar código por sessão:', error)
            router.push(`/youtube-mixer?error=${encodeURIComponent(error.message)}`)
            return
          }

          if (data.session) {
            console.log('✅ [AUTH_V1_CALLBACK] Login PKCE v1 realizado com sucesso!')
            console.log('🔄 [AUTH_V1_CALLBACK] Redirecionando para /youtube-mixer...')
            router.push('/youtube-mixer?login=success')
            return
          }
        }

        // Verificar se já existe sessão no hash (fluxo implicit)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        console.log('🔍 [AUTH_V1_CALLBACK] Hash params:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken
        })

        if (accessToken) {
          console.log('✅ [AUTH_V1_CALLBACK] Token encontrado no hash!')
          // O Supabase deve processar automaticamente
          setTimeout(() => {
            router.push('/youtube-mixer?login=success')
          }, 1000)
          return
        }

        // Fallback: verificar se já existe sessão
        console.log('🔄 [AUTH_V1_CALLBACK] Verificando sessão existente...')
        const { data, error } = await supabase.auth.getSession()
        
        console.log('🔍 [AUTH_V1_CALLBACK] Resultado getSession:', {
          hasSession: !!data.session,
          hasUser: !!data.session?.user,
          userId: data.session?.user?.id,
          email: data.session?.user?.email,
          error: error
        })

        if (error) {
          console.error('❌ [AUTH_V1_CALLBACK] Erro ao verificar sessão:', error)
          router.push(`/youtube-mixer?error=${encodeURIComponent(error.message)}`)
          return
        }

        if (data.session) {
          console.log('✅ [AUTH_V1_CALLBACK] Sessão existente encontrada!')
          console.log('🔄 [AUTH_V1_CALLBACK] Redirecionando para /youtube-mixer...')
          router.push('/youtube-mixer?login=success')
        } else {
          console.warn('⚠️ [AUTH_V1_CALLBACK] Nenhuma sessão, código ou token encontrado')
          router.push('/youtube-mixer?error=no_auth_data')
        }
      } catch (err) {
        console.error('❌ [AUTH_V1_CALLBACK] Erro inesperado:', err)
        router.push(`/youtube-mixer?error=${encodeURIComponent('Unexpected error during authentication')}`)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h1 className="text-xl font-mono mb-2">Authenticating v1...</h1>
        <p className="text-white/60 font-mono text-sm">Processing OAuth callback</p>
      </div>
    </div>
  )
}
