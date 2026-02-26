import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Language = 'ua' | 'en'

interface Translations {
  [key: string]: any
}

interface LanguageStore {
  language: Language
  translations: Translations
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  loadTranslations: (lang: Language) => Promise<void>
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      language: 'ua',
      translations: {},

      setLanguage: async (lang: Language) => {
        set({ language: lang })
        await get().loadTranslations(lang)
      },

      loadTranslations: async (lang: Language) => {
        try {
          const response = await fetch(`/locales/${lang}/translation.json`)
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          const translations = await response.json()
          set({ translations })
        } catch (error) {
          console.error('Failed to load translations:', error)
        }
      },

      t: (key: string) => {
        const { translations } = get()
        const keys = key.split('.')
        let value: any = translations

        for (const k of keys) {
          if (value && typeof value === 'object') {
            value = value[k]
          } else {
            return key // Return key if translation not found
          }
        }

        return typeof value === 'string' ? value : key
      }
    }),
    {
      name: 'language-storage',
      partialize: (state) => ({ language: state.language })
    }
  )
)

// Initialize translations
if (typeof window !== 'undefined') {
  useLanguageStore.getState().loadTranslations(useLanguageStore.getState().language)
}
