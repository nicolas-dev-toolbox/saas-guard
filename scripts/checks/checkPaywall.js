const fs = require("fs");
const glob = require("glob");

const monetizationKeywords = [
  /plan/i,
  /subscription/i,
  /billing/i,
  /paid/i,
  /premium/i,
  /pro/i,
  /upgrade/i,
  /invoice/i,
  /accessLevel/i,
  /paywall/i,
];

exports.run = async () => {
  const findings = [];
  const files = glob.sync("**/*.{js,ts,tsx,vue}", {
    ignore: ["node_modules/**", "scripts/**"],
  });

  files.forEach((file) => {
    const content = fs.readFileSync(file, "utf8");
    const containsMonetization = monetizationKeywords.some((p) =>
      p.test(content)
    );
    const noBackendProtection =
      !/getServerSession|verifyToken|auth|checkSession|backend/i.test(content);

    if (containsMonetization && noBackendProtection) {
      findings.push({
        type: "Monetization",
        message:
          "Monetization or plan logic found without backend verification",
        file,
        details:
          "Found plan/subscription logic but no server-side auth or validation.",
        severity: 2,
        doc: "https://stripe.com/docs/security/guide#client-side-checkout",
      });
    }
  });

  return findings;
};
