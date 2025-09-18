import { useCallback, useEffect, useState } from 'react'
import { useMixer } from '../contexts/MixerContext'

export function useMixerAudio() {
  const { players, isGlobalPlaying, globalVolume, audioRefs } = useMixer()
  const [activeAudioElements, setActiveAudioElements] = useState<HTMLAudioElement[]>([])

  // Encontrar elementos de áudio ativos
  const getActiveAudioElements = useCallback(() => {
    return players
      .filter(player => 
        player.isPlaying && 
        (player.url || player.fileName) &&
        player.type === 'audio' &&
        audioRefs.current[player.id]
      )
      .map(player => audioRefs.current[player.id])
      .filter(Boolean) as HTMLAudioElement[]
  }, [players, audioRefs])

  // Verificar se há YouTube ativo
  const hasActiveYouTube = useCallback(() => {
    return players.some(player => 
      player.isPlaying && 
      player.type === 'youtube' && 
      (player.url || player.fileName)
    )
  }, [players])

  // Atualizar elementos ativos quando players mudam
  useEffect(() => {
    const newActiveElements = getActiveAudioElements()
    setActiveAudioElements(newActiveElements)
  }, [getActiveAudioElements])

  return {
    isPlaying: isGlobalPlaying,
    hasActiveAudio: activeAudioElements.length > 0 || hasActiveYouTube(),
    activeAudioCount: activeAudioElements.length
  }
}
