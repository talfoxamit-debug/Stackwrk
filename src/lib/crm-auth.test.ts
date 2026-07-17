import { describe, it, expect, beforeEach } from "vitest";
import crypto from "crypto";
import { makeToken, verifyToken, checkLogin, isConfigured } from "./crm-auth";

function forge(username: string, secret: string, expMs = Date.now() + 1_000_000_000): string {
  const payload = `${username}|${expMs}`;
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return Buffer.from(payload).toString("base64url") + "." + sig;
}

describe("crm-auth (SEC-01, SEC-15, REL-05)", () => {
  beforeEach(() => {
    process.env.CRM_ACCESS_KEY = "test-signing-secret-abc123";
    process.env.CRM_USERS = "tal:hunter2|othman:pw";
  });

  it("round-trips a valid token", () => {
    const t = makeToken("tal");
    expect(t).toBeTruthy();
    expect(verifyToken(t)).toBe("tal");
  });

  it("rejects a token signed with the wrong secret (forgery)", () => {
    expect(verifyToken(forge("tal", "wrong-secret"))).toBeNull();
  });

  it("rejects the old committed fallback secret", () => {
    expect(verifyToken(forge("tal", "stackwrk-crm-dev-secret"))).toBeNull();
  });

  it("fails closed when CRM_ACCESS_KEY is unset", () => {
    delete process.env.CRM_ACCESS_KEY;
    expect(makeToken("tal")).toBeNull();
    expect(isConfigured()).toBe(false);
    // even a token that was valid under a secret must not verify with no secret
    expect(verifyToken(forge("tal", "test-signing-secret-abc123"))).toBeNull();
  });

  it("rejects an expired token", () => {
    expect(verifyToken(forge("tal", "test-signing-secret-abc123", Date.now() - 1000))).toBeNull();
  });

  it("rejects a token for a user no longer in CRM_USERS", () => {
    const t = makeToken("ghost"); // signed, but ghost is not a configured user
    expect(verifyToken(t)).toBeNull();
  });

  it("checkLogin validates the password", () => {
    expect(checkLogin("tal", "hunter2")).toBe(true);
    expect(checkLogin("tal", "wrong")).toBe(false);
    expect(checkLogin("nobody", "x")).toBe(false);
  });
});
