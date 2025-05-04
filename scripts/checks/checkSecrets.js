const fs = require('fs');
const glob = require('glob');

exports.run = async () => {
  const findings = [];
  const patterns = [/sk_live_[0-9a-zA-Z]{24,}/, /ghp_[0-9a-zA-Z]{36}/];
  const files = glob.sync('**/*.{js,ts,env}', { ignore: 'node_modules/**' });

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    patterns.forEach(regex => {
      if (regex.test(content)) {
        findings.push({ type: 'Secrets', message: 'Exposed API key', file, details: 'Potential secret in code.', severity: 3, doc: 'https://owasp.org/www-community/vulnerabilities/ExposedSecrets' });
      }
    });
  });

  return findings;
};