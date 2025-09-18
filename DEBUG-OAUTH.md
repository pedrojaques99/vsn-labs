# 🔍 **DEBUG GUIDE - OAUTH ERROR DIAGNOSTICS**

## **📋 COMO USAR OS LOGS:**

Quando você tentar fazer login agora, o console vai mostrar logs detalhados. Procure por estas marcações:

### **🔧 1. VERIFICAÇÃO INICIAL:**
```
🔍 [SUPABASE_CONFIG] Verificando configuração:
✅ [SUPABASE_CONFIG] Cliente Supabase inicializado com sucesso
🔍 [USE_AUTH] Iniciando hook useAuth...
```

### **🔧 2. PROCESSO DE LOGIN:**
```
🔍 [AUTH_SERVICE] Iniciando signInWithGoogle...
🔍 [AUTH_SERVICE] Configuração OAuth:
🔄 [AUTH_SERVICE] Chamando supabase.auth.signInWithOAuth...
🔍 [AUTH_SERVICE] Resposta OAuth:
```

### **🔧 3. POSSÍVEIS ERROS:**

#### **❌ Erro de Configuração:**
```
❌ [SUPABASE_CONFIG] Variáveis de ambiente do Supabase não configuradas
```
**SOLUÇÃO**: Verificar arquivo `.env.local`

#### **❌ Erro OAuth:**
```
❌ [AUTH_SERVICE] Erro OAuth detalhado:
```
**SOLUÇÃO**: Verificar configurações do Google Cloud Console

#### **❌ Erro "requested path is invalid":**
```
{
  "error": "requested path is invalid"
}
```
**POSSÍVEIS CAUSAS**:
1. Site URL incorreta no Supabase
2. Redirect URLs incorretas no Google Cloud Console
3. Mismatch entre domínios configurados

## **📊 COLETA DE DADOS:**

Quando o erro aparecer, copie e cole TODOS os logs do console que começam com:
- `🔍 [SUPABASE_CONFIG]`
- `🔍 [AUTH_SERVICE]`
- `🔍 [USE_AUTH]`
- `❌ [qualquer coisa]`

## **🎯 VERIFICAÇÕES ESSENCIAIS:**

### **1. Arquivo .env.local:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://cndvlwjphohgfgydvgum.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
```

### **2. Supabase Dashboard:**
- **Site URL**: `https://vsn-labs.vercel.app`
- **Redirect URLs**: `https://vsn-labs.vercel.app/**`

### **3. Google Cloud Console:**
- **Authorized origins**: `https://vsn-labs.vercel.app`
- **Authorized redirect URIs**: `https://vsn-labs.vercel.app/auth/callback`

## **🚀 COMO TESTAR:**

1. Abra o console do navegador (F12)
2. Vá para `https://vsn-labs.vercel.app/youtube-mixer`
3. Clique em "LOGIN"
4. Observe os logs no console
5. Copie todos os logs e erros

Agora os logs vão te mostrar exatamente onde está o problema! 🔍
