# Runbook do Sistema de Release Publico

Ultima atualizacao: 2026-04-24

## Objetivo

Formalizar o sistema tecnico de release do produto publico sem abrir ainda a
tranche editorial da newsletter.

Este sistema cobre:

- import dos artefactos aprovados do `talaria-brand-radar`
- manifesto de release do site
- verificacao local dos artefactos publicos
- smoke test do site live

Nao cobre:

- envio editorial da newsletter
- selecao de issue
- novas shortlist packets
- runtime research

## Fontes de verdade usadas pelo site

O site publico continua a consumir apenas:

- `public/data/public_brand_rankings.latest.json`
- `public/data/newsletter_candidate_brands.latest.json`
- `public/data/site_release.latest.json`

O primeiro ficheiro alimenta o ranking live.

O segundo continua a existir como artefacto de suporte para a camada editorial,
mas nao abre por defeito uma tranche de conteudo.

O terceiro passa a ser o manifesto tecnico de release.

## Passo 1: Importar os artefactos aprovados

```powershell
npm run import:rankings
npm run import:newsletter
```

## Passo 2: Construir o manifesto de release

```powershell
npm run build:release
```

O passo escreve:

- `public/data/site_release.latest.json`
- `public/data/site_release.metadata.json`
- `public/data/site_release.<snapshot>.json`

## Passo 3: Verificar os limites publicos

```powershell
npm run verify:artifact
npm run verify:newsletter
npm run verify:release
```

Regras principais:

- `blocked` nunca aparece no ranking publico
- `limited` continua publico com badge
- o manifesto de release tem de estar alinhado com os dois artefactos fonte

## Passo 4: Verificacao completa local

```powershell
npm run verify
```

Este passo cobre:

- testes
- limites dos artefactos
- manifesto de release
- historico append-only de releases
- build do site

## Passo 4B: Comando semanal unico de preparacao

```powershell
npm run release:prepare
```

Este comando corre, por ordem fixa:

- import de rankings
- verificacao de rankings
- import do artefacto de newsletter
- verificacao do artefacto de newsletter
- build do manifesto `site_release.latest.json`
- verificacao do manifesto
- build de producao
- resumo final do release

## Passo 5: Deploy

O deploy continua em GitHub Pages, com o repo publico e o workflow de Actions
ja configurado.

## Passo 6: Smoke test live

```powershell
npm run smoke:live
```

Por defeito o smoke test verifica:

- `/`
- `/?/ranking`
- `/?/metodologia`
- `/?/privacidade`
- `/?/registo`
- `/?/arquivo`
- os tres artefactos JSON publicados

Opcionalmente pode testar signup real:

```powershell
npm run smoke:live -- --check-signup --signup-email smoke+manual@example.invalid
```

Esse passo usa a funcao publica `newsletter-signup`. Deve ser usado apenas
quando for necessario provar a boundary publica live.

## Passo 7: Registar a release so depois do smoke live

Uma release conta apenas depois do smoke live passar em producao.

So depois desse passo:

```powershell
npm run release:record
npm run verify:history
```

O ficheiro tracked e:

- `public/data/site_release_history.json`

Este ledger e append-only e guarda:

- timestamp de deploy
- snapshot de origem
- score version
- SHA do repo publico
- contagens publicas visiveis
- contagem default de candidatos da newsletter

## Resultado esperado desta tranche

No fim desta tranche, o produto publico fica com um sistema tecnico claro:

- import manual dos artefactos aprovados
- manifesto de release verificavel
- deploy estatico
- smoke test live repetivel
- historico append-only de releases bem sucedidas

Ou seja: sistemas primeiro, conteudo depois.
