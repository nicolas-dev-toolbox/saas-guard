const fs = require('fs');
const glob = require('glob');

exports.run = async () => {
  const findings = [];
  const files = glob.sync('**/*.{js,ts,php}', { ignore: 'node_modules/**' });

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');

    if (content.includes('$queryRaw') && !content.includes('sql`')) {
      findings.push({
        type: 'SQL Injection',
        message: 'Prisma $queryRaw used without sql tag (unsafe)',
        file,
        details: 'Use `sql` tagged template literals to prevent SQL injection.',
        severity: 3,
        doc: 'https://www.prisma.io/docs/orm/prisma-client/raw-database-access'
      });
    }

    if (content.match(/->query\(([^\)]*)\)/) && !content.includes('prepare')) {
      findings.push({
        type: 'SQL Injection',
        message: 'PHP query() used without prepared statement',
        file,
        details: 'Use $pdo->prepare() and bindParam() to prevent SQL injection.',
        severity: 3,
        doc: 'https://www.php.net/manual/en/pdo.prepare.php'
      });
    }
  });

  return findings;
};