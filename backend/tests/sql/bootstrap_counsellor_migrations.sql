-- Minimal, synthetic EduSync baseline for disposable PostgreSQL migration tests.
-- This is not a production schema dump and contains no production data.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS auth;
DO $$ BEGIN
  CREATE ROLE anon NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE ROLE authenticated NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid()
);

CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

CREATE TYPE public.membership_role AS ENUM ('admin', 'teacher', 'parent');
CREATE TYPE public.membership_status AS ENUM ('active', 'invited', 'suspended');

CREATE TABLE public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  timezone text NOT NULL DEFAULT 'Asia/Kolkata'
);

CREATE TABLE public.school_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  role public.membership_role NOT NULL,
  status public.membership_status NOT NULL DEFAULT 'invited',
  UNIQUE (user_id, school_id)
);

CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id),
  admission_no text NOT NULL,
  first_name text NOT NULL,
  last_name text,
  UNIQUE (id, school_id)
);

CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id),
  name text NOT NULL,
  UNIQUE (id, school_id)
);

CREATE TABLE public.class_teacher_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id),
  class_id uuid NOT NULL,
  teacher_user_id uuid NOT NULL,
  FOREIGN KEY (class_id, school_id) REFERENCES public.classes(id, school_id),
  FOREIGN KEY (teacher_user_id, school_id) REFERENCES public.school_memberships(user_id, school_id)
);

CREATE TABLE public.student_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id),
  student_id uuid NOT NULL,
  class_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'active',
  FOREIGN KEY (student_id, school_id) REFERENCES public.students(id, school_id),
  FOREIGN KEY (class_id, school_id) REFERENCES public.classes(id, school_id)
);

-- Existing baseline tables are represented for policy subqueries. Feature-table
-- RLS and grants are created by the feature migrations under test.
GRANT USAGE ON SCHEMA public, auth TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated;
GRANT SELECT ON public.school_memberships, public.class_teacher_assignments,
  public.student_enrollments, public.students, public.classes TO authenticated;
