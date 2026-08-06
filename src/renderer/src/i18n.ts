import i18n, { type TOptions } from 'i18next'
import Backend from 'i18next-electron-fs-backend'
import { initReactI18next, useTranslation } from 'react-i18next'
import ICU from 'i18next-icu'

const basePath = await window.api.main.getLocaleBasePath()
const settings = await window.api.main.getCurrentSettings()
const language = settings.result?.language ?? 'en'

await i18n
  .use(Backend as never)
  .use(ICU as never)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: `${basePath}/{{lng}}.json`,
      addPath: `${basePath}/{{lng}}.missing.json`
    },
    lng: language,
    fallbackLng: 'en',
    nsSeparator: false,
    keySeparator: false,
    saveMissing: false,
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  })

export const _ = (key: string, options?: Record<string, unknown>): string => {
  // `cod` is used by the translation skill and must not reach i18next.
  const { cod: _, ...rest } = options ?? {}
  return i18n.t(key, rest as TOptions) as string
}

export const useI18n = (): ((key: string, options?: Record<string, unknown>) => string) => {
  const { t } = useTranslation()
  return (key: string, options?: Record<string, unknown>): string => t(key, options as TOptions) as string
}

export default i18n
