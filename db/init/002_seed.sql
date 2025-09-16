INSERT INTO roles (name) VALUES ('user') ON CONFLICT DO NOTHING;
INSERT INTO roles (name) VALUES ('admin') ON CONFLICT DO NOTHING;

-- Create an admin user placeholder
-- password hash needs to be replaced by application seed logic
INSERT INTO users (email, password_hash, role_id)
SELECT 'admin@example.com', '$2b$10$3b9Xc6b5aT2NwLRvU8KpeeVvH5cW.vJYfJOLwObAun1vDLteA94gS', r.id
FROM roles r WHERE r.name='admin'
ON CONFLICT (email) DO NOTHING;

-- Sample products
INSERT INTO products (title, description, price_cents, image, stock) VALUES
('Gaming GPU', 'High performance graphics card suitable for 4K gaming.', 79999, 'https://placehold.co/600x450/png?text=GPU', 120),
('Mechanical Keyboard', 'RGB backlit mechanical keyboard with hot-swappable switches.', 14950, 'https://placehold.co/600x450/png?text=Keyboard', 40),
('NVMe SSD 2TB', 'Fast PCIe 4.0 NVMe solid state drive 2TB capacity.', 19900, 'https://placehold.co/600x450/png?text=SSD', 15),
('750W PSU', '80+ Gold modular power supply unit.', 10900, 'https://placehold.co/600x450/png?text=PSU', 55),
('Gaming Chair', 'Ergonomic gaming chair with lumbar support.', 25900, 'https://placehold.co/600x450/png?text=Chair', 8);
