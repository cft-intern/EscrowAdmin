/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_FEATURE_BETA_ENABLED: string
  readonly VITE_FEATURE_ANALYTICS_ENABLED: string
  readonly VITE_FEATURE_EXPERIMENTAL_UI: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_GOOGLE_ANALYTICS_ID: string
  readonly VITE_DEV_MOCK_API: string
  readonly VITE_DEV_SHOW_REDUX_DEVTOOLS: string
  readonly VITE_AUTH_TOKEN_STORAGE_KEY: string
  readonly VITE_AUTH_REFRESH_TOKEN_STORAGE_KEY: string
  readonly VITE_DEFAULT_THEME: string
  readonly VITE_DEFAULT_LANGUAGE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}