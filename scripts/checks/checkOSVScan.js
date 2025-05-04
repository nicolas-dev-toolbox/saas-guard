const { execSync } = require("child_process");
const fs = require("fs");

exports.run = async () => {
  const findings = [];

  if (!fs.existsSync("package-lock.json")) {
    findings.push({
      type: "OSV",
      message: "No lockfile found for OSV scan",
      file: "package-lock.json",
      details: "The scanner requires a valid package-lock.json file.",
      severity: 1,
      doc: "https://osv.dev",
    });
    return findings;
  }

  try {
    execSync(
      "npx osv-scanner --lockfile=package-lock.json --format=json > output/osv.json",
      { stdio: "inherit" }
    );
    const result = fs.readFileSync("output/osv.json", "utf8");
    const parsed = JSON.parse(result);

    parsed.results?.forEach((pkg) => {
      pkg.vulnerabilities?.forEach((vuln) => {
        findings.push({
          type: "OSV",
          message: `${vuln.id} in ${pkg.package.name}`,
          file: "package-lock.json",
          details: vuln.summary || vuln.details || "Known vulnerability",
          severity:
            vuln.severity === "CRITICAL" || vuln.severity === "HIGH" ? 3 : 2,
          doc: vuln.references?.[0]?.url || "https://osv.dev",
        });
      });
    });
  } catch (err) {
    findings.push({
      type: "OSV",
      message: "OSV scan failed",
      file: "package-lock.json",
      details: err.message,
      severity: 1,
      doc: "https://osv.dev",
    });
  }

  return findings;
};
