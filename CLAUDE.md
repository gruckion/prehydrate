# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a **next-forge** project - a production-grade Turborepo monorepo template for Next.js SaaS applications. It uses Turborepo for build orchestration and pnpm/bun for package management.

## Critical: Always Run Commands from the Monorepo Root

**IMPORTANT**: Always run `bun install` and build commands from the monorepo root directory (`/prehydrate`), not from within individual app directories. Running from subdirectories can cause esbuild and other native module issues.

```bash
# CORRECT - from monorepo root
cd /path/to/prehydrate
bun install
bun run build --filter docs

# INCORRECT - do not run from app directories
cd apps/docs && bun install  # This can cause issues!
```

## Development Commands

### Running the project

```bash
# Start all apps in development mode (from root)
bun dev

# Start specific apps (runs on designated ports)
# - apps/app: http://localhost:3000 (main application)
# - apps/web: http://localhost:3001 (marketing site)
# - apps/api: http://localhost:3002 (API server)
# - apps/docs: http://localhost:3004 (documentation site)
bun run dev --filter app      # Main app only
bun run dev --filter web      # Marketing site only
bun run dev --filter api      # API + Stripe webhook listener
bun run dev --filter docs     # Documentation site only
```

### Building

```bash
# Build all apps and packages (from root)
bun build

# Build a specific app using --filter (RECOMMENDED)
bun run build --filter docs
bun run build --filter app
bun run build --filter web

# Alternative using turbo directly
turbo build --filter=app
```

### Code quality

```bash
# Check code with Biome (via ultracite)
bun check

# Auto-fix issues
bun fix

# Type checking
turbo typecheck
```

### Testing

```bash
# Run all tests
bun test

# Run tests for specific app
cd apps/app && bun test
```

### Database operations

```bash
# Format, generate Prisma client, and push schema to database
bun migrate

# From packages/database directory
cd packages/database
npx prisma format               # Format schema
npx prisma generate            # Generate client
npx prisma db push             # Push to database
```

### Other utilities

```bash
# Analyze bundle sizes
bun analyze

# Update dependencies (except pinned ones)
bun bump-deps

# Update shadcn UI components
bun bump-ui

# Translation workflows
bun translate
```

## Architecture

### Monorepo Structure

**Apps** (independently deployable):

- `apps/app` - Main SaaS application with authentication, uses Clerk for auth
- `apps/web` - Marketing website with internationalization (uses `[locale]` routing)
- `apps/api` - API server with webhook handling (includes Stripe webhook forwarding)
- `apps/docs` - Documentation site (Fumadocs with Next.js, deployed to Cloudflare Pages)
- `apps/email` - Email templates (React Email)
- `apps/storybook` - Component library showcase
- `apps/studio` - Database studio

**Packages** (shared libraries):

- `@repo/auth` - Authentication via Clerk
- `@repo/database` - Prisma ORM with Neon adapter (PostgreSQL)
- `@repo/design-system` - Shared UI components (shadcn-based)
- `@repo/payments` - Stripe integration
- `@repo/email` - Email utilities via Resend
- `@repo/analytics` - Google Analytics & PostHog
- `@repo/observability` - Sentry error tracking, BetterStack monitoring
- `@repo/security` - Arcjet security & rate limiting
- `@repo/collaboration` - Liveblocks real-time features
- `@repo/notifications` - Knock notification system
- `@repo/webhooks` - Svix webhook handling
- `@repo/feature-flags` - Feature flag management
- `@repo/cms` - BaseHub content management
- `@repo/seo` - SEO utilities
- `@repo/storage` - File storage
- `@repo/internationalization` - i18n support (next-international)
- `@repo/ai` - AI integration utilities

### Key Architectural Patterns

**Authentication Flow**:

- Clerk is the auth provider (`@clerk/nextjs`)
- Auth components in `@repo/auth/components`
- Middleware protection in `apps/app/middleware.ts`
- Routes split into `(authenticated)` and `(unauthenticated)` groups

**Database Architecture**:

- Prisma with Neon serverless adapter
- Schema at `packages/database/prisma/schema.prisma`
- Generated client at `packages/database/generated/client`
- Uses `relationMode = "prisma"` for database relations

**Design System**:

- Based on shadcn/ui components
- Theme provider with dark mode support (next-themes)
- Shared fonts configuration
- Components at `packages/design-system/components`

**Environment Variables**:

- Each app has its own `.env.local` file
- See `apps/app/.env.example` for required variables
- Server-side validation via `@t3-oss/env-nextjs`

**Turbo Build System**:

- Build tasks depend on tests passing (`dependsOn: ["^build", "test"]`)
- Outputs cached in `.next`, `storybook-static`, `.react-email`
- Global dependencies on `.env.*local` files

### Third-Party Service Integrations

The project is integrated with:

- **Clerk** - Authentication
- **Stripe** - Payments (webhook testing via Stripe CLI)
- **Resend** - Transactional email
- **Sentry** - Error tracking
- **BetterStack** - Uptime monitoring
- **Arcjet** - Security & rate limiting
- **PostHog** - Product analytics
- **Liveblocks** - Real-time collaboration
- **Knock** - Notifications
- **Svix** - Webhook infrastructure
- **BaseHub** - CMS
- **Neon** - PostgreSQL database

### Port Assignments

- 3000: Main app (`apps/app`)
- 3001: Marketing website (`apps/web`)
- 3002: API server (`apps/api`)
- 3004: Docs (referenced in env vars)

## Development Notes

### Adding New Features

1. Check if functionality belongs in an existing package or needs a new one
2. For UI components, add to `@repo/design-system`
3. For business logic shared across apps, create or extend a package
4. Import packages using `@repo/[package-name]` in apps

### Working with Prisma

1. Modify `packages/database/prisma/schema.prisma`
2. Run `bun migrate` from root, or from `packages/database`:
   - `npx prisma format`
   - `npx prisma generate`
   - `npx prisma db push`
3. Generated client is at `packages/database/generated/client`

### Internationalization (i18n)

- Marketing site (`apps/web`) uses locale-based routing: `app/[locale]/`
- Translation utilities in `@repo/internationalization`
- Run `bun translate` to manage translations

### Code Style

- Uses **Biome** via ultracite for linting/formatting
- Config in `biome.jsonc`
- Excludes certain auto-generated files (shadcn components, basehub types)
- Global types include `Liveblocks` for collaboration features

### Testing

- Uses **Vitest** for unit/integration tests
- Tests in `__tests__` directories
- Testing library for React component tests
- Run with `bun test` (uses `NODE_ENV=test`)
