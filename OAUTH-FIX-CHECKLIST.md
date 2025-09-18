# 🔧 CONFIGURAÇÃO: OAuth Google APENAS EM PRODUÇÃO

## **🎯 ESTRATÉGIA**: Login Google só funciona no site público

## **✅ CONFIGURAÇÃO PARA PRODUÇÃO:**

### **1. Configurar Supabase**
No **Supabase Dashboard**:
- Vá em **Settings** → **Authentication**
- **Site URL**: `https://vsn-labs.vercel.app`
- **Redirect URLs**: Teste AMBAS as opções (uma de cada vez):
  
  **OPÇÃO A (Nossa implementação):**
  ```
  https://vsn-labs.vercel.app/auth/callback
  ```
  
  **OPÇÃO B (URL padrão Supabase):**
  ```
  https://vsn-labs.vercel.app/auth/v1/callback
  ```
- Clique **Save**

**🔧 IMPORTANTE**: Se OPÇÃO A não funcionar, teste OPÇÃO B!

**❗ IMPORTANTE**: 
- NÃO adicione `/**` ou outras URLs
- Use APENAS `/auth/callback` como endpoint
- A página de callback foi criada seguindo a documentação oficial do Supabase
- Implementa tanto fluxo PKCE (seguro) quanto implicit (fallback)

### **2. Configurar Google Cloud Console**
No **Google Cloud Console**:
- Vá em **Credentials** → Seu OAuth Client
- **Authorized JavaScript origins**: 
  - `https://vsn-labs.vercel.app`
- **Authorized redirect URIs**:
  - `https://vsn-labs.vercel.app/auth/callback`
- **❌ REMOVER**: Todas URLs que contenham `supabase.co`
- Clique **Save**

**📚 FONTE**: Documentação oficial do Supabase confirma que URLs do Google OAuth devem apontar para SEU domínio, não para supabase.co

### **3. Desabilitar OAuth em Desenvolvimento**
No arquivo `src/components/2d/youtube-mixer.tsx`, o botão LOGIN aparecerá mas mostrará uma mensagem informativa em localhost.

## **🚀 VANTAGENS DESTA ABORDAGEM:**
- ✅ **Segurança**: OAuth só funciona em produção
- ✅ **Simplicidade**: Sem configuração complexa para dev
- ✅ **Flexibilidade**: Pode desenvolver sem autenticação
- ✅ **Realismo**: Força testes em ambiente real

## **💻 DESENVOLVIMENTO LOCAL:**
- Você pode testar todas as funcionalidades **exceto** login
- Interface mostra "Login disponível apenas em produção"
- Pode simular usuário logado modificando o código temporariamente

## **📋 PARA SEU VERCEL (vsn-labs.vercel.app):**
1. ✅ **Supabase**: Site URL = `https://vsn-labs.vercel.app`
2. ✅ **Google OAuth**: Origins = `https://vsn-labs.vercel.app`
3. ✅ **Deploy**: Seu app já está no Vercel
4. ✅ **Teste**: Acesse `https://vsn-labs.vercel.app/youtube-mixer` e teste login

## **🔧 VARIÁVEIS NO VERCEL:**
No dashboard do Vercel, adicione as mesmas variáveis:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
