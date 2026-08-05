-- run this in the supabase SQL editor

create table if not exists groups (
  code            text primary key,
  distance_miles  int not null default 5,
  created_at      timestamptz not null default now()
);

create table if not exists members (
  id          uuid primary key default gen_random_uuid(),
  group_code  text not null references groups(code) on delete cascade,
  name        text not null,
  joined      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists places (
  id          bigserial primary key,
  group_code  text not null references groups(code) on delete cascade,
  position    int not null,
  name        text not null,
  cuisine     text default '',
  hours       text default '',
  address     text default '',

  photo_ref   text default ''
);

create table if not exists votes (
  group_code  text not null references groups(code) on delete cascade,
  member_id   uuid not null references members(id) on delete cascade,
  place_name  text not null,
  liked       boolean not null,
  created_at  timestamptz not null default now(),

  primary key (group_code, member_id, place_name)
);

-- row level security, the publishable key is in the browser so this is what protects the data

alter table groups  enable row level security;
alter table members enable row level security;
alter table places  enable row level security;
alter table votes   enable row level security;

-- no logins, you just need the group code

drop policy if exists "anon read groups"   on groups;
drop policy if exists "anon insert groups" on groups;
drop policy if exists "anon update groups" on groups;
create policy "anon read groups"   on groups for select to anon using (true);
create policy "anon insert groups" on groups for insert to anon with check (true);
create policy "anon update groups" on groups for update to anon using (true) with check (true);

drop policy if exists "anon read members"   on members;
drop policy if exists "anon insert members" on members;
create policy "anon read members"   on members for select to anon using (true);
create policy "anon insert members" on members for insert to anon with check (true);

drop policy if exists "anon read places"   on places;
drop policy if exists "anon insert places" on places;
create policy "anon read places"   on places for select to anon using (true);
create policy "anon insert places" on places for insert to anon with check (true);

drop policy if exists "anon read votes"   on votes;
drop policy if exists "anon insert votes" on votes;
drop policy if exists "anon update votes" on votes;
drop policy if exists "anon delete votes" on votes;
create policy "anon read votes"   on votes for select to anon using (true);
create policy "anon insert votes" on votes for insert to anon with check (true);
create policy "anon update votes" on votes for update to anon using (true) with check (true);
create policy "anon delete votes" on votes for delete to anon using (true);

-- realtime, so the members list updates without a refresh
alter publication supabase_realtime add table members;
alter publication supabase_realtime add table votes;

select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
