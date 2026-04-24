# Newsletter Editorial Runbook PT

Data: 2026-04-24

## Objetivo

Preparar a camada editorial da newsletter sem iniciar envio publico.

Este runbook serve para transformar o artefacto:

- `newsletter_candidate_brands.latest.json`

numa issue manual futura, mantendo o contrato:

- site publico pode mostrar `publishable + limited`
- newsletter usa `publishable` por defeito
- `limited` so entra com override manual explicito upstream
- `blocked` nunca entra

## Fonte de verdade

O repo publico nao inventa candidatos.

Ele importa do Brand Radar:

- `public/data/newsletter_candidate_brands.latest.json`

Esse ficheiro e apenas um input editorial.

Nao substitui:

- o checkpoint do Brand Radar
- o rankings feed publico do site
- o scorer

## Passo 1: Importar o artefacto editorial

```powershell
npm run import:newsletter
npm run verify:newsletter
```

## Passo 2: Ler o baseline editorial

Validar no artefacto:

- `snapshot_captured_at`
- `publishable_candidates`
- `limited_overrides_applied`
- `top_candidate_brand`
- `selection_policy.send_mode`

## Passo 3: Decidir a issue

Uma issue manual deve escolher:

- geografia
- angulo editorial
- lista final de marcas
- CTA principal

Regra default:

- usar apenas os candidatos `publishable` do artefacto

Se um `limited` precisar de entrar:

- o override tem de acontecer upstream
- o repo publico apenas consome esse override depois de importado

## Passo 4: Montar a issue

Cada issue futura deve conter:

1. titulo
2. subtitulo
3. enquadramento editorial curto
4. lista ordenada de marcas
5. porque importa
6. nota de confianca / limitacoes
7. CTA para ranking e registo

## Passo 5: Publicacao

Fora desta fase:

- envio automatico
- automacao com ESP
- arquivo com issues reais live

Nesta fase:

- o arquivo continua placeholder publico
- o runbook apenas fecha a camada editorial e o boundary do artefacto
