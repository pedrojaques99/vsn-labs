'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface ThemeColors {
  background: string
  accent: string
  text: string
  textSecondary: string
  border: string
  glassBg: string
  glassBorder: string
  glassHover: string
}

export interface Theme {
  id: string
  name: string
  colors: ThemeColors
  isLight: boolean
}

export interface ThemeContextType {
  currentTheme: Theme
  themes: Theme[]
  isLightMode: boolean
  setTheme: (themeId: string) => void
  setCustomColors: (background: string, accent: string) => void
  toggleLightMode: () => void
  resetToDefault: () => void
  saveThemeToSupabase: () => Promise<void>
  loadThemeFromSupabase: () => Promise<void>
}

const defaultThemes: Theme[] = [
  {
    id: 'dark-cyan',
    name: 'Dark Cyan',
    isLight: false,
    colors: {
      background: '#000000',
      accent: '#06b6d4',
      text: '#ffffff',
      textSecondary: '#a1a1aa',
      border: 'rgba(255, 255, 255, 0.1)',
      glassBg: 'rgba(0, 0, 0, 0.8)',
      glassBorder: 'rgba(255, 255, 255, 0.1)',
      glassHover: 'rgba(255, 255, 255, 0.05)'
    }
  },
  {
    id: 'dark-purple',
    name: 'Dark Purple',
    isLight: false,
    colors: {
      background: '#0a0a0a',
      accent: '#8b5cf6',
      text: '#ffffff',
      textSecondary: '#a1a1aa',
      border: 'rgba(255, 255, 255, 0.1)',
      glassBg: 'rgba(0, 0, 0, 0.8)',
      glassBorder: 'rgba(255, 255, 255, 0.1)',
      glassHover: 'rgba(255, 255, 255, 0.05)'
    }
  },
  {
    id: 'dark-green',
    name: 'Dark Green',
    isLight: false,
    colors: {
      background: '#000000',
      accent: '#10b981',
      text: '#ffffff',
      textSecondary: '#a1a1aa',
      border: 'rgba(255, 255, 255, 0.1)',
      glassBg: 'rgba(0, 0, 0, 0.8)',
      glassBorder: 'rgba(255, 255, 255, 0.1)',
      glassHover: 'rgba(255, 255, 255, 0.05)'
    }
  },
  {
    id: 'light-cyan',
    name: 'Light Cyan',
    isLight: true,
    colors: {
      background: '#ffffff',
      accent: '#0891b2',
      text: '#000000',
      textSecondary: '#525252',
      border: 'rgba(0, 0, 0, 0.1)',
      glassBg: 'rgba(255, 255, 255, 0.8)',
      glassBorder: 'rgba(0, 0, 0, 0.1)',
      glassHover: 'rgba(0, 0, 0, 0.05)'
    }
  },
  {
    id: 'light-purple',
    name: 'Light Purple',
    isLight: true,
    colors: {
      background: '#fafafa',
      accent: '#7c3aed',
      text: '#000000',
      textSecondary: '#525252',
      border: 'rgba(0, 0, 0, 0.1)',
      glassBg: 'rgba(255, 255, 255, 0.8)',
      glassBorder: 'rgba(0, 0, 0, 0.1)',
      glassHover: 'rgba(0, 0, 0, 0.05)'
    }
  }
]

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Utility functions for color contrast calculation
const getContrastRatio = (color1: string, color2: string): number => {
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }
  
  const getLuminance = (color: string) => {
    const rgb = hexToRgb(color)
    if (!rgb) return 0
    const { r, g, b } = rgb
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }
  
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  return (brightest + 0.05) / (darkest + 0.05)
}

