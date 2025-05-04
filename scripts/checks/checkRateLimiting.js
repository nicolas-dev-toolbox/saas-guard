const fs = require('fs');
const glob = require('glob');

exports.run = async () => {
  const findings = [];
  const files = glob.sync('**/*.{js,ts}', { ignore: 'node_modules/**' });

  let limiterFound = false;

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('rateLimit') || content.includes('express-rate-limit')) {
      limiterFound = true;
    }

    if (file.includes('/api/') && (file.includes('login') || file.includes('signup') || file.includes('reset'))) {
      if (!content.includes('rateLimit') && !content.includes('middleware') && !content.includes('limiter')) {
        findings.push({
          type: 'Rate Limiting',
          message: 'No rate limiting on sensitive API route',
          file,
          details: 'Consider adding express-rate-limit or equivalent middleware.',
          severity: 3,
          doc: 'https://express-rate-limit.mintlify.app/'
        });
      }
    }
  });

  if (!limiterFound) {
    findings.push({
      type: 'Rate Limiting',
      message: 'No rate limiting detected in project',
      file: 'global',
      details: 'No express-rate-limit or similar logic found in any file.',
      severity: 2,
      doc: 'https://express-rate-limit.mintlify.app/'
    });
  }

  return findings;
};