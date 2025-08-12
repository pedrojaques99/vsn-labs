# Instalação do Wave ASCII

## Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

## Passos para Instalação

### 1. Instalar Dependências

```bash
npm install
```

### 2. Executar o Projeto

```bash
npm run dev
```

### 3. Acessar no Navegador

Abra [http://localhost:3000](http://localhost:3000)

## Estrutura de Arquivos

```
wave-ascii/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Página principal
│   │   ├── layout.tsx        # Layout da aplicação
│   │   └── globals.css       # Estilos globais
│   ├── components/
│   │   ├── wave-ascii.tsx    # Componente principal
│   │   └── wave-demo.tsx     # Componente de demonstração
│   └── lib/
│       └── utils.ts          # Utilitários CSS
├── package.json              # Dependências do projeto
├── tailwind.config.js        # Configuração do Tailwind
├── tsconfig.json            # Configuração do TypeScript
└── components.json          # Configuração do Shadcn
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Constrói o projeto para produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter

## Características do Componente

- **Interativo**: Responde ao movimento do mouse
- **ASCII**: Usa caracteres especiais para criar o efeito
- **Performance**: Otimizado com requestAnimationFrame
- **Responsivo**: Se adapta ao tamanho da tela
- **Estilo**: Fundo preto com caracteres brancos

## Personalização

Você pode modificar:
- Caracteres ASCII em `ASCII_CHARS`
- Densidade da grade (cols/rows)
- Velocidade da animação
- Cores e estilos
- Efeitos de onda 