const { execSync } = require("child_process");
const fs = require("fs");

exports.run = async () => {
  const findings = [];
  try {
    execSync("npx semgrep --config p/ci --json > output/semgrep.json");
    const data = fs.readFileSync("output/semgrep.json", "utf8");
    const result = JSON.parse(data);

    result.results?.forEach((res) => {
      findings.push({
        type: "Semgrep",
        message: res.check_id,
        file: res.path,
        details: res.extra.message,
        severity:
          res.extra.severity === "ERROR"
            ? 3
            : res.extra.severity === "WARNING"
            ? 2
            : 1,
        doc: res.extra.metadata?.references?.[0] || "https://semgrep.dev",
      });
    });
  } catch (err) {
    findings.push({
      type: "Semgrep",
      message: "Semgrep scan failed",
      file: "N/A",
      details: err.message,
      severity: 1,
      doc: "https://semgrep.dev",
    });
  }

  return findings;
};
