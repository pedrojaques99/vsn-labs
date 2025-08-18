'use client'

import { useRef, useCallback } from 'react'
import * as THREE from 'three'
import { BaseThreeJS } from '../shared/BaseThreeJS'

// Move constants outside component to prevent callback recreation
const RING_COUNT = 16
const PARTICLES_PER_RING = 40
const RING_SPACING = 1
const PARTICLE_SIZE = 0.05
const SCALE_X = 1.5
const SCALE_Y = 1
const SCALE_Z = 1.5
const PARTICLE_COLOR = 0xffffff
const PARTICLE_OPACITY = 0.8
const WAVE_AMPLITUDE = 1.5
const WAVE_SPEED = 3
const INFLUENCE_RADIUS = 0.1
const MOUSE_SCALE = 8
const ROTATION_SPEED = 0.1

// Stabilize config objects outside component to prevent re-creation
const CAMERA_CONFIG = {
  fov: 75,
  near: 0.1,
  far: 1000,
  position: [0, 8, 8] as [number, number, number]
}

const COMPONENT_STYLE = { cursor: 'crosshair' as const }

export default function WavePolarGrid() {
  const particlesRef = useRef<THREE.InstancedMesh | null>(null)
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(0.5, 0.5))
  const animationRef = useRef<number | null>(null)
  
  // Reuse objects to avoid garbage collection
  const matrixRef = useRef(new THREE.Matrix4())
  const tempVectorRef = useRef(new THREE.Vector3())
  const tempQuaternionRef = useRef(new THREE.Quaternion())
  const mouseWorldPosRef = useRef(new THREE.Vector3())

  // Función de renderización optimizada
  const render = useCallback((scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => {
    if (!particlesRef.current) return

    const time = performance.now() * 0.001
    const particles = particlesRef.current
    
    // Reuse existing objects
    const matrix = matrixRef.current
    const tempVector = tempVectorRef.current
    const tempQuaternion = tempQuaternionRef.current
    const mouseWorldPos = mouseWorldPosRef.current

    // Pre-calculate mouse world position once
    mouseWorldPos.set(
      mouseRef.current.x * MOUSE_SCALE,
      0,
      mouseRef.current.y * MOUSE_SCALE
    )

    for (let ring = 0; ring < RING_COUNT; ring++) {
      const ringRadius = ring * RING_SPACING
      
      for (let i = 0; i < PARTICLES_PER_RING; i++) {
        const angle = (i / PARTICLES_PER_RING) * Math.PI * 2 + time * ROTATION_SPEED
        const index = ring * PARTICLES_PER_RING + i
        
        // Calculate base position
        const cosAngle = Math.cos(angle)
        const sinAngle = Math.sin(angle)
        
        tempVector.set(
          cosAngle * ringRadius,
          0,
          sinAngle * ringRadius
        )
        
        // Add interactive wave effect
        const distanceFromMouse = tempVector.distanceTo(mouseWorldPos)
        const influence = Math.exp(-distanceFromMouse * INFLUENCE_RADIUS)
        const waveHeight = influence * Math.sin(time * WAVE_SPEED) * WAVE_AMPLITUDE
        tempVector.y = waveHeight
        
        // Reuse quaternion calculation
        tempQuaternion.setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          angle
        )
        
        // Apply transformations  
        matrix.compose(tempVector, tempQuaternion, new THREE.Vector3(1, 1, 1))
        particles.setMatrixAt(index, matrix)
      }
    }
    
    particles.instanceMatrix.needsUpdate = true
    renderer.render(scene, camera)
  }, []) // Remove all dependencies since we use constants

  // Setup das partículas optimizado
  const setupParticles = useCallback((scene: THREE.Scene) => {
    // Create particle geometry
    const particleGeometry = new THREE.SphereGeometry(PARTICLE_SIZE, 8, 6)
    particleGeometry.scale(SCALE_X, SCALE_Y, SCALE_Z)

    // Create particle material
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: PARTICLE_COLOR,
      transparent: true,
      opacity: PARTICLE_OPACITY,
    })

    // Calculate total particles
    const totalParticles = RING_COUNT * PARTICLES_PER_RING

    // Create instanced mesh
    const particles = new THREE.InstancedMesh(
      particleGeometry,
      particleMaterial,
      totalParticles
    )
    scene.add(particles)
    particlesRef.current = particles

    // Reuse objects for initial setup
    const matrix = matrixRef.current
    const tempVector = tempVectorRef.current
    const tempQuaternion = tempQuaternionRef.current

    for (let ring = 0; ring < RING_COUNT; ring++) {
      const ringRadius = ring * RING_SPACING
      
      for (let i = 0; i < PARTICLES_PER_RING; i++) {
        const angle = (i / PARTICLES_PER_RING) * Math.PI * 2
        const index = ring * PARTICLES_PER_RING + i
        
        // Calculate position
        tempVector.set(
          Math.cos(angle) * ringRadius,
          0,
          Math.sin(angle) * ringRadius
        )
        
        // Create rotation matrix
        tempQuaternion.setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          angle
        )
        
        // Apply transformations
        matrix.compose(tempVector, tempQuaternion, new THREE.Vector3(1, 1, 1))
        particles.setMatrixAt(index, matrix)
      }
    }
  }, []) // Remove all dependencies

  // Mouse interaction
  const handlePointerMove = useCallback((event: PointerEvent) => {
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    
    mouseRef.current.set(x, y)
  }, [])

  // Setup do componente
  const handleInitialized = useCallback((scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => {
    console.log('🌊 WavePolarGrid: handleInitialized called', { scene, camera, renderer })
    
    try {
      console.log('⚪ WavePolarGrid: Setting up particles')
      // Setup das partículas
      setupParticles(scene)

      console.log('🖱️ WavePolarGrid: Setting up mouse events')
      // Mouse events
      const container = renderer.domElement
      container.addEventListener('pointermove', handlePointerMove)
      container.addEventListener('pointerenter', () => {
        container.style.cursor = 'crosshair'
      })
      container.addEventListener('pointerleave', () => {
        container.style.cursor = 'default'
      })

      console.log('🎬 WavePolarGrid: Starting animation loop')
      // Iniciar loop de renderização
      const animate = () => {
        if (animationRef.current) {
          render(scene, camera, renderer)
          animationRef.current = requestAnimationFrame(animate)
        }
      }
      
      animationRef.current = requestAnimationFrame(animate)
      console.log('✅ WavePolarGrid: Initialization complete')
      
    } catch (error) {
      console.error('💥 WavePolarGrid: Initialization failed:', error)
    }
  }, []) // Remove dependencies that change on every render

  // Cleanup function
  const cleanup = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }, [])

  return (
    <BaseThreeJS
      cameraConfig={CAMERA_CONFIG}
      onInitialized={handleInitialized}
      onError={cleanup}
      showGrid={true}
      className="w-full h-full min-h-screen bg-black"
      style={COMPONENT_STYLE}
      loadingText="Carregando Wave Polar Grid..."
      errorText="Erro ao carregar Wave Polar Grid"
    />
  )
}
