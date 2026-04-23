/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_SIGNUP_SUPABASE_URL?: string;
  readonly VITE_PUBLIC_SIGNUP_SUPABASE_ANON_KEY?: string;
  readonly VITE_PUBLIC_SIGNUP_FUNCTION_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
