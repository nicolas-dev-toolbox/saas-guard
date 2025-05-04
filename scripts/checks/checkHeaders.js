const { execSync } = require('child_process');

exports.run = async () => {
  const findings = [];
  const target = process.env.TARGET_URL || 'https://example.com';

  try {
    const headers = execSync(`curl -s -I ${target}`).toString().toLowerCase();

    const required = [
      { key: 'content-security-policy', doc: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy' },
      { key: 'x-frame-options', doc: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options' },
      { key: 'referrer-policy', doc: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy' },
      { key: 'x-content-type-options', doc: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options' }
    ];

    required.forEach(header => {
      if (!headers.includes(header.key)) {
        findings.push({
          type: 'Headers',
          message: `Missing security header: ${header.key}`,
          file: `Remote: ${target}`,
          details: 'Header not found in HTTP response.',
          severity: 2,
          doc: header.doc
        });
      }
    });

  } catch (err) {
    findings.push({
      type: 'Headers',
      message: 'Failed to fetch headers',
      file: `Remote: ${target}`,
      details: err.message,
      severity: 1,
      doc: 'https://curl.se/docs/manual.html'
    });
  }

  return findings;
};