-- This creates "photos" table --

CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    alt TEXT NOT NULL,
    description TEXT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Use single column '' for DB --

-- Reject duplicate file --
ALTER TABLE photos ADD CONSTRAINT unique_filename UNIQUE(filename);




