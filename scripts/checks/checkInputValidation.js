const fs = require('fs');
const glob = require('glob');

const indicators = [
  { regex: /req\.body\..*[^\w](username|email|password)[^\w]/, label: 'Unvalidated body param', doc: 'https://owasp.org/www-community/Input_Validation' },
  { regex: /req\.query\./, label: 'Query param used without validation', doc: 'https://owasp.org/www-community/Input_Validation' },
  { regex: /\$_(GET|POST|REQUEST)\[.*\]/, label: 'PHP input var without sanitization', doc: 'https://owasp.org/www-community/Input_Validation' }
];

exports.run = async () => {
  const findings = [];
  const files = glob.sync('**/*.{js,ts,php}', { ignore: 'node_modules/**' });

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    indicators.forEach(p => {
      const matches = content.match(p.regex);
      if (matches) {
        findings.push({
          type: 'Input Validation',
          message: `${p.label} in ${file}`,
          file,
          details: `Pattern: ${matches[0]}`,
          severity: 2,
          doc: p.doc
        });
      }
    });
  });

  return findings;
};