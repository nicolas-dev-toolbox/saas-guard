const fs = require("fs");
const glob = require("glob");

const weakPatterns = [
  {
    regex: /md5/i,
    label: "MD5 hashing",
    doc: "https://cwe.mitre.org/data/definitions/328.html",
  },
  {
    regex: /sha1/i,
    label: "SHA1 hashing",
    doc: "https://cwe.mitre.org/data/definitions/328.html",
  },
  {
    regex: /crypto\.createCipher/i,
    label: "Insecure cipher usage",
    doc: "https://nodejs.org/api/crypto.html",
  },
];

exports.run = async () => {
  const findings = [];

  const files = glob.sync("**/*.{js,ts,php,py,go}", {
    ignore: [
      "node_modules/**",
      "scripts/checks/**",
      "saasguard/**",
      "output/**",
    ],
  });

  files.forEach((file) => {
    const content = fs.readFileSync(file, "utf8");
    weakPatterns.forEach((p) => {
      if (p.regex.test(content)) {
        findings.push({
          type: "Crypto",
          message: `${p.label} detected`,
          file,
          details:
            "Consider using a modern hashing algorithm (e.g., bcrypt, argon2, sha256+salt).",
          severity: 3,
          doc: p.doc,
        });
      }
    });
  });

  return findings;
};
