const fs = require('fs');

exports.run = async () => {
  const findings = [];

  if (!fs.existsSync('prisma/schema.prisma')) {
    return [];
  }

  const content = fs.readFileSync('prisma/schema.prisma', 'utf8');
  const hasPolicy = content.includes('@@policy');
  const hasRLS = content.includes('previewFeatures');

  if (!hasRLS) {
    findings.push({
      type: 'Prisma',
      message: 'Prisma previewFeatures for RLS not enabled',
      file: 'prisma/schema.prisma',
      details: 'Consider enabling RLS support in the generator previewFeatures.',
      severity: 2,
      doc: 'https://www.prisma.io/docs/orm/prisma-schema/data-model#previewfeatures'
    });
  }

  if (!hasPolicy) {
    findings.push({
      type: 'Prisma',
      message: 'No RLS policies found in schema.prisma',
      file: 'prisma/schema.prisma',
      details: 'Define @@policy blocks to enforce RLS at the database level.',
      severity: 3,
      doc: 'https://www.prisma.io/docs/orm/prisma-schema/data-model#policy'
    });
  }

  return findings;
};