create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type type_record
    join pg_namespace schema_record on schema_record.oid = type_record.typnamespace
    where schema_record.nspname = 'public'
      and type_record.typname = 'debt_status'
  ) then
    create type public.debt_status as enum (
      'to''lanmagan',
      'qisman to''langan',
      'to''langan'
    );
  end if;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.gardens (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique default 'xons-static-garden',
  owner_user_id uuid,
  garden_name text not null default '',
  manager_name text not null default '',
  phone text not null default '',
  location text not null default '',
  currency_label text not null default 'so''m',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gardens add column if not exists slug text;
alter table public.gardens alter column slug set default 'xons-static-garden';
alter table public.gardens alter column owner_user_id drop not null;
alter table public.gardens drop constraint if exists gardens_owner_user_id_fkey;

update public.gardens
set slug = concat('garden-', id::text)
where slug is null or btrim(slug) = '';

do $$
declare
  static_garden_id uuid;
begin
  select id
  into static_garden_id
  from public.gardens
  where slug = 'xons-static-garden'
  order by created_at asc, id asc
  limit 1;

  if static_garden_id is null then
    select id
    into static_garden_id
    from public.gardens
    order by created_at asc, id asc
    limit 1;

    if static_garden_id is not null then
      update public.gardens
      set slug = 'xons-static-garden'
      where id = static_garden_id;
    else
      insert into public.gardens (
        slug,
        owner_user_id,
        garden_name,
        manager_name,
        phone,
        location,
        currency_label
      )
      values (
        'xons-static-garden',
        null,
        'XON''s Garden',
        'XON',
        '',
        '',
        'so''m'
      );
    end if;
  end if;
end;
$$;

alter table public.gardens alter column slug set not null;

create table if not exists public.income_records (
  id text primary key,
  garden_id uuid not null references public.gardens(id) on delete cascade,
  amount numeric(14, 2) not null default 0,
  reason text not null default '',
  date date not null,
  source_location text,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.debt_records (
  id text primary key,
  garden_id uuid not null references public.gardens(id) on delete cascade,
  person_or_company text not null default '',
  category text not null default '',
  reason text not null default '',
  amount numeric(14, 2) not null default 0,
  date date not null,
  due_date date,
  status public.debt_status not null default 'to''lanmagan',
  phone text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.worker_expenses (
  id text primary key,
  garden_id uuid not null references public.gardens(id) on delete cascade,
  date date not null,
  worker_count integer not null default 0,
  salary_per_one numeric(14, 2) not null default 0,
  total_salary numeric(14, 2) not null default 0,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.food_expenses (
  id text primary key,
  garden_id uuid not null references public.gardens(id) on delete cascade,
  date date not null,
  shop_name text not null default '',
  price numeric(14, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fertilizer_expenses (
  id text primary key,
  garden_id uuid not null references public.gardens(id) on delete cascade,
  date date not null,
  fertilizer_type text not null default '',
  machine_count integer not null default 0,
  ton_amount numeric(12, 2) not null default 0,
  cost numeric(14, 2) not null default 0,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transport_expenses (
  id text primary key,
  garden_id uuid not null references public.gardens(id) on delete cascade,
  date date not null,
  transport_type text not null default '',
  cost numeric(14, 2) not null default 0,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.energy_expenses (
  id text primary key,
  garden_id uuid not null references public.gardens(id) on delete cascade,
  date date not null,
  amount_paid numeric(14, 2) not null default 0,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.oil_expenses (
  id text primary key,
  garden_id uuid not null references public.gardens(id) on delete cascade,
  date date not null,
  price numeric(14, 2) not null default 0,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.remont_expenses (
  id text primary key,
  garden_id uuid not null references public.gardens(id) on delete cascade,
  date date not null,
  price numeric(14, 2) not null default 0,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tax_expenses (
  id text primary key,
  garden_id uuid not null references public.gardens(id) on delete cascade,
  date date not null,
  amount_paid numeric(14, 2) not null default 0,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.drainage_expenses (
  id text primary key,
  garden_id uuid not null references public.gardens(id) on delete cascade,
  date date not null,
  hours_worked numeric(10, 2) not null default 0,
  total_salary numeric(14, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gardens replica identity full;
alter table public.income_records replica identity full;
alter table public.debt_records replica identity full;
alter table public.worker_expenses replica identity full;
alter table public.food_expenses replica identity full;
alter table public.fertilizer_expenses replica identity full;
alter table public.transport_expenses replica identity full;
alter table public.energy_expenses replica identity full;
alter table public.oil_expenses replica identity full;
alter table public.remont_expenses replica identity full;
alter table public.tax_expenses replica identity full;
alter table public.drainage_expenses replica identity full;

do $$
declare
  table_name text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach table_name in array array[
      'gardens',
      'income_records',
      'debt_records',
      'worker_expenses',
      'food_expenses',
      'fertilizer_expenses',
      'transport_expenses',
      'energy_expenses',
      'oil_expenses',
      'remont_expenses',
      'tax_expenses',
      'drainage_expenses'
    ]
    loop
      if not exists (
        select 1
        from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = table_name
      ) then
        execute format('alter publication supabase_realtime add table public.%I', table_name);
      end if;
    end loop;
  end if;
end;
$$;

create index if not exists gardens_owner_user_id_idx on public.gardens(owner_user_id);
create unique index if not exists gardens_slug_idx on public.gardens(slug);
create index if not exists income_records_garden_id_date_idx on public.income_records(garden_id, date desc);
create index if not exists debt_records_garden_id_date_idx on public.debt_records(garden_id, date desc);
create index if not exists debt_records_garden_id_due_date_idx on public.debt_records(garden_id, due_date desc);
create index if not exists debt_records_garden_id_status_idx on public.debt_records(garden_id, status);
create index if not exists worker_expenses_garden_id_date_idx on public.worker_expenses(garden_id, date desc);
create index if not exists food_expenses_garden_id_date_idx on public.food_expenses(garden_id, date desc);
create index if not exists fertilizer_expenses_garden_id_date_idx on public.fertilizer_expenses(garden_id, date desc);
create index if not exists transport_expenses_garden_id_date_idx on public.transport_expenses(garden_id, date desc);
create index if not exists energy_expenses_garden_id_date_idx on public.energy_expenses(garden_id, date desc);
create index if not exists oil_expenses_garden_id_date_idx on public.oil_expenses(garden_id, date desc);
create index if not exists remont_expenses_garden_id_date_idx on public.remont_expenses(garden_id, date desc);
create index if not exists tax_expenses_garden_id_date_idx on public.tax_expenses(garden_id, date desc);
create index if not exists drainage_expenses_garden_id_date_idx on public.drainage_expenses(garden_id, date desc);

drop trigger if exists set_gardens_updated_at on public.gardens;
create trigger set_gardens_updated_at
before update on public.gardens
for each row
execute function public.set_updated_at();

drop trigger if exists set_income_records_updated_at on public.income_records;
create trigger set_income_records_updated_at
before update on public.income_records
for each row
execute function public.set_updated_at();

drop trigger if exists set_debt_records_updated_at on public.debt_records;
create trigger set_debt_records_updated_at
before update on public.debt_records
for each row
execute function public.set_updated_at();

drop trigger if exists set_worker_expenses_updated_at on public.worker_expenses;
create trigger set_worker_expenses_updated_at
before update on public.worker_expenses
for each row
execute function public.set_updated_at();

drop trigger if exists set_food_expenses_updated_at on public.food_expenses;
create trigger set_food_expenses_updated_at
before update on public.food_expenses
for each row
execute function public.set_updated_at();

drop trigger if exists set_fertilizer_expenses_updated_at on public.fertilizer_expenses;
create trigger set_fertilizer_expenses_updated_at
before update on public.fertilizer_expenses
for each row
execute function public.set_updated_at();

drop trigger if exists set_transport_expenses_updated_at on public.transport_expenses;
create trigger set_transport_expenses_updated_at
before update on public.transport_expenses
for each row
execute function public.set_updated_at();

drop trigger if exists set_energy_expenses_updated_at on public.energy_expenses;
create trigger set_energy_expenses_updated_at
before update on public.energy_expenses
for each row
execute function public.set_updated_at();

drop trigger if exists set_oil_expenses_updated_at on public.oil_expenses;
create trigger set_oil_expenses_updated_at
before update on public.oil_expenses
for each row
execute function public.set_updated_at();

drop trigger if exists set_remont_expenses_updated_at on public.remont_expenses;
create trigger set_remont_expenses_updated_at
before update on public.remont_expenses
for each row
execute function public.set_updated_at();

drop trigger if exists set_tax_expenses_updated_at on public.tax_expenses;
create trigger set_tax_expenses_updated_at
before update on public.tax_expenses
for each row
execute function public.set_updated_at();

drop trigger if exists set_drainage_expenses_updated_at on public.drainage_expenses;
create trigger set_drainage_expenses_updated_at
before update on public.drainage_expenses
for each row
execute function public.set_updated_at();

alter table public.gardens enable row level security;
alter table public.income_records enable row level security;
alter table public.debt_records enable row level security;
alter table public.worker_expenses enable row level security;
alter table public.food_expenses enable row level security;
alter table public.fertilizer_expenses enable row level security;
alter table public.transport_expenses enable row level security;
alter table public.energy_expenses enable row level security;
alter table public.oil_expenses enable row level security;
alter table public.remont_expenses enable row level security;
alter table public.tax_expenses enable row level security;
alter table public.drainage_expenses enable row level security;

drop policy if exists "gardens_select_static" on public.gardens;
create policy "gardens_select_static"
on public.gardens
for select
using (slug = 'xons-static-garden');

drop policy if exists "gardens_insert_static" on public.gardens;
create policy "gardens_insert_static"
on public.gardens
for insert
with check (slug = 'xons-static-garden');

drop policy if exists "gardens_update_static" on public.gardens;
create policy "gardens_update_static"
on public.gardens
for update
using (slug = 'xons-static-garden')
with check (slug = 'xons-static-garden');

drop policy if exists "gardens_select_own" on public.gardens;
drop policy if exists "gardens_insert_own" on public.gardens;
drop policy if exists "gardens_update_own" on public.gardens;

drop policy if exists "income_records_static_access" on public.income_records;
create policy "income_records_static_access"
on public.income_records
for all
using (
  garden_id in (
    select id from public.gardens where slug = 'xons-static-garden'
  )
)
with check (
  garden_id in (
    select id from public.gardens where slug = 'xons-static-garden'
  )
);

drop policy if exists "income_records_owner_access" on public.income_records;

drop policy if exists "debt_records_static_access" on public.debt_records;
create policy "debt_records_static_access"
on public.debt_records
for all
using (
  garden_id in (
    select id from public.gardens where slug = 'xons-static-garden'
  )
)
with check (
  garden_id in (
    select id from public.gardens where slug = 'xons-static-garden'
  )
);

drop policy if exists "debt_records_owner_access" on public.debt_records;

drop policy if exists "worker_expenses_static_access" on public.worker_expenses;
create policy "worker_expenses_static_access"
on public.worker_expenses
for all
using (
  garden_id in (
    select id from public.gardens where slug = 'xons-static-garden'
  )
)
with check (
  garden_id in (
    select id from public.gardens where slug = 'xons-static-garden'
  )
);

drop policy if exists "worker_expenses_owner_access" on public.worker_expenses;

drop policy if exists "food_expenses_static_access" on public.food_expenses;
create policy "food_expenses_static_access"
on public.food_expenses
for all
using (
  garden_id in (
    select id from public.gardens where slug = 'xons-static-garden'
  )
)
with check (
  garden_id in (
    select id from public.gardens where slug = 'xons-static-garden'
  )
);

drop policy if exists "food_expenses_owner_access" on public.food_expenses;

drop policy if exists "fertilizer_expenses_static_access" on public.fertilizer_expenses;
create policy "fertilizer_expenses_static_access"
on public.fertilizer_expenses
for all
using (
  garden_id in (
    select id from public.gardens where slug = 'xons-static-garden'
  )
)
with check (
  garden_id in (
    select id from public.gardens where slug = 'xons-static-garden'
  )
);

drop policy if exists "fertilizer_expenses_owner_access" on public.fertilizer_expenses;

drop policy if exists "transport_expenses_static_access" on public.transport_expenses;
create policy "transport_expenses_static_access"
on public.transport_expenses
for all
using (
  garden_id in (
    select id from public.gardens where slug = 'xons-static-garden'
  )
)
with check (
  garden_id in (
    select id from public.gardens where slug = 'xons-static-garden'
  )
);

drop policy if exists "transport_expenses_owner_access" on public.transport_expenses;

drop policy if exists "energy_expenses_static_access" on public.energy_expenses;
create policy "energy_expenses_static_access"
on public.energy_expenses
for all
using (
  garden_id in (
    select id from public.gardens where slug = 'xons-static-garden'
  )
)
with check (
  garden_id in (
    select id from public.gardens where slug = 'xons-static-garden'
  )
);

drop policy if exists "energy_expenses_owner_access" on public.energy_expenses;

drop policy if exists "oil_expenses_static_access" on public.oil_expenses;
create policy "oil_expenses_static_access"
on public.oil_expenses
for all
using (
  garden_id in (
    select id from public.gardens where slug = 'xons-static-garden'
  )
)
with check (
  garden_id in (
    select id from public.gardens where slug = 'xons-static-garden'
  )
);

drop policy if exists "oil_expenses_owner_access" on public.oil_expenses;

drop policy if exists "remont_expenses_static_access" on public.remont_expenses;
create policy "remont_expenses_static_access"
on public.remont_expenses
for all
using (
  garden_id in (
    select id from public.gardens where slug = 'xons-static-garden'
  )
)
with check (
  garden_id in (
    select id from public.gardens where slug = 'xons-static-garden'
  )
);

drop policy if exists "remont_expenses_owner_access" on public.remont_expenses;

drop policy if exists "tax_expenses_static_access" on public.tax_expenses;
create policy "tax_expenses_static_access"
on public.tax_expenses
for all
using (
  garden_id in (
    select id from public.gardens where slug = 'xons-static-garden'
  )
)
with check (
  garden_id in (
    select id from public.gardens where slug = 'xons-static-garden'
  )
);

drop policy if exists "tax_expenses_owner_access" on public.tax_expenses;

drop policy if exists "drainage_expenses_static_access" on public.drainage_expenses;
create policy "drainage_expenses_static_access"
on public.drainage_expenses
for all
using (
  garden_id in (
    select id from public.gardens where slug = 'xons-static-garden'
  )
)
with check (
  garden_id in (
    select id from public.gardens where slug = 'xons-static-garden'
  )
);

drop policy if exists "drainage_expenses_owner_access" on public.drainage_expenses;
