-- ============================================================================
--  SEED / DEMO — Datos de ejemplo para presentar el panel de Comisiones
-- ============================================================================
--  Qué hace este script:
--    1) BORRA todas las citas y barberos actuales.
--    2) Crea 3 barberos con distintas comisiones.
--    3) Asegura que existan servicios con precio.
--    4) Crea unos clientes de ejemplo.
--    5) Crea varias citas YA COMPLETADAS en el mes actual, repartidas
--       entre los barberos, para que la pantalla de Comisiones muestre datos.
--
--  Es seguro re-ejecutarlo: vuelve a dejar el set de demo desde cero.
--  Pégalo en Supabase -> SQL Editor y ejecútalo.
-- ============================================================================

begin;

-- 1) Limpiar citas y barberos actuales -------------------------------------
delete from public.appointments;
delete from public.barbers;

-- 2) Crear barberos (con distintas comisiones) -----------------------------
insert into public.barbers (name, specialty, bio, commission_rate, active) values
  ('Carlos', 'Degradados y diseños', 'Especialista en fades y líneas.', 50, true),
  ('Mario',  'Barba clásica',        'Afeitado tradicional a navaja.',  45, true),
  ('Luis',   'Cortes modernos',      'Tendencias y estilos actuales.',  55, true);

-- 3) Asegurar servicios con precio -----------------------------------------
insert into public.services (name, description, duration_minutes, price, active) values
  ('Corte clásico',         'Corte de cabello a máquina y tijera', 30, 12.00, true),
  ('Corte + barba',         'Corte completo y arreglo de barba',   45, 18.00, true),
  ('Afeitado tradicional',  'Afeitado a navaja con toalla caliente', 30, 10.00, true)
on conflict do nothing;

-- 4) Crear clientes de ejemplo ---------------------------------------------
insert into public.clients (name, phone) values
  ('Juan Pérez',    '600111222'),
  ('Andrés Gómez',  '600333444'),
  ('Pedro Ramírez', '600555666')
on conflict do nothing;

-- 5) Crear citas YA COMPLETADAS en el mes actual ---------------------------
--    Insertamos eligiendo barbero y servicio por nombre. La fecha usa
--    date_trunc('month', now()) para caer siempre en el mes en curso.
insert into public.appointments
  (barber_id, service_id, customer_name, customer_phone, start_time, end_time, status)
select
  b.id,
  s.id,
  v.customer_name,
  v.customer_phone,
  date_trunc('month', now()) + v.offset_interval,
  date_trunc('month', now()) + v.offset_interval + (s.duration_minutes || ' minutes')::interval,
  'completed'
from (values
  -- barbero,  servicio,                customer,           phone,        desplazamiento desde el inicio del mes
  ('Carlos', 'Corte clásico',          'Juan Pérez',       '600111222',  interval '2 days 10 hours'),
  ('Carlos', 'Corte + barba',          'Andrés Gómez',     '600333444',  interval '3 days 11 hours'),
  ('Carlos', 'Corte clásico',          'Pedro Ramírez',    '600555666',  interval '5 days 12 hours'),
  ('Mario',  'Afeitado tradicional',   'Juan Pérez',       '600111222',  interval '4 days 9 hours'),
  ('Mario',  'Corte + barba',          'Pedro Ramírez',    '600555666',  interval '6 days 16 hours'),
  ('Luis',   'Corte clásico',          'Andrés Gómez',     '600333444',  interval '7 days 10 hours 30 minutes'),
  ('Luis',   'Corte + barba',          'Juan Pérez',       '600111222',  interval '8 days 17 hours'),
  ('Luis',   'Afeitado tradicional',   'Andrés Gómez',     '600333444',  interval '9 days 13 hours')
) as v(barber_name, service_name, customer_name, customer_phone, offset_interval)
join public.barbers  b on b.name = v.barber_name
join public.services s on s.name = v.service_name;

commit;

-- Refresca la caché del API:
notify pgrst, 'reload schema';

-- ============================================================================
--  Comprobación rápida (opcional): comisión calculada por barbero este mes.
-- ============================================================================
-- select
--   b.name,
--   count(*)                                   as servicios,
--   sum(s.price)                               as facturado,
--   round(sum(s.price * b.commission_rate / 100), 2) as a_pagar
-- from public.appointments a
-- join public.barbers  b on b.id = a.barber_id
-- join public.services s on s.id = a.service_id
-- where a.status = 'completed'
--   and a.start_time >= date_trunc('month', now())
--   and a.start_time <  date_trunc('month', now()) + interval '1 month'
-- group by b.name
-- order by a_pagar desc;
