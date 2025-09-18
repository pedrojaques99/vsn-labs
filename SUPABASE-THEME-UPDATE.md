# Supabase Theme Update Instructions

## 📋 Schema Updates Required

Execute the following SQL commands in your Supabase SQL Editor to add theme support:

### 1. Add Theme Columns to Profiles Table

```sql
-- Add theme columns to existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS theme_id TEXT DEFAULT 'dark-cyan',
ADD COLUMN IF NOT EXISTS custom_background_color TEXT,
ADD COLUMN IF NOT EXISTS custom_accent_color TEXT,
ADD COLUMN IF NOT EXISTS is_light_mode BOOLEAN DEFAULT false;
```

### 2. Update Existing Profiles

```sql
-- Update existing profiles with default theme
UPDATE public.profiles 
SET 
  theme_id = 'dark-cyan',
  custom_background_color = NULL,
  custom_accent_color = NULL,
  is_light_mode = false
WHERE theme_id IS NULL;
```

### 3. Create Theme Functions

```sql
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
```

### 4. Update User Creation Trigger

```sql
-- Update the trigger to include theme fields
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
```

## 🔐 RLS Policies

Make sure your RLS policies allow users to read and update their own profiles:

```sql
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
```

## ✅ Verification

After running these commands, verify that:

1. The `profiles` table has the new theme columns
2. The functions `update_user_theme` and `get_user_theme` exist
3. New users get default theme values
4. Existing users can update their theme preferences

## 🚀 Features Added

- **Theme Persistence**: User themes are saved to Supabase
- **Cross-Device Sync**: Themes sync across all user devices
- **Custom Colors**: Support for custom background and accent colors
- **Light/Dark Mode**: Persistent light/dark mode preference
- **Automatic Loading**: Themes load automatically on login

The app will now automatically save and load user theme preferences from Supabase!
