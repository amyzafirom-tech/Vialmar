-- Ejecuta esto en Supabase: Project > SQL Editor > New query > pegar y correr
-- Es seguro volver a correrlo (usa "if not exists" / "if exists" en todo).

create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nombre text not null,
  telefono text not null,
  producto text not null,
  cantidad text not null,
  notas text,
  estado text not null default 'nuevo' check (estado in ('nuevo', 'contactado', 'confirmado', 'cancelado'))
);

alter table public.pedidos enable row level security;

-- Permisos base de Postgres sobre la tabla (necesarios además de las políticas de RLS)
grant insert on public.pedidos to anon, authenticated;
grant select, update, delete on public.pedidos to authenticated;

drop policy if exists "Cualquiera puede crear pedidos" on public.pedidos;
drop policy if exists "Solo usuarios autenticados pueden ver pedidos" on public.pedidos;
drop policy if exists "Solo usuarios autenticados pueden actualizar pedidos" on public.pedidos;
drop policy if exists "Solo usuarios autenticados pueden borrar pedidos" on public.pedidos;

-- Cualquiera (incluso visitantes anónimos del sitio) puede CREAR un pedido.
-- Usamos "public" + auth.uid() en vez del rol "anon" porque el nuevo sistema
-- de API keys de Supabase (publishable/secret) no siempre resuelve igual el rol "anon".
create policy "Cualquiera puede crear pedidos"
  on public.pedidos for insert
  to public
  with check (true);

-- Solo usuarios autenticados (el admin) pueden LEER los pedidos
create policy "Solo usuarios autenticados pueden ver pedidos"
  on public.pedidos for select
  to public
  using (auth.uid() is not null);

-- Solo usuarios autenticados pueden ACTUALIZAR el estado de un pedido
create policy "Solo usuarios autenticados pueden actualizar pedidos"
  on public.pedidos for update
  to public
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- Solo usuarios autenticados pueden BORRAR un pedido
create policy "Solo usuarios autenticados pueden borrar pedidos"
  on public.pedidos for delete
  to public
  using (auth.uid() is not null);


-- ============================================================
-- PRODUCTOS (catálogo editable desde /admin/productos)
-- ============================================================

create table if not exists public.productos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  origen text not null,
  overview text not null,
  price integer not null,
  presentacion text not null,
  image_url text not null,
  orden integer not null default 0
);

alter table public.productos enable row level security;

grant select on public.productos to anon, authenticated;
grant insert, update, delete on public.productos to authenticated;

drop policy if exists "Cualquiera puede ver productos" on public.productos;
drop policy if exists "Solo usuarios autenticados pueden crear productos" on public.productos;
drop policy if exists "Solo usuarios autenticados pueden editar productos" on public.productos;
drop policy if exists "Solo usuarios autenticados pueden borrar productos" on public.productos;

-- El catálogo es público: cualquier visitante del sitio debe poder verlo
create policy "Cualquiera puede ver productos"
  on public.productos for select
  to public
  using (true);

create policy "Solo usuarios autenticados pueden crear productos"
  on public.productos for insert
  to public
  with check (auth.uid() is not null);

create policy "Solo usuarios autenticados pueden editar productos"
  on public.productos for update
  to public
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "Solo usuarios autenticados pueden borrar productos"
  on public.productos for delete
  to public
  using (auth.uid() is not null);

-- Datos iniciales: los 3 productos que ya estaban fijos en el sitio.
-- Si ya los editaste desde /admin/productos, este bloque no los duplica ni los pisa.
insert into public.productos (title, origen, overview, price, presentacion, image_url, orden)
select * from (values
  ('Pastillas de Cacao', 'Valle del Cauca', 'Nuestra presentación clásica: cacao 100% natural, molido y prensado de forma artesanal.', 18000, '250 g', '/images/cacao/producto-pastillas.jpg', 1),
  ('Chocolate Artesanal', 'Antigua Vía al Mar', 'Chocolate oscuro elaborado a partir de nuestro propio cacao agroforestal, sin aditivos.', 22000, '100 g', '/images/cacao/producto-chocolate.jpg', 2),
  ('Cacao en Polvo', 'Valle del Cauca', 'Cacao puro en polvo, ideal para bebidas y repostería, sin azúcares ni conservantes.', 16000, '200 g', '/images/cacao/producto-pastillas.jpg', 3)
) as seed(title, origen, overview, price, presentacion, image_url, orden)
where not exists (select 1 from public.productos);

-- ============================================================
-- STORAGE: bucket público para las imágenes de producto
-- ============================================================

insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

drop policy if exists "Cualquiera puede ver imágenes de productos" on storage.objects;
drop policy if exists "Solo usuarios autenticados pueden subir imágenes de productos" on storage.objects;
drop policy if exists "Solo usuarios autenticados pueden borrar imágenes de productos" on storage.objects;

create policy "Cualquiera puede ver imágenes de productos"
  on storage.objects for select
  to public
  using (bucket_id = 'productos');

create policy "Solo usuarios autenticados pueden subir imágenes de productos"
  on storage.objects for insert
  to public
  with check (bucket_id = 'productos' and auth.uid() is not null);

create policy "Solo usuarios autenticados pueden borrar imágenes de productos"
  on storage.objects for delete
  to public
  using (bucket_id = 'productos' and auth.uid() is not null);
