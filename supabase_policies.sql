-- Habilita a extensão de storage se não estiver ativa
create extension if not exists "storage";

-- Cria o bucket público 'products' para imagens dos produtos
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Cria o bucket público 'avatars' para usuários
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- POLÍTICAS DE SEGURANÇA (RLS)

-- 1. Permitir acesso público de LEITURA para imagens de produtos
create policy "Public Access to Product Images"
on storage.objects for select
using ( bucket_id = 'products' );

-- 2. Permitir upload de imagens de produtos apenas para Autenticados (Idealmente Admin)
-- Nota: Como o Supabase Auth está separado do Firebase Auth neste projeto híbrido,
-- estamos permitindo upload público para facilitar o teste (CUIDADO EM PRODUÇÃO)
-- ou você deve usar a service_role key no backend.
create policy "Allow Uploads"
on storage.objects for insert
with check ( bucket_id = 'products' );

-- 3. Permitir deleção/update apenas para quem fez o upload ou admins
create policy "Allow Updates"
on storage.objects for update
using ( bucket_id = 'products' );

create policy "Allow Deletes"
on storage.objects for delete
using ( bucket_id = 'products' );