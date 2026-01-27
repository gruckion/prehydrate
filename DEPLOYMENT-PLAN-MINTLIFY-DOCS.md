# Deployment Plan: Mintlify Docs on prehydrate.gruckion.com

**Created:** 2026-01-27
**Status:** Pending Approval
**Estimated Setup Time:** 30-60 minutes (excluding DNS propagation)

---

## Executive Summary

This plan outlines the steps to publish the Mintlify documentation site (`apps/docs/`) to `https://prehydrate.gruckion.com` using Mintlify's managed hosting with Cloudflare DNS.

---

## Current State Analysis

### Cloudflare Account Details
- **Account:** Gruckionlimited@gmail.com
- **Account ID:** 0e41520999577263968bc2309d96c05d
- **Domain:** gruckion.com (Active, Free plan)
- **Nameservers:** melody.ns.cloudflare.com, rex.ns.cloudflare.com

### Existing DNS Records for gruckion.com
| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| CNAME | www | gruckion.com | Proxied |
| Worker | gruckion.com | gruckion (Pages) | Proxied |
| Worker | healio.gruckion.com | healio-server | Proxied |
| MX | gruckion.com | route1/2/3.mx.cloudflare.net | DNS only |
| TXT | gruckion.com | SPF record | DNS only |
| TXT | cf2024-1._domainkey | DKIM record | DNS only |

### Existing Workers & Pages Projects
1. **gruckion** - Pages project connected to `gruckion/website` GitHub repo
2. **healio-server** - Worker serving healio.gruckion.com
3. **stephenrayner-website** - Pages project for stephenrayner.com

### Current SSL/TLS Configuration
| Setting | Current Value | Required Value | Action Needed |
|---------|--------------|----------------|---------------|
| SSL Mode | Flexible | Full (strict) | **CHANGE REQUIRED** |
| Always Use HTTPS | OFF | OFF | No change |
| Wildcard Certificate | *.gruckion.com (Active) | Active | No change |

---

## Chosen Approach: Mintlify-Hosted with Custom Domain

### Why This Approach?
1. **Zero infrastructure maintenance** - Mintlify handles hosting, CDN, SSL
2. **Automatic deployments** - Push to GitHub, docs update automatically
3. **Built-in features** - Search, analytics, versioning included
4. **Simplest setup** - Just DNS configuration + Mintlify dashboard

### Architecture Overview
```
User Request: https://prehydrate.gruckion.com
        ↓
Cloudflare DNS (CNAME → cname.mintlify-dns.com)
        ↓
Mintlify Infrastructure (Vercel)
        ↓
Your docs from apps/docs/ directory
```

---

## Detailed Implementation Steps

### Phase 1: Mintlify Account Setup

#### Step 1.1: Create Mintlify Account
- **URL:** https://dashboard.mintlify.com
- **Action:** Sign up with GitHub (recommended) or email
- **Notes:** Using GitHub allows automatic repo connection

#### Step 1.2: Create New Documentation Project
- **Action:** Click "New Project" or "Add Documentation"
- **Repository:** gruckion-stuff/prehydrate (or gruckion/prehydrate if different org)
- **Root Directory:** `apps/docs`
- **Branch:** `main`

#### Step 1.3: Verify Initial Deployment
- **Expected URL:** `[project-name].mintlify.dev`
- **Action:** Confirm docs render correctly at the .mintlify.dev URL
- **Troubleshooting:** If build fails, check mint.json syntax

### Phase 2: Cloudflare SSL Configuration

#### Step 2.1: Change SSL Mode to Full (Strict)
- **Location:** Cloudflare Dashboard → gruckion.com → SSL/TLS → Overview
- **Current:** Flexible
- **Target:** Full (strict)
- **Risk:** May affect other services if they don't support HTTPS origin

**Pre-change verification checklist:**
- [ ] gruckion.com main site works with HTTPS origin
- [ ] healio.gruckion.com works with HTTPS origin
- [ ] Any other subdomains verified

#### Step 2.2: Verify Always Use HTTPS is Disabled
- **Location:** SSL/TLS → Edge Certificates → Always Use HTTPS
- **Required State:** OFF (toggle disabled)
- **Reason:** Allows Let's Encrypt ACME challenge for certificate provisioning

### Phase 3: DNS Configuration

#### Step 3.1: Add CNAME Record for prehydrate Subdomain
- **Location:** Cloudflare Dashboard → gruckion.com → DNS → Records
- **Record Details:**
  ```
  Type:    CNAME
  Name:    prehydrate
  Target:  cname.mintlify-dns.com
  Proxy:   OFF (DNS only - click orange cloud to turn gray)
  TTL:     Auto
  ```

**CRITICAL:** The proxy MUST be OFF (gray cloud). Mintlify/Vercel needs direct DNS access to:
1. Verify domain ownership
2. Provision Let's Encrypt SSL certificate
3. Handle the ACME challenge at `/.well-known/acme-challenge/`

### Phase 4: Mintlify Custom Domain Configuration

#### Step 4.1: Add Custom Domain in Mintlify Dashboard
- **Location:** Mintlify Dashboard → Your Project → Settings → Custom Domain
- **Domain:** prehydrate.gruckion.com
- **Action:** Click "Add Domain"

