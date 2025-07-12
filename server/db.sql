-- This creates "photos" table --

CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    alt TEXT NOT NULL
);

-- Insert sample rows --
INSERT INTO photos (filename, alt) 
VALUES
('A6-ENV.jpg', 'Emirates Boeing 777-300ER || A6-ENV'),
('9V-SGA.jpg', 'Singapore Airlines Airbus A350-900 || 9V-SGA'),
('JA784A.jpg', 'All Nippon Airways Boeing 777-300ER || JA784A');

-- Use single column '' for DB --

-- Adding description to photos --
ALTER TABLE photos ADD COLUMN description TEXT;


