# 🎯 Estrutura de Componentes

## 📁 Organização por Tecnologia

### 🎮 **3D/** - Componentes Three.js
Componentes que usam WebGL/Three.js para renderização 3D.

- `WavePolarGrid.tsx` - Grade polar de partículas 3D
- `wave-ascii-3d.tsx` - Visualização 3D com ASCII art overlay

**Características:**
- ✅ Sistema unificado de inicialização
- ✅ Gerenciamento automático de recursos
- ✅ Cleanup automático
- ✅ Tratamento de erros WebGL

### 🎨 **2D/** - Componentes Canvas 2D
Componentes que usam Canvas 2D para efeitos visuais.

- `audio-frequency-wave.tsx` - Visualizador de áudio em tempo real
- `wave-ascii-vortex.tsx` - Efeito vortex ASCII art
- `frequency-wave.tsx` - Ondas de frequência interativas
- `particle-3d-globe.tsx` - Simulação de partículas em esfera
- `particle-glitch.tsx` - Partículas com efeito glitch
- `topographic.tsx` - Linhas topográficas
- `elliptical-lines.tsx` - Linhas elípticas animadas
- `bitmap-radio-wave.tsx` - Ondas de rádio em bitmap
- `wave-ascii.tsx` - Ondas ASCII art
- `wave-demo.tsx` - Demo de ondas

**Características:**
- 🚀 Performance otimizada para 2D
- 🎯 Efeitos visuais leves
- 📱 Compatível com dispositivos móveis

### 🔧 **shared/** - Componentes Compartilhados
Componentes reutilizáveis entre diferentes tipos de efeitos.

- `BaseThreeJS.tsx` - Wrapper base para componentes 3D

## 📦 **Como Importar**

### Importação Específica
```tsx
// Componentes 3D
import { WavePolarGrid, WaveAscii3D } from '@/components/3d'

// Componentes 2D
import { AudioFrequencyWave, WaveAsciiVortex } from '@/components/2d'

// Componentes compartilhados
import { BaseThreeJS } from '@/components/shared'
```

### Importação Geral
```tsx
// Todos os componentes
import { WavePolarGrid, AudioFrequencyWave, BaseThreeJS } from '@/components'
```

## 🏗️ **Arquitetura**

```
src/components/
├── index.ts              # Exportações principais
├── 3d/                  # Componentes Three.js
│   ├── index.ts         # Exportações 3D
│   ├── WavePolarGrid.tsx
│   └── wave-ascii-3d.tsx
├── 2d/                  # Componentes Canvas 2D
│   ├── index.ts         # Exportações 2D
│   ├── audio-frequency-wave.tsx
│   ├── wave-ascii-vortex.tsx
│   └── ... (outros 8 componentes)
└── shared/              # Componentes compartilhados
    ├── index.ts         # Exportações compartilhadas
    └── BaseThreeJS.tsx
```

## 🎯 **Benefícios da Organização**

1. **Separação Clara**: 3D vs 2D facilmente identificável
2. **Manutenção**: Código organizado por tecnologia
3. **Reutilização**: Componentes compartilhados centralizados
4. **Escalabilidade**: Fácil adicionar novos componentes
5. **Importações Limpas**: Caminhos organizados e intuitivos

## 🚀 **Adicionando Novos Componentes**

### Para Componentes 3D:
1. Criar arquivo em `src/components/3d/`
2. Adicionar exportação em `src/components/3d/index.ts`
3. Usar `BaseThreeJS` para inicialização

### Para Componentes 2D:
1. Criar arquivo em `src/components/2d/`
2. Adicionar exportação em `src/components/2d/index.ts`
3. Usar Canvas 2D para renderização

### Para Componentes Compartilhados:
1. Criar arquivo em `src/components/shared/`
2. Adicionar exportação em `src/components/shared/index.ts`
3. Reutilizar em outros componentes
