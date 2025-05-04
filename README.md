# SaaSGuard – Tech-Agnostic Security Scanner for Web Projects

![Security Scan](https://github.com/tonuser/saasguard/actions/workflows/security-scan.yml/badge.svg)
![badge](./output/badge.svg)

SaaSGuard is a **tech-agnostic, plug-and-play GitHub Action** that scans your entire web project for security vulnerabilities, misconfigurations, and bad practices.

Supports all common stacks: **JavaScript**, **TypeScript**, **PHP**, **Go**, **Python**, **Node.js**, and more.

## Features

- ✅ Exposed secret detection (Stripe, GitHub, AWS, etc.)
- ✅ Static code analysis via Semgrep (XSS, SQLi, crypto, auth...)
- ✅ Dependency vulnerability scan (via osv.dev)
- ✅ Weak encryption (md5, sha1, etc.)
- ✅ Lack of input validation
- ✅ Missing rate limiting on sensitive routes
- ✅ Absence of CSRF protection
- ✅ Prisma RLS & policy audit
- ✅ Public paywall route exposure (Stripe, LemonSqueezy)
- ✅ HTTP header inspection (CSP, X-Frame, etc.)
- ✅ Prepared statements missing (Prisma, PHP)
- ✅ Security score + Markdown/JSON report + badge

## Usage

1. Drop this into `.github/workflows/security-scan.yml`
2. Run the action manually or on push
3. Retrieve your security report and badge in `/output/`

## License

MIT © 2025 – Built by indie devs, for devs.