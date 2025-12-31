-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable array support (already enabled by default in PostgreSQL)

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  image TEXT,
  provider TEXT CHECK (provider IN ('google', 'email')),
  bio TEXT,
  hashtags TEXT[],
  location TEXT,
  website TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('superadmin', 'admin', 'member')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- ============================================
-- DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('googleDrive', 'text', 'table', 'uploaded')),
  google_drive_link TEXT,
  content TEXT,
  table_data JSONB,
  file_path TEXT,
  file_name TEXT,
  file_size BIGINT,
  mime_type TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_by_name TEXT NOT NULL,
  created_by_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Indexes for documents table
CREATE INDEX IF NOT EXISTS idx_documents_created_by ON documents(created_by);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);

-- ============================================
-- POLLS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('single', 'multiple')),
  end_date TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_by_name TEXT NOT NULL,
  created_by_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Indexes for polls table
CREATE INDEX IF NOT EXISTS idx_polls_created_by ON polls(created_by);
CREATE INDEX IF NOT EXISTS idx_polls_is_active ON polls(is_active);
CREATE INDEX IF NOT EXISTS idx_polls_created_at ON polls(created_at);

-- ============================================
-- POLL OPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS poll_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for poll_options table
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_options_order ON poll_options(poll_id, order_index);

-- ============================================
-- POLL VOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(poll_id, option_id, user_id)
);

-- Indexes for poll_votes table
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_option_id ON poll_votes(option_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON poll_votes(user_id);

-- ============================================
-- AGENDA ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS agenda_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_by_name TEXT NOT NULL,
  created_by_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Indexes for agenda_items table
CREATE INDEX IF NOT EXISTS idx_agenda_items_created_by ON agenda_items(created_by);
CREATE INDEX IF NOT EXISTS idx_agenda_items_date ON agenda_items(date);
CREATE INDEX IF NOT EXISTS idx_agenda_items_created_at ON agenda_items(created_at);

-- ============================================
-- AGENDA COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS agenda_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agenda_id UUID NOT NULL REFERENCES agenda_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_image TEXT,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for agenda_comments table
CREATE INDEX IF NOT EXISTS idx_agenda_comments_agenda_id ON agenda_comments(agenda_id);
CREATE INDEX IF NOT EXISTS idx_agenda_comments_user_id ON agenda_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_agenda_comments_created_at ON agenda_comments(created_at);

-- ============================================
-- ACTIVITY HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS activity_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  action TEXT,
  description TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT,
  user_image TEXT,
  target_id UUID,
  target_title TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for activity_history table
CREATE INDEX IF NOT EXISTS idx_activity_history_user_id ON activity_history(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_history_type ON activity_history(type);
CREATE INDEX IF NOT EXISTS idx_activity_history_created_at ON activity_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_history_target_id ON activity_history(target_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

-- Users can update their own profile (except role and status)
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text)
  WITH CHECK (
    auth.uid()::text = id::text AND
    -- Prevent users from changing their own role/status
    (OLD.role = NEW.role AND OLD.status = NEW.status)
  );

-- All authenticated users can read all users (for network view)
CREATE POLICY "Authenticated users can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Admins can update any user's role and status
CREATE POLICY "Admins can update user roles and status"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role IN ('superadmin', 'admin')
    )
  );

-- Users can insert their own record (during registration)
CREATE POLICY "Users can insert own record"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id::text);

-- ============================================
-- DOCUMENTS TABLE POLICIES
-- ============================================

-- All authenticated users can read documents
CREATE POLICY "Authenticated users can read documents"
  ON documents FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can create documents
CREATE POLICY "Authenticated users can create documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = created_by::text);

-- Users can update their own documents
CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = created_by::text)
  WITH CHECK (auth.uid()::text = created_by::text);

-- Users can delete their own documents
CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  TO authenticated
  USING (auth.uid()::text = created_by::text);

-- Admins can update/delete any document
CREATE POLICY "Admins can update any document"
  ON documents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role IN ('superadmin', 'admin')
    )
  );

CREATE POLICY "Admins can delete any document"
  ON documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role IN ('superadmin', 'admin')
    )
  );

-- ============================================
-- POLLS TABLE POLICIES
-- ============================================

-- All authenticated users can read polls
CREATE POLICY "Authenticated users can read polls"
  ON polls FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can create polls
CREATE POLICY "Authenticated users can create polls"
  ON polls FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = created_by::text);

-- Users can update their own polls
CREATE POLICY "Users can update own polls"
  ON polls FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = created_by::text)
  WITH CHECK (auth.uid()::text = created_by::text);

-- Users can delete their own polls
CREATE POLICY "Users can delete own polls"
  ON polls FOR DELETE
  TO authenticated
  USING (auth.uid()::text = created_by::text);

-- ============================================
-- POLL OPTIONS TABLE POLICIES
-- ============================================

-- All authenticated users can read poll options
CREATE POLICY "Authenticated users can read poll options"
  ON poll_options FOR SELECT
  TO authenticated
  USING (true);

-- Poll creators can manage options (via service role or function)
-- Note: Options are typically created/updated when poll is created/updated
-- This is handled through the application logic

-- ============================================
-- POLL VOTES TABLE POLICIES
-- ============================================

-- All authenticated users can read votes
CREATE POLICY "Authenticated users can read votes"
  ON poll_votes FOR SELECT
  TO authenticated
  USING (true);

-- Users can vote (insert)
CREATE POLICY "Users can vote"
  ON poll_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own votes (change vote)
CREATE POLICY "Users can update own votes"
  ON poll_votes FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can delete their own votes (remove vote)
CREATE POLICY "Users can delete own votes"
  ON poll_votes FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- AGENDA ITEMS TABLE POLICIES
-- ============================================

-- All authenticated users can read agenda items
CREATE POLICY "Authenticated users can read agenda items"
  ON agenda_items FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can create agenda items
CREATE POLICY "Authenticated users can create agenda items"
  ON agenda_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = created_by::text);

-- Users can update their own agenda items
CREATE POLICY "Users can update own agenda items"
  ON agenda_items FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = created_by::text)
  WITH CHECK (auth.uid()::text = created_by::text);

-- Users can delete their own agenda items
CREATE POLICY "Users can delete own agenda items"
  ON agenda_items FOR DELETE
  TO authenticated
  USING (auth.uid()::text = created_by::text);

-- ============================================
-- AGENDA COMMENTS TABLE POLICIES
-- ============================================

-- All authenticated users can read comments
CREATE POLICY "Authenticated users can read comments"
  ON agenda_comments FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON agenda_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON agenda_comments FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON agenda_comments FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- ACTIVITY HISTORY TABLE POLICIES
-- ============================================

-- All authenticated users can read history
CREATE POLICY "Authenticated users can read history"
  ON activity_history FOR SELECT
  TO authenticated
  USING (true);

-- System can insert history (via service role or function)
-- For now, allow authenticated users to insert (application will handle this)
CREATE POLICY "Authenticated users can insert history"
  ON activity_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_polls_updated_at
  BEFORE UPDATE ON polls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agenda_items_updated_at
  BEFORE UPDATE ON agenda_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

