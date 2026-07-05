-- Run this command in your Supabase SQL Editor to create the practice_logs table:

CREATE TABLE IF NOT EXISTS practice_logs (
    id BIGSERIAL PRIMARY KEY,
    student_email TEXT NOT NULL,
    material_title TEXT NOT NULL,
    language TEXT NOT NULL,
    speed TEXT NOT NULL,
    accuracy INTEGER NOT NULL,
    mistakes INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Optional: Add an index on student_email for performance if there are many logs
CREATE INDEX IF NOT EXISTS idx_practice_logs_student_email ON practice_logs(student_email);