const getTextColor = (backgroundColor: string): string => {
  const contrastWithWhite = getContrastRatio(backgroundColor, '#ffffff')
  const contrastWithBlack = getContrastRatio(backgroundColor, '#000000')
  return contrastWithWhite > contrastWithBlack ? '#ffffff' : '#000000'
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultThemes[0])
  const [isLightMode, setIsLightMode] = useState(false)
  const [themes] = useState<Theme[]>(defaultThemes)

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedThemeId = localStorage.getItem('youtube-mixer-theme')
    const savedLightMode = localStorage.getItem('youtube-mixer-light-mode') === 'true'
    
    if (savedThemeId) {
      const theme = themes.find(t => t.id === savedThemeId)
      if (theme) {
        setCurrentTheme(theme)
        setIsLightMode(theme.isLight)
      }
    } else {
      setIsLightMode(savedLightMode)
    }
  }, [themes])


  // Load theme from Supabase when user is authenticated
  useEffect(() => {
    if (!supabase) return

    const loadUserTheme = async () => {
      if (!supabase) return
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await loadThemeFromSupabase()
      }
    }

    loadUserTheme()

    // Listen for auth state changes
    if (!supabase) return
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        loadThemeFromSupabase()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    
    root.style.setProperty('--theme-background', currentTheme.colors.background)
    root.style.setProperty('--theme-accent', currentTheme.colors.accent)
    root.style.setProperty('--theme-text', currentTheme.colors.text)
    root.style.setProperty('--theme-text-secondary', currentTheme.colors.textSecondary)
    root.style.setProperty('--theme-border', currentTheme.colors.border)
    root.style.setProperty('--theme-glass-bg', currentTheme.colors.glassBg)
    root.style.setProperty('--theme-glass-border', currentTheme.colors.glassBorder)
    root.style.setProperty('--theme-glass-hover', currentTheme.colors.glassHover)
    
    if (isLightMode) {
      body.classList.add('light')
    } else {
      body.classList.remove('light')
    }
  }, [currentTheme, isLightMode])

  const setTheme = useCallback((themeId: string) => {
    const theme = themes.find(t => t.id === themeId)
    if (theme) {
      setCurrentTheme(theme)
      setIsLightMode(theme.isLight)
    localStorage.setItem('youtube-mixer-theme', themeId)
    localStorage.setItem('youtube-mixer-light-mode', theme.isLight.toString())
    
    // Salvar no Supabase
    saveThemeToSupabase()
    }
  }, [themes])

  const setCustomColors = useCallback((background: string, accent: string) => {
    const textColor = getTextColor(background)
    const isDarkBackground = textColor === '#ffffff'
    
    const customTheme: Theme = {
      id: 'custom',
      name: 'Custom',
      isLight: !isDarkBackground,
      colors: {
        background,
        accent,
        text: textColor,
        textSecondary: isDarkBackground ? '#a1a1aa' : '#525252',
        border: isDarkBackground ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        glassBg: isDarkBackground ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        glassBorder: isDarkBackground ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        glassHover: isDarkBackground ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
      }
    }
    
    setCurrentTheme(customTheme)
    setIsLightMode(!isDarkBackground)
    
    // Apply immediately to CSS variables
    const root = document.documentElement
    root.style.setProperty('--theme-background', background)
    root.style.setProperty('--theme-accent', accent)
    root.style.setProperty('--theme-text', textColor)
    root.style.setProperty('--theme-text-secondary', isDarkBackground ? '#a1a1aa' : '#525252')
    root.style.setProperty('--theme-border', isDarkBackground ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
    root.style.setProperty('--theme-glass-bg', isDarkBackground ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)')
    root.style.setProperty('--theme-glass-border', isDarkBackground ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
    root.style.setProperty('--theme-glass-hover', isDarkBackground ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)')
    
    // Apply light mode class
    const body = document.body
    if (!isDarkBackground) {
      body.classList.add('light')
    } else {
      body.classList.remove('light')
    }
    
    localStorage.setItem('youtube-mixer-theme', 'custom')
    localStorage.setItem('youtube-mixer-light-mode', (!isDarkBackground).toString())
    localStorage.setItem('youtube-mixer-custom-theme', JSON.stringify(customTheme))
    
    // Salvar no Supabase
    saveThemeToSupabase()
  }, [])

  const toggleLightMode = useCallback(() => {
    const newLightMode = !isLightMode
    setIsLightMode(newLightMode)
    localStorage.setItem('youtube-mixer-light-mode', newLightMode.toString())
    
    // Update current theme with new light mode
    const updatedTheme = {
      ...currentTheme,
      isLight: newLightMode,
      colors: {
        ...currentTheme.colors,
        text: getTextColor(currentTheme.colors.background),
        textSecondary: newLightMode ? '#525252' : '#a1a1aa',
        border: newLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
        glassBg: newLightMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
        glassBorder: newLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
        glassHover: newLightMode ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'
      }
    }
    
    setCurrentTheme(updatedTheme)
  }, [isLightMode, currentTheme])

  const resetToDefault = useCallback(() => {
    setCurrentTheme(defaultThemes[0])
    setIsLightMode(false)
    localStorage.setItem('youtube-mixer-theme', defaultThemes[0].id)
    localStorage.setItem('youtube-mixer-light-mode', 'false')
    localStorage.removeItem('youtube-mixer-custom-theme')
  }, [])

  // Salvar tema no Supabase
  const saveThemeToSupabase = useCallback(async () => {
    if (!supabase) return
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.rpc('update_user_theme', {
        p_theme_id: currentTheme.id,
        p_custom_background_color: currentTheme.id === 'custom' ? currentTheme.colors.background : null,
        p_custom_accent_color: currentTheme.id === 'custom' ? currentTheme.colors.accent : null,
        p_is_light_mode: isLightMode
      })

      if (error) {
        console.error('Error saving theme to Supabase:', error)
      }
    } catch (error) {
      console.error('Error saving theme to Supabase:', error)
    }
  }, [currentTheme, isLightMode])

  // Carregar tema do Supabase
  const loadThemeFromSupabase = useCallback(async () => {
    if (!supabase) return
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase.rpc('get_user_theme')
      if (error) {
        console.error('Error loading theme from Supabase:', error)
        return
      }

      if (data && data.length > 0) {
        const themeData = data[0]
        
        if (themeData.theme_id === 'custom' && themeData.custom_background_color && themeData.custom_accent_color) {
          // Carregar tema customizado
          setCustomColors(themeData.custom_background_color, themeData.custom_accent_color)
        } else {
          // Carregar tema padrão
          const theme = themes.find(t => t.id === themeData.theme_id) || defaultThemes[0]
          setTheme(theme.id)
        }
        
        // Aplicar modo light/dark
        if (themeData.is_light_mode !== isLightMode) {
          setIsLightMode(themeData.is_light_mode)
        }
      }
    } catch (error) {
      console.error('Error loading theme from Supabase:', error)
    }
  }, [themes, isLightMode, setTheme, setCustomColors])


  const value: ThemeContextType = {
    currentTheme,
    themes,
    isLightMode,
    setTheme,
    setCustomColors,
    toggleLightMode,
    resetToDefault,
    saveThemeToSupabase,
    loadThemeFromSupabase
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}