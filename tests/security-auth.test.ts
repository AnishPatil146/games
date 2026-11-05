import test from "node:test";
import assert from "node:assert/strict";
import {
  hashPassword,
  verifyPassword,
  setAdminCredentials,
  getStoredAdminCredentials,
  createAdminSessionToken,
  verifyAdminSessionToken,
  generateAdminRecoveryToken,
  consumeAdminRecoveryToken,
} from "../src/lib/services/admin-auth-service";
import { AUTHORIZED_ADMIN_EMAIL } from "../src/lib/env";

test("THE UNWRITTEN — Security & Admin Authentication Recovery Suite", async (t) => {
  await t.test("1. Password Hashing: PBKDF2-SHA512 produces valid salt and constant-time verification", () => {
    const rawPass = "RecoveryPass#2026";
    const { salt, hash, iterations } = hashPassword(rawPass);

    assert.equal(salt.length, 64, "Salt must be 32 bytes hex-encoded (64 chars)");
    assert.equal(hash.length, 128, "SHA-512 hash must be 64 bytes hex-encoded (128 chars)");
    assert.equal(iterations, 100_000, "Iterations must be 100,000");

    assert.ok(verifyPassword(rawPass, salt, hash, iterations), "Correct password must verify successfully");
    assert.ok(!verifyPassword("WrongPass#9999", salt, hash, iterations), "Incorrect password must be rejected");
  });

  await t.test("2. Admin Session Token: Signs and verifies token claims with HMAC-SHA256", () => {
    const token = createAdminSessionToken(AUTHORIZED_ADMIN_EMAIL, "SUPER_ADMIN", 3600);
    const verified = verifyAdminSessionToken(token);

    assert.equal(verified.valid, true, "Valid token must pass verification");
    assert.equal(verified.email, AUTHORIZED_ADMIN_EMAIL);
    assert.equal(verified.role, "SUPER_ADMIN");

    // Test tampered token
    const tampered = token.slice(0, -4) + "AAAA";
    const tamperedCheck = verifyAdminSessionToken(tampered);
    assert.equal(tamperedCheck.valid, false, "Tampered signature must be rejected");

    // Test unauthorized identity token
    const fakeToken = createAdminSessionToken("intruder@evil.org", "SUPER_ADMIN", 3600);
    const fakeCheck = verifyAdminSessionToken(fakeToken);
    assert.equal(fakeCheck.valid, false, "Non-admin email must be rejected");
  });

  await t.test("3. Local Admin Credentials: Sets and verifies authorized administrator account", () => {
    const testPassword = "AdminSecurePass!2026";
    const res = setAdminCredentials(testPassword);
    assert.equal(res.success, true, "Credential storage must succeed");

    const record = getStoredAdminCredentials();
    assert.ok(record, "Stored record must exist");
    assert.equal(record?.email, AUTHORIZED_ADMIN_EMAIL);
    assert.ok(
      verifyPassword(testPassword, record!.salt, record!.hash, record!.iterations),
      "Stored credentials must verify against set password"
    );
  });

  await t.test("4. Single-Use Emergency Recovery Token: Validates and consumes one-time secret", () => {
    const secret = generateAdminRecoveryToken();
    assert.ok(secret && secret.length >= 24, "Secret must be high-entropy");

    // First use: must succeed
    const firstUse = consumeAdminRecoveryToken(secret);
    assert.equal(firstUse, true, "First consumption of recovery token must succeed");

    // Second use: must be rejected (single-use guarantee)
    const secondUse = consumeAdminRecoveryToken(secret);
    assert.equal(secondUse, false, "Second consumption of same token must be rejected");

    // Invalid secret: must be rejected
    const invalidUse = consumeAdminRecoveryToken("invalid-garbage-token-1234");
    assert.equal(invalidUse, false, "Invalid secret must be rejected");
  });
});

