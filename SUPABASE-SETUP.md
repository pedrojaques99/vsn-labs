# 🚀 **CONFIGURAÇÃO DO SUPABASE - YOUTUBE MIXER**

## **1. CRIAR PROJETO NO SUPABASE**

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Escolha sua organização
4. Configure:
   - **Name**: `youtube-mixer` (ou nome de sua preferência)
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha o mais próximo (Brazil East)
5. Clique em "Create new project"
6. **Aguarde 2-3 minutos** para o projeto ser criado

## **2. CONFIGURAR VARIÁVEIS DE AMBIENTE**

1. No dashboard do Supabase, vá em **Settings** → **API**
2. Copie os valores:
   - **Project URL**
   - **Anon key** (public)

3. Crie o arquivo `.env.local` na raiz do projeto:
```bash
# Substitua pelos valores do seu projeto:
NEXT_PUBLIC_SUPABASE_URL=https://seuprojetoid.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## **3. EXECUTAR O SCHEMA SQL**

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em "New query"
3. Copie **TODO** o conteúdo do arquivo `supabase-schema.sql`
4. Cole no editor SQL
5. Clique em **RUN** (▶️)
6. Verifique se executou sem erros

## **4. CONFIGURAR AUTENTICAÇÃO**

1. Vá em **Authentication** → **Providers**
2. Configure o **Google Provider**:
   - Ative o "Enable sign in with Google"
   - **Client ID** e **Client Secret**: [Veja seção abaixo]
3. Configure **Site URL**:
   - Development: `http://localhost:3000`
   - Production: `https://seudominio.com`
4. Configure **Redirect URLs**:
   - `http://localhost:3000/youtube-mixer`
   - `https://seudominio.com/youtube-mixer`

### **Configurar Google OAuth (IMPORTANTE)**

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione existente
3. Ative a **Google+ API**
4. Vá em **Credentials** → **Create Credentials** → **OAuth client ID**
5. Configure:
   - **Application type**: Web application
   - **Name**: YouTube Mixer
   - **Authorized JavaScript origins**: 
     - `http://localhost:3007` (para desenvolvimento)
     - `https://seuprojetoid.supabase.co`
     - `https://seudominio.com` (se tiver domínio próprio)
   - **Authorized redirect URIs**:
     - `http://localhost:3007/api/auth/callback` (para desenvolvimento)
     - `https://seuprojetoid.supabase.co/auth/v1/callback`
     - `https://seudominio.com/api/auth/callback` (se tiver domínio próprio)
6. Copie **Client ID** e **Client Secret** para o Supabase

### **Configurar Site URL no Supabase (CRÍTICO)**

No painel do Supabase:

1. Vá em **Settings** → **Authentication**
2. Na seção **Site URL**:
   - **Production**: `https://vsn-labs.vercel.app`
3. Na seção **Redirect URLs**, adicione uma por linha:
   ```
   https://vsn-labs.vercel.app
   https://vsn-labs.vercel.app/auth/callback
   https://vsn-labs.vercel.app/**
   ```
4. Clique em **Save**

**❗ ERRO COMUM**: NÃO misture URLs do Supabase com seu domínio:
- ❌ **ERRADO**: `https://[projeto-id].supabase.co/vsn-labs.vercel.app`
- ✅ **CORRETO**: `https://vsn-labs.vercel.app`

## **5. VERIFICAR CONFIGURAÇÃO**

Execute estes comandos no terminal:

```bash
# 1. Verificar se as dependências foram instaladas
npm list @supabase/supabase-js

# 2. Testar a aplicação
npm run dev

# 3. Abrir no navegador
open http://localhost:3000/youtube-mixer
```

## **6. TESTAR O SISTEMA**

### **Teste de Autenticação:**
1. Clique no botão "LOGIN" no header
2. Faça login com Google
3. Verifique se aparece seu nome no header

### **Teste de Salvar Mix:**
1. Adicione alguns vídeos do YouTube nos slots
2. Clique em "SALVAR MIX"
3. Dê um nome e descrição
4. Marque como "público"
5. Clique em "Salvar"

### **Teste de Carregar Mix:**
1. Na seção "FAVORITOS", veja se aparece "SEUS MIXES"
2. Clique em um mix salvo
3. Verifique se carrega os vídeos e volumes

### **Teste de Compartilhamento:**
1. Clique no ícone de compartilhar (📤) em um mix
2. Abra o link em uma nova aba anônima
3. Veja se carrega o mix corretamente

### **Teste de Explorar:**
1. Clique em "EXPLORAR" no header
2. Veja se aparecem mixes públicos
3. Teste curtir um mix
4. Teste carregar um mix de outro usuário

## **7. ESTRUTURA DO BANCO CRIADA**

✅ **Tabelas:**
- `profiles` - Perfis dos usuários
- `mixes` - Mixes/presets salvos
- `mix_likes` - Curtidas nos mixes

✅ **Segurança (RLS):**
- Usuários só veem seus próprios mixes privados
- Mixes públicos são visíveis para todos
- Sistema de likes protegido

✅ **Triggers:**
- Auto-criação de perfil no registro
- Auto-atualização de contador de likes
- Auto-timestamp em updates

## **8. POSSÍVEIS PROBLEMAS**

### **Erro: "Invalid API key"**
- Verifique se copiou corretamente as variáveis do `.env.local`
- Reinicie o servidor (`npm run dev`)

### **Erro: "Table doesn't exist"**
- Execute novamente o SQL schema completo
- Verifique se todas as tabelas foram criadas em **Database** → **Tables**

### **Login redireciona para localhost ou dá erro:**
**Problema comum:** OAuth redireciona para localhost após login

**Soluções:**
1. **No Supabase Dashboard**:
   - Vá em **Settings** → **Authentication**
   - **Site URL**: `http://localhost:3007` (ou sua porta)
   - **Redirect URLs**: `http://localhost:3007/**`

2. **No Google Cloud Console**:
   - **Authorized JavaScript origins**: `http://localhost:3007`
   - **Authorized redirect URIs**: `http://localhost:3007/api/auth/callback`

3. **Verifique a porta do seu servidor**:
   - Se usa porta diferente (3000, 3001, etc.), atualize todas as URLs
   - Reinicie o servidor após mudanças

4. **Teste em modo incógnito** para evitar cache

### **Outros problemas de login:**
- Verifique se copiou corretamente Client ID/Secret do Google
- Confirme se ativou a Google+ API no Google Cloud
- Teste com outro navegador

### **Mix não carrega:**
- Verifique se o mix é público ou se você é o dono
- Teste com outro mix
- Verifique o console do navegador para erros

## **9. PRÓXIMOS PASSOS (OPCIONAL)**

- **Analytics**: Adicionar tracking de uso dos mixes
- **Categories**: Sistema de categorias para mixes
- **Search**: Busca por nome/descrição nos mixes públicos  
- **Playlists**: Sistema de playlists de mixes
- **Social**: Seguir outros usuários
- **Comments**: Sistema de comentários nos mixes

---

## **🎉 PARABÉNS!** 

Seu sistema de presets/mixes compartilháveis está funcionando! 

Agora os usuários podem:
- ✅ Fazer login
- ✅ Salvar mixes personalizados  
- ✅ Compartilhar mixes via link
- ✅ Explorar e curtir mixes de outros
- ✅ Gerenciar seus próprios mixes

**Happy coding! 🎵**
