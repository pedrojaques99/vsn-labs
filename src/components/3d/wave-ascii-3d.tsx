'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { BaseThreeJS } from '../shared/BaseThreeJS'

interface Model3D {
  scene: THREE.Group
  boundingBox: THREE.Box3
  center: THREE.Vector3
}

interface AsciiSettings {
  resolution: number
  characters: string
  fgColor: string
  bgColor: string
  invert: boolean
  enabled: boolean
}

export function WaveAscii3D() {
  // Refs
  const modelRef = useRef<Model3D | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const gridHelperRef = useRef<THREE.GridHelper | null>(null)
  const asciiCanvasRef = useRef<HTMLCanvasElement>(null)
  const asciiCtxRef = useRef<CanvasRenderingContext2D | null>(null)
  
  // State
  const [isLoading, setIsLoading] = useState(false)
  const [hasModel, setHasModel] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [wireframeColor, setWireframeColor] = useState('#00ff00')
  const [showControls, setShowControls] = useState(true)
  const [objectRotation, setObjectRotation] = useState({ x: 0, y: 0, z: 0 })
  const [objectScale, setObjectScale] = useState({ x: 1, y: 1, z: 1 })
  
  const [asciiSettings, setAsciiSettings] = useState<AsciiSettings>({
    resolution: 0.22,
    characters: " .:-=+*#%@",
    fgColor: "#ffffff",
    bgColor: "#007BE5",
    invert: false,
    enabled: true
  })
  
  // Constants
  const modelScale = 1.0
  const cameraDistance = 5.0

  // Initialize ASCII canvas
  const initAsciiCanvas = useCallback((width: number, height: number) => {
    if (!asciiCanvasRef.current) return
    
    const canvas = asciiCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = width
    canvas.height = height
    asciiCtxRef.current = ctx
    ctx.font = '12px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
  }, [])

  // Render ASCII art
  const renderAscii = useCallback((renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera, scene: THREE.Scene) => {
    if (!asciiCtxRef.current || !asciiSettings.enabled) {
      return
    }

    const ctx = asciiCtxRef.current
    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    
    const width = ctx.canvas.width
    const height = ctx.canvas.height
    
    // Capture scene to render target
    const renderTarget = new THREE.WebGLRenderTarget(width, height)
    renderer.setRenderTarget(renderTarget)
    renderer.render(scene, camera)
    renderer.setRenderTarget(null)
    
    // Read pixels
    const buffer = new Uint8Array(width * height * 4)
    renderer.readRenderTargetPixels(renderTarget, 0, 0, width, height, buffer)
    
    // Calculate ASCII resolution
    const asciiWidth = Math.floor(width * asciiSettings.resolution)
    const asciiHeight = Math.floor(height * asciiSettings.resolution)
    const charWidth = width / asciiWidth
    const charHeight = height / asciiHeight
    
    // Render ASCII characters
    ctx.fillStyle = asciiSettings.fgColor
    ctx.font = `${Math.max(8, Math.floor(charHeight * 0.8))}px monospace`
    
    for (let y = 0; y < asciiHeight; y++) {
      for (let x = 0; x < asciiWidth; x++) {
        const pixelX = Math.floor(x * charWidth)
        const pixelY = Math.floor(y * charHeight)
        const bufferIndex = (pixelY * width + pixelX) * 4
        
        const r = buffer[bufferIndex]
        const g = buffer[bufferIndex + 1]
        const b = buffer[bufferIndex + 2]
        const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255
        
        let charIndex = Math.floor(luminance * (asciiSettings.characters.length - 1))
        if (asciiSettings.invert) {
          charIndex = asciiSettings.characters.length - 1 - charIndex
        }
        
        const char = asciiSettings.characters[charIndex] || ' '
        if (char !== ' ' && luminance > 0.1) {
          ctx.fillText(char, pixelX + charWidth / 2, pixelY + charHeight / 2)
        }
      }
    }
    
    renderTarget.dispose()
  }, [asciiSettings])

  // Reset ASCII settings
  const resetAsciiSettings = useCallback(() => {
    setAsciiSettings({
      resolution: 0.22,
      characters: " .:-=+*#%@",
      fgColor: "#ffffff",
      bgColor: "#007BE5",
      invert: false,
      enabled: true
    })
  }, [])

  // Load 3D model
  const loadModel = useCallback(async (file: File, scene: THREE.Scene) => {
    setIsLoading(true)
    let url: string | undefined
    
    try {
      url = URL.createObjectURL(file)
      const extension = file.name.split('.').pop()?.toLowerCase()
      
      let model: THREE.Group
      
      switch (extension) {
        case 'gltf':
        case 'glb':
          const gltfLoader = new GLTFLoader()
          const gltfResult = await gltfLoader.loadAsync(url)
          model = gltfResult.scene
          break
          
        case 'obj':
          const objLoader = new OBJLoader()
          model = await objLoader.loadAsync(url)
          break
          
        case 'fbx':
          const fbxLoader = new FBXLoader()
          model = await fbxLoader.loadAsync(url)
          break
          
        default:
          throw new Error('Formato de arquivo não suportado')
      }
      
      // Remove previous model
      if (modelRef.current) {
        scene.remove(modelRef.current.scene)
      }
      
      // Calculate bounding box and center
      const boundingBox = new THREE.Box3().setFromObject(model)
      const center = boundingBox.getCenter(new THREE.Vector3())
      
      // Center and scale model
      model.position.sub(center)
      const size = boundingBox.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = modelScale / maxDim
      model.scale.setScalar(scale)
      
      // Add to scene
      scene.add(model)
      
      // Store reference
      modelRef.current = {
        scene: model,
        boundingBox,
        center
      }
      
      setHasModel(true)
      
    } catch (error) {
      console.error('Error loading model:', error)
      alert('Erro ao carregar modelo: ' + error)
    } finally {
      setIsLoading(false)
      if (url) {
        URL.revokeObjectURL(url)
      }
    }
  }, [modelScale])

  // Handle file input
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, scene: THREE.Scene) => {
    const file = event.target.files?.[0]
    if (file) {
      loadModel(file, scene)
    }
  }, [loadModel])

  // Setup do componente
  const handleInitialized = useCallback((scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => {
    // Position camera
    camera.position.set(0, 0, cameraDistance)
    
    // Store grid helper reference
    const gridHelper = scene.children.find(child => child.type === 'GridHelper') as THREE.GridHelper
    if (gridHelper) {
      gridHelperRef.current = gridHelper
    }
    
    // Initialize ASCII canvas
    initAsciiCanvas(renderer.domElement.clientWidth, renderer.domElement.clientHeight)
    
    // Animation loop
    const animate = () => {
      // Update model rotation
      if (modelRef.current) {
        modelRef.current.scene.rotation.x = objectRotation.x
        modelRef.current.scene.rotation.y = objectRotation.y
        modelRef.current.scene.rotation.z = objectRotation.z
        
        modelRef.current.scene.scale.set(objectScale.x, objectScale.y, objectScale.z)
      }
      
      // Render ASCII if enabled
      if (asciiSettings.enabled) {
        renderAscii(renderer, camera, scene)
      }
      
      requestAnimationFrame(animate)
    }
    animate()
  }, [cameraDistance, initAsciiCanvas, objectRotation, objectScale, renderAscii, asciiSettings.enabled])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (asciiCanvasRef.current) {
        const width = window.innerWidth
        const height = window.innerHeight
        initAsciiCanvas(width, height)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [initAsciiCanvas])

  return (
    <div className="relative w-full h-full">
      {/* ASCII Canvas Overlay */}
      {asciiSettings.enabled && (
        <canvas
          ref={asciiCanvasRef}
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: asciiSettings.bgColor,
            mixBlendMode: 'multiply'
          }}
        />
      )}
      
      {/* Three.js Scene */}
      <BaseThreeJS
        {...{
          cameraConfig: {
            fov: 75,
            near: 0.1,
            far: 1000,
            position: [0, 0, cameraDistance]
          },
          orbitControlsConfig: {
            enableDamping: true,
            dampingFactor: 0.05,
            minDistance: 1,
            maxDistance: 20
          }
        }}
        onInitialized={handleInitialized}
        showGrid={showGrid}
        className="w-full h-full min-h-screen bg-black"
      />
      
      {/* Controls */}
      {showControls && (
        <div className="absolute top-4 left-4 z-20 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white max-w-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Controles 3D</h3>
            <button
              onClick={() => setShowControls(false)}
              className="text-white/60 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          {/* File Input */}
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".gltf,.glb,.obj,.fbx"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  // Store file for later loading
                  const tempFile = file
                  // We'll load it when the scene is ready
                  setTimeout(() => {
                    if (tempFile && modelRef.current?.scene) {
                      const scene = modelRef.current.scene.parent as THREE.Scene
                      if (scene) {
                        loadModel(tempFile, scene)
                      }
                    }
                  }, 100)
                }
              }}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded"
            >
              {isLoading ? 'Carregando...' : 'Carregar Modelo 3D'}
            </button>
          </div>
          
          {/* Model Controls */}
          {hasModel && (
            <>
              <div className="mb-4">
                <label className="block text-sm mb-2">Rotação X</label>
                <input
                  type="range"
                  min="-Math.PI"
                  max="Math.PI"
                  step="0.1"
                  value={objectRotation.x}
                  onChange={(e) => setObjectRotation(prev => ({ ...prev, x: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm mb-2">Rotação Y</label>
                <input
                  type="range"
                  min="-Math.PI"
                  max="Math.PI"
                  step="0.1"
                  value={objectRotation.y}
                  onChange={(e) => setObjectRotation(prev => ({ ...prev, y: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm mb-2">Escala</label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={objectScale.x}
                  onChange={(e) => {
                    const scale = parseFloat(e.target.value)
                    setObjectScale({ x: scale, y: scale, z: scale })
                  }}
                  className="w-full"
                />
              </div>
            </>
          )}
          
          {/* ASCII Settings */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm">ASCII Art</label>
              <input
                type="checkbox"
                checked={asciiSettings.enabled}
                onChange={(e) => setAsciiSettings(prev => ({ ...prev, enabled: e.target.checked }))}
              />
            </div>
            
            {asciiSettings.enabled && (
              <>
                <div className="mb-2">
                  <label className="block text-xs mb-1">Resolução</label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.5"
                    step="0.01"
                    value={asciiSettings.resolution}
                    onChange={(e) => setAsciiSettings(prev => ({ ...prev, resolution: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                
                <div className="mb-2">
                  <label className="block text-xs mb-1">Caracteres</label>
                  <input
                    type="text"
                    value={asciiSettings.characters}
                    onChange={(e) => setAsciiSettings(prev => ({ ...prev, characters: e.target.value }))}
                    className="w-full px-2 py-1 bg-white/10 rounded text-xs"
                  />
                </div>
                
                <div className="mb-2">
                  <label className="block text-xs mb-1">Cor do Texto</label>
                  <input
                    type="color"
                    value={asciiSettings.fgColor}
                    onChange={(e) => setAsciiSettings(prev => ({ ...prev, fgColor: e.target.value }))}
                    className="w-full h-8 rounded"
                  />
                </div>
                
                <button
                  onClick={resetAsciiSettings}
                  className="w-full px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs"
                >
                  Reset ASCII
                </button>
              </>
            )}
          </div>
          
          {/* Grid Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm">Mostrar Grid</label>
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
            />
          </div>
        </div>
      )}
      
      {/* Show Controls Button */}
      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="absolute top-4 left-4 z-20 bg-black/80 backdrop-blur-sm rounded-lg p-2 text-white hover:bg-black/90"
        >
          ⚙️
        </button>
      )}
    </div>
  )
}
