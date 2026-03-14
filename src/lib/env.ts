function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `환경변수 ${name}이(가) 설정되지 않았습니다. .env.example을 참고하세요.`
    );
  }
  return value;
}

export const env = {
  get supabaseUrl() {
    return getEnv("NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabaseAnonKey() {
    return getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
} as const;
