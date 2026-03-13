create table public.conversions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  md_content text not null,
  document_metadata jsonb not null default '{}',
  export_format text check (export_format in ('hwpx', 'docx', 'pdf')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_conversions_user_id on public.conversions(user_id);
create index idx_conversions_created on public.conversions(user_id, created_at desc);

create trigger on_conversion_updated
  before update on public.conversions
  for each row execute function public.handle_updated_at();

alter table public.conversions enable row level security;

create policy "Users can view own conversions"
  on public.conversions for select
  using (auth.uid() = user_id);

create policy "Users can insert own conversions"
  on public.conversions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own conversions"
  on public.conversions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own conversions"
  on public.conversions for delete
  using (auth.uid() = user_id);
