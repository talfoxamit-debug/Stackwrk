import { describe, it, expect } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rate-limit (SEC-03, SEC-08, SEC-09)", () => {
  it("allows up to the limit then blocks within the window", () => {
    const key = "test-key-a";
    for (let i = 0; i < 5; i++) expect(rateLimit(key, 5, 60_000)).toBe(true);
    expect(rateLimit(key, 5, 60_000)).toBe(false);
    expect(rateLimit(key, 5, 60_000)).toBe(false);
  });

  it("keeps separate buckets per key", () => {
    expect(rateLimit("test-key-b", 1, 60_000)).toBe(true);
    expect(rateLimit("test-key-b", 1, 60_000)).toBe(false);
    expect(rateLimit("test-key-c", 1, 60_000)).toBe(true); // different key unaffected
  });
});
