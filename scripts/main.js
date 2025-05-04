const fs = require("fs");
const path = require("path");

const checks = [
  "./checks/checkSecrets",
  "./checks/checkPrisma",
  "./checks/checkHeaders",
  "./checks/checkPaywall",
  "./checks/checkDependencies",
  "./checks/runSemgrep",
  "./checks/checkCSPStrength",
  "./checks/checkWeakCrypto",
  "./checks/checkInputValidation",
  "./checks/checkRateLimiting",
  "./checks/checkPreparedStatements",
  "./checks/checkCSRF",
  "./checks/checkOSVScan",
];

let allFindings = [];

(async () => {
  for (const checkPath of checks) {
    try {
      const check = require(checkPath);
      const findings = await check.run();
      allFindings.push(...findings);
    } catch (err) {
      console.error(`❌ Failed to run check ${checkPath}:`, err.message);
    }
  }

  allFindings.sort((a, b) => b.severity - a.severity);

  const reportMd = allFindings
    .map(
      (f) =>
        `- [${f.type}] **${f.message}**\n  - File: \`${f.file}\`\n  - Details: ${f.details}\n  - Doc: ${f.doc}`
    )
    .join("\n\n");

  const score = 100 - allFindings.reduce((acc, f) => acc + f.severity * 5, 0);
  const finalScore = Math.max(0, score);

  fs.writeFileSync(
    path.join(__dirname, "../output/report.md"),
    `# Security Report\n\nScore: ${finalScore}/100\n\n${reportMd}`
  );
  fs.writeFileSync(
    path.join(__dirname, "../output/report.json"),
    JSON.stringify({ score: finalScore, findings: allFindings }, null, 2)
  );
  fs.writeFileSync(
    path.join(__dirname, "../output/badge.svg"),
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='20'>
  <rect width='100%' height='100%' fill='${
    finalScore >= 80 ? "#4c1" : finalScore >= 50 ? "#dfb317" : "#e05d44"
  }'/>
  <text x='10' y='14' fill='white' font-family='Arial' font-size='12'>Security Score: ${finalScore}/100</text>
</svg>`
  );

  // Generate HTML report
  const htmlLines = [
    `<html><head><meta charset='UTF-8'><title>SaaSGuard Report</title><style>
    body { font-family: sans-serif; background: #f9f9f9; padding: 2em; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.6em; border: 1px solid #ccc; text-align: left; }
    th { background: #444; color: white; }
    tr:nth-child(even) { background: #f2f2f2; }
    .sev-3 { background: #ffe6e6; }
    .sev-2 { background: #fff8dc; }
    .sev-1 { background: #e2f0d9; }
    </style></head><body><h1>SaaSGuard Security Report</h1><table>
    <thead><tr><th>Type</th><th>Message</th><th>File</th><th>Severity</th><th>Doc</th></tr></thead><tbody>`,
  ];

  allFindings.forEach((f) => {
    const sevClass = `sev-${f.severity}`;
    const sevIcon = f.severity === 3 ? "🟥" : f.severity === 2 ? "🟧" : "🟩";
    htmlLines.push(
      `<tr class="${sevClass}"><td>${f.type}</td><td>${f.message}</td><td><code>${f.file}</code></td><td>${sevIcon}</td><td><a href="${f.doc}" target="_blank">🔗</a></td></tr>`
    );
  });

  htmlLines.push("</tbody></table></body></html>");
  fs.writeFileSync(
    path.join(__dirname, "../output/report.html"),
    htmlLines.join("\n")
  );

  console.log("✅ SaaSGuard completed. Score:", finalScore);
})();
