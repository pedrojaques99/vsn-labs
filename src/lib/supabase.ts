import { createClient, type User } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'

// Configuração do Supabase com logs detalhados
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 [SUPABASE_CONFIG] Verificando configuração:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlFormat: supabaseUrl ? (supabaseUrl.includes('supabase.co') ? 'VÁLIDO' : 'INVÁLIDO') : 'AUSENTE',
  urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT_SET',
  keyPreview: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT_SET',
  environment: typeof window !== 'undefined' ? 'CLIENT' : 'SERVER'
})

// Verificar se as variáveis estão configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [SUPABASE_CONFIG] Variáveis de ambiente do Supabase não configuradas')
  console.error('❌ [SUPABASE_CONFIG] Certifique-se de ter NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local')
  console.error('❌ [SUPABASE_CONFIG] Exemplo:', {
    'NEXT_PUBLIC_SUPABASE_URL': 'https://seu-projeto-id.supabase.co',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
}

// Cria o cliente Supabase (com fallback para desenvolvimento)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Log de inicialização do cliente
if (supabase) {
  console.log('✅ [SUPABASE_CONFIG] Cliente Supabase inicializado com sucesso')
} else {
  console.error('❌ [SUPABASE_CONFIG] Cliente Supabase NÃO foi inicializado')
}

// Tipos TypeScript para o banco
export interface Mix {
  id: string
  user_id: string
  name: string
  description?: string
  config: {
    players: Array<{
      id: string
      url: string
      volume: number
      isLooping: boolean
      type: 'youtube' | 'audio'
      fileName?: string
      videoId?: string
      // Playlist properties
      isPlaylist?: boolean
      playlistId?: string
      playlistTitle?: string
      playlistVideos?: Array<{id: string, title: string}>
      currentPlaylistIndex?: number
    }>
    globalVolume: number
    isSlotPreset?: boolean
  }
  is_public: boolean
  likes_count: number
  plays_count: number
  icon?: string // Lucide icon name for mix thumbnail
  created_at: string
  updated_at: string
  is_liked?: boolean
  is_owned?: boolean
  profiles?: {
    name: string
  }
}

export interface MixLike {
  id: string
  user_id: string
  mix_id: string
  created_at: string
}

// Serviços do banco de dados
export const mixService = {
  // Salvar novo mix
  async saveMix(name: string, config: Record<string, unknown>, isPublic = false, description?: string, icon?: string) {
    if (!supabase) throw new Error('Supabase não configurado')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('mixes')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim(),
        config,
        is_public: isPublic,
        icon: icon?.trim()
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Buscar mixes do usuário
  async getUserMixes() {
    if (!supabase) return []
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    try {
      // Buscar mixes criados pelo usuário
      const { data: ownMixes, error: ownError } = await supabase
        .from('mixes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (ownError) throw ownError

      // Buscar mixes curtidos pelo usuário
      const { data: likedMixes, error: likedError } = await supabase
        .from('mix_likes')
        .select(`
          mixes!inner (
            id,
            user_id,
            name,
            description,
            config,
            is_public,
            likes_count,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)

      if (likedError) throw likedError

      // Combinar os dois arrays e remover duplicatas
      const allMixes = [
        ...(ownMixes || []).map(mix => ({ ...mix, is_owned: true })),
        ...(likedMixes?.map(like => ({ ...like.mixes, is_liked: true, is_owned: false })) || [])
      ]

      // Remover duplicatas baseado no ID
      const uniqueMixes = allMixes.reduce((acc: Mix[], mix) => {
        const existingIndex = acc.findIndex(m => m.id === mix.id)
        if (existingIndex >= 0) {
          // Se já existe, manter o owned=true se for do usuário
          acc[existingIndex] = { 
            ...acc[existingIndex], 
            is_liked: mix.is_liked || acc[existingIndex].is_liked,
            is_owned: mix.is_owned || acc[existingIndex].is_owned
          }
        } else {
          acc.push(mix)
        }
        return acc
      }, [])

      // Ordenar por data de criação
      return uniqueMixes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (error) {
      console.error('Error fetching user mixes:', error)
      return []
    }
  },

  // Buscar mixes públicos com informações do usuário
  async getPublicMixes(limit = 20, sortBy: 'recent' | 'likes' | 'plays' = 'recent') {
    if (!supabase) return []
    
    // Get current user to check likes
    const { data: { user } } = await supabase.auth.getUser()
    
    // Primeiro buscar os mixes públicos
    let mixQuery = supabase
      .from('mixes')
      .select('*')
      .eq('is_public', true)
    
    // Apply sorting based on sortBy parameter
    if (sortBy === 'likes') {
      mixQuery = mixQuery
        .order('likes_count', { ascending: false })
        .order('created_at', { ascending: false })
    } else if (sortBy === 'plays') {
      mixQuery = mixQuery
        .order('plays_count', { ascending: false })
        .order('created_at', { ascending: false })
    } else {
      mixQuery = mixQuery
        .order('created_at', { ascending: false })
    }
    
    const { data: mixesData, error: mixesError } = await mixQuery.limit(limit)

    if (mixesError) {
      console.error('Error fetching public mixes:', {
        message: mixesError.message,
        details: mixesError.details,
        hint: mixesError.hint,
        code: mixesError.code
      })
      return []
    }

    if (!mixesData || mixesData.length === 0) {
      return []
    }

    // Buscar os perfis dos usuários dos mixes
    const userIds = mixesData.map(mix => mix.user_id)
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', userIds)

    if (profilesError) {
      console.warn('Error fetching profiles:', profilesError)
      // Continuar mesmo se os perfis falharem
    }

    // Buscar likes do usuário atual (se estiver logado)
    let userLikes: string[] = []
    if (user) {
      const mixIds = mixesData.map(mix => mix.id)
      const { data: likesData } = await supabase
        .from('mix_likes')
        .select('mix_id')
        .eq('user_id', user.id)
        .in('mix_id', mixIds)
      
      userLikes = likesData?.map(like => like.mix_id) || []
    }

    // Combinar os dados
    const mixesWithProfiles = mixesData.map(mix => ({
      ...mix,
      profiles: profilesData?.find(profile => profile.id === mix.user_id) || null,
      is_liked: userLikes.includes(mix.id),
      is_owned: user ? mix.user_id === user.id : false
    }))

    return mixesWithProfiles
  },

  // Buscar mix por ID (para compartilhamento)
  async getMixById(id: string) {
    if (!supabase) throw new Error('Supabase não configurado')
    const { data, error } = await supabase
      .from('mixes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Verificar se usuário já deu like
  async checkUserLike(mixId: string) {
    if (!supabase) return false
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase
      .from('mix_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('mix_id', mixId)
      .single()

    return !error && !!data
  },

  // Toggle like em um mix
  async toggleLike(mixId: string) {
    if (!supabase) throw new Error('Supabase não configurado')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Verificar se já deu like
    const { data: existingLike } = await supabase
      .from('mix_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('mix_id', mixId)
      .single()

    if (existingLike) {
      // Remover like
      const { error: deleteError } = await supabase
        .from('mix_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('mix_id', mixId)

      if (deleteError) throw deleteError

      // Decrementar contador
      const { error: updateError } = await supabase
        .rpc('decrement_likes', { mix_id: mixId })

      if (updateError) throw updateError
      return false
    } else {
      // Adicionar like
      const { error: insertError } = await supabase
        .from('mix_likes')
        .insert({ user_id: user.id, mix_id: mixId })

      if (insertError) throw insertError

      // Incrementar contador
      const { error: updateError } = await supabase
        .rpc('increment_likes', { mix_id: mixId })

      if (updateError) throw updateError
      return true
    }
  },

  // Deletar mix do usuário
  async deleteMix(mixId: string) {
    if (!supabase) throw new Error('Supabase não configurado')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('mixes')
      .delete()
      .eq('id', mixId)
      .eq('user_id', user.id) // Só pode deletar próprios mixes

    if (error) throw error
  },

  // Atualizar mix
  async updateMix(mixId: string, updates: Partial<Pick<Mix, 'name' | 'description' | 'config' | 'is_public' | 'icon'>>) {
    if (!supabase) throw new Error('Supabase não configurado')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('mixes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', mixId)
      .eq('user_id', user.id) // Só pode atualizar próprios mixes
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Incrementar contador de plays
  async incrementPlays(mixId: string) {
    if (!supabase) throw new Error('Supabase não configurado')
    
    const { error } = await supabase
      .rpc('increment_plays', { mix_id: mixId })

    if (error) throw error
  }
}

// Serviços de autenticação
export const authService = {
  // Login com Google com logs detalhados
  async signInWithGoogle() {
    console.log('🔍 [AUTH_SERVICE] Iniciando signInWithGoogle...')
    
    if (!supabase) {
      console.error('❌ [AUTH_SERVICE] Supabase não configurado')
      throw new Error('Supabase não configurado')
    }
    
    // Tentar duas URLs de callback diferentes
    const useV1Callback = true // Mude para false se quiser testar /auth/callback
    const redirectUrl = useV1Callback 
      ? `${window.location.origin}/auth/v1/callback`
      : `${window.location.origin}/auth/callback`
    console.log('🔍 [AUTH_SERVICE] Configuração OAuth:', {
      provider: 'google',
      redirectTo: redirectUrl,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***SET***' : 'NOT_SET',
      currentOrigin: window.location.origin,
      currentUrl: window.location.href
    })
    
    try {
      console.log('🔄 [AUTH_SERVICE] Chamando supabase.auth.signInWithOAuth...')
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      })
      
      console.log('🔍 [AUTH_SERVICE] Resposta OAuth:', {
        hasData: !!data,
        hasError: !!error,
        data: data,
        error: error
      })
      
      if (error) {
        console.error('❌ [AUTH_SERVICE] Erro OAuth detalhado:', {
          message: error.message,
          status: error.status,
          code: error.code,
          details: error
        })
        throw error
      }
      
      console.log('✅ [AUTH_SERVICE] OAuth iniciado com sucesso')
      return data
    } catch (err) {
      const error = err as Error
      console.error('❌ [AUTH_SERVICE] Erro no try/catch:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        error: err
      })
      throw err
    }
  },

  // Login com GitHub
  async signInWithGitHub() {
    if (!supabase) throw new Error('Supabase não configurado')
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/youtube-mixer`
      }
    })
    if (error) throw error
    return data
  },

  // Logout
  async signOut() {
    if (!supabase) throw new Error('Supabase não configurado')
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Obter usuário atual
  async getCurrentUser() {
    if (!supabase) return null
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Obter sessão atual
  async getSession() {
    if (!supabase) return null
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  }
}

// Hook para monitorar estado de autenticação com logs
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔍 [USE_AUTH] Iniciando hook useAuth...')
    
    if (!supabase) {
      console.error('❌ [USE_AUTH] Supabase não configurado no hook')
      setUser(null)
      setLoading(false)
      return
    }

    console.log('🔄 [USE_AUTH] Verificando sessão inicial...')
    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('🔍 [USE_AUTH] Sessão inicial:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        email: session?.user?.email,
        error: error
      })
      
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch((err) => {
      console.error('❌ [USE_AUTH] Erro ao verificar sessão inicial:', err)
      setUser(null)
      setLoading(false)
    })

    // Escutar mudanças de autenticação
    console.log('🔄 [USE_AUTH] Configurando listener de mudanças de auth...')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔍 [USE_AUTH] Mudança de estado auth:', {
          event,
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          email: session?.user?.email
        })
        
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      console.log('🔄 [USE_AUTH] Desconectando listener de auth...')
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading, signOut: authService.signOut }
}
