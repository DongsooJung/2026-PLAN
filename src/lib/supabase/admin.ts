import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * 서비스 롤 키를 사용하는 관리자용 Supabase 클라이언트.
 * RLS를 우회하므로 서버(크론 등) 전용이며, 절대 클라이언트에 노출되면 안 됩니다.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL 환경 변수가 필요합니다."
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
