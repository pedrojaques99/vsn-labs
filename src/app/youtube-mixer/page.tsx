import { YouTubeMixer } from '@/components/2d'
import { MixerProvider } from '@/contexts/MixerContext'
import { Metadata } from 'next'

// Função para gerar metadados dinâmicos baseados no mix ID
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ mix?: string }> }): Promise<Metadata> {
  const params = await searchParams
  const mixId = params.mix
  
  // Se não há mix ID, usar metadados padrão
  if (!mixId) {
    return {
      title: "YouTube Mixer - Visant Labs®",
    }
  }

  try {
    // Buscar dados do mix no servidor
    const mixData = await getMixData(mixId)
    
    if (mixData && mixData.is_public) {
      const mixTitle = `"${mixData.name}" - YouTube Mixer`
      
      return {
        title: mixTitle,
        openGraph: {
          title: mixTitle,
          type: "music.song",
          url: `https://vsn-labs.vercel.app/youtube-mixer?mix=${mixId}`,
        },
        twitter: {
          card: "summary",
          title: mixTitle,
        },
      }
    }
  } catch (error) {
    console.error('Error fetching mix data for metadata:', error)
  }

  // Fallback para metadados padrão se houver erro
  return {
    title: "YouTube Mixer - Visant Labs®",
  }
}

// Função para buscar dados do mix no servidor
async function getMixData(mixId: string) {
  try {
    // Usar fetch diretamente para buscar dados do mix
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/mixes?id=eq.${mixId}&is_public=eq.true&select=*,profiles(name)`, {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch mix data')
    }
    
    const data = await response.json()
    return data[0] || null
  } catch (error) {
    console.error('Error fetching mix data:', error)
    return null
  }
}

export default function YouTubeMixerPage() {
  return (
    <MixerProvider>
      <YouTubeMixer />
    </MixerProvider>
  )
}