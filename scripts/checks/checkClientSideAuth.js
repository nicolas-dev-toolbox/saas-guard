const fs = require("fs");
const glob = require("glob");

const clientRedirectPatterns = [
  /router\.push\(/i,
  /navigate\(/i,
  /window\.location(?:\.href)?\s*=/i,
  /document\.location(?:\.href)?\s*=/i,
];

exports.run = async () => {
  const findings = [];
  const files = glob.sync("**/*.{js,ts,tsx,vue}", {
    ignore: ["node_modules/**", "scripts/**"],
  });

  files.forEach((file) => {
    const content = fs.readFileSync(file, "utf8");
    const isFrontend =
      !file.includes("api") &&
      !file.includes("controller") &&
      !file.includes("route");

    clientRedirectPatterns.forEach((pattern) => {
      if (pattern.test(content) && isFrontend) {
        const hasBackendVerification =
          /fetch|axios|\/api\/auth|verifyToken|checkSession/i.test(content);
        if (!hasBackendVerification) {
          findings.push({
            type: "Client Protection",
            message:
              "Client-side redirect or access control without backend validation",
            file,
            details:
              "Redirection or logic detected in a frontend file without server/session/token check.",
            severity: 2,
            doc: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html",
          });
        }
      }
    });
  });

  return findings;
};
