const fs = require('fs');
const path = require('path');

const checks = [
  './checks/checkSecrets',
  './checks/checkPrisma',
  './checks/checkHeaders',
  './checks/checkPaywall',
  './checks/checkDependencies',
  './checks/runSemgrep',
  './checks/checkCSPStrength',
  './checks/checkWeakCrypto',
  './checks/checkInputValidation',
  './checks/checkRateLimiting',
  './checks/checkPreparedStatements',
  './checks/checkCSRF',
  './checks/checkOSVScan'
];

let allFindings = [];

(async () => {
  for (const checkPath of checks) {
    const check = require(checkPath);
    const findings = await check.run();
    allFindings.push(...findings);
  }

  allFindings.sort((a, b) => b.severity - a.severity);

  const reportMd = allFindings.map(f => 
    `- [${f.type}] **${f.message}**
  - File: \`${f.file}\`
  - Details: ${f.details}
  - Doc: ${f.doc}`).join('\n\n');

  const score = 100 - allFindings.reduce((acc, f) => acc + (f.severity * 5), 0);
  const finalScore = Math.max(0, score);

  fs.writeFileSync(path.join(__dirname, '../output/report.md'), `# Security Report\n\nScore: ${finalScore}/100\n\n${reportMd}`);
  fs.writeFileSync(path.join(__dirname, '../output/report.json'), JSON.stringify({ score: finalScore, findings: allFindings }, null, 2));
  fs.writeFileSync(path.join(__dirname, '../output/badge.svg'),
`<svg xmlns='http://www.w3.org/2000/svg' width='160' height='20'>
  <rect width='100%' height='100%' fill='${finalScore >= 80 ? '#4c1' : finalScore >= 50 ? '#dfb317' : '#e05d44'}'/>
  <text x='10' y='14' fill='white' font-family='Arial' font-size='12'>Security Score: ${finalScore}/100</text>
</svg>`);

  console.log('Security scan completed. Summary:');
  console.log(`Score: ${finalScore}/100`);
  console.log(reportMd);
})();