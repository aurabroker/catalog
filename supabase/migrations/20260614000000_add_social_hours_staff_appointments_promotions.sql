-- =============================================================================
-- Migration: add_social_hours_staff_appointments_promotions
-- Adds to salons: social media links, NIP, booking settings
-- New tables: working_hours, staff, staff_services,
--             appointments, staff_unavailability, promotions
-- Updated view: public_catalog_salons (adds social + contact columns)
-- New RPC: get_available_slots()
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Extend salons table
-- -----------------------------------------------------------------------------
ALTER TABLE salons
  ADD COLUMN IF NOT EXISTS website_url    text,
  ADD COLUMN IF NOT EXISTS facebook_url   text,
  ADD COLUMN IF NOT EXISTS instagram_url  text,
  ADD COLUMN IF NOT EXISTS tiktok_url     text,
  ADD COLUMN IF NOT EXISTS phone_secondary text,
  ADD COLUMN IF NOT EXISTS nip            text CHECK (nip IS NULL OR nip ~ '^\d{10}$'),
  -- booking settings
  ADD COLUMN IF NOT EXISTS booking_enabled          boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS booking_auto_confirm     boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS booking_slot_min         integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS booking_advance_hours_min integer NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS booking_advance_days_max  integer NOT NULL DEFAULT 60;

