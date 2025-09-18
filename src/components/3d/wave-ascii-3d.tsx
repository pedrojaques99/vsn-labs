'use client'

import { useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { BaseThreeJS } from '../shared/BaseThreeJS'

export function WaveAscii3D() {
  const modelRef = useRef<THREE.Group | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasModel, setHasModel] = useState(false)

  const loadModel = useCallback(async (file: File, scene: THREE.Scene) => {
    setIsLoading(true)
    try {
      const url = URL.createObjectURL(file)
      const loader = new GLTFLoader()
      const result = await loader.loadAsync(url)
      
      if (modelRef.current) scene.remove(modelRef.current)
      
      const model = result.scene
      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      
      model.position.sub(center)
      model.scale.setScalar(1 / Math.max(size.x, size.y, size.z))
      
      scene.add(model)
      modelRef.current = model
      setHasModel(true)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error loading model:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleInitialized = useCallback((scene: THREE.Scene, camera: THREE.PerspectiveCamera) => {
    camera.position.set(0, 0, 5)
  }, [])

  return (
    <div className="relative w-full h-full">
      <BaseThreeJS
        cameraConfig={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 5] }}
        orbitControlsConfig={{ enableDamping: true, dampingFactor: 0.05 }}
        onInitialized={handleInitialized}
        className="w-full h-full min-h-screen bg-black"
      />
      
      <div className="absolute top-4 left-4 z-10">
        <input
          ref={fileInputRef}
          type="file"
          accept=".gltf,.glb"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file && modelRef.current?.parent) {
              loadModel(file, modelRef.current.parent as THREE.Scene)
            }
          }}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-white"
        >
          {isLoading ? 'Loading...' : 'Load 3D Model'}
        </button>
      </div>
    </div>
  )
}