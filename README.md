# 🛡 SaaSGuard

**SaaSGuard** is a security-focused GitHub Action that scans your web app for critical vulnerabilities and misconfigurations in seconds.

It works across **any stack** (Node.js, PHP, Python, Laravel, Next.js, etc.), and flags issues such as:

- 🔐 Exposed secrets
- 🧩 Missing authentication or CSRF protection
- 🧱 Unprotected paywalls and monetization logic
- 📦 Vulnerable dependencies
- ⚡ Weak crypto usage (e.g. MD5/SHA1)
- 🚫 Missing HTTP security headers (CSP, X-Frame-Options…)
- 📛 Lack of rate limiting on sensitive routes
- 🧾 Prisma RLS & policy audits
- 🧪 Static analysis via Semgrep
- 💥 OSV open source vuln database scanning
- ✅ Generates: JSON + Markdown + full HTML report (and badge)

---

## 📦 Quick Setup (in your SaaS project)

1. **Create the GitHub Action file** in your project at:

```
.github/workflows/security.yml
```

2. **Paste this config** (you can adjust `branches:` as needed):

```yaml
name: SaaSGuard

on:
  workflow_dispatch:
  push:
    branches: [main, develop]

jobs:
  scan:
    name: Run SaaSGuard
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "18"

      - name: Clone SaaSGuard core
        run: |
          git clone https://github.com/nicolas-dev-toolbox/saas-guard saasguard
          mkdir -p scripts output
          cp -r saasguard/scripts/* ./scripts/

      - name: Install + Scan
        run: |
          npm install || true
          npx semgrep install || true
          npx osv-scanner --version || true
          node scripts/main.js

      - uses: actions/upload-artifact@v4
        with:
          name: security-report
          path: output/
```

---

## 🔎 See Results

After the scan runs:

1. Go to **GitHub → Actions → SaaSGuard**
2. Select the latest run
3. At the bottom, under **Artifacts**, download:

   - `report.html` → 📊 full visual report
   - `report.json` → for automation
   - `report.md` → readable summary
   - `badge.svg` → optional badge you can embed

---

## ⚙️ Options

### 🔁 Trigger manually or per branch

You can:

- Trigger via GitHub UI (⚙️ Actions → "Run workflow")
- Automatically on push to specific branches (see `branches:` in `.yml`)

### 🌐 Set your public URL (for header scanning)

If you want HTTP header checks to run against your live site, define the following repo secret:

```
TARGET_URL=https://yourdomain.com
```

---

## 🧪 Custom Checks

SaaSGuard includes modular checks in `scripts/checks/`:

- `checkClientSideOnlyProtection.js`
- `checkMonetizationLogic.js`
- `checkCSRF.js`, `checkRateLimiting.js`, etc.

You can add/remove them easily via `main.js`.

---

## ❤️ Contribute

Feel free to open PRs, suggest new check ideas, or report false positives!

---

## License

MIT — Created by [@nicolas-dev-toolbox](https://github.com/nicolas-dev-toolbox)