-- -----------------------------------------------------------------------------
-- 2. working_hours
--    day_of_week: 1=Poniedziałek … 7=Niedziela (ISO)
--    staff_id NULL  → godziny na poziomie salonu (domyślne)
--    staff_id NOT NULL → nadpisanie dla konkretnego pracownika
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS working_hours (
  id          uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id    uuid      NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  staff_id    uuid,                      -- NULL = salon-level
  day_of_week smallint  NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  is_open     boolean   NOT NULL DEFAULT true,
  open_time   time,
  close_time  time,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Separate unique indexes because NULL ≠ NULL in standard UNIQUE constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_wh_salon_day
  ON working_hours (salon_id, day_of_week)
  WHERE staff_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_wh_staff_day
  ON working_hours (salon_id, staff_id, day_of_week)
  WHERE staff_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_wh_salon ON working_hours (salon_id);

CREATE TRIGGER set_working_hours_updated_at
  BEFORE UPDATE ON working_hours
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- 3. staff (pracownicy)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS staff (
  id             uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id       uuid      NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  user_id        uuid      REFERENCES auth.users(id) ON DELETE SET NULL,
  name           text      NOT NULL,
  role_label     text,                   -- np. "Stylistka", "Kosmetolożka"
  bio            text,
  photo_url      text,
  calendar_color text      NOT NULL DEFAULT '#6366f1',
  is_active      boolean   NOT NULL DEFAULT true,
  sort_order     integer   NOT NULL DEFAULT 100,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_salon ON staff (salon_id);
CREATE INDEX IF NOT EXISTS idx_staff_user  ON staff (user_id);

CREATE TRIGGER set_staff_updated_at
  BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- 4. staff_services (które zabiegi wykonuje dany pracownik)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS staff_services (
  staff_id   uuid NOT NULL REFERENCES staff(id)    ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, service_id)
);

-- -----------------------------------------------------------------------------
-- 5. appointments (wizyty — wbudowany kalendarz)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id        uuid        NOT NULL REFERENCES salons(id)   ON DELETE CASCADE,
  staff_id        uuid        REFERENCES staff(id)             ON DELETE SET NULL,
  service_id      uuid        REFERENCES services(id)          ON DELETE SET NULL,
  -- dane klienta
  client_name     text        NOT NULL,
  client_email    citext,
  client_phone    text,
  client_user_id  uuid        REFERENCES auth.users(id)        ON DELETE SET NULL,
  -- termin
  starts_at       timestamptz NOT NULL,
  ends_at         timestamptz NOT NULL,
  duration_min    integer     NOT NULL,
  -- status
  status          text        NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','confirmed','cancelled','completed','no_show')),
  -- cena (snapshot w momencie rezerwacji)
  price           numeric(10,2),
  currency_code   text        NOT NULL DEFAULT 'PLN',
  -- notatki
  notes           text,                  -- od klienta
  internal_notes  text,                  -- od salonu (niewidoczne dla klienta)
  cancellation_reason text,
  -- powiadomienia
  reminder_sent_at timestamptz,
  -- źródło rezerwacji
  source          text        NOT NULL DEFAULT 'online'
                  CHECK (source IN ('online','phone','walk_in','dashboard')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT appt_ends_after_starts CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_appt_salon     ON appointments (salon_id);
CREATE INDEX IF NOT EXISTS idx_appt_staff     ON appointments (staff_id);
CREATE INDEX IF NOT EXISTS idx_appt_starts    ON appointments (starts_at);
CREATE INDEX IF NOT EXISTS idx_appt_status    ON appointments (status);
CREATE INDEX IF NOT EXISTS idx_appt_email     ON appointments (client_email);
CREATE INDEX IF NOT EXISTS idx_appt_client    ON appointments (client_user_id);
-- Range index do sprawdzania konfliktów
CREATE INDEX IF NOT EXISTS idx_appt_range     ON appointments USING gist (tstzrange(starts_at, ends_at));

CREATE TRIGGER set_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- 6. staff_unavailability (urlopy, przerwy, niedostępność)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS staff_unavailability (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id   uuid        NOT NULL REFERENCES staff(id)   ON DELETE CASCADE,
  salon_id   uuid        NOT NULL REFERENCES salons(id)  ON DELETE CASCADE,
  starts_at  timestamptz NOT NULL,
  ends_at    timestamptz NOT NULL,
  reason     text        NOT NULL DEFAULT 'other'
             CHECK (reason IN ('holiday','sick','break','other')),
  note       text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unavail_ends_after_starts CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_unavail_staff ON staff_unavailability (staff_id);
CREATE INDEX IF NOT EXISTS idx_unavail_range ON staff_unavailability
  USING gist (tstzrange(starts_at, ends_at));

-- -----------------------------------------------------------------------------
-- 7. promotions (promocje / oferty specjalne)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS promotions (
  id             uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id       uuid      NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  title          text      NOT NULL,
  description    text,
  image_url      text,
  discount_type  text      CHECK (discount_type IN ('percent','fixed','free','other')),
  discount_value numeric(10,2),
  valid_from     date,
  valid_until    date,
  is_active      boolean   NOT NULL DEFAULT true,
  sort_order     integer   NOT NULL DEFAULT 100,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promo_salon  ON promotions (salon_id);
CREATE INDEX IF NOT EXISTS idx_promo_active ON promotions (salon_id, is_active);

CREATE TRIGGER set_promotions_updated_at
  BEFORE UPDATE ON promotions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- 8. Row Level Security
-- -----------------------------------------------------------------------------

ALTER TABLE working_hours       ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff               ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_services      ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_unavailability ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions          ENABLE ROW LEVEL SECURITY;

-- working_hours
CREATE POLICY "public read working hours"
  ON working_hours FOR SELECT TO anon, authenticated
  USING (is_public_salon(salon_id));

CREATE POLICY "members manage working hours"
  ON working_hours FOR ALL TO authenticated
  USING (can_manage_salon(salon_id))
  WITH CHECK (can_manage_salon(salon_id));

-- staff
CREATE POLICY "public read active staff"
  ON staff FOR SELECT TO anon, authenticated
  USING (is_active AND is_public_salon(salon_id));

CREATE POLICY "members manage staff"
  ON staff FOR ALL TO authenticated
  USING (can_manage_salon(salon_id))
  WITH CHECK (can_manage_salon(salon_id));

-- staff_services
CREATE POLICY "public read staff services"
  ON staff_services FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.id = staff_id AND s.is_active AND is_public_salon(s.salon_id)
    )
  );

CREATE POLICY "members manage staff services"
  ON staff_services FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.id = staff_id AND can_manage_salon(s.salon_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.id = staff_id AND can_manage_salon(s.salon_id)
    )
  );

-- appointments
CREATE POLICY "members read all appointments"
  ON appointments FOR SELECT TO authenticated
  USING (can_edit_salon_content(salon_id));

CREATE POLICY "client reads own appointments"
  ON appointments FOR SELECT TO authenticated
  USING (client_user_id = auth.uid());

CREATE POLICY "anyone can book appointment"
  ON appointments FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "members update appointments"
  ON appointments FOR UPDATE TO authenticated
  USING (can_edit_salon_content(salon_id))
  WITH CHECK (can_edit_salon_content(salon_id));

CREATE POLICY "client cancels own appointment"
  ON appointments FOR UPDATE TO authenticated
  USING (client_user_id = auth.uid() AND status IN ('pending', 'confirmed'))
  WITH CHECK (status = 'cancelled');

-- staff_unavailability
CREATE POLICY "public read unavailability"
  ON staff_unavailability FOR SELECT TO anon, authenticated
  USING (is_public_salon(salon_id));

CREATE POLICY "members manage unavailability"
  ON staff_unavailability FOR ALL TO authenticated
  USING (can_manage_salon(salon_id))
  WITH CHECK (can_manage_salon(salon_id));

-- promotions
CREATE POLICY "public read active promotions"
  ON promotions FOR SELECT TO anon, authenticated
  USING (is_active AND is_public_salon(salon_id));

CREATE POLICY "members manage promotions"
  ON promotions FOR ALL TO authenticated
  USING (can_manage_salon(salon_id))
  WITH CHECK (can_manage_salon(salon_id));

-- -----------------------------------------------------------------------------
-- 9. Update public_catalog_salons view (dodajemy social + kontakt)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public_catalog_salons AS
SELECT
  s.id,
  s.name,
  s.slug,
  s.plan,
  s.short_description,
  s.description,
  s.city,
  s.address_line,
  s.postal_code,
  s.country_code,
  s.latitude,
  s.longitude,
  s.cover_image_url,
  s.logo_url,
  s.published_at,
  d.host        AS primary_host,
  d.type        AS primary_host_type,
  -- nowe kolumny
  s.phone,
  s.email,
  s.website_url,
  s.facebook_url,
  s.instagram_url,
  s.tiktok_url,
  s.booking_enabled
FROM salons s
LEFT JOIN domains d ON d.salon_id = s.id AND d.is_primary AND d.active
WHERE s.status = 'published' AND s.published_at IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 10. RPC: get_available_slots
--     Zwraca dostępne sloty dla pracownika w danym dniu.
--     Strefy: czas lokalny Poland (Europe/Warsaw) → UTC w wynikach.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_available_slots(
  p_salon_id    uuid,
  p_staff_id    uuid,
  p_date        date,
  p_duration_min integer
)
RETURNS TABLE (slot_start timestamptz, slot_end timestamptz)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_day         smallint;
  v_open_time   time;
  v_close_time  time;
  v_step        integer;
  v_cur         timestamptz;
  v_slot_end    timestamptz;
  v_day_end     timestamptz;
BEGIN
  v_day := EXTRACT(ISODOW FROM p_date)::smallint;

  -- Godziny otwarcia: najpierw override pracownika, potem poziom salonu
  SELECT
    COALESCE(
      (SELECT open_time  FROM working_hours
       WHERE salon_id = p_salon_id AND staff_id = p_staff_id
         AND day_of_week = v_day AND is_open LIMIT 1),
      (SELECT open_time  FROM working_hours
       WHERE salon_id = p_salon_id AND staff_id IS NULL
         AND day_of_week = v_day AND is_open LIMIT 1)
    ),
    COALESCE(
      (SELECT close_time FROM working_hours
       WHERE salon_id = p_salon_id AND staff_id = p_staff_id
         AND day_of_week = v_day AND is_open LIMIT 1),
      (SELECT close_time FROM working_hours
       WHERE salon_id = p_salon_id AND staff_id IS NULL
         AND day_of_week = v_day AND is_open LIMIT 1)
    ),
    COALESCE(
      (SELECT booking_slot_min FROM salons WHERE id = p_salon_id),
      30
    )
  INTO v_open_time, v_close_time, v_step;

  IF v_open_time IS NULL OR v_close_time IS NULL THEN
    RETURN; -- closed
  END IF;

  -- Zamiana date+time → timestamptz w strefie Warsaw
  v_cur     := (p_date + v_open_time)  AT TIME ZONE 'Europe/Warsaw';
  v_day_end := (p_date + v_close_time) AT TIME ZONE 'Europe/Warsaw';

  WHILE v_cur + (p_duration_min || ' minutes')::interval <= v_day_end LOOP
    v_slot_end := v_cur + (p_duration_min || ' minutes')::interval;

    -- Brak konfliktu z istniejącymi wizytami i z niedostępnością
    IF NOT EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.staff_id = p_staff_id
        AND a.status NOT IN ('cancelled')
        AND tstzrange(a.starts_at, a.ends_at, '[)') &&
            tstzrange(v_cur, v_slot_end, '[)')
    )
    AND NOT EXISTS (
      SELECT 1 FROM staff_unavailability u
      WHERE u.staff_id = p_staff_id
        AND tstzrange(u.starts_at, u.ends_at, '[)') &&
            tstzrange(v_cur, v_slot_end, '[)')
    )
    THEN
      slot_start := v_cur;
      slot_end   := v_slot_end;
      RETURN NEXT;
    END IF;

    v_cur := v_cur + (v_step || ' minutes')::interval;
  END LOOP;
END;
$$;
