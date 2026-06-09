# Hermes Admin

Painel operacional em `Next.js` para o control plane do Hermes no Supabase.

## Escopo atual

- login por e-mail e senha com Supabase Auth
- bootstrap do primeiro admin
- visao geral da organizacao
- lista e detalhe de agentes
- configuracao de prompt, tier, tools e executor
- historico read-only
- handoffs
- tarefas e execucoes
- memoria consolidada read-only

## Stack

- `Next.js 16`
- `React 19`
- `Tailwind CSS`
- `shadcn/ui`
- `Supabase SSR`

## Variaveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
HERMES_ADMIN_BOOTSTRAP_ENABLED=false
HERMES_BOOTSTRAP_ORGANIZATION_SLUG=connect-labs
HERMES_BOOTSTRAP_ADMIN_EMAIL=
HERMES_BOOTSTRAP_ADMIN_PASSWORD=
```

`SUPABASE_SERVICE_ROLE_KEY` pode ser usado no lugar de `SUPABASE_SECRET_KEY`.

## Rodando localmente

```bash
npm install
npm run dev
```

Se o Node local estiver sem a cadeia de certificados do Windows carregada, rode:

```bash
set NODE_OPTIONS=--use-system-ca
npm run dev
```

Servidor local padrao: [http://localhost:3000](http://localhost:3000)

## Testes e build

```bash
npm test
npm run build
```

## Seguranca

- o frontend usa apenas a chave publishable no browser
- a chave secreta fica restrita ao servidor para bootstrap e acoes administrativas
- o painel foi desenhado sobre as tabelas novas com RLS
- tabelas legadas sem endurecimento completo nao devem ser expostas aqui
