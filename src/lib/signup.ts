export type SignupPayload = {
  email: string;
  name: string;
  company: string;
  role: string;
  country: string;
  marketingConsent: boolean;
};

export type SignupValidationResult = {
  isValid: boolean;
  fieldErrors: Partial<Record<keyof SignupPayload, string>>;
  normalizedPayload: SignupPayload;
};

export type SignupRuntimeConfig = {
  projectUrl: string;
  anonKey: string;
  functionName: string;
};

export type SignupEnvLike = {
  VITE_PUBLIC_SIGNUP_SUPABASE_URL?: string;
  VITE_PUBLIC_SIGNUP_SUPABASE_ANON_KEY?: string;
  VITE_PUBLIC_SIGNUP_FUNCTION_NAME?: string;
};

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function validateSignupPayload(payload: SignupPayload): SignupValidationResult {
  const normalizedPayload: SignupPayload = {
    ...payload,
    email: normalizeEmail(payload.email),
    name: payload.name.trim(),
    company: payload.company.trim(),
    role: payload.role.trim(),
    country: payload.country.trim(),
  };

  const fieldErrors: Partial<Record<keyof SignupPayload, string>> = {};

  if (!normalizedPayload.email || !normalizedPayload.email.includes('@')) {
    fieldErrors.email = 'Indica um email valido.';
  }
  if (!normalizedPayload.name) {
    fieldErrors.name = 'Indica o teu nome.';
  }
  if (!normalizedPayload.company) {
    fieldErrors.company = 'Indica a tua empresa.';
  }
  if (!normalizedPayload.role) {
    fieldErrors.role = 'Indica a tua funcao.';
  }
  if (!normalizedPayload.country) {
    fieldErrors.country = 'Indica o teu pais.';
  }
  if (!normalizedPayload.marketingConsent) {
    fieldErrors.marketingConsent = 'Precisas de dar consentimento para receber a newsletter.';
  }

  return {
    isValid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
    normalizedPayload,
  };
}

export function readSignupRuntimeConfig(env: SignupEnvLike): SignupRuntimeConfig | null {
  if (!env.VITE_PUBLIC_SIGNUP_SUPABASE_URL || !env.VITE_PUBLIC_SIGNUP_SUPABASE_ANON_KEY) {
    return null;
  }

  return {
    projectUrl: env.VITE_PUBLIC_SIGNUP_SUPABASE_URL,
    anonKey: env.VITE_PUBLIC_SIGNUP_SUPABASE_ANON_KEY,
    functionName: env.VITE_PUBLIC_SIGNUP_FUNCTION_NAME || 'newsletter-signup',
  };
}

export function createNewsletterFunctionUrl(config: SignupRuntimeConfig): string {
  const root = config.projectUrl.replace(/\/+$/, '');
  return `${root}/functions/v1/${config.functionName}`;
}

export async function submitNewsletterSignup(
  payload: SignupPayload,
  config: SignupRuntimeConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  const validation = validateSignupPayload(payload);
  if (!validation.isValid) {
    throw new Error('signup_validation_failed');
  }

  const response = await fetchImpl(createNewsletterFunctionUrl(config), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
    },
    body: JSON.stringify(validation.normalizedPayload),
  });

  if (!response.ok) {
    throw new Error(`signup_request_failed:${response.status}`);
  }
}
