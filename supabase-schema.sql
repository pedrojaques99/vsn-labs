-- ============================================
-- SCHEMA SQL PARA SUPABASE - YOUTUBE MIXER
-- ============================================
-- Execute este SQL no editor SQL do Supabase

-- Habilitar RLS (Row Level Security)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Criar tabela de perfis de usuário (opcional, para dados extras)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  email TEXT,
  -- Theme preferences
  theme_id TEXT DEFAULT 'dark-cyan',
  custom_background_color TEXT,
  custom_accent_color TEXT,
  is_light_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url, email, theme_id, custom_background_color, custom_accent_color, is_light_mode)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email,
    'dark-cyan',
    NULL,
    NULL,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar preferências de tema
CREATE OR REPLACE FUNCTION public.update_user_theme(
  p_theme_id TEXT,
  p_custom_background_color TEXT DEFAULT NULL,
  p_custom_accent_color TEXT DEFAULT NULL,
  p_is_light_mode BOOLEAN DEFAULT false
)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    theme_id = p_theme_id,
    custom_background_color = p_custom_background_color,
    custom_accent_color = p_custom_accent_color,
    is_light_mode = p_is_light_mode,
    updated_at = NOW()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter preferências de tema do usuário
CREATE OR REPLACE FUNCTION public.get_user_theme()
RETURNS TABLE(
  theme_id TEXT,
  custom_background_color TEXT,
  custom_accent_color TEXT,
  is_light_mode BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.theme_id,
    p.custom_background_color,
    p.custom_accent_color,
    p.is_light_mode
  FROM public.profiles p
  WHERE p.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tabela principal de mixes
CREATE TABLE IF NOT EXISTS public.mixes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL CHECK (length(name) > 0 AND length(name) <= 100),
  description TEXT CHECK (length(description) <= 500),
  config JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
  plays_count INTEGER DEFAULT 0 CHECK (plays_count >= 0),
  icon TEXT, -- Lucide icon name for mix thumbnail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de likes nos mixes
CREATE TABLE IF NOT EXISTS public.mix_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mix_id UUID REFERENCES public.mixes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, mix_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_mixes_user_id ON public.mixes(user_id);
CREATE INDEX IF NOT EXISTS idx_mixes_public ON public.mixes(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_mixes_likes_count ON public.mixes(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_mixes_plays_count ON public.mixes(plays_count DESC);
CREATE INDEX IF NOT EXISTS idx_mixes_created_at ON public.mixes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mix_likes_mix_id ON public.mix_likes(mix_id);
CREATE INDEX IF NOT EXISTS idx_mix_likes_user_id ON public.mix_likes(user_id);

-- RLS Policies para mixes
ALTER TABLE public.mixes ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seus próprios mixes
CREATE POLICY "Users can view own mixes" ON public.mixes
  FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem ver mixes públicos
CREATE POLICY "Users can view public mixes" ON public.mixes
  FOR SELECT USING (is_public = true);

-- Usuários podem inserir seus próprios mixes
CREATE POLICY "Users can insert own mixes" ON public.mixes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios mixes
CREATE POLICY "Users can update own mixes" ON public.mixes
  FOR UPDATE USING (auth.uid() = user_id);

-- Usuários podem deletar seus próprios mixes
CREATE POLICY "Users can delete own mixes" ON public.mixes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies para mix_likes
ALTER TABLE public.mix_likes ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver likes em mixes públicos
CREATE POLICY "Users can view likes on public mixes" ON public.mix_likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.mixes 
      WHERE id = mix_id AND is_public = true
    )
  );

-- Usuários podem ver seus próprios likes
CREATE POLICY "Users can view own likes" ON public.mix_likes
  FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem inserir likes (desde que seja em mix público)
CREATE POLICY "Users can insert likes on public mixes" ON public.mix_likes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.mixes 
      WHERE id = mix_id AND is_public = true
    )
  );

-- Usuários podem deletar seus próprios likes
CREATE POLICY "Users can delete own likes" ON public.mix_likes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Perfis são públicos para leitura
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Função para atualizar likes_count automaticamente
CREATE OR REPLACE FUNCTION update_mix_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.mixes 
    SET likes_count = likes_count + 1,
        updated_at = NOW()
    WHERE id = NEW.mix_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.mixes 
    SET likes_count = GREATEST(likes_count - 1, 0),
        updated_at = NOW()
    WHERE id = OLD.mix_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para atualizar likes_count automaticamente
CREATE TRIGGER trigger_update_likes_count_on_insert
  AFTER INSERT ON public.mix_likes
  FOR EACH ROW EXECUTE FUNCTION update_mix_likes_count();

CREATE TRIGGER trigger_update_likes_count_on_delete
  AFTER DELETE ON public.mix_likes
  FOR EACH ROW EXECUTE FUNCTION update_mix_likes_count();

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at nas tabelas
CREATE TRIGGER update_mixes_updated_at
  BEFORE UPDATE ON public.mixes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para incrementar likes
CREATE OR REPLACE FUNCTION increment_likes(mix_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.mixes 
  SET likes_count = likes_count + 1, updated_at = NOW()
  WHERE id = mix_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para decrementar likes
CREATE OR REPLACE FUNCTION decrement_likes(mix_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.mixes 
  SET likes_count = GREATEST(0, likes_count - 1), updated_at = NOW()
  WHERE id = mix_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para incrementar plays
CREATE OR REPLACE FUNCTION increment_plays(mix_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.mixes 
  SET plays_count = plays_count + 1, updated_at = NOW()
  WHERE id = mix_id AND is_public = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- EXEMPLO DE DADOS PARA TESTE (OPCIONAL)
-- ============================================

-- Exemplo de config JSON para um mix:
/*
{
  "players": [
    {
      "id": "slot-1",
      "url": "https://www.youtube.com/watch?v=M-Q2Extc6z8",
      "volume": 75,
      "isLooping": true,
      "type": "youtube",
      "videoId": "M-Q2Extc6z8"
    },
    {
      "id": "slot-2",
      "url": "https://www.youtube.com/watch?v=WoFKSR6ed2Q",
      "volume": 50,
      "isLooping": false,
      "type": "youtube",
      "videoId": "WoFKSR6ed2Q"
    }
  ],
  "globalVolume": 100
}
*/
