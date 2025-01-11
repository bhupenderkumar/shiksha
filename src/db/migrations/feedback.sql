-- Create feedback table
CREATE TABLE school.feedback (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES school.users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    note TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'RAISED', -- RAISED, RESOLVED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create feedback replies table
CREATE TABLE school.feedback_replies (
    id SERIAL PRIMARY KEY,
    feedback_id INTEGER NOT NULL REFERENCES school.feedback(id),
    user_id INTEGER NOT NULL REFERENCES school.users(id),
    reply TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_feedback_user_id ON school.feedback(user_id);
CREATE INDEX idx_feedback_status ON school.feedback(status);
CREATE INDEX idx_feedback_replies_feedback_id ON school.feedback_replies(feedback_id);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feedback_updated_at
    BEFORE UPDATE ON school.feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
