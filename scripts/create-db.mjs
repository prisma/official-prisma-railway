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
const { connectionString, claimUrl, deletionDate } = JSON.parse(
  execSync("npx create-db@latest --json", {
    stdio: ["ignore", "pipe", "inherit"],
  }).toString()
);

fs.writeFileSync(
  envPath,
  [
    `# Generated on ${new Date().toISOString()}`,
    `DATABASE_URL="${connectionString}"`,
    `NEXT_PUBLIC_CLAIM_URL="${claimUrl}"`,
    `# Expires: ${deletionDate}`,
    "",
  ].join("\n")
);

log.success("Configured .env");

const readmePath = new URL("../README.md", import.meta.url);
let readmeContent = fs.readFileSync(readmePath, "utf-8");

// Check if the Database Claim URL section exists
const claimSectionRegex =
  /## Database Claim URL\n\n\[create-db\.prisma\.io\/claim\]\([^)]*\)/s;

if (claimSectionRegex.test(readmeContent)) {
  // Update existing section
  readmeContent = readmeContent.replace(
    claimSectionRegex,
    `## Database Claim URL\n\n[create-db.prisma.io/claim](${claimUrl})`
  );
} else {
  // Append new section at the end of the file
  const claimSection = `\n## Database Claim URL\n\n[create-db.prisma.io/claim](${claimUrl})`;
  readmeContent = readmeContent.trimEnd() + "\n" + claimSection;
}

fs.writeFileSync(readmePath, readmeContent);
log.success("Updated README.md with claim URL");

try {
  log.section("Database setup");
  execSync(
    "npx prisma db push && npx prisma generate && npx prisma db seed",
    {
      stdio: "inherit",
    }
  );
  log.success("Database ready");
} catch (error) {
  console.error("\nError:", error.message);
  process.exit(1);
}
