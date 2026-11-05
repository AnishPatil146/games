import { setAdminCredentials } from "../src/lib/services/admin-auth-service";
import { AUTHORIZED_ADMIN_EMAIL } from "../src/lib/env";

const args = process.argv.slice(2);
const newPassword = args[0];

if (!newPassword || newPassword.length < 8) {
  console.error("=================================================================");
  console.error("THE UNWRITTEN — SECURE ADMINISTRATOR RECOVERY PROTOCOL");
  console.error("=================================================================");
  console.error("Usage: npm run admin:recover <new_password>");
  console.error("Requirement: Minimum 8 characters in length.");
  console.error("Authorized Administrator Identity:", AUTHORIZED_ADMIN_EMAIL);
  console.error("=================================================================");
  process.exit(1);
}

const result = setAdminCredentials(newPassword);

if (result.success) {
  console.log("=================================================================");
  console.log("THE UNWRITTEN — ADMINISTRATOR CREDENTIALS RE-ESTABLISHED");
  console.log("=================================================================");
  console.log("Status: SUCCESS");
  console.log("Identity:", AUTHORIZED_ADMIN_EMAIL);
  console.log("Hashing Algorithm: PBKDF2-SHA512 (100,000 iterations, 32-byte salt)");
  console.log("Storage: Protected .data/admin-credentials.json");
  console.log("Action: You may now sign in at /admin/login with your new password.");
  console.log("=================================================================");
  process.exit(0);
} else {
  console.error("Failed to establish credentials:", result.error);
  process.exit(1);
}
