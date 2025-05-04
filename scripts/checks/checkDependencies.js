const { execSync } = require('child_process');

exports.run = async () => {
  const findings = [];

  try {
    const result = execSync('npm audit --json', { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
    const parsed = JSON.parse(result);

    if (parsed.metadata.totalDependencies > 0 && parsed.vulnerabilities) {
      Object.entries(parsed.vulnerabilities).forEach(([pkg, vuln]) => {
        findings.push({
          type: 'Dependencies',
          message: `Vulnerability in ${pkg}`,
          file: 'package-lock.json',
          details: `${vuln.severity.toUpperCase()} - ${vuln.title}`,
          severity: vuln.severity === 'high' ? 3 : vuln.severity === 'moderate' ? 2 : 1,
          doc: vuln.url || 'https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities'
        });
      });
    }

  } catch (err) {
    findings.push({
      type: 'Dependencies',
      message: 'npm audit failed',
      file: 'package.json',
      details: err.message,
      severity: 1,
      doc: 'https://docs.npmjs.com/cli/v8/commands/npm-audit'
    });
  }

  return findings;
};