# Deploying Prehydrate Docs to Cloudflare Pages

This document describes how to deploy the Fumadocs documentation site to Cloudflare Pages.

## Overview

The docs site is built as a static export using Next.js and Fumadocs, then deployed to Cloudflare Pages. The site is available at:

- **Production**: https://prehydrate.gruckion.com
- **Preview**: https://prehydrate-docs.pages.dev

## Prerequisites

- [Bun](https://bun.sh/) installed
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) installed (`bun add -D wrangler`)
- Cloudflare account with the domain configured
- Authenticated with Cloudflare (`npx wrangler login`)

## Project Configuration

### Cloudflare Account Details

- **Account ID**: `0e41520999577263968bc2309d96c05d`
- **Zone ID** (gruckion.com): `810c567a47c1a6a44c1ab3e990e7b5cb`
- **Pages Project Name**: `prehydrate-docs`

### Next.js Configuration

The site uses static export mode (`next.config.mjs`):

```javascript
const config = {
  reactStrictMode: true,
  output: 'export',  // Static export to /out directory
  images: {
    unoptimized: true,  // Required for static export
  },
};
```

## Manual Deployment

### 1. Build the Site

**Important**: Always run commands from the monorepo root directory.

```bash
# From the monorepo root (/prehydrate)
cd /path/to/prehydrate

# Build the docs app
bun run build --filter docs
```

This creates a static site in `apps/docs/out/`.

### 2. Deploy to Cloudflare Pages

```bash
# Navigate to the docs app
cd apps/docs

# Deploy the static output
npx wrangler pages deploy out --project-name=prehydrate-docs --commit-dirty=true
```

**Output:**
```
Uploading... (200/200)
✨ Success! Uploaded 200 files (31.37 sec)
✨ Deployment complete! Take a peek over at https://<hash>.prehydrate-docs.pages.dev
```

## Initial Setup (One-Time)

If setting up for the first time, you need to create the Pages project and configure the custom domain.

### 1. Authenticate with Cloudflare

```bash
npx wrangler login
```

This opens a browser for OAuth authentication and stores tokens in `~/Library/Preferences/.wrangler/config/default.toml`.

### 2. Create the Pages Project

```bash
npx wrangler pages project create prehydrate-docs --production-branch=main
```

**Output:**
```
✨ Successfully created the 'prehydrate-docs' project.
It will be available at https://prehydrate-docs.pages.dev/ once you create your first deployment.
```

### 3. Add Custom Domain

Using the Cloudflare API:

```bash
# Get the OAuth token
TOKEN=$(cat ~/Library/Preferences/.wrangler/config/default.toml | grep oauth_token | cut -d'"' -f2)

# Add custom domain
curl -X POST "https://api.cloudflare.com/client/v4/accounts/0e41520999577263968bc2309d96c05d/pages/projects/prehydrate-docs/domains" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"prehydrate.gruckion.com"}'
```

### 4. Configure DNS

In the Cloudflare Dashboard (https://dash.cloudflare.com):

1. Go to **gruckion.com** → **DNS** → **Records**
2. Find or create a CNAME record for `prehydrate`
3. Set the target to: `prehydrate-docs.pages.dev`
4. Enable **Proxy** (orange cloud icon)
5. Save

## Automated Deployment (GitHub Actions)

The repository includes a GitHub Actions workflow (`.github/workflows/deploy-docs.yml`) that automatically deploys when changes are pushed to the `main` branch.

### Required GitHub Secrets

Add these secrets to your repository settings:

- `CLOUDFLARE_API_TOKEN`: API token with Pages write permissions
- `CLOUDFLARE_ACCOUNT_ID`: `0e41520999577263968bc2309d96c05d`

### Creating a Cloudflare API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Use the **Edit Cloudflare Workers** template
4. Add **Cloudflare Pages:Edit** permission
5. Scope to your account
6. Create and copy the token

### Workflow File

```yaml
# .github/workflows/deploy-docs.yml
name: Deploy Docs to Cloudflare

on:
  push:
    branches: [main]
    paths:
      - "apps/docs/**"
      - "packages/prehydrate/**"
      - ".github/workflows/deploy-docs.yml"

jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Build docs
        run: bun run build --filter docs

      - name: Deploy to Cloudflare Pages
        working-directory: apps/docs
        run: npx wrangler pages deploy out --project-name=prehydrate-docs --commit-dirty=true
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

## Useful Commands

### List Deployments

```bash
npx wrangler pages deployment list --project-name=prehydrate-docs
```

### List Projects

```bash
npx wrangler pages project list
```

### Check Domain Status

```bash
TOKEN=$(cat ~/Library/Preferences/.wrangler/config/default.toml | grep oauth_token | cut -d'"' -f2)

curl -s "https://api.cloudflare.com/client/v4/accounts/0e41520999577263968bc2309d96c05d/pages/projects/prehydrate-docs/domains" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

### Delete a Project (Caution!)

```bash
npx wrangler pages project delete prehydrate-docs
```

## Troubleshooting

### Build Fails with "The service was stopped: write EPIPE"

This error occurs when running builds from within the `apps/docs` directory. **Always run builds from the monorepo root**:

```bash
# CORRECT
cd /path/to/prehydrate
bun run build --filter docs

# INCORRECT - will fail
cd apps/docs
bun run build
```

### "Project not found" Error

The Pages project doesn't exist. Create it first:

```bash
npx wrangler pages project create prehydrate-docs --production-branch=main
```

### Domain Shows "CNAME record not set"

Update the DNS record in Cloudflare Dashboard to point to `prehydrate-docs.pages.dev`.

### Authentication Error

Re-authenticate with Cloudflare:

```bash
npx wrangler login
```

## Architecture Notes

### Why Static Export?

- Fumadocs documentation sites don't require server-side features
- Static export is simpler and more reliable
- Faster deployments (just upload files)
- No cold starts or worker limits

### Why Not OpenNext?

OpenNext was initially considered for server-side rendering, but:
- Static export is sufficient for documentation
- Simpler deployment pipeline
- No need for Workers runtime
- Avoids complexity with Next.js 16 + Turbopack compatibility

### File Structure

```
apps/docs/
├── out/                    # Static build output (deployed)
├── content/docs/           # MDX documentation files
├── src/app/                # Next.js app routes
├── next.config.mjs         # Next.js config (output: 'export')
├── wrangler.jsonc          # Wrangler config (optional for Pages)
├── package.json            # Scripts and dependencies
└── DEPLOYMENT.md           # This file
```
