-- ============================================
-- RESOURCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT,
  file_name TEXT,
  file_size BIGINT,
  mime_type TEXT,
  category TEXT NOT NULL DEFAULT 'Logos',
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_by_name TEXT NOT NULL,
  created_by_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Indexes for resources table
CREATE INDEX IF NOT EXISTS idx_resources_created_by ON resources(created_by);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at);

-- ============================================
-- RLS POLICIES FOR RESOURCES
-- ============================================

-- Enable RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view resources (approved members and admins)
CREATE POLICY "Resources are viewable by approved members and admins"
  ON resources
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.status = 'approved' OR users.role IN ('admin', 'superadmin'))
    )
  );

-- Policy: Approved members and admins can insert resources
CREATE POLICY "Approved members and admins can insert resources"
  ON resources
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.status = 'approved' OR users.role IN ('admin', 'superadmin'))
    )
  );

-- Policy: Users can update their own resources, admins can update any
CREATE POLICY "Users can update own resources, admins can update any"
  ON resources
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (
        (resources.created_by = auth.uid() AND users.status = 'approved')
        OR users.role IN ('admin', 'superadmin')
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (
        (resources.created_by = auth.uid() AND users.status = 'approved')
        OR users.role IN ('admin', 'superadmin')
      )
    )
  );

-- Policy: Users can delete their own resources, admins can delete any
CREATE POLICY "Users can delete own resources, admins can delete any"
  ON resources
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (
        (resources.created_by = auth.uid() AND users.status = 'approved')
        OR users.role IN ('admin', 'superadmin')
      )
    )
  );

-- ============================================
-- UPDATE TRIGGER FOR UPDATED_AT
-- ============================================
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

