export const brandScoreWeights = [
  ['Relacao com Portugal', 20],
  ['Capacidade de knitwear', 15],
  ['Profundidade de knitwear', 15],
  ['Segmento de preco', 10],
  ['Escala de receita', 10],
  ['Geografia de producao', 12],
  ['Modelo de negocio', 8],
  ['Sinal de sustentabilidade', 5],
  ['Maturidade da marca', 5],
] as const;

export const confidenceScoreWeights = [
  ['Alinhamento critico da verdade', 25],
  ['Completude das fontes', 30],
  ['Frescura da pesquisa', 20],
  ['Completude geografica', 10],
  ['Completude social', 10],
  ['Recencia da verificacao', 5],
] as const;

export const publicationStatusCopy: Record<string, { label: string; description: string }> = {
  publishable: {
    label: 'Publicavel',
    description: 'Pode aparecer no site e entrar na newsletter por defeito.',
  },
  limited: {
    label: 'Limitado',
    description: 'Pode aparecer no site com contexto, mas precisa de cautela editorial.',
  },
  blocked: {
    label: 'Bloqueado',
    description: 'Fica fora da descoberta publica ate a base de prova ficar estavel.',
  },
};

export const portugalRelationshipCopy: Record<string, string> = {
  both: 'Producao e comercial em Portugal',
  production: 'Producao em Portugal',
  commercial: 'Presenca comercial em Portugal',
  unknown: 'Relacao com Portugal ainda nao fechada',
};

export const socialCompletenessCopy: Record<string, string> = {
  verified: 'Verificado',
  present_unverified: 'Identificado, sem prova arquivada fechada',
  missing: 'Em falta',
  not_found: 'Nao encontrado',
  unknown: 'Desconhecido',
};

export const limitationCopy: Record<string, string> = {
  instagram_handle_present_unverified:
    'Instagram identificado, mas ainda sem prova arquivada totalmente fechada.',
  tiktok_handle_present_unverified:
    'TikTok identificado, mas ainda sem prova arquivada totalmente fechada.',
  instagram_handle_missing: 'Instagram em falta na verdade aceite.',
  tiktok_handle_missing: 'TikTok em falta na verdade aceite.',
};

export function formatFallbackLabel(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function describeLimitation(code: string): string {
  return limitationCopy[code] || formatFallbackLabel(code);
}
