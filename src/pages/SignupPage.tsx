import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { readSignupRuntimeConfig, submitNewsletterSignup, type SignupPayload } from '../lib/signup';

const emptyForm: SignupPayload = {
  email: '',
  name: '',
  company: '',
  role: '',
  country: '',
  marketingConsent: false,
};

export function SignupPage() {
  const [form, setForm] = useState<SignupPayload>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof SignupPayload, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const config = useMemo(
    () =>
      readSignupRuntimeConfig({
        VITE_PUBLIC_SIGNUP_SUPABASE_URL: import.meta.env.VITE_PUBLIC_SIGNUP_SUPABASE_URL,
        VITE_PUBLIC_SIGNUP_SUPABASE_ANON_KEY: import.meta.env.VITE_PUBLIC_SIGNUP_SUPABASE_ANON_KEY,
        VITE_PUBLIC_SIGNUP_FUNCTION_NAME: import.meta.env.VITE_PUBLIC_SIGNUP_FUNCTION_NAME,
      }),
    [],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrors({});
    setStatusMessage(null);

    if (!config) {
      setStatusMessage('O registo publico ainda nao esta ligado ao projeto Supabase separado.');
      return;
    }

    setSubmitting(true);
    try {
      await submitNewsletterSignup(form, config);
      setStatusMessage('Registo recebido. Vais entrar na lista gratuita do Brand Radar.');
      setForm(emptyForm);
    } catch (error) {
      if (error instanceof Error && error.message === 'signup_validation_failed') {
        const nextErrors: Partial<Record<keyof SignupPayload, string>> = {};
        if (!form.email.trim()) nextErrors.email = 'Indica um email valido.';
        if (!form.name.trim()) nextErrors.name = 'Indica o teu nome.';
        if (!form.company.trim()) nextErrors.company = 'Indica a tua empresa.';
        if (!form.role.trim()) nextErrors.role = 'Indica a tua funcao.';
        if (!form.country.trim()) nextErrors.country = 'Indica o teu pais.';
        if (!form.marketingConsent) {
          nextErrors.marketingConsent = 'Precisas de dar consentimento para receber a newsletter.';
        }
        setErrors(nextErrors);
      } else {
        setStatusMessage(
          'Nao foi possivel concluir o registo agora. O ranking continua publico; tenta novamente mais tarde.',
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  function updateField<Key extends keyof SignupPayload>(key: Key, value: SignupPayload[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="page-stack">
      <section className="hero-panel hero-panel--compact">
        <div className="hero-copy">
          <p className="eyebrow">Registo gratuito</p>
          <h2>Recebe a newsletter sem bloquear o acesso ao ranking</h2>
          <p className="hero-lead">
            O ranking e publico. O registo serve apenas para te enviar a newsletter e manter a
            distribuicao focada em decisores relevantes.
          </p>
        </div>
      </section>

      <section className="signup-layout">
        <form className="signup-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
            />
            {errors.email ? <small className="field-error">{errors.email}</small> : null}
          </label>
          <label>
            <span>Nome</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
            />
            {errors.name ? <small className="field-error">{errors.name}</small> : null}
          </label>
          <label>
            <span>Empresa</span>
            <input
              type="text"
              value={form.company}
              onChange={(event) => updateField('company', event.target.value)}
            />
            {errors.company ? <small className="field-error">{errors.company}</small> : null}
          </label>
          <label>
            <span>Funcao</span>
            <input
              type="text"
              value={form.role}
              onChange={(event) => updateField('role', event.target.value)}
            />
            {errors.role ? <small className="field-error">{errors.role}</small> : null}
          </label>
          <label>
            <span>Pais</span>
            <input
              type="text"
              value={form.country}
              onChange={(event) => updateField('country', event.target.value)}
            />
            {errors.country ? <small className="field-error">{errors.country}</small> : null}
          </label>

          <label className="consent-row">
            <input
              type="checkbox"
              checked={form.marketingConsent}
              onChange={(event) => updateField('marketingConsent', event.target.checked)}
            />
            <span>Autorizo o envio da newsletter e comunicacao de marketing do Brand Radar.</span>
          </label>
          {errors.marketingConsent ? (
            <small className="field-error">{errors.marketingConsent}</small>
          ) : null}

          <button className="button button--primary" disabled={submitting} type="submit">
            {submitting ? 'A registar...' : 'Entrar na lista'}
          </button>
          {statusMessage ? <p className="inline-note">{statusMessage}</p> : null}
        </form>

        <aside className="content-card">
          <h3>Contrato Lean B2B</h3>
          <ul className="issue-list">
            <li>Sem gating do ranking por email.</li>
            <li>Sem automacao de envio nesta fase.</li>
            <li>Projeto Supabase separado do Brand Radar research.</li>
            <li>Override editorial de linhas limited fica fora do form e fora do site.</li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
