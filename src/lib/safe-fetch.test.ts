import { describe, it, expect } from "vitest";
import { isPrivateIp, isBlockedHost, normalizeUrl } from "./safe-fetch";

describe("safe-fetch SSRF guards (SEC-04)", () => {
  it("flags loopback / private / link-local IPv4", () => {
    expect(isPrivateIp("127.0.0.1")).toBe(true);
    expect(isPrivateIp("10.0.0.5")).toBe(true);
    expect(isPrivateIp("192.168.1.1")).toBe(true);
    expect(isPrivateIp("172.16.0.1")).toBe(true);
    expect(isPrivateIp("169.254.169.254")).toBe(true); // cloud metadata
    expect(isPrivateIp("100.64.0.1")).toBe(true); // CGNAT
    expect(isPrivateIp("8.8.8.8")).toBe(false);
  });

  it("decodes IPv4-mapped IPv6 in every textual form (the closed hole)", () => {
    expect(isPrivateIp("::ffff:127.0.0.1")).toBe(true);
    expect(isPrivateIp("::ffff:7f00:1")).toBe(true); // hex form of 127.0.0.1
    expect(isPrivateIp("::ffff:a9fe:a9fe")).toBe(true); // hex form of 169.254.169.254
  });

  it("blocks internal hostnames and private literal IPs", () => {
    expect(isBlockedHost("localhost")).toBe(true);
    expect(isBlockedHost("metadata.google.internal")).toBe(true);
    expect(isBlockedHost("something.local")).toBe(true);
    expect(isBlockedHost("[::ffff:7f00:1]")).toBe(true);
    expect(isBlockedHost("example.com")).toBe(false);
  });

  it("normalizeUrl rejects private targets and non-http protocols", () => {
    expect(normalizeUrl("http://127.0.0.1/")).toBeNull();
    expect(normalizeUrl("http://169.254.169.254/")).toBeNull();
    expect(normalizeUrl("file:///etc/passwd")).toBeNull();
    expect(normalizeUrl("notaurl")).toBeNull();
    expect(normalizeUrl("example.com")).not.toBeNull();
    expect(normalizeUrl("https://stackwrk.com")).not.toBeNull();
  });
});
