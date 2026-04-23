import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

type SignupPayload = {
  email?: string;
  name?: string;
  company?: string;
  role?: string;
  country?: string;
  marketingConsent?: boolean;
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function readPayload(payload: SignupPayload) {
  const email = normalizeEmail(payload.email || '');
  const name = (payload.name || '').trim();
  const company = (payload.company || '').trim();
  const role = (payload.role || '').trim();
  const country = (payload.country || '').trim();
  const marketingConsent = payload.marketingConsent === true;

  if (!email || !email.includes('@')) {
    throw new Error('invalid_email');
  }
  if (!name || !company || !role || !country || !marketingConsent) {
    throw new Error('invalid_payload');
  }

  return { email, name, company, role, country, marketingConsent };
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return json(405, { ok: false });
  }

  const projectUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!projectUrl || !serviceRoleKey) {
    return json(500, { ok: false });
  }

  let payload: ReturnType<typeof readPayload>;
  try {
    payload = readPayload((await request.json()) as SignupPayload);
  } catch {
    return json(400, { ok: false });
  }

  const supabase = createClient(projectUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const now = new Date().toISOString();
  const { error } = await supabase.from('newsletter_signups').upsert(
    {
      email: payload.email,
      email_normalized: payload.email,
      name: payload.name,
      company: payload.company,
      role: payload.role,
      country: payload.country,
      marketing_consent: payload.marketingConsent,
      source: 'brand-radar-public',
      source_page: 'registo',
      locale: 'pt-PT',
      last_seen_at: now,
      updated_at: now,
    },
    { onConflict: 'email_normalized' },
  );

  if (error) {
    return json(500, { ok: false });
  }

  return json(200, { ok: true });
});
