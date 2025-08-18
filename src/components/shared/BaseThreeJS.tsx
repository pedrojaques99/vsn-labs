'use client'

import React from 'react'
import * as THREE from 'three'
import { useThreeJS, ThreeJSConfig } from '@/hooks/useThreeJS'

interface BaseThreeJSProps extends ThreeJSConfig {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onInitialized?: (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => void
  onError?: (error: string) => void
  showGrid?: boolean
  showLoading?: boolean
  loadingText?: string
  errorText?: string
}

export function BaseThreeJS({
  children,
  className = "w-full h-full min-h-screen bg-black",
  style,
  onInitialized,
  onError,
  showGrid = true,
  showLoading = true,
  loadingText = "Inicializando WebGL...",
  errorText = "Erro WebGL",
  ...config
}: BaseThreeJSProps) {
  // Stabilize config to prevent useThreeJS from resetting
  const stableConfig = React.useMemo(() => ({
    ...config,
    orbitControlsConfig: {
      enableDamping: true,
      dampingFactor: 0.05,
      minDistance: 1,
      maxDistance: 100,
      ...(config.orbitControlsConfig || {})
    }
  } as ThreeJSConfig), [config])

  const {
    mountRef,
    isInitialized,
    webglError,
    scene,
    camera,
    renderer
  } = useThreeJS(stableConfig)



  // Callbacks - Use ref to avoid dependency issues
  const onInitializedRef = React.useRef(onInitialized)
  onInitializedRef.current = onInitialized

  React.useEffect(() => {
    if (isInitialized && onInitializedRef.current && scene && camera && renderer) {
      console.log('🎉 BaseThreeJS: Calling onInitialized callback')
      onInitializedRef.current(scene, camera, renderer)
    }
  }, [isInitialized]) // Only depend on isInitialized since we use refs for the callback

  const onErrorRef = React.useRef(onError)
  onErrorRef.current = onError

  React.useEffect(() => {
    if (webglError && onErrorRef.current) {
      onErrorRef.current(webglError)
    }
  }, [webglError])

  // Toggle grid visibility
  React.useEffect(() => {
    if (scene && scene.children.length > 0) {
      const gridHelper = scene.children.find(child => child.type === 'GridHelper')
      if (gridHelper) {
        gridHelper.visible = showGrid
      }
    }
  }, [scene, showGrid])

  // Mostrar erro se WebGL falhar
  if (webglError) {
    return (
      <div className={className} style={style}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-white">
            <div className="text-red-400 text-xl mb-4">⚠️ {errorText}</div>
            <div className="text-white/80 mb-4">{webglError}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-md transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar loading enquanto inicializa
  if (!isInitialized && showLoading) {
    return (
      <div className={className} style={style}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <div>{loadingText}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={mountRef}
      className={className}
      style={style}
    >
      {children}
    </div>
  )
}

// Componente de loading reutilizável
export function ThreeJSLoading({ 
  text = "Inicializando WebGL...",
  className = "w-full h-full min-h-screen bg-black flex items-center justify-center"
}: { text?: string; className?: string }) {
  return (
    <div className={className}>
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <div>{text}</div>
      </div>
    </div>
  )
}

// Componente de erro reutilizável
export function ThreeJSError({ 
  error,
  onRetry,
  className = "w-full h-full min-h-screen bg-black flex items-center justify-center"
}: { 
  error: string; 
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-center text-white">
        <div className="text-red-400 text-xl mb-4">⚠️ Erro WebGL</div>
        <div className="text-white/80 mb-4">{error}</div>
        <button 
          onClick={onRetry || (() => window.location.reload())} 
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-md transition-colors"
        >
          {onRetry ? 'Tentar Novamente' : 'Recarregar Página'}
        </button>
      </div>
    </div>
  )
}
