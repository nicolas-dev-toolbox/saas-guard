const fs = require('fs');
const glob = require('glob');

exports.run = async () => {
  const findings = [];
  const files = glob.sync('**/*.{js,ts,php}', { ignore: 'node_modules/**' });

  let csrfMentioned = false;

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');

    if (content.includes('csrf') || content.includes('csrfToken')) {
      csrfMentioned = true;
    }

    if ((file.includes('form') || file.includes('submit')) &&
        !content.includes('csrf') && !content.includes('csrfToken')) {
      findings.push({
        type: 'CSRF',
        message: 'Potential CSRF risk in form without token',
        file,
        details: 'No CSRF token found in form submission logic.',
        severity: 2,
        doc: 'https://owasp.org/www-community/attacks/csrf'
      });
    }
  });

  if (!csrfMentioned) {
    findings.push({
      type: 'CSRF',
      message: 'No CSRF protection detected in project',
      file: 'global',
      details: 'No mention of CSRF token or middleware in any file.',
      severity: 2,
      doc: 'https://owasp.org/www-community/attacks/csrf'
    });
  }

  return findings;
};