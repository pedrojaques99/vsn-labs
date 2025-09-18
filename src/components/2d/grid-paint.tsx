'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

interface GridPaintProps {
  gridSize?: number
  cellSize?: number
  strokeWidth?: number
  fillColor?: string
  backgroundColor?: string
}

type Resolution = {
  label: string
  gridSize: number
  cellSize: number
}

type VectorShape = {
  label: string
  value: 'rounded' | 'square' | 'circle' | 'diamond'
}

type ConnectionType = {
  label: string
  value: '90deg' | 'organic' | 'web' | 'simple' | 'ref' | 'off'
}

const resolutions: Resolution[] = [
  { label: 'XS', gridSize: 15, cellSize: 50 },
  { label: 'S', gridSize: 20, cellSize: 40 },
  { label: 'M', gridSize: 30, cellSize: 30 },
  { label: 'L', gridSize: 40, cellSize: 25 },
  { label: 'XL', gridSize: 50, cellSize: 20 },
  { label: 'XXL', gridSize: 60, cellSize: 15 }
]


const vectorShapes: VectorShape[] = [
  { label: 'ROUND', value: 'rounded' },
  { label: 'SQUARE', value: 'square' },
  { label: 'CIRCLE', value: 'circle' },
  { label: 'DIAMOND', value: 'diamond' }
]

// Shape icon components
const ShapeIcon = ({ type, size = 16 }: { type: VectorShape['value'], size?: number }) => {
  const commonProps = { width: size, height: size, viewBox: '0 0 16 16', fill: 'currentColor' }
  
  switch (type) {
    case 'rounded':
      return (
        <svg {...commonProps}>
          <rect x="2" y="2" width="12" height="12" rx="4" ry="4" />
        </svg>
      )
    case 'square':
      return (
        <svg {...commonProps}>
          <rect x="2" y="2" width="12" height="12" />
        </svg>
      )
    case 'circle':
      return (
        <svg {...commonProps}>
          <circle cx="8" cy="8" r="6" />
        </svg>
      )
    case 'diamond':
      return (
        <svg {...commonProps}>
          <path d="M8 2 L14 8 L8 14 L2 8 Z" />
        </svg>
      )
    default:
      return null
  }
}

const connectionTypes: ConnectionType[] = [
  { label: '90°', value: '90deg' },
  { label: 'ORGANIC', value: 'organic' },
  { label: 'WEB', value: 'web' },
  { label: 'SIMPLE', value: 'simple' },
  { label: 'REF', value: 'ref' },
  { label: 'OFF', value: 'off' }
]

export function GridPaint({
  strokeWidth = 18,
  backgroundColor = '#f5f5f5'
}: GridPaintProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [filledCells, setFilledCells] = useState<Set<string>>(new Set())
  const [isDragging, setIsDragging] = useState(false)
  const [isErasing, setIsErasing] = useState(false) // Track if we're in erase mode
  const [fillColor, setFillColor] = useState('#000000')
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState('#f5f5f5')
  const [currentShape, setCurrentShape] = useState<VectorShape['value']>('rounded')
  const [connectionType, setConnectionType] = useState<ConnectionType['value']>('90deg')
  const [strokeThickness, setStrokeThickness] = useState(0.95) // Percentage of cell size
  const [connectionDensity, setConnectionDensity] = useState(1.0) // 1.0 = all connections, 0.5 = half
  const [showControls, setShowControls] = useState(true)
  
  // Canvas panning state
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  
  // Undo functionality
  const [history, setHistory] = useState<Array<Set<string>>>([new Set()])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [showUndoTip, setShowUndoTip] = useState(false)
  
  // Zoom state (replaces resolution)
  const [zoom, setZoom] = useState(100) // percentage
  const currentCellSize = (30 * zoom) / 100 // Base cell size of 30px

  const getCellFromPoint = useCallback((x: number, y: number): [number, number] => {
    const canvas = canvasRef.current
    if (!canvas) return [0, 0]
    
    const rect = canvas.getBoundingClientRect()
    const canvasX = x - rect.left
    const canvasY = y - rect.top
    
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    // Account for canvas offset (panning)
    const scaledX = (canvasX * scaleX) - canvasOffset.x
    const scaledY = (canvasY * scaleY) - canvasOffset.y
    
    const cellX = Math.floor(scaledX / currentCellSize)
    const cellY = Math.floor(scaledY / currentCellSize)
    
    return [cellX, cellY]
  }, [currentCellSize, canvasOffset])

  const saveToHistory = useCallback((newState: Set<string>) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(new Set(newState))
      return newHistory.slice(-50) // Keep only last 50 states
    })
    setHistoryIndex(prev => Math.min(prev + 1, 49))
  }, [historyIndex])

  const toggleCell = useCallback((cellX: number, cellY: number, forceMode?: 'draw' | 'erase') => {
    const gridSize = Math.ceil(Math.max(window.innerWidth, window.innerHeight) / currentCellSize)
    if (cellX < -gridSize || cellX >= gridSize || cellY < -gridSize || cellY >= gridSize) return
    
    const cellKey = `${cellX},${cellY}`
    setFilledCells(prev => {
      const newSet = new Set(prev)
      const cellExists = newSet.has(cellKey)
      
      // Determine mode based on first click or forced mode
      const mode = forceMode || (cellExists ? 'erase' : 'draw')
      
      if (mode === 'erase' && cellExists) {
        newSet.delete(cellKey)
      } else if (mode === 'draw' && !cellExists) {
        newSet.add(cellKey)
      }
      
      saveToHistory(newSet)
      return newSet
    })
  }, [currentCellSize, saveToHistory])

  const startDrawing = useCallback((cellX: number, cellY: number) => {
    const cellKey = `${cellX},${cellY}`
    const cellExists = filledCells.has(cellKey)
    
    // Determine mode based on first click
    setIsErasing(cellExists)
    
    // Apply the action
    toggleCell(cellX, cellY, cellExists ? 'erase' : 'draw')
  }, [filledCells, toggleCell])

  const continueDrawing = useCallback((cellX: number, cellY: number) => {
    // Continue with the established mode
    toggleCell(cellX, cellY, isErasing ? 'erase' : 'draw')
  }, [isErasing, toggleCell])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1)
      setFilledCells(new Set(history[historyIndex - 1]))
      
      // Show undo tip
      setShowUndoTip(true)
      setTimeout(() => setShowUndoTip(false), 1000)
    }
  }, [historyIndex, history])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1)
      setFilledCells(new Set(history[historyIndex + 1]))
      
      // Show redo tip
      setShowUndoTip(true)
      setTimeout(() => setShowUndoTip(false), 1000)
    }
  }, [historyIndex, history])

  // Touch handling state
  const [touchState, setTouchState] = useState<{
    touches: Array<{ id: number; x: number; y: number }>
    initialDistance?: number
    lastPanOffset?: { x: number; y: number }
  }>({ touches: [] })

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    
    // Check if middle mouse button or space + left mouse
    if (e.button === 1 || (isSpacePressed && e.button === 0)) {
      // Start panning
      setIsPanning(true)
      setPanStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y })
      return
    }
    
    // Regular drawing with left mouse button (not panning)
    if (e.button === 0 && !isSpacePressed) {
      setIsDragging(true)
      const [cellX, cellY] = getCellFromPoint(e.clientX, e.clientY)
      startDrawing(cellX, cellY)
    }
  }, [getCellFromPoint, startDrawing, isSpacePressed, canvasOffset])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      // Update canvas offset for panning
      const newOffset = {
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      }
      setCanvasOffset(newOffset)
      return
    }
    
    if (!isDragging) return
    const [cellX, cellY] = getCellFromPoint(e.clientX, e.clientY)
    continueDrawing(cellX, cellY)
  }, [isDragging, isPanning, getCellFromPoint, panStart, continueDrawing])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsPanning(false)
    setIsErasing(false) // Reset erase mode
  }, [])

  // Touch event handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    
    const touches = Array.from(e.touches).map(touch => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY
    }))
    
    setTouchState({ touches })
    
    if (touches.length === 1) {
      // Single touch - start drawing
      setIsDragging(true)
      const [cellX, cellY] = getCellFromPoint(touches[0].x, touches[0].y)
      startDrawing(cellX, cellY)
    } else if (touches.length === 2) {
      // Two fingers - start panning
      setIsDragging(false)
      setIsPanning(true)
      
      const centerX = (touches[0].x + touches[1].x) / 2
      const centerY = (touches[0].y + touches[1].y) / 2
      
      setPanStart({ x: centerX - canvasOffset.x, y: centerY - canvasOffset.y })
      setTouchState(prev => ({ ...prev, lastPanOffset: canvasOffset }))
    }
  }, [getCellFromPoint, toggleCell, canvasOffset])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    
    const touches = Array.from(e.touches).map(touch => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY
    }))
    
    if (touches.length === 1 && isDragging && !isPanning) {
      // Single touch drawing
      const [cellX, cellY] = getCellFromPoint(touches[0].x, touches[0].y)
      continueDrawing(cellX, cellY)
    } else if (touches.length === 2 && isPanning) {
      // Two finger panning
      const centerX = (touches[0].x + touches[1].x) / 2
      const centerY = (touches[0].y + touches[1].y) / 2
      
      const newOffset = {
        x: centerX - panStart.x,
        y: centerY - panStart.y
      }
      setCanvasOffset(newOffset)
    }
    
    setTouchState({ touches })
  }, [isDragging, isPanning, getCellFromPoint, panStart])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    
    const touches = Array.from(e.touches).map(touch => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY
    }))
    
    setTouchState({ touches })
    
    if (touches.length === 0) {
      // All fingers lifted
      setIsDragging(false)
      setIsPanning(false)
      setIsErasing(false) // Reset erase mode
    } else if (touches.length === 1 && isPanning) {
      // One finger left, switch from panning to drawing
      setIsPanning(false)
      setIsDragging(true)
      const [cellX, cellY] = getCellFromPoint(touches[0].x, touches[0].y)
      startDrawing(cellX, cellY)
    }
  }, [getCellFromPoint, startDrawing, isPanning])

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current
    if (!canvas) return

    ctx.fillStyle = canvasBackgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Apply canvas offset for panning
    ctx.save()
    ctx.translate(canvasOffset.x, canvasOffset.y)

    // Subtle grid dots instead of lines for cleaner look
    ctx.fillStyle = fillColor
    ctx.globalAlpha = 0.2

    const gridSize = Math.ceil(Math.max(canvas.width, canvas.height) / currentCellSize) + 10
    const startX = Math.floor(-canvasOffset.x / currentCellSize) - 5
    const startY = Math.floor(-canvasOffset.y / currentCellSize) - 5

    for (let x = startX; x <= startX + gridSize; x++) {
      for (let y = startY; y <= startY + gridSize; y++) {
        ctx.beginPath()
        ctx.arc(x * currentCellSize, y * currentCellSize, 1, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    ctx.globalAlpha = 1
    ctx.restore()
  }, [currentCellSize, fillColor, canvasBackgroundColor, canvasOffset])

  // Function to build REF paths - continuous tubes through cell centers
  const buildRefPaths = useCallback((
    filledArray: Array<{x:number,y:number}>,
    filledCells: Set<string>,
    cellSize: number
  ): Path2D[] => {
    const key = (x:number,y:number)=>`${x},${y}`;
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    const centerX = (x:number)=> x*cellSize + cellSize/2;
    const centerY = (y:number)=> y*cellSize + cellSize/2;

    // grafo 4-vizinhos
    const neighbors = new Map<string, Array<{x:number,y:number}>>();
    for (const c of filledArray) {
      const list: Array<{x:number,y:number}> = [];
      for (const [dx,dy] of dirs) {
        const nx=c.x+dx, ny=c.y+dy;
        if (filledCells.has(key(nx,ny))) list.push({x:nx,y:ny});
      }
      neighbors.set(key(c.x,c.y), list);
    }

    // endpoints (grau 1). se não houver, é loop
    const endpoints: Array<{x:number,y:number}> = [];
    for (const c of filledArray) {
      if ((neighbors.get(key(c.x,c.y))?.length ?? 0) === 1) endpoints.push(c);
    }

    const edgeKey = (a:string,b:string)=> a<b?`${a}-${b}`:`${b}-${a}`;
    const visitedEdges = new Set<string>();
    const paths: Path2D[] = [];

    function traceFrom(start:{x:number,y:number}) {
      const tube = new Path2D();
      let prev: {x:number,y:number}|null = null;
      let curr = {x:start.x,y:start.y};
      tube.moveTo(centerX(curr.x), centerY(curr.y));

      while (true) {
        const nbrs = neighbors.get(key(curr.x,curr.y)) || [];
        let next: {x:number,y:number}|null = null;

        // pega próxima aresta ainda não visitada
        for (const n of nbrs) {
          const ek = edgeKey(key(curr.x,curr.y), key(n.x,n.y));
          if (!visitedEdges.has(ek)) { next = n; break; }
        }
        if (!next) break;

        // marca aresta
        visitedEdges.add(edgeKey(key(curr.x,curr.y), key(next.x,next.y)));

        const p2x = centerX(curr.x), p2y = centerY(curr.y);
        const p3x = centerX(next.x),  p3y = centerY(next.y);

        if (prev) {
          // transição suave no canto (arcTo). raio será aplicado no stroke.
          tube.lineTo(p2x, p2y);
          // Check if arcTo method exists on Path2D
          if ('arcTo' in tube && typeof (tube as unknown as CanvasRenderingContext2D).arcTo === 'function') {
            (tube as unknown as CanvasRenderingContext2D).arcTo(p2x, p2y, p3x, p3y, 1); // raio simbólico; o arredondamento real vem do stroke round
          } else {
            // fallback: 
            tube.quadraticCurveTo(p2x, p2y, p3x, p3y);
          }
        } else {
          tube.lineTo(p3x, p3y);
        }

        prev = curr;
        curr = next;
      }

      paths.push(tube);
    }

    // trilhas: primeiro endpoints (ramos abertos), depois loops
    for (const s of endpoints) traceFrom(s);
    for (const c of filledArray) {
      const nbrs = neighbors.get(key(c.x,c.y)) || [];
      for (const n of nbrs) {
        const ek = edgeKey(key(c.x,c.y), key(n.x,n.y));
        if (!visitedEdges.has(ek)) { traceFrom(c); }
      }
    }

    return paths;
  }, []);

  const drawConnections = useCallback((ctx: CanvasRenderingContext2D) => {
    const filledArray = Array.from(filledCells).map(key => {
      const [x, y] = key.split(',').map(Number)
      return { x, y }
    })

    if (filledArray.length === 0) return

    // Apply canvas offset for panning
    ctx.save()
    ctx.translate(canvasOffset.x, canvasOffset.y)

    const cellSize = currentCellSize
    
    ctx.fillStyle = fillColor
    ctx.strokeStyle = fillColor
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Step 1: Draw connections based on connection type
    const connectionThickness = cellSize * strokeThickness
    ctx.lineWidth = connectionThickness

    const processedConnections = new Set<string>()

    for (const cell of filledArray) {
      const centerX = cell.x * cellSize + cellSize / 2
      const centerY = cell.y * cellSize + cellSize / 2

      let directions: Array<{ dx: number, dy: number }> = []

      switch (connectionType) {
        case '90deg':
          // Only horizontal and vertical connections
          directions = [
            { dx: 1, dy: 0 },  // right
            { dx: 0, dy: 1 },  // down
            { dx: -1, dy: 0 }, // left
            { dx: 0, dy: -1 }  // up
          ]
          break

        case 'organic':
          // All 8 directions for organic flow
          directions = [
            { dx: 1, dy: 0 },   // right
            { dx: 0, dy: 1 },   // down
            { dx: -1, dy: 0 },  // left
            { dx: 0, dy: -1 },  // up
            { dx: 1, dy: 1 },   // bottom-right
            { dx: -1, dy: 1 },  // bottom-left
            { dx: 1, dy: -1 },  // top-right
            { dx: -1, dy: -1 }  // top-left
          ]
          break

        case 'web':
          // Web pattern - connects to cells within 2-step radius
          directions = [
            { dx: 2, dy: 0 }, { dx: -2, dy: 0 }, { dx: 0, dy: 2 }, { dx: 0, dy: -2 },
            { dx: 1, dy: 1 }, { dx: -1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: -1 },
            { dx: 2, dy: 1 }, { dx: 2, dy: -1 }, { dx: -2, dy: 1 }, { dx: -2, dy: -1 },
            { dx: 1, dy: 2 }, { dx: -1, dy: 2 }, { dx: 1, dy: -2 }, { dx: -1, dy: -2 }
          ]
          break

        case 'simple':
          // Simple pattern - only right and down for clean flowing lines
          directions = [
            { dx: 1, dy: 0 },  // right
            { dx: 0, dy: 1 },  // down
            { dx: 2, dy: 0 },  // skip one right
            { dx: 0, dy: 2 }   // skip one down
          ]
          break

        case 'ref': {
          // REF connection type - continuous tubes through cell centers
          const paths = buildRefPaths(filledArray, filledCells, cellSize);

          // Configure tube styling
          const lineWidth = cellSize * strokeThickness;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeStyle = fillColor;
          ctx.fillStyle = fillColor;
          ctx.lineWidth = lineWidth;

          // Draw each tube path with thick stroke
          for (const p of paths) {
            ctx.stroke(p);
            // Second pass helps "weld" junctions
            ctx.stroke(p);
          }

          // Exit early - don't draw individual cells for REF type
          ctx.restore();
          return;
        }

        case 'off':
          // No connections - only individual cells
          directions = []
          break
      }

      for (const dir of directions) {
        const neighborX = cell.x + dir.dx
        const neighborY = cell.y + dir.dy
        const neighborKey = `${neighborX},${neighborY}`

        if (filledCells.has(neighborKey)) {
          // Apply connection density filter
          if (Math.random() > connectionDensity) continue

          // Create unique connection key (always smaller coordinates first)
          const key1 = `${cell.x},${cell.y}`
          const key2 = `${neighborX},${neighborY}`
          const connectionKey = key1 < key2 ? `${key1}-${key2}` : `${key2}-${key1}`
          
          if (!processedConnections.has(connectionKey)) {
            const neighborCenterX = neighborX * cellSize + cellSize / 2
            const neighborCenterY = neighborY * cellSize + cellSize / 2

            if (connectionType === 'organic') {
              // For organic connections, use curved paths
              const midX = (centerX + neighborCenterX) / 2
              const midY = (centerY + neighborCenterY) / 2
              
              // Add slight curve for more organic feel
              const curveOffset = cellSize * 0.1
              const perpX = -(neighborCenterY - centerY) / Math.sqrt((neighborCenterX - centerX) ** 2 + (neighborCenterY - centerY) ** 2) * curveOffset
              const perpY = (neighborCenterX - centerX) / Math.sqrt((neighborCenterX - centerX) ** 2 + (neighborCenterY - centerY) ** 2) * curveOffset

              ctx.beginPath()
              ctx.moveTo(centerX, centerY)
              ctx.quadraticCurveTo(midX + perpX, midY + perpY, neighborCenterX, neighborCenterY)
              ctx.stroke()
            } else {
              // Straight lines for 90deg and 45deg
              ctx.beginPath()
              ctx.moveTo(centerX, centerY)
              ctx.lineTo(neighborCenterX, neighborCenterY)
              ctx.stroke()
            }

            processedConnections.add(connectionKey)
          }
        }
      }
    }

    // Step 2: Draw individual cells on top
    for (const cell of filledArray) {
      const centerX = cell.x * cellSize + cellSize / 2
      const centerY = cell.y * cellSize + cellSize / 2
      
      ctx.beginPath()
      
      switch (currentShape) {
        case 'rounded':
          const roundedSize = cellSize * 0.85
          const roundedRadius = roundedSize * 0.4
          const roundedX = centerX - roundedSize / 2
          const roundedY = centerY - roundedSize / 2
          ctx.roundRect(roundedX, roundedY, roundedSize, roundedSize, roundedRadius)
          break
          
        case 'square':
          const squareSize = cellSize * 0.8
          const squareX = centerX - squareSize / 2
          const squareY = centerY - squareSize / 2
          ctx.rect(squareX, squareY, squareSize, squareSize)
          break
          
        case 'circle':
          const circleRadius = cellSize * 0.4
          ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2)
          break
          
        case 'diamond':
          const diamondSize = cellSize * 0.35
          ctx.moveTo(centerX, centerY - diamondSize)
          ctx.lineTo(centerX + diamondSize, centerY)
          ctx.lineTo(centerX, centerY + diamondSize)
          ctx.lineTo(centerX - diamondSize, centerY)
          ctx.closePath()
          break
      }
      
      ctx.fill()
    }

    ctx.restore()

  }, [filledCells, currentCellSize, fillColor, currentShape, connectionType, strokeThickness, connectionDensity, canvasOffset, buildRefPaths])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to full window
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Clear and draw
    drawGrid(ctx)
    drawConnections(ctx)
  }, [filledCells, drawGrid, drawConnections])

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setIsSpacePressed(true)
      }
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault()
        undo()
      }
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault()
        redo()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setIsSpacePressed(false)
      }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [undo, redo])

  const clearGrid = useCallback(() => {
    setFilledCells(new Set())
    saveToHistory(new Set())
  }, [saveToHistory])

  const increaseZoom = useCallback(() => {
    setZoom(prev => Math.min(prev + 25, 400))
  }, [])

  const decreaseZoom = useCallback(() => {
    setZoom(prev => Math.max(prev - 25, 25))
  }, [])

  const setZoomValue = useCallback((value: number) => {
    setZoom(Math.max(25, Math.min(400, value)))
  }, [])

  // Determine cursor style
  const getCursorStyle = () => {
    if (isPanning) return 'grabbing'
    if (isSpacePressed) return 'grab'
    return 'crosshair'
  }

  const toggleControls = useCallback(() => {
    setShowControls(prev => !prev)
  }, [])

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-100">
      {/* Fullscreen Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{
          width: '100vw',
          height: '100vh',
          cursor: getCursorStyle(),
          touchAction: 'none' // Prevent default touch behaviors
        }}
      />
      
      {/* Floating Controls */}
      {showControls && (
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-gray-200">
          <h1 className="text-black text-lg font-mono mb-3 font-bold">GRID PAINT</h1>
          
          {/* Zoom Controls */}
          <div className="mb-4">
            <label className="block text-xs font-mono text-gray-600 mb-2">ZOOM</label>
            <div className="flex items-center gap-2">
              <button
                onClick={decreaseZoom}
                disabled={zoom <= 25}
                className="px-2 py-1 text-xs font-mono bg-gray-200 text-black hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                −
              </button>
              <input
                type="number"
                value={zoom}
                onChange={(e) => setZoomValue(parseInt(e.target.value) || 100)}
                className="w-16 px-2 py-1 text-xs font-mono text-center bg-black text-white border-none outline-none"
                min="25"
                max="400"
              />
              <span className="text-xs font-mono text-gray-600">%</span>
              <button
                onClick={increaseZoom}
                disabled={zoom >= 400}
                className="px-2 py-1 text-xs font-mono bg-gray-200 text-black hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                +
              </button>
              
              {/* Undo/Redo buttons */}
              <div className="flex gap-1 ml-2 border-l border-gray-300 pl-2">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="p-1 text-xs font-mono bg-gray-200 text-black hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Desfazer (Ctrl+Z)"
                >
                  ↶
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-1 text-xs font-mono bg-gray-200 text-black hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Refazer (Ctrl+Y)"
                >
                  ↷
                </button>
              </div>
            </div>
          </div>
          
          {/* Color Controls */}
          <div className="mb-4">
            <label className="block text-xs font-mono text-gray-600 mb-2">COLORS</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-600">VECTOR</span>
                <div className="relative">
                  <input
                    type="color"
                    value={fillColor}
                    onChange={(e) => setFillColor(e.target.value)}
                    className="w-6 h-6 rounded-full border-2 border-gray-300 cursor-pointer"
                    style={{ backgroundColor: fillColor }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-600">BG</span>
                <div className="relative">
                  <input
                    type="color"
                    value={canvasBackgroundColor}
                    onChange={(e) => setCanvasBackgroundColor(e.target.value)}
                    className="w-6 h-6 rounded-full border-2 border-gray-300 cursor-pointer"
                    style={{ backgroundColor: canvasBackgroundColor }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Shape Controls */}
          <div className="mb-4">
            <label className="block text-xs font-mono text-gray-600 mb-2">SHAPE</label>
            <div className="grid grid-cols-4 gap-1">
              {vectorShapes.map((shape) => (
                <button
                  key={shape.label}
                  onClick={() => setCurrentShape(shape.value)}
                  className={`p-2 transition-colors flex items-center justify-center ${
                    currentShape === shape.value
                      ? 'bg-black text-white'
                      : 'bg-gray-200 text-black hover:bg-gray-300'
                  }`}
                  title={shape.label}
                >
                  <ShapeIcon type={shape.value} size={16} />
                </button>
              ))}
            </div>
          </div>
          
          {/* Stroke & Connection Controls */}
          <div className="mb-4">
            <label className="block text-xs font-mono text-gray-600 mb-2">SETTINGS</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-600 w-16">THICKNESS</span>
                <input
                  type="range"
                  min="0.3"
                  max="1.2"
                  step="0.1"
                  value={strokeThickness}
                  onChange={(e) => setStrokeThickness(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs font-mono text-gray-600 w-8">{Math.round(strokeThickness * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-600 w-16">DENSITY</span>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.1"
                  value={connectionDensity}
                  onChange={(e) => setConnectionDensity(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs font-mono text-gray-600 w-8">{Math.round(connectionDensity * 100)}%</span>
              </div>
            </div>
          </div>
          
          {/* Connection Type Controls */}
          <div className="mb-4">
            <label className="block text-xs font-mono text-gray-600 mb-2">CONNECTION</label>
            <div className="grid grid-cols-3 gap-1">
              {connectionTypes.map((connection) => (
                <button
                  key={connection.label}
                  onClick={() => setConnectionType(connection.value)}
                  className={`px-2 py-1 text-xs font-mono transition-colors ${
                    connectionType === connection.value
                      ? 'bg-black text-white'
                      : 'bg-gray-200 text-black hover:bg-gray-300'
                  }`}
                >
                  {connection.label}
                </button>
              ))}
            </div>
          </div>
          
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={clearGrid}
              className="px-3 py-1 bg-red-500 text-white font-mono text-xs hover:bg-red-600 transition-colors rounded"
            >
              CLEAR
            </button>
          </div>
          
          <div className="mt-3 text-gray-500 text-xs font-mono">
            {filledCells.size} cells • {zoom}% • {currentShape.toUpperCase()} • {connectionType.toUpperCase()}
          </div>
        </div>
      )}
      
      {/* Toggle Controls Button */}
      <button
        onClick={toggleControls}
        className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-gray-200 hover:bg-white transition-colors"
      >
        <div className="w-5 h-5 text-gray-600">
          {showControls ? '−' : '+'}
        </div>
      </button>
      
      {/* Help Text */}
      {!showControls && (
        <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200">
          <p className="text-gray-600 text-xs font-mono">
            Click and drag to paint • Space + drag to pan • Ctrl+Z to undo • Press + for controls
          </p>
        </div>
      )}

      {/* Undo Tip */}
      {showUndoTip && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-black/80 text-white px-4 py-2 rounded-lg font-mono text-sm">
          Undo
        </div>
      )}
    </div>
  )
}
