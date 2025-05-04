const fs = require("fs");
const glob = require("glob");

const cspIndicators = [
  /Content-Security-Policy/i,
  /contentSecurityPolicy/i,
  /setHeader\(['"`]Content-Security-Policy['"`],/,
  /headers\[['"`]Content-Security-Policy['"`]\]/,
  /helmet\(\s*{[^}]*contentSecurityPolicy/i,
];

const weakDirectives = [
  /default-src\s+['"]?\*/i,
  /script-src[^;]*['"]unsafe-inline['"]/i,
  /style-src[^;]*['"]unsafe-inline['"]/i,
];

exports.run = async () => {
  const findings = [];

  const files = glob.sync("**/*.{js,ts,py,php}", {
    ignore: ["node_modules/**", "scripts/**", "saasguard/**", "__tests__/**"],
  });

  files.forEach((file) => {
    const content = fs.readFileSync(file, "utf8");

    const definesCSP = cspIndicators.some((p) => p.test(content));
    const isWeakCSP = weakDirectives.some((p) => p.test(content));

    if (!definesCSP) {
      findings.push({
        type: "Headers",
        message: "No Content-Security-Policy (CSP) header found",
        file,
        details:
          "You should define a CSP header to prevent XSS and injection attacks.",
        severity: 2,
        doc: "https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP",
      });
    } else if (isWeakCSP) {
      findings.push({
        type: "Headers",
        message: "Weak CSP detected (wildcards or unsafe-inline)",
        file,
        details: "Avoid using default-src * or unsafe-inline in CSP headers.",
        severity: 2,
        doc: "https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP",
      });
    }
  });

  return findings;
};
