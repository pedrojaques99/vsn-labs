# 🔧 CONFIGURAÇÃO DE AMBIENTE (.env.local)

## **📋 INFORMAÇÕES NECESSÁRIAS**

Você precisa apenas de **2 informações** do Supabase:

### **1. SUPABASE URL**
- Acesse seu [Supabase Dashboard](https://supabase.com/dashboard)
- Vá em **Settings** → **General**
- Copie a **Project URL**
- Exemplo: `https://abcdefghijk.supabase.co`

### **2. SUPABASE ANON KEY**
- No mesmo projeto, vá em **Settings** → **API**
- Na seção **Project API keys**
- Copie a chave **anon public**
- Exemplo: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## **📝 CRIAR ARQUIVO .env.local**

Na raiz do projeto, crie o arquivo `.env.local`:

```bash
# ================================
# SUPABASE CONFIGURATION
# ================================

# 1. SUPABASE URL (obrigatório)
NEXT_PUBLIC_SUPABASE_URL=https://[seu-projeto-id].supabase.co

# 2. SUPABASE ANON KEY (obrigatório)  
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ================================
# PARA PRODUÇÃO VERCEL
# ================================
# NEXT_PUBLIC_SITE_URL=https://vsn-labs.vercel.app
```

### **🔄 Se já tem arquivo `.env`:**
```bash
# Você pode renomear:
mv .env .env.local

# Ou copiar o conteúdo para .env.local
# .env.local tem prioridade sobre .env
```

## **❗ IMPORTANTE**

### **NÃO precisa configurar Google OAuth para localhost:**
- O sistema detecta automaticamente se está em desenvolvimento
- Login será desabilitado em localhost
- Funcionará apenas em produção

### **Após criar o .env.local:**
```bash
# Reinicie o servidor
npm run dev
```

## **✅ TESTE**
1. Acesse `http://localhost:3007/youtube-mixer`
2. Clique "LOGIN" → deve mostrar mensagem que login só funciona em produção
3. Teste outras funcionalidades (slots, volume, etc.)

## **🚀 PARA PRODUÇÃO**
Quando fizer deploy:
1. Configure as mesmas variáveis no seu serviço de hosting
2. Configure Google OAuth com seu domínio real
3. Login funcionará automaticamente
