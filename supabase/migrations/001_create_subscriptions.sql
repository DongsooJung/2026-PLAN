create extension if not exists "uuid-ossp";

create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  service_name text not null,
  plan_name text,
  cost numeric(10, 2) not null check (cost >= 0),
  currency text not null default 'KRW',
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'yearly', 'weekly')),
  next_billing_date date not null,
  category text not null default '기타' check (category in ('엔터테인먼트', '생산성', '음악', '클라우드', '교육', '건강', '뉴스', '기타')),
  icon_url text,
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled')),
  memo text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_next_billing on public.subscriptions(user_id, next_billing_date);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_subscription_updated
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();

alter table public.subscriptions enable row level security;

create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert own subscriptions"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own subscriptions"
  on public.subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own subscriptions"
  on public.subscriptions for delete
  using (auth.uid() = user_id);
