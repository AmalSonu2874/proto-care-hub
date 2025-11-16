-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER ROLES TABLE (Create first - needed for is_admin function)
-- ============================================
CREATE TYPE public.app_role AS ENUM ('student', 'admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (Create before using in policies)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = 'admin'
  )
$$;

-- Role policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.is_admin(auth.uid()));

-- ============================================
-- USER PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  student_id TEXT,
  batch_number TEXT,
  dob DATE,
  brotocare_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

-- ============================================
-- COMPLAINTS TABLE
-- ============================================
CREATE TYPE public.complaint_category AS ENUM ('academic', 'hostel', 'faculty_behaviour', 'infrastructure', 'other');
CREATE TYPE public.complaint_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.complaint_status AS ENUM ('submitted', 'under_review', 'in_process', 'resolved', 'closed');

CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category complaint_category NOT NULL,
  priority complaint_priority NOT NULL DEFAULT 'medium',
  status complaint_status NOT NULL DEFAULT 'submitted',
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Complaint policies
CREATE POLICY "Users can view their own complaints"
  ON public.complaints FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own complaints"
  ON public.complaints FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own complaints"
  ON public.complaints FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all complaints"
  ON public.complaints FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all complaints"
  ON public.complaints FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Index for faster queries
CREATE INDEX idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX idx_complaints_status ON public.complaints(status);
CREATE INDEX idx_complaints_priority ON public.complaints(priority);
CREATE INDEX idx_complaints_created_at ON public.complaints(created_at DESC);

-- ============================================
-- COMPLAINT COMMENTS TABLE
-- ============================================
CREATE TABLE public.complaint_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  comment TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.complaint_comments ENABLE ROW LEVEL SECURITY;

-- Comment policies
CREATE POLICY "Users can view comments on their complaints"
  ON public.complaint_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE complaints.id = complaint_comments.complaint_id
      AND complaints.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments on their complaints"
  ON public.complaint_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE complaints.id = complaint_comments.complaint_id
      AND complaints.user_id = auth.uid()
    ) AND user_id = auth.uid()
  );

CREATE POLICY "Admins can view all comments"
  ON public.complaint_comments FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create comments on any complaint"
  ON public.complaint_comments FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()) AND user_id = auth.uid());

CREATE INDEX idx_complaint_comments_complaint_id ON public.complaint_comments(complaint_id);
CREATE INDEX idx_complaint_comments_created_at ON public.complaint_comments(created_at);

-- ============================================
-- COMPLAINT TIMELINE TABLE
-- ============================================
CREATE TABLE public.complaint_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  status complaint_status NOT NULL,
  note TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.complaint_timeline ENABLE ROW LEVEL SECURITY;

-- Timeline policies
CREATE POLICY "Users can view timeline for their complaints"
  ON public.complaint_timeline FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE complaints.id = complaint_timeline.complaint_id
      AND complaints.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all timelines"
  ON public.complaint_timeline FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create timeline entries"
  ON public.complaint_timeline FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE INDEX idx_complaint_timeline_complaint_id ON public.complaint_timeline(complaint_id);
CREATE INDEX idx_complaint_timeline_created_at ON public.complaint_timeline(created_at);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, brotocare_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email
  );
  
  -- Assign default student role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-create timeline entry on status change
CREATE OR REPLACE FUNCTION public.handle_complaint_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') OR (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.complaint_timeline (complaint_id, status, created_by)
    VALUES (NEW.id, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_complaint_status_change
  AFTER INSERT OR UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_complaint_status_change();

-- ============================================
-- STORAGE BUCKET FOR ATTACHMENTS
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-attachments', 'complaint-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for complaint attachments
CREATE POLICY "Users can upload their own complaint attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'complaint-attachments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own complaint attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'complaint-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all complaint attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'complaint-attachments'
    AND public.is_admin(auth.uid())
  );