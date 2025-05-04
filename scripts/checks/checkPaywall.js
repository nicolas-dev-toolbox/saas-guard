const fs = require("fs");
const glob = require("glob");

const webhookFileIndicators = [
  /webhook/i,
  /payment/i,
  /checkout/i,
  /invoice/i,
  /subscription/i,
  /handle.*hook/i,
];

const verificationIndicators = [
  /constructEvent/i,
  /verify.*signature/i,
  /timingSafeEqual/i,
  /req\.headers\[['"`]x-[a-z0-9-]+['"`]\]/i,
  /crypto/i,
  /hmac/i,
  /signature/i,
  /compare/i,
  /token/i,
  /secret/i,
];

const logicExecutionPatterns = [
  /grantAccess/i,
  /upgrade/i,
  /createUser/i,
  /updateSubscription/i,
  /save/i,
  /prisma\..+create/i,
  /insert\s+into/i,
];

exports.run = async () => {
  const findings = [];

  const files = glob.sync("**/*.{js,ts,php,py}", {
    ignore: [
      "node_modules/**",
      "scripts/**",
      "saasguard/**",
      "test/**",
      "__tests__/**",
    ],
  });

  files.forEach((file) => {
    const content = fs.readFileSync(file, "utf8");

    const isLikelyWebhook = webhookFileIndicators.some((p) => p.test(content));
    const hasVerification = verificationIndicators.some((p) => p.test(content));
    const hasSensitiveLogic = logicExecutionPatterns.some((p) =>
      p.test(content)
    );

    if (isLikelyWebhook && hasSensitiveLogic && !hasVerification) {
      findings.push({
        type: "Payment Webhook",
        message:
          "Sensitive webhook logic without signature or token verification",
        file,
        details:
          "Webhook handler contains payment logic (e.g. user upgrade, access grant) without verification.",
        severity: 3,
        doc: "https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html#webhooks",
      });
    }
  });

  return findings;
};
