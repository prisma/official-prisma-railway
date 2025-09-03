import { execSync } from "node:child_process";
import fs from "node:fs";

if (process.env.DATABASE_URL) {
  process.exit(0);
}

const log = {
  info: (msg) => console.log(`• ${msg}`),
  success: (msg) => console.log(`✓ ${msg}`),
  section: (msg) => console.log(`\n${msg}:`),
};

const envPath = ".env";

if (fs.existsSync(envPath) && !process.argv.includes("--force")) {
  log.info("Using existing .env (--force to regenerate)");
  process.exit(0);
}

log.section("Provisioning database");
const { connectionString, directConnectionString, claimUrl, deletionDate } =
  JSON.parse(
    execSync("npx create-db@latest --json", {
      stdio: ["ignore", "pipe", "inherit"],
    }).toString()
  );

fs.writeFileSync(
  envPath,
  [
    `# Generated on ${new Date().toISOString()}`,
    `DATABASE_URL="${connectionString}"`,
    `DIRECT_URL="${directConnectionString}"`,
    `# Claim: ${claimUrl}`,
    `# Expires: ${deletionDate}`,
    "",
  ].join("\n")
);

log.success("Configured .env");

try {
  log.section("Database setup");
  execSync(
    "npx prisma db push && npx prisma generate --no-hints && npx prisma db seed",
    {
      stdio: "inherit",
    }
  );
  log.success("Database ready");
} catch (error) {
  console.error("\nError:", error.message);
  process.exit(1);
}
