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

// Track the in-flight request so concurrent setLanguage() calls don't overwrite
// each other (e.g. quick toggle ua → en → ua would otherwise resolve out of
// order and leave the store on the wrong locale).
let inflight: { lang: Language; promise: Promise<void> } | null = null

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
        if (inflight && inflight.lang === lang) return inflight.promise

        const promise = (async () => {
          try {
            const response = await fetch(`/locales/${lang}/translation.json`)
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            const translations = await response.json()
            // Drop the result if the user switched language again while we were fetching.
            if (get().language === lang) {
              set({ translations })
            }
          } catch (error) {
            console.error('Failed to load translations:', error)
          } finally {
            if (inflight && inflight.lang === lang) inflight = null
          }
        })()

        inflight = { lang, promise }
        return promise
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
      partialize: (state) => ({ language: state.language }),
      // After zustand rehydrates the persisted language, kick off the matching
      // translation file. Doing it here (instead of at module top-level) means
      // we wait for the real persisted value rather than racing against it.
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== 'undefined') {
          state.loadTranslations(state.language)
        }
      },
    }
  )
)
