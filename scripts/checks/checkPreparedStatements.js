const fs = require("fs");
const glob = require("glob");

const patterns = [
  // Prisma / raw SQL
  {
    match: /\$queryRaw\([^`'"]/,
    safe: /sql`/,
    tech: "Prisma",
    doc: "https://www.prisma.io/docs/orm/prisma-client/raw-database-access",
  },

  // PHP: direct query() without prepare
  {
    match: /->query\(/,
    safe: /->prepare\(/,
    tech: "PHP PDO",
    doc: "https://www.php.net/manual/en/pdo.prepare.php",
  },

  // Node.js / Sequelize raw query
  {
    match: /sequelize\.query\(/i,
    safe: /\.bind|\?/i,
    tech: "Sequelize",
    doc: "https://sequelize.org/docs/v6/core-concepts/raw-queries/",
  },

  // Generic raw SQL usage (Node, PHP, Python, etc.)
  {
    match: /\b(exec|execute|query|raw|cursor)\s*\(/i,
    safe: /prepare|bind|param|sql`/,
    tech: "Generic SQL",
    doc: "https://owasp.org/www-community/attacks/SQL_Injection",
  },
];

exports.run = async () => {
  const findings = [];

  const files = glob.sync("**/*.{js,ts,php,py}", {
    ignore: ["node_modules/**", "scripts/**", "saasguard/**", "__tests__/**"],
  });

  files.forEach((file) => {
    const content = fs.readFileSync(file, "utf8");

    patterns.forEach(({ match, safe, tech, doc }) => {
      if (match.test(content) && !safe.test(content)) {
        findings.push({
          type: "SQL Injection",
          message: `${tech} raw SQL used without protection`,
          file,
          details: `This file uses raw SQL patterns (${match}) but does not appear to use safe practices (${safe}).`,
          severity: 3,
          doc,
        });
      }
    });
  });

  return findings;
};
