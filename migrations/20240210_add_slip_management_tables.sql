-- Create slip_fields table
CREATE TABLE IF NOT EXISTS slip_fields (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create slip_templates table
CREATE TABLE IF NOT EXISTS slip_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create slip_template_fields join table
CREATE TABLE IF NOT EXISTS slip_template_fields (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  template_id UUID REFERENCES slip_templates(id) ON DELETE CASCADE,
  field_id UUID REFERENCES slip_fields(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, field_id)
);

-- Create slip_data table
CREATE TABLE IF NOT EXISTS slip_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  template_id UUID REFERENCES slip_templates(id) ON DELETE CASCADE,
  values JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER slip_fields_updated_at
  BEFORE UPDATE ON slip_fields
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER slip_templates_updated_at
  BEFORE UPDATE ON slip_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER slip_data_updated_at
  BEFORE UPDATE ON slip_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_slip_template_fields_template_id ON slip_template_fields(template_id);
CREATE INDEX IF NOT EXISTS idx_slip_template_fields_field_id ON slip_template_fields(field_id);
CREATE INDEX IF NOT EXISTS idx_slip_data_template_id ON slip_data(template_id);

-- Add RLS policies
ALTER TABLE slip_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE slip_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE slip_template_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE slip_data ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all users to read slip_fields"
  ON slip_fields FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admins to modify slip_fields"
  ON slip_fields FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow all users to read slip_templates"
  ON slip_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admins to modify slip_templates"
  ON slip_templates FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow all users to read slip_template_fields"
  ON slip_template_fields FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admins to modify slip_template_fields"
  ON slip_template_fields FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow users to read their own slip_data"
  ON slip_data FOR SELECT
  TO authenticated
  USING (auth.uid() = template_id::text);

CREATE POLICY "Allow users to insert their own slip_data"
  ON slip_data FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = template_id::text);

CREATE POLICY "Allow users to update their own slip_data"
  ON slip_data FOR UPDATE
  TO authenticated
  USING (auth.uid() = template_id::text);

CREATE POLICY "Allow users to delete their own slip_data"
  ON slip_data FOR DELETE
  TO authenticated
  USING (auth.uid() = template_id::text);