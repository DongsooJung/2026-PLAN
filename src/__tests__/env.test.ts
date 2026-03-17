import { describe, it, expect, beforeEach, afterEach } from "vitest";

// env.ts 는 모듈 레벨에서 즉시 실행되지 않으므로 (lazy getter) 동적 import로 테스트
describe("env", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns environment variables when set", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

    // 매번 fresh import를 위해 cache 무효화
    const mod = await import("@/lib/env");
    expect(mod.env.supabaseUrl).toBe("https://test.supabase.co");
    expect(mod.env.supabaseAnonKey).toBe("test-anon-key");
  });

  it("throws when NEXT_PUBLIC_SUPABASE_URL is missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const mod = await import("@/lib/env");
    expect(() => mod.env.supabaseUrl).toThrow("NEXT_PUBLIC_SUPABASE_URL");
  });

  it("throws when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const mod = await import("@/lib/env");
    expect(() => mod.env.supabaseAnonKey).toThrow("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  });

  it("includes guidance to check .env.example in error message", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const mod = await import("@/lib/env");
    expect(() => mod.env.supabaseUrl).toThrow(".env.example");
  });
});