#### Step 4.2: Wait for Domain Verification
- **Expected Time:** 5-30 minutes after DNS propagation
- **Verification:** Mintlify will show "Verified" status
- **Check DNS:** Use https://dnschecker.org to verify CNAME propagation

#### Step 4.3: Wait for SSL Certificate Provisioning
- **Expected Time:** Minutes to a few hours after verification
- **Provider:** Let's Encrypt (automatic via Vercel)
- **Verification:** HTTPS should work without certificate warnings

### Phase 5: Verification & Testing

#### Step 5.1: Test HTTP to HTTPS Redirect
```bash
curl -I http://prehydrate.gruckion.com
# Should return 301/302 redirect to HTTPS
```

#### Step 5.2: Test HTTPS Access
```bash
curl -I https://prehydrate.gruckion.com
# Should return 200 OK
```

#### Step 5.3: Test Documentation Pages
- Home: https://prehydrate.gruckion.com/
- Introduction: https://prehydrate.gruckion.com/introduction
- Quickstart: https://prehydrate.gruckion.com/quickstart
- API Reference: https://prehydrate.gruckion.com/prehydrate/api-reference

#### Step 5.4: Test Search Functionality
- Mintlify's built-in search should work
- Press Cmd/Ctrl+K to open search

### Phase 6: Optional Enhancements

#### Step 6.1: Add Canonical URL to mint.json
```json
{
  "seo": {
    "metatags": {
      "canonical": "https://prehydrate.gruckion.com"
    }
  }
}
```

#### Step 6.2: Update Package README Links
- Update links in `packages/prehydrate/README.md` to point to new docs URL

#### Step 6.3: Configure GitHub Integration for Auto-Deploy
- Ensure Mintlify GitHub App has access to the repository
- Verify webhook is set up for automatic deployments on push

---

## Potential Blockers & Risks

### Blocker 1: Mintlify Account/Authentication
- **Risk:** May need to create Mintlify account, could require email verification
- **Mitigation:** User will need to complete authentication steps manually
- **Impact:** Cannot proceed with custom domain setup until account exists

### Blocker 2: SSL Mode Change Impact
- **Risk:** Changing from "Flexible" to "Full (strict)" affects ALL subdomains
- **Affected Services:**
  - gruckion.com (main website)
  - healio.gruckion.com (healio-server)
- **Verification Needed:** Confirm these origins support HTTPS
- **Rollback Plan:** Can revert to "Flexible" if issues occur

### Blocker 3: DNS Propagation Delay
- **Risk:** DNS changes can take 1-48 hours to propagate globally
- **Typical Time:** 5-30 minutes for most regions
- **Mitigation:** Use dnschecker.org to monitor propagation
- **Impact:** Cannot complete SSL provisioning until DNS propagates

### Blocker 4: Mintlify Free Tier Limitations
- **Risk:** Free tier may have limitations
- **Potential Limits:** Number of projects, custom domains, analytics
- **Verification:** Check Mintlify pricing page during setup
- **Mitigation:** Upgrade if needed (pricing typically reasonable for docs)

### Blocker 5: Repository Access
- **Risk:** Mintlify needs read access to the GitHub repository
- **Current Repo:** gruckion-stuff/prehydrate (appears to be public based on README links)
- **Action:** May need to authorize Mintlify GitHub App
- **Impact:** Cannot deploy docs without repo access

### Blocker 6: mint.json Configuration Issues
- **Risk:** Invalid mint.json could cause build failures
- **Current Status:** Reviewed - appears valid
- **Verification:** Test build on Mintlify before adding custom domain

---

## Rollback Plan

If issues occur after deployment:

### Immediate Rollback (DNS)
1. Delete CNAME record for `prehydrate` in Cloudflare
2. Site will become unavailable (expected)
3. No impact on other services

### SSL Rollback (if Full strict causes issues)
1. Go to SSL/TLS → Overview → Configure
2. Change back to "Flexible"
3. Monitor other services for recovery

### Full Rollback Steps
1. Remove custom domain from Mintlify dashboard
2. Delete DNS CNAME record
3. Revert SSL mode if changed
4. Verify gruckion.com and healio.gruckion.com still work

---

## Post-Deployment Checklist

- [ ] https://prehydrate.gruckion.com loads correctly
- [ ] All documentation pages accessible
- [ ] Search functionality works
- [ ] Mobile responsive design works
- [ ] SSL certificate valid (no browser warnings)
- [ ] gruckion.com main site still works
- [ ] healio.gruckion.com still works
- [ ] GitHub auto-deploy webhook configured
- [ ] README links updated to new URL

---

## References

- [Mintlify Custom Domain Documentation](https://www.mintlify.com/docs/customize/custom-domain)
- [Mintlify Cloudflare Integration](https://www.mintlify.com/docs/deploy/cloudflare)
- [Cloudflare SSL/TLS Modes](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/)
- [DNS Propagation Checker](https://dnschecker.org)
- [Mintlify Pricing](https://mintlify.com/pricing)
