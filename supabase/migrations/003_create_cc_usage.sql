create table public.cc_usage (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  session_id text,
  model text not null default 'claude-sonnet-4-20250514',
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  cache_read_tokens integer not null default 0 check (cache_read_tokens >= 0),
  cache_write_tokens integer not null default 0 check (cache_write_tokens >= 0),
  cost_usd numeric(10, 6) not null default 0 check (cost_usd >= 0),
  duration_ms integer not null default 0 check (duration_ms >= 0),
  tool_uses integer not null default 0 check (tool_uses >= 0),
  task_description text,
  used_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

create index idx_cc_usage_user_id on public.cc_usage(user_id);
create index idx_cc_usage_used_at on public.cc_usage(user_id, used_at desc);

alter table public.cc_usage enable row level security;

create policy "Users can view own cc_usage"
  on public.cc_usage for select
  using (auth.uid() = user_id);

create policy "Users can insert own cc_usage"
  on public.cc_usage for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cc_usage"
  on public.cc_usage for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own cc_usage"
  on public.cc_usage for delete
  using (auth.uid() = user_id);
