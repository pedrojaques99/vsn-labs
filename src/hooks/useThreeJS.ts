'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export interface ThreeJSConfig {
  antialias?: boolean
  powerPreference?: 'default' | 'high-performance' | 'low-power'
  failIfMajorPerformanceCaveat?: boolean
  enableOrbitControls?: boolean
  orbitControlsConfig?: {
    enableDamping?: boolean
    dampingFactor?: number
    minDistance?: number
    maxDistance?: number
  }
  cameraConfig?: {
    fov?: number
    near?: number
    far?: number
    position?: [number, number, number]
  }
  rendererConfig?: {
    clearColor?: number
    pixelRatio?: number
  }
}

interface ThreeJSContext {
  scene: THREE.Scene | null
  camera: THREE.PerspectiveCamera | null
  renderer: THREE.WebGLRenderer | null
  controls: OrbitControls | null
  mountRef: React.RefObject<HTMLDivElement | null>
  isInitialized: boolean
  webglError: string | null
  dispose: () => void
}

export function useThreeJS(config: ThreeJSConfig = {}): ThreeJSContext {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const animationRef = useRef<number | undefined>(undefined)
  
  const [isInitialized, setIsInitialized] = useState(false)
  const [webglError, setWebglError] = useState<string | null>(null)

  // Store config in refs to avoid dependency issues
  const configRef = useRef(config)
  configRef.current = config

  // Verificar suporte WebGL
  const checkWebGLSupport = useCallback(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) {
        throw new Error('WebGL não suportado')
      }
      return true
    } catch (error) {
      console.error('WebGL não disponível:', error)
      return false
    }
  }, [])

  // Função de disposição
  const dispose = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    if (rendererRef.current) {
      try {
        rendererRef.current.dispose()
      } catch (error) {
        console.warn('Erro ao dispor renderer:', error)
      }
    }

    if (controlsRef.current) {
      try {
        controlsRef.current.dispose()
      } catch (error) {
        console.warn('Erro ao dispor controls:', error)
      }
    }

    // Limpar referências
    sceneRef.current = null
    cameraRef.current = null
    rendererRef.current = null
    controlsRef.current = null
    animationRef.current = undefined
  }, [])

  // Função para inicializar sem dependencies 
  const initializeThreeJS = useCallback(() => {
    console.log('🚀 useThreeJS: initializeThreeJS called', {
      hasMountRef: !!mountRef.current,
      isInitialized,
      hasScene: !!sceneRef.current,
      webglError
    })
    
    if (!mountRef.current) {
      console.log('❌ useThreeJS: No mount ref')
      return
    }
    
    if (isInitialized) {
      console.log('❌ useThreeJS: Already initialized')
      return
    }
    
    if (sceneRef.current) {
      console.log('❌ useThreeJS: Scene already exists')
      return
    }

    // Verificar WebGL
    console.log('🔍 useThreeJS: Checking WebGL support')
    if (!checkWebGLSupport()) {
      console.log('❌ useThreeJS: WebGL not supported')
      setWebglError('WebGL não é suportado neste navegador')
      return
    }
    console.log('✅ useThreeJS: WebGL supported')

    try {
      const currentConfig = configRef.current
      const container = mountRef.current
      const width = container.clientWidth
      const height = container.clientHeight
      
      console.log('📐 useThreeJS: Container dimensions', { width, height })
      
      if (width === 0 || height === 0) {
        console.log('⏳ useThreeJS: Zero dimensions, retrying in 100ms')
        setTimeout(() => {
          if (!sceneRef.current) {
            console.log('🔄 useThreeJS: Retrying initialization')
            initializeThreeJS()
          }
        }, 100)
        return
      }

      // Configurações padrão
      const {
        antialias = true,
        powerPreference = 'high-performance',
        failIfMajorPerformanceCaveat = false,
        enableOrbitControls = true,
        orbitControlsConfig = {
          enableDamping: true,
          dampingFactor: 0.05,
          minDistance: 1,
          maxDistance: 100
        },
        cameraConfig = {
          fov: 75,
          near: 0.1,
          far: 1000,
          position: [0, 5, 5]
        },
        rendererConfig = {
          clearColor: 0x000000,
          pixelRatio: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1
        }
      } = currentConfig

      console.log('🎬 useThreeJS: Creating scene')
      // Scene
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(rendererConfig.clearColor)
      sceneRef.current = scene

      console.log('📷 useThreeJS: Creating camera')
      // Camera
      const camera = new THREE.PerspectiveCamera(
        cameraConfig.fov!,
        width / height,
        cameraConfig.near!,
        cameraConfig.far!
      )
      camera.position.set(...(cameraConfig.position!))
      cameraRef.current = camera

      console.log('🎨 useThreeJS: Creating renderer')
      // Renderer with performance optimizations
      const renderer = new THREE.WebGLRenderer({
        antialias,
        powerPreference,
        failIfMajorPerformanceCaveat,
        alpha: false, // Disable alpha for better performance
        premultipliedAlpha: false,
        stencil: false, // Disable stencil buffer if not needed
        depth: true
      })

      if (!renderer.domElement) {
        throw new Error('Falha ao criar renderer WebGL')
      }

      console.log('⚙️ useThreeJS: Configuring renderer')
      renderer.setSize(width, height)
      renderer.setClearColor(rendererConfig.clearColor!)
      renderer.setPixelRatio(rendererConfig.pixelRatio!)
      
      console.log('📌 useThreeJS: Appending to DOM')
      container.appendChild(renderer.domElement)
      rendererRef.current = renderer

      // Controls (opcional)
      if (enableOrbitControls) {
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = orbitControlsConfig.enableDamping!
        controls.dampingFactor = orbitControlsConfig.dampingFactor!
        controls.minDistance = orbitControlsConfig.minDistance!
        controls.maxDistance = orbitControlsConfig.maxDistance!
        controlsRef.current = controls
      }

      // Lighting básico
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
      scene.add(ambientLight)
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(10, 10, 5)
      scene.add(directionalLight)

      // Grid helper opcional
      const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222)
      scene.add(gridHelper)

      console.log('🎉 useThreeJS: Initialization complete!')
      setIsInitialized(true)

    } catch (error) {
      console.error('💥 useThreeJS: Initialization error:', error)
      setWebglError(`Erro de inicialização: ${error instanceof Error ? error.message : 'Desconhecido'}`)
      setIsInitialized(false)
    }
  }, []) // Remove all dependencies

  // Resize handler
  const handleResize = useCallback(() => {
    if (!mountRef.current || !cameraRef.current || !rendererRef.current) return

    const container = mountRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    cameraRef.current.aspect = width / height
    cameraRef.current.updateProjectionMatrix()
    rendererRef.current.setSize(width, height)
  }, [])

  // Wait for mount ref to be available
  useEffect(() => {
    if (!mountRef.current || sceneRef.current) {
      return
    }

    initializeThreeJS()

    // Safety timeout
    const safetyTimeout = setTimeout(() => {
      console.log('⏰ useThreeJS: Safety timeout triggered', {
        hasScene: !!sceneRef.current,
        webglError,
        isInitialized
      })
      if (!sceneRef.current && !webglError) {
        console.log('💀 useThreeJS: Forcing timeout error')
        setWebglError('Timeout na inicialização do WebGL')
      }
    }, 10000) // Longer timeout for safety

    // Event listeners with passive option for better performance
    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      console.log('🧹 useThreeJS: Cleanup')
      clearTimeout(safetyTimeout)
      window.removeEventListener('resize', handleResize)
      dispose()
    }
  }) // No dependencies - run on every render to check mount ref

  return {
    scene: sceneRef.current,
    camera: cameraRef.current,
    renderer: rendererRef.current,
    controls: controlsRef.current,
    mountRef,
    isInitialized,
    webglError,
    dispose
  }
}

// Hook para renderização em loop
export function useRenderLoop(
  renderFunction: () => void,
  dependencies: React.DependencyList = [],
  isActive: boolean = true
) {
  const animationRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!isActive) return

    const animate = () => {
      renderFunction()
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [renderFunction, isActive, ...dependencies])

  return animationRef
}

// Hook para recursos Three.js
export function useThreeResource<T extends THREE.Object3D | THREE.Material | THREE.BufferGeometry>(
  createResource: () => T,
  dependencies: React.DependencyList = []
) {
  const resourceRef = useRef<T | null>(null)

  useEffect(() => {
    resourceRef.current = createResource()

    return () => {
      if (resourceRef.current) {
        try {
          if ('dispose' in resourceRef.current) {
            (resourceRef.current as T & { dispose: () => void }).dispose()
          }
        } catch (error) {
          console.warn('Erro ao dispor recurso:', error)
        }
        resourceRef.current = null
      }
    }
  }, dependencies)

  return resourceRef.current
}
