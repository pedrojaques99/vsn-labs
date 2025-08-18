'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default function WavePolarGrid() {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const particlesRef = useRef<THREE.InstancedMesh | null>(null)
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(0.5, 0.5))
  const animationIdRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 8, 8)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.setClearColor(0x000000)
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.01
    controlsRef.current = controls

    // ===================== CONFIGURAÇÕES DAS PARTÍCULAS =====================
    
    // QUANTIDADE DE PARTÍCULAS
    const ringCount = 16           // Quantos anéis (círculos) - mais anéis = mais partículas
    const particlesPerRing = 40   // Quantas partículas por anel - mais = mais densas
    
    // ESPAÇAMENTO
    const ringSpacing = 1       // Distância entre anéis - maior = mais espaçadas
    
    // TAMANHO DAS PARTÍCULAS
    const particleSize = 0.05     // Tamanho base das partículas - maior = partículas maiores
    
    // FORMATO DAS PARTÍCULAS
    const scaleX = 1.5              // Largura (1 = normal, >1 = mais larga, <1 = mais estreita)
    const scaleY = 1            // Altura (1 = esfera, <1 = achatada, >1 = alongada)
    const scaleZ = 1.5              // Profundidade (1 = normal)
    
    // APARÊNCIA
    const particleColor = 0xffffff  // Cor das partículas (hex color)
    const particleOpacity = 0.8     // Transparência (0 = invisível, 1 = opaco)
    
    // ==================== CONFIGURAÇÕES DE INTERATIVIDADE ====================
    
    // INTENSIDADE DO EFEITO MOUSE
    const waveAmplitude = 1.5         // Altura máxima das ondas (maior = efeito mais forte)
    const waveSpeed = 3               // Velocidade da animação das ondas
    const influenceRadius = 0.1       // Raio de influência do mouse (menor = mais focado)
    const mouseScale = 8              // Escala do movimento do mouse (maior = área maior)
    
    // ANIMAÇÃO GERAL
    const rotationSpeed = 0.1         // Velocidade de rotação das partículas (0 = sem rotação)
    
    // ========================================================================

    // Create particle geometry (small ellipsoid)
    const particleGeometry = new THREE.SphereGeometry(particleSize, 8, 6)
    particleGeometry.scale(scaleX, scaleY, scaleZ) // Apply custom shape

    // Create particle material with glow effect
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: particleColor,
      transparent: true,
      opacity: particleOpacity,
    })

    // Calculate particle positions in polar grid
    const totalParticles = ringCount * particlesPerRing

    // Create instanced mesh
    const particles = new THREE.InstancedMesh(
      particleGeometry,
      particleMaterial,
      totalParticles
    )
    scene.add(particles)
    particlesRef.current = particles

    // Set up particle positions and create matrices
    const matrix = new THREE.Matrix4()
    const tempVector = new THREE.Vector3()
    const tempQuaternion = new THREE.Quaternion()

    for (let ring = 0; ring < ringCount; ring++) {
      const ringRadius = ring * ringSpacing
      
      for (let i = 0; i < particlesPerRing; i++) {
        const angle = (i / particlesPerRing) * Math.PI * 2
        const index = ring * particlesPerRing + i
        
        // Calculate position
        tempVector.set(
          Math.cos(angle) * ringRadius,
          0,
          Math.sin(angle) * ringRadius
        )
        
        // Create rotation matrix to align particles with radial direction
        tempQuaternion.setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          angle
        )
        
        // Apply transformations
        matrix.compose(tempVector, tempQuaternion, new THREE.Vector3(1, 1, 1))
        particles.setMatrixAt(index, matrix)
      }
    }

    // Mouse interaction
    const handlePointerMove = (event: PointerEvent) => {
      const rect = mountRef.current!.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      
      mouseRef.current.set(x, y)
    }

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)

      const time = performance.now() * 0.001

      // Animate particles
      if (particlesRef.current) {
        const particles = particlesRef.current
        const matrix = new THREE.Matrix4()
        const tempVector = new THREE.Vector3()
        const tempQuaternion = new THREE.Quaternion()

        for (let ring = 0; ring < ringCount; ring++) {
          const ringRadius = ring * ringSpacing
          
          for (let i = 0; i < particlesPerRing; i++) {
            const angle = (i / particlesPerRing) * Math.PI * 2 + time * rotationSpeed
            const index = ring * particlesPerRing + i
            
            // Calculate base position
            tempVector.set(
              Math.cos(angle) * ringRadius,
              0,
              Math.sin(angle) * ringRadius
            )
            
            // Add interactive wave effect based on mouse position
            const mouseWorldPos = new THREE.Vector3(
              mouseRef.current.x * mouseScale, 
              0, 
              mouseRef.current.y * mouseScale
            )
            const distanceFromMouse = tempVector.distanceTo(mouseWorldPos)
            
            // Create wave with configurable parameters
            const influence = Math.exp(-distanceFromMouse * influenceRadius)
            const waveHeight = influence * Math.sin(time * waveSpeed) * waveAmplitude
            tempVector.y = waveHeight
            
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
        
        particles.instanceMatrix.needsUpdate = true
      }

      controls.update()
      renderer.render(scene, camera)
    }

    // Event listeners
    mountRef.current.addEventListener('pointermove', handlePointerMove)
    mountRef.current.addEventListener('pointerenter', () => {
      mountRef.current!.style.cursor = 'crosshair'
    })
    mountRef.current.addEventListener('pointerleave', () => {
      mountRef.current!.style.cursor = 'default'
    })

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return

      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight

      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    // Start animation
    animate()

    // Cleanup function
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }

      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeEventListener('pointermove', handlePointerMove)
        mountRef.current.removeEventListener('pointerenter', () => {})
        mountRef.current.removeEventListener('pointerleave', () => {})
        mountRef.current.removeChild(rendererRef.current.domElement)
      }

      window.removeEventListener('resize', handleResize)

      // Dispose of Three.js resources
      if (particleGeometry) particleGeometry.dispose()
      if (particleMaterial) particleMaterial.dispose()
      if (rendererRef.current) rendererRef.current.dispose()
    }
  }, [])

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full min-h-screen bg-black"
      style={{ cursor: 'crosshair' }}
    />
  )
}