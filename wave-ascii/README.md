# Wave ASCII - Componente Interativo

Um componente Next.js que cria um efeito de onda ASCII interativo que responde ao movimento do mouse.

## Características

- **Estilo ASCII**: Usa caracteres como `!@#$%^&*()XO|ALWA`
- **Interação com Mouse**: A onda se move e responde ao cursor
- **Fundo Preto**: Design minimalista com caracteres brancos
- **Performance Otimizada**: Usa `requestAnimationFrame` para animações suaves
- **Responsivo**: Se adapta ao tamanho da tela

## Instalação

```bash
npm install
```

## Execução

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## Tecnologias

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Shadcn/ui utilities

## Como Funciona

O componente cria uma grade de caracteres ASCII que:
1. Detecta a posição do mouse
2. Calcula a distância de cada caractere ao cursor
3. Aplica uma função de onda senoidal para criar o efeito
4. Anima a opacidade e escala dos caracteres
5. Atualiza em tempo real com `requestAnimationFrame`

## Estrutura do Projeto

```
src/
├── app/
│   ├── page.tsx          # Página principal
│   ├── layout.tsx        # Layout da aplicação
│   └── globals.css       # Estilos globais
├── components/
│   └── wave-ascii.tsx    # Componente principal
└── lib/
    └── utils.ts          # Utilitários CSS
```
