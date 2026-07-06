-- 결제일 알림/리마인더 기능
-- 1) 사용자별 알림 설정  2) Web Push 구독  3) 발송 로그(중복 방지)

-- 사용자별 알림 설정 -------------------------------------------------
create table public.notification_settings (
  user_id uuid references auth.users(id) on delete cascade primary key,
  enabled boolean not null default true,
  -- 결제 며칠 전에 알릴지 (예: {7,3,1} = 7일·3일·1일 전)
  reminder_days integer[] not null default '{7,3,1}',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create trigger on_notification_settings_updated
  before update on public.notification_settings
  for each row execute function public.handle_updated_at();

alter table public.notification_settings enable row level security;

create policy "Users can view own notification settings"
  on public.notification_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert own notification settings"
  on public.notification_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notification settings"
  on public.notification_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Web Push 구독 정보 -------------------------------------------------
create table public.push_subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz default now() not null,
  unique (user_id, endpoint)
);

create index idx_push_subscriptions_user_id on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

create policy "Users can view own push subscriptions"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert own push subscriptions"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own push subscriptions"
  on public.push_subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own push subscriptions"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);

-- 발송 로그 (같은 구독·결제일·리마인더 조합을 하루에 한 번만 발송) ----
create table public.notification_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  subscription_id uuid references public.subscriptions(id) on delete cascade not null,
  billing_date date not null,
  reminder_day integer not null,
  sent_at timestamptz default now() not null,
  unique (subscription_id, billing_date, reminder_day)
);

create index idx_notification_logs_user_id on public.notification_logs(user_id);

alter table public.notification_logs enable row level security;

create policy "Users can view own notification logs"
  on public.notification_logs for select
  using (auth.uid() = user_id);
-- insert/삭제는 서버(서비스 롤)에서만 수행하므로 별도 정책 없음(RLS로 차단)
