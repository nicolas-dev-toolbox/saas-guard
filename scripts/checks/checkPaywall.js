const fs = require('fs');
const glob = require('glob');

exports.run = async () => {
  const findings = [];
  const files = glob.sync('**/*.{ts,tsx,js}', { ignore: 'node_modules/**' });

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');

    // Webhook signature
    if (file.includes('webhook') && !content.includes('verifySignature')) {
      findings.push({
        type: 'Paywall',
        message: 'Stripe webhook signature not verified',
        file,
        details: 'You should validate the Stripe signature in the webhook handler.',
        severity: 3,
        doc: 'https://stripe.com/docs/webhooks/signatures'
      });
    }

    // LemonSqueezy route check
    if (content.includes('/lemon') && content.includes('GET') && !content.includes('auth')) {
      findings.push({
        type: 'Paywall',
        message: 'LemonSqueezy route without auth protection',
        file,
        details: 'Public route handling LemonSqueezy data should be protected.',
        severity: 2,
        doc: 'https://docs.lemonsqueezy.com/help/webhooks'
      });
    }

    // Client-only protection check
    if (content.includes('router.push') && content.includes('/dashboard') && !content.includes('session')) {
      findings.push({
        type: 'Paywall',
        message: 'Client-side route protection only',
        file,
        details: 'Page redirects based on session only in the browser, but backend might be exposed.',
        severity: 2,
        doc: 'https://next-auth.js.org/getting-started/example'
      });
    }
  });

  return findings;
};